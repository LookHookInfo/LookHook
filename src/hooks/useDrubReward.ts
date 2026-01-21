import { useMemo } from 'react';
import {
  useActiveAccount,
  useSendTransaction,
} from 'thirdweb/react';
import { prepareContractCall, waitForReceipt, readContract, type ThirdwebContract } from 'thirdweb';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';
import { formatUnits } from 'ethers';
import { drubRewardContract, hashcoinContract } from '@/utils/contracts';
import { useQueryClient, useQueries, useMutation } from '@tanstack/react-query';
import { Abi } from 'viem';

export function useDrubReward() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { mutateAsync: sendTx } = useSendTransaction();
  const accountAddress = account?.address || '0x0000000000000000000000000000000000000000';

  // Helper for consistent query creation
  const createThirdwebQuery = <TAbi extends Abi, TFunctionName extends string, TArgs extends readonly unknown[]>(
    contractInstance: ThirdwebContract<TAbi>,
    methodName: TFunctionName,
    params: TArgs,
    enabled: boolean = true,
  ) => ({
    queryKey: [contractInstance.address, methodName, ...params, accountAddress], // Added accountAddress to queryKey for better specificity
    queryFn: () => readContract({ contract: contractInstance, method: methodName as any, params: params as any }),
    enabled,
    staleTime: 300000, // 5 minutes
  });

  // 1. Batched Reads with Caching
  const queries = useMemo(() => {
    return [
      createThirdwebQuery(drubRewardContract, 'canClaim', [accountAddress], !!account),
      createThirdwebQuery(drubRewardContract, 'claimed', [accountAddress], !!account),
      createThirdwebQuery(drubRewardContract, 'rewardAmount', []),
      createThirdwebQuery(hashcoinContract, 'balanceOf', [drubRewardContract.address]),
    ];
  }, [account, accountAddress]);

  const results = useQueries({ queries });

  const [
    { data: canClaim },
    { data: hasClaimed },
    { data: rewardAmount },
    { data: poolRewardBalance },
  ] = results;

  // 2. Efficient Transaction Handling with useMutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!canClaim) throw new Error('You are not eligible to claim.');
      if (hasClaimed) throw new Error('You have already claimed this reward.');

      const tx = prepareContractCall({
        contract: drubRewardContract,
        method: 'claim',
        params: [],
      });
      const { transactionHash } = await sendTx(tx);
      return waitForReceipt({ client, chain, transactionHash });
    },
    onSuccess: () => {
      // Invalidate relevant queries to trigger background refetch
      queryClient.invalidateQueries({ queryKey: [drubRewardContract.address, 'canClaim', accountAddress] });
      queryClient.invalidateQueries({ queryKey: [drubRewardContract.address, 'claimed', accountAddress] });
      queryClient.invalidateQueries({ queryKey: [drubRewardContract.address, 'rewardAmount'] });
      queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', drubRewardContract.address] });
      // Also invalidate user's HASH balance since they receive reward
      queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', accountAddress] });
    },
    onError: (error) => {
      console.error("Claim failed", error);
    },
  });

  const handleClaim = async () => {
    claimMutation.mutate();
  };

  return {
    canClaim,
    hasClaimed,
    isClaiming: claimMutation.isPending,
    rewardAmount: rewardAmount ? parseFloat(formatUnits(rewardAmount, 18)).toLocaleString() : '0',
    poolRewardBalance: poolRewardBalance ? parseFloat(formatUnits(poolRewardBalance, 18)).toLocaleString() : '0',
    handleClaim,
    status: claimMutation.isError ? `Error: ${claimMutation.error?.message.substring(0, 50)}` : '', // Simplified status
  };
}
