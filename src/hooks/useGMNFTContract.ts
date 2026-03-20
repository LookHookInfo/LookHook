import { useQueryClient, useQueries, useMutation } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { parseEther, encodeFunctionData } from 'viem';

import { gmContract, gmnftContract } from '../utils/contracts';
import { publicClient } from '../lib/viem/client';
import GMAbi from '../utils/GMAbi';
import { gmnftAbi } from '../utils/gmnftAbi';

const BURN_AMOUNT_STRING = '30';
const BURN_AMOUNT_WEI = parseEther(BURN_AMOUNT_STRING);

export function useGMNFTContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address as `0x${string}` | undefined;

  // 1. Batched Reads with Caching using Viem
  const gmBalanceQuery = {
    queryKey: ['gmBalance', accountAddress],
    queryFn: async () => {
      if (!accountAddress) return 0n;
      return await publicClient.readContract({
        address: gmContract.address as `0x${string}`,
        abi: GMAbi,
        functionName: 'balanceOf',
        args: [accountAddress],
      });
    },
    enabled: !!accountAddress,
    staleTime: 300000,
  };

  const gmnftBalanceQuery = {
    queryKey: ['gmnftBalance', accountAddress],
    queryFn: async () => {
      if (!accountAddress) return 0n;
      return await publicClient.readContract({
        address: gmnftContract.address as `0x${string}`,
        abi: gmnftAbi,
        functionName: 'balanceOf',
        args: [accountAddress],
      });
    },
    enabled: !!accountAddress,
    staleTime: 300000,
  };

  const allowanceQuery = {
    queryKey: ['gmAllowance', accountAddress],
    queryFn: async () => {
      if (!accountAddress) return 0n;
      return await publicClient.readContract({
        address: gmContract.address as `0x${string}`,
        abi: GMAbi,
        functionName: 'allowance',
        args: [accountAddress, gmnftContract.address as `0x${string}`],
      });
    },
    enabled: !!accountAddress,
    staleTime: 300000,
  };

  const [{ data: gmBalance }, { data: gmnftBalance }, { data: allowance }] = useQueries({
    queries: [gmBalanceQuery, gmnftBalanceQuery, allowanceQuery],
  });

  const hasEnoughGM = gmBalance ? gmBalance >= BURN_AMOUNT_WEI : false;
  const hasGMNFT = gmnftBalance ? gmnftBalance > 0n : false;
  const isApproved = allowance ? allowance >= BURN_AMOUNT_WEI : false;

  // 2. Mutations
  const approveMutation = useMutation<unknown, Error, void, { previousAllowance?: bigint }>({
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected');

      const data = encodeFunctionData({
        abi: GMAbi,
        functionName: 'approve',
        args: [gmnftContract.address as `0x${string}`, BURN_AMOUNT_WEI],
      });

      const { transactionHash } = await account.sendTransaction({
        to: gmContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return await publicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
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

  const burnAndMintMutation = useMutation<
    unknown,
    Error,
    void,
    { previousGMBalance?: bigint; previousGMNFTBalance?: bigint }
  >({
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected');

      const data = encodeFunctionData({
        abi: gmnftAbi,
        functionName: 'burnAndMint',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: gmnftContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return await publicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: gmnftBalanceQuery.queryKey });
      await queryClient.cancelQueries({ queryKey: gmBalanceQuery.queryKey });

      const previousGMBalance = queryClient.getQueryData<bigint>(gmBalanceQuery.queryKey);
      const previousGMNFTBalance = queryClient.getQueryData<bigint>(gmnftBalanceQuery.queryKey);

      queryClient.setQueryData<bigint>(gmBalanceQuery.queryKey, (old) => (old ? old - BURN_AMOUNT_WEI : 0n));
      queryClient.setQueryData<bigint>(gmnftBalanceQuery.queryKey, (old) => (old ? old + 1n : 1n));

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
    },
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
      console.error('Failed during the unified action:', error);
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
