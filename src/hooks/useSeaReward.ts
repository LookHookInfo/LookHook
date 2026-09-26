import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { encodeFunctionData, formatUnits } from 'viem';
import { seaRewardContract } from '../utils/contracts';
import { xPublicClient } from '../lib/viem/client';
import { seaRewardAbi } from '../utils/seaRewardAbi';
import { useRewardBlocksAggregator } from './useRewardBlocksAggregator';

export function useSeaReward() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { userStatus, pools, isLoading: isLoadingStatus, isPoolsLoading, refetch } = useRewardBlocksAggregator();

  const isShark = userStatus?.seaIsShark ?? false;
  const isVoter = userStatus?.seaIsVoter ?? false;
  const isX = userStatus?.seaIsX ?? false;

  const canClaim = userStatus?.sea.canClaim ?? false;
  const hasClaimed = userStatus?.sea.alreadyClaimed ?? false;

  const rewardAmount =
    userStatus && userStatus.sea.rewardAmount !== undefined
      ? parseFloat(formatUnits(userStatus.sea.rewardAmount, 18)).toLocaleString()
      : '0';

  const formattedPoolRewardBalance =
    pools && pools.seaPool !== undefined
      ? parseFloat(formatUnits(pools.seaPool, 18)).toLocaleString()
      : userStatus && userStatus.sea.poolBalance !== undefined
        ? parseFloat(formatUnits(userStatus.sea.poolBalance, 18)).toLocaleString()
        : '0';

  const isLoading = isLoadingStatus || isPoolsLoading;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!canClaim) throw new Error('You are not eligible to claim this reward.');

      const data = encodeFunctionData({
        abi: seaRewardAbi,
        functionName: 'claim',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: seaRewardContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return xPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardBlocksAggregator'] });
    },
    onError: (error: Error) => {
      console.error('Sea Reward claim failed', error);
    },
  });

  const handleClaim = () => {
    claimMutation.mutate();
  };

  return {
    handleClaim,
    canClaim,
    hasClaimed,
    isShark,
    isVoter,
    isX,
    rewardAmount,
    poolRewardBalance: formattedPoolRewardBalance,
    isClaiming: claimMutation.isPending,
    isLoading,
    refetchCanClaim: refetch,
    error: claimMutation.error,
  };
}