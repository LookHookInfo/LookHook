
import { useActiveAccount } from 'thirdweb/react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { rewardAggregatorContract } from '../utils/contracts';
import { rewardAggregatorAbi } from '../utils/rewardAggregatorAbi';
import { publicClient } from '../lib/viem/client';

interface RoleStatus {
  hasNFT: boolean;
  alreadyClaimed: boolean;
  canClaim: boolean;
  rewardAmount: bigint;
  contractBalance: bigint;
}

interface AmbaStatus {
  hasAmba: boolean;
  hasTube: boolean;
  hasGram: boolean;
  hasX: boolean;
  canMint: boolean;
  totalSupply: bigint;
}

interface UserStatus {
  x: RoleStatus;
  gram: RoleStatus;
  tube: RoleStatus;
  amba: AmbaStatus;
  totalClaimable: bigint;
}

export const useSocialRewardsAggregator = () => {
  const account = useActiveAccount();
  const accountAddress = account?.address as `0x${string}` | undefined;

  const { data: userStatus, isLoading, refetch } = useQuery({
    queryKey: ['socialRewardsAggregator', accountAddress],
    queryFn: async () => {
      if (!accountAddress) return null;
      return (await publicClient.readContract({
        address: rewardAggregatorContract.address as `0x${string}`,
        abi: rewardAggregatorAbi,
        functionName: 'getUserStatus',
        args: [accountAddress],
      })) as UserStatus;
    },
    enabled: !!accountAddress,
    staleTime: 60000, // 1 minute
  });

  const formatReward = (amount?: bigint) => {
    if (amount === undefined) return '0';
    return parseFloat(formatUnits(amount, 18)).toLocaleString();
  };

  return {
    userStatus,
    isLoading,
    refetch,
    formatReward,
  };
};
