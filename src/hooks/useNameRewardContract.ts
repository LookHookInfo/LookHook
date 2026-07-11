import { useActiveAccount } from 'thirdweb/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { formatUnits, encodeFunctionData } from 'viem';
import { namePublicClient } from '../lib/viem/client';
import { nameRewardContract } from '../utils/contracts';
import { nameRewardAbi } from '../utils/nameRewardAbi';
import { useGmNameFeed } from './useGmNameFeed';

export function useNameRewardContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { nameReward, isLoading } = useGmNameFeed();

  const canClaim = nameReward?.canClaim ?? false;
  const hasClaimed = nameReward?.claimed ?? false;
  const ourNftBalance = nameReward?.nftBalance;
  const poolBalance = nameReward?.poolBalance;

  const poolRewardBalance = poolBalance ? parseFloat(formatUnits(poolBalance, 18)).toFixed(2) : '0';
  const hasOurNft = !!ourNftBalance && ourNftBalance > 0n;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account || !canClaim) return;

      const data = encodeFunctionData({
        abi: nameRewardAbi,
        functionName: 'claim',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: nameRewardContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return namePublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmNameFeed'] });
    },
  });

  const claimReward = useCallback(() => {
    claimMutation.mutate();
  }, [claimMutation]);

  return {
    canClaim,
    hasClaimed,
    isClaiming: claimMutation.isPending,
    poolRewardBalance,
    isDataLoading: isLoading,
    claimReward,
    hasOurNft,
  };
}
