import { useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { encodeFunctionData, formatUnits } from 'viem';
import { tuberoleRewardContract, hashcoinContract } from '../utils/contracts';
import { xPublicClient, publicClient } from '../lib/viem/client';
import { useQueryClient, useQueries, useMutation } from '@tanstack/react-query';
import { xroleRewardAbi } from '../utils/xroleRewardAbi';
import erc20Abi from '../utils/erc20';

export const useYouTubeReward = () => {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address as `0x${string}` | undefined;

  const queries = useMemo(() => {
    return [
      {
        queryKey: ['tuberole', 'canClaim', accountAddress],
        queryFn: async () => {
          if (!accountAddress) return false;
          return await xPublicClient.readContract({
            address: tuberoleRewardContract.address as `0x${string}`,
            abi: xroleRewardAbi,
            functionName: 'canClaim',
            args: [accountAddress],
          });
        },
        enabled: !!accountAddress,
        staleTime: 900000,
      },
      {
        queryKey: ['tuberole', 'poolBalance', tuberoleRewardContract.address],
        queryFn: async () => {
          return await publicClient.readContract({
            address: hashcoinContract.address as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [tuberoleRewardContract.address as `0x${string}`],
          });
        },
        enabled: true,
        staleTime: 900000,
      },
      {
        queryKey: ['tuberole', 'hasClaimed', accountAddress],
        queryFn: async () => {
          if (!accountAddress) return false;
          return await xPublicClient.readContract({
            address: tuberoleRewardContract.address as `0x${string}`,
            abi: xroleRewardAbi,
            functionName: 'claimed',
            args: [accountAddress],
          });
        },
        enabled: !!accountAddress,
        staleTime: 900000,
      },
    ] as const;
  }, [accountAddress]);

  const results = useQueries({ queries });

  const [
    { data: canClaim, isLoading: isCheckingCanClaim, refetch: refetchCanClaim },
    { data: poolRewardBalance, isLoading: isLoadingPoolBalance },
    { data: hasClaimed, isLoading: isCheckingHasClaimed },
  ] = results;

  const rewardAmount = '10,000';

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!canClaim) throw new Error('You are not eligible to claim this reward.');

      const data = encodeFunctionData({
        abi: xroleRewardAbi,
        functionName: 'claim',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: tuberoleRewardContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return xPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuberole'] });
    },
    onError: (error: Error) => {
      console.error('TubeRole Reward claim failed', error);
    },
  });

  const handleClaim = () => {
    claimMutation.mutate();
  };

  const formattedPoolRewardBalance = poolRewardBalance
    ? parseFloat(formatUnits(poolRewardBalance as bigint, 18)).toLocaleString()
    : '0';

  return {
    handleClaim,
    canClaim: (canClaim as boolean) ?? false,
    hasClaimed: (hasClaimed as boolean) ?? false,
    rewardAmount,
    poolRewardBalance: formattedPoolRewardBalance,
    isClaiming: claimMutation.isPending,
    isCheckingCanClaim,
    isLoadingPoolBalance,
    isCheckingHasClaimed,
    refetchCanClaim,
    error: claimMutation.error,
  };
};
