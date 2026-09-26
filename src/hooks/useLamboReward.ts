import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { formatUnits, encodeFunctionData } from 'viem';

import { lamboRewardContract, hashcoinContract } from '../utils/contracts';
import { namePublicClient } from '../lib/viem/client';
import { lamboRewardAbi } from '../utils/lamboRewardAbi';
import { useRewardBlocksAggregator } from './useRewardBlocksAggregator';

export function useLamboReward() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address;
  const { userStatus, pools, isLoading: isLoadingStatus, isPoolsLoading } = useRewardBlocksAggregator();

  const hasGmnft = userStatus?.lamboHasGm ?? false;
  const hasGem = userStatus?.lamboHasGem ?? false;
  const hasGram = userStatus?.lamboHasGram ?? false;
  const hasWhale = userStatus?.lamboHasWhale ?? false;

  const hasClaimed = userStatus?.lambo.alreadyClaimed ?? false;

  const canClaim = userStatus?.lambo.canClaim ?? false;

  const formattedRewardAmount =
    userStatus && userStatus.lambo.rewardAmount !== undefined
      ? parseFloat(formatUnits(userStatus.lambo.rewardAmount, 18)).toLocaleString()
      : '0';

  const formattedPoolRewardBalance =
    pools && pools.lamboPool !== undefined
      ? parseFloat(formatUnits(pools.lamboPool, 18)).toLocaleString()
      : userStatus && userStatus.lambo.poolBalance !== undefined
        ? parseFloat(formatUnits(userStatus.lambo.poolBalance, 18)).toLocaleString()
        : '0';

  const isLoading = isLoadingStatus || isPoolsLoading;

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
      queryClient.invalidateQueries({ queryKey: ['rewardBlocksAggregator'] });
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