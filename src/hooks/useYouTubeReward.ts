import { useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { encodeFunctionData } from 'viem';
import { tuberoleRewardContract } from '../utils/contracts';
import { xPublicClient } from '../lib/viem/client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { xroleRewardAbi } from '../utils/xroleRewardAbi';
import { useSocialRewardsAggregator } from './useSocialRewardsAggregator';

export const useYouTubeReward = () => {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { userStatus, isLoading: isAggregatorLoading, refetch: refetchAggregator, formatReward } = useSocialRewardsAggregator();

  const tubeStatus = userStatus?.tube;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!tubeStatus?.canClaim) throw new Error('You are not eligible to claim this reward.');

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
      queryClient.invalidateQueries({ queryKey: ['socialRewardsAggregator'] });
    },
    onError: (error: Error) => {
      console.error('TubeRole Reward claim failed', error);
    },
  });

  const handleClaim = () => {
    claimMutation.mutate();
  };

  return {
    handleClaim,
    canClaim: tubeStatus?.canClaim ?? false,
    hasClaimed: tubeStatus?.alreadyClaimed ?? false,
    rewardAmount: formatReward(tubeStatus?.rewardAmount),
    poolRewardBalance: formatReward(tubeStatus?.contractBalance),
    isClaiming: claimMutation.isPending,
    isCheckingCanClaim: isAggregatorLoading,
    isLoadingPoolBalance: isAggregatorLoading,
    isCheckingHasClaimed: isAggregatorLoading,
    refetchCanClaim: refetchAggregator,
    error: claimMutation.error,
  };
};
