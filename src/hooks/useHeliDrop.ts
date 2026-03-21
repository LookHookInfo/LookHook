import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { formatUnits, encodeFunctionData } from 'viem';

import {
  gmnftContract,
  badgeStakeContract,
  earlyBirdContract,
  heliRewardContract,
  hashcoinContract,
} from '../utils/contracts';
import { publicClient, namePublicClient, miningPublicClient } from '../lib/viem/client';
import { gmnftAbi } from '../utils/gmnftAbi';
import { heliRewardAbi } from '../utils/heliRewardAbi';
import { earlyBirdAbi } from '../utils/earlyBirdAbi';
import { badgeStakeAbi } from '../utils/badgeStakeAbi';
import erc20Abi from '../utils/erc20';

export function useHeliDrop() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address;

  const queries = useQueries({
    queries: [
      // Balance checks for UI indicators
      {
        queryKey: ['heliDrop', 'gmnftBalance', accountAddress],
        queryFn: () => publicClient.readContract({
          address: gmnftContract.address as `0x${string}`,
          abi: gmnftAbi,
          functionName: 'balanceOf',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      {
        queryKey: ['heliDrop', 'badgeStakeBalance', accountAddress],
        queryFn: () => miningPublicClient.readContract({
          address: badgeStakeContract.address as `0x${string}`,
          abi: badgeStakeAbi,
          functionName: 'balanceOf',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      {
        queryKey: ['heliDrop', 'earlyBirdBalance', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: earlyBirdContract.address as `0x${string}`,
          abi: earlyBirdAbi,
          functionName: 'balanceOf',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      // Reward contract state checks
      {
        queryKey: ['heliDrop', 'hasClaimed', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: heliRewardContract.address as `0x${string}`,
          abi: heliRewardAbi,
          functionName: 'claimed',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      {
        queryKey: ['heliDrop', 'rewardAmount'],
        queryFn: () => namePublicClient.readContract({
          address: heliRewardContract.address as `0x${string}`,
          abi: heliRewardAbi,
          functionName: 'rewardAmount',
        }),
        enabled: true,
        staleTime: Infinity,
      },
      {
        queryKey: ['heliDrop', 'poolRewardBalance'],
        queryFn: () => namePublicClient.readContract({
          address: hashcoinContract.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [heliRewardContract.address as `0x${string}`],
        }),
        enabled: true,
        staleTime: 300_000,
      },
    ],
  });

  const [gmnftResult, badgeResult, earlyBirdResult, hasClaimedResult, rewardAmountResult, poolRewardBalanceResult] =
    queries;

  const isLoading = queries.some((q) => q.isLoading);

  const hasGmnft = gmnftResult.data ? (gmnftResult.data as bigint) > 0n : false;
  const hasBadge = badgeResult.data ? (badgeResult.data as bigint) > 0n : false;
  const hasEarlyBird = earlyBirdResult.data ? (earlyBirdResult.data as bigint) > 0n : false;

  const hasClaimed = (hasClaimedResult.data as boolean) ?? false;

  const canClaim = hasGmnft && hasBadge && hasEarlyBird && !hasClaimed;

  const formattedRewardAmount = rewardAmountResult.data
    ? parseFloat(formatUnits(rewardAmountResult.data as bigint, 18)).toLocaleString()
    : '0';

  const formattedPoolRewardBalance = poolRewardBalanceResult.data
    ? parseFloat(formatUnits(poolRewardBalanceResult.data as bigint, 18)).toLocaleString()
    : '0';

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!canClaim) throw new Error('You are not eligible to claim this reward.');

      const data = encodeFunctionData({
        abi: heliRewardAbi,
        functionName: 'claim',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: heliRewardContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return namePublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heliDrop'] });
      queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', accountAddress] });
    },
    onError: (error: Error) => {
      console.error('HeliDrop Reward claim failed', error);
    },
  });

  const handleClaim = () => {
    claimMutation.mutate();
  };

  return {
    isLoading,
    hasGmnft,
    hasBadge,
    hasEarlyBird,
    canClaim,
    hasClaimed,
    rewardAmount: formattedRewardAmount,
    isClaiming: claimMutation.isPending,
    handleClaim,
    error: claimMutation.error,
    poolRewardBalance: formattedPoolRewardBalance,
  };
}
