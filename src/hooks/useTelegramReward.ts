import { useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { encodeFunctionData } from 'viem';
import { gramroleRewardContract } from '../utils/contracts';
import { xPublicClient } from '../lib/viem/client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { xroleRewardAbi } from '../utils/xroleRewardAbi';
import { useSocialRewardsAggregator } from './useSocialRewardsAggregator';

export const useTelegramReward = () => {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { userStatus, isLoading: isAggregatorLoading, refetch: refetchAggregator, formatReward } = useSocialRewardsAggregator();

  const gramStatus = userStatus?.gram;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!gramStatus?.canClaim) throw new Error('You are not eligible to claim this reward.');

      const data = encodeFunctionData({
        abi: xroleRewardAbi,
        functionName: 'claim',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: gramroleRewardContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return xPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialRewardsAggregator'] });
    },
    onError: (error: Error) => {
      console.error('GramRole Reward claim failed', error);
    },
  });

  const handleClaim = () => {
    claimMutation.mutate();
  };

  return {
    handleClaim,
    canClaim: gramStatus?.canClaim ?? false,
    hasClaimed: gramStatus?.alreadyClaimed ?? false,
    rewardAmount: formatReward(gramStatus?.rewardAmount),
    poolRewardBalance: formatReward(gramStatus?.contractBalance),
    isClaiming: claimMutation.isPending,
    isCheckingCanClaim: isAggregatorLoading,
    isLoadingPoolBalance: isAggregatorLoading,
    isCheckingHasClaimed: isAggregatorLoading,
    refetchCanClaim: refetchAggregator,
    error: claimMutation.error,
  };
};
