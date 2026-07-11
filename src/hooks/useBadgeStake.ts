import { useActiveAccount } from 'thirdweb/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { badgeStakeContract } from '../utils/contracts';
import { stakePublicClient } from '../lib/viem/client';
import { badgeStakeAbi } from '../utils/badgeStakeAbi';
import { encodeFunctionData } from 'viem';

export const useBadgeStake = () => {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const address = account?.address;

  const { data: isEligible, isLoading: isEligibilityLoading } = useQuery({
    queryKey: ['badgeStake', 'isEligible', address],
    queryFn: () => stakePublicClient.readContract({
      address: badgeStakeContract.address as `0x${string}`,
      abi: badgeStakeAbi,
      functionName: 'isEligible',
      args: [address as `0x${string}`],
    }),
    enabled: !!address,
    staleTime: 300000,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account || !isEligible) return;

      const data = encodeFunctionData({
        abi: badgeStakeAbi,
        functionName: 'claimBadge',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: badgeStakeContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return stakePublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badgeStake', 'isEligible', address] });
    },
  });

  const claimBadge = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
    claimMutation.mutate(undefined, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return {
    isEligible: !!isEligible,
    isEligibilityLoading,
    isClaiming: claimMutation.isPending,
    claimBadge,
  };
};
