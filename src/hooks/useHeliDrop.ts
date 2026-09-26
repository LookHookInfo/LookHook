import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { formatUnits, encodeFunctionData } from 'viem';

import { heliRewardContract, hashcoinContract } from '../utils/contracts';
import { namePublicClient } from '../lib/viem/client';
import { heliRewardAbi } from '../utils/heliRewardAbi';
import { useRewardBlocksAggregator } from './useRewardBlocksAggregator';

export function useHeliDrop() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address;
  const { userStatus, pools, isLoading: isLoadingStatus, isPoolsLoading } = useRewardBlocksAggregator();

  const hasGmnft = userStatus?.heliHasGm ?? false;
  const hasBadge = userStatus?.heliHasBadge ?? false;
  const hasEarlyBird = userStatus?.heliHasEarly ?? false;

  const hasClaimed = userStatus?.heli.alreadyClaimed ?? false;

  const canClaim = userStatus?.heli.canClaim ?? false;

  const formattedRewardAmount =
    userStatus && userStatus.heli.rewardAmount !== undefined
      ? parseFloat(formatUnits(userStatus.heli.rewardAmount, 18)).toLocaleString()
      : '0';

  const formattedPoolRewardBalance =
    pools && pools.heliPool !== undefined
      ? parseFloat(formatUnits(pools.heliPool, 18)).toLocaleString()
      : userStatus && userStatus.heli.poolBalance !== undefined
        ? parseFloat(formatUnits(userStatus.heli.poolBalance, 18)).toLocaleString()
        : '0';

  const isLoading = isLoadingStatus || isPoolsLoading;

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
      queryClient.invalidateQueries({ queryKey: ['rewardBlocksAggregator'] });
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
    poolRewardBalance: formattedPoolRewardBalance,
  };
}