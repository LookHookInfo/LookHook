import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { formatUnits, encodeFunctionData } from 'viem';

import {
  gmnftContract,
  gemContract,
  gramContract,
  whaleContract,
  lamboRewardContract,
  hashcoinContract,
} from '../utils/contracts';
import { namePublicClient } from '../lib/viem/client';
import { gmnftAbi } from '../utils/gmnftAbi';
import { lamboRewardAbi } from '../utils/lamboRewardAbi';
import erc20Abi from '../utils/erc20';

export function useLamboReward() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address;

  const queries = useQueries({
    queries: [
      // Balance checks for UI indicators
      {
        queryKey: ['lamboReward', 'gmnftBalance', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: gmnftContract.address as `0x${string}`,
          abi: gmnftAbi,
          functionName: 'balanceOf',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      {
        queryKey: ['lamboReward', 'gemBalance', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: gemContract.address as `0x${string}`,
          abi: gmnftAbi,
          functionName: 'balanceOf',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      {
        queryKey: ['lamboReward', 'gramBalance', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: gramContract.address as `0x${string}`,
          abi: gmnftAbi,
          functionName: 'balanceOf',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      {
        queryKey: ['lamboReward', 'whaleBalance', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: whaleContract.address as `0x${string}`,
          abi: gmnftAbi,
          functionName: 'balanceOf',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      // Reward contract state checks
      {
        queryKey: ['lamboReward', 'hasClaimed', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: lamboRewardContract.address as `0x${string}`,
          abi: lamboRewardAbi,
          functionName: 'claimed',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      {
        queryKey: ['lamboReward', 'rewardAmount'],
        queryFn: () => namePublicClient.readContract({
          address: lamboRewardContract.address as `0x${string}`,
          abi: lamboRewardAbi,
          functionName: 'rewardAmount',
        }),
        enabled: true,
        staleTime: Infinity,
      },
      {
        queryKey: ['lamboReward', 'poolRewardBalance'],
        queryFn: () => namePublicClient.readContract({
          address: hashcoinContract.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [lamboRewardContract.address as `0x${string}`],
        }),
        enabled: true,
        staleTime: 300_000,
      },
    ],
  });

  const [
    gmnftResult,
    gemResult,
    gramResult,
    whaleResult,
    hasClaimedResult,
    rewardAmountResult,
    poolRewardBalanceResult
  ] = queries;

  const isLoading = queries.some((q) => q.isLoading);

  const hasGmnft = gmnftResult.data ? (gmnftResult.data as bigint) > 0n : false;
  const hasGem = gemResult.data ? (gemResult.data as bigint) > 0n : false;
  const hasGram = gramResult.data ? (gramResult.data as bigint) > 0n : false;
  const hasWhale = whaleResult.data ? (whaleResult.data as bigint) > 0n : false;

  const hasClaimed = (hasClaimedResult.data as boolean) ?? false;

  const canClaim = hasGmnft && hasGem && hasGram && hasWhale && !hasClaimed;

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
        abi: lamboRewardAbi,
        functionName: 'claim',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: lamboRewardContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return namePublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lamboReward'] });
      queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', accountAddress] });
    },
    onError: (error: Error) => {
      console.error('Lambo Reward claim failed', error);
    },
  });

  const handleClaim = () => {
    claimMutation.mutate();
  };

  return {
    isLoading,
    hasGmnft,
    hasGem,
    hasGram,
    hasWhale,
    canClaim,
    hasClaimed,
    rewardAmount: formattedRewardAmount,
    isClaiming: claimMutation.isPending,
    handleClaim,
    poolRewardBalance: formattedPoolRewardBalance,
  };
}
