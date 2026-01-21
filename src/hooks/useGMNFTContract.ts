import { useQueryClient, useQueries, useMutation } from '@tanstack/react-query';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall, waitForReceipt } from 'thirdweb';
import { balanceOf as erc20BalanceOf, allowance as erc20Allowance, approve as erc20Approve } from 'thirdweb/extensions/erc20';
import { balanceOf as erc721BalanceOf } from 'thirdweb/extensions/erc721';
import { parseEther } from 'viem';

import { gmContract, gmnftContract } from '../utils/contracts';

const BURN_AMOUNT_STRING = '30';
const BURN_AMOUNT_WEI = parseEther(BURN_AMOUNT_STRING);



export function useGMNFTContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { mutateAsync: sendTx } = useSendTransaction();
  const accountAddress = account?.address || '0x0000000000000000000000000000000000000000';
  
  // 1. Batched Reads with Caching
  const gmBalanceQuery = {
    queryKey: ['gmBalance', accountAddress],
    queryFn: () => erc20BalanceOf({ contract: gmContract, address: accountAddress! }),
    enabled: !!accountAddress,
    staleTime: 300000, // 5 minutes
  };

  const gmnftBalanceQuery = {
    queryKey: ['gmnftBalance', accountAddress],
    queryFn: () => erc721BalanceOf({ contract: gmnftContract, owner: accountAddress! }),
    enabled: !!accountAddress,
    staleTime: 300000,
  };

  const allowanceQuery = {
    queryKey: ['gmAllowance', accountAddress],
    queryFn: () => erc20Allowance({ contract: gmContract, owner: accountAddress!, spender: gmnftContract.address }),
    enabled: !!accountAddress,
    staleTime: 300000,
  };

  const [
    { data: gmBalance },
    { data: gmnftBalance },
    { data: allowance },
  ] = useQueries({
    queries: [gmBalanceQuery, gmnftBalanceQuery, allowanceQuery],
  });

  const hasEnoughGM = gmBalance ? gmBalance >= BURN_AMOUNT_WEI : false;
  const hasGMNFT = gmnftBalance ? BigInt(gmnftBalance.toString()) > 0n : false;
  const isApproved = allowance ? allowance >= BURN_AMOUNT_WEI : false;

  // 2. Mutations (Approve with Optimistic Update, Mint with simple refetch for reliability)
  const approveMutation = useMutation<unknown, Error, void, { previousAllowance?: bigint; }>({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      const tx = erc20Approve({ contract: gmContract, spender: gmnftContract.address, amount: BURN_AMOUNT_STRING });
      const { transactionHash } = await sendTx(tx);
      return waitForReceipt({ transactionHash, chain: gmContract.chain, client: gmContract.client });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: allowanceQuery.queryKey });
      const previousAllowance = queryClient.getQueryData<bigint>(allowanceQuery.queryKey);
      queryClient.setQueryData(allowanceQuery.queryKey, () => BURN_AMOUNT_WEI);
      return { previousAllowance };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousAllowance !== undefined) {
        queryClient.setQueryData(allowanceQuery.queryKey, context.previousAllowance);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: allowanceQuery.queryKey });
    },
  });

  const burnAndMintMutation = useMutation<unknown, Error, void, { previousGMBalance?: bigint; previousGMNFTBalance?: bigint; }>({
    mutationFn: async () => {
      const transaction = prepareContractCall({
        contract: gmnftContract,
        method: 'burnAndMint',
        params: [],
      });
      const { transactionHash } = await sendTx(transaction);
      return waitForReceipt({ transactionHash, chain: gmnftContract.chain, client: gmnftContract.client });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: gmnftBalanceQuery.queryKey });
      await queryClient.cancelQueries({ queryKey: gmBalanceQuery.queryKey });

      const previousGMBalance = queryClient.getQueryData<bigint>(gmBalanceQuery.queryKey);
      const previousGMNFTBalance = queryClient.getQueryData<bigint>(gmnftBalanceQuery.queryKey);

      queryClient.setQueryData<bigint>(
        gmBalanceQuery.queryKey,
        (old) => (old ? old - BURN_AMOUNT_WEI : 0n)
      );
      queryClient.setQueryData<bigint>(
        gmnftBalanceQuery.queryKey,
        (old) => (old ? old + 1n : 1n)
      );

      return { previousGMBalance, previousGMNFTBalance };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousGMBalance) {
        queryClient.setQueryData(gmBalanceQuery.queryKey, context.previousGMBalance);
      }
      if (context?.previousGMNFTBalance) {
        queryClient.setQueryData(gmnftBalanceQuery.queryKey, context.previousGMNFTBalance);
      }
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: gmBalanceQuery.queryKey });
        queryClient.invalidateQueries({ queryKey: gmnftBalanceQuery.queryKey });
    }
  });

  // 3. Simplified Action Handler & Loading State
  const handleUnifiedAction = async () => {
    if (!account) return;
    try {
      if (!isApproved) {
        await approveMutation.mutateAsync();
      }
      await burnAndMintMutation.mutateAsync();
    } catch (error) {
      console.error("Failed during the unified action:", error);
    }
  };

  const isProcessing = approveMutation.isPending || burnAndMintMutation.isPending;

  return {
    gmBalance,
    BURN_AMOUNT: Number(BURN_AMOUNT_STRING),
    hasEnoughGM,
    hasGMNFT,
    isApproved,
    isProcessing,
    handleUnifiedAction,
  };
}
