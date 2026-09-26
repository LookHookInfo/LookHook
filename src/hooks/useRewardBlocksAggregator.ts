import { useActiveAccount } from 'thirdweb/react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { rewardBlocksAggregatorContract } from '../utils/contracts';
import { rewardBlocksAggregatorAbi } from '../utils/rewardBlocksAggregatorAbi';
import { publicClient } from '../lib/viem/client';

interface BlockStatus {
  canClaim: boolean;
  alreadyClaimed: boolean;
  rewardAmount: bigint;
  poolBalance: bigint;
}

interface UserStatus {
  heli: BlockStatus;
  heliHasGm: boolean;
  heliHasBadge: boolean;
  heliHasEarly: boolean;
  lambo: BlockStatus;
  lamboHasGm: boolean;
  lamboHasGem: boolean;
  lamboHasGram: boolean;
  lamboHasWhale: boolean;
  welcome: BlockStatus;
  sea: BlockStatus;
  seaIsShark: boolean;
  seaIsVoter: boolean;
  seaIsX: boolean;
  totalClaimable: bigint;
}

interface Pools {
  heliPool: bigint;
  lamboPool: bigint;
  welcomePool: bigint;
  seaPool: bigint;
}

export const useRewardBlocksAggregator = () => {
  const account = useActiveAccount();
  const accountAddress = account?.address as `0x${string}` | undefined;

  const { data: userStatus, isLoading, refetch } = useQuery({
    queryKey: ['rewardBlocksAggregator', accountAddress],
    queryFn: async () => {
      if (!accountAddress) return null;
      return (await publicClient.readContract({
        address: rewardBlocksAggregatorContract.address as `0x${string}`,
        abi: rewardBlocksAggregatorAbi,
        functionName: 'getUserStatus',
        args: [accountAddress],
      })) as unknown as UserStatus;
    },
    enabled: !!accountAddress,
    staleTime: 60000,
  });

  const { data: pools, isLoading: isPoolsLoading } = useQuery({
    queryKey: ['rewardBlocksAggregator', 'pools'],
    queryFn: async () => {
      return (await publicClient.readContract({
        address: rewardBlocksAggregatorContract.address as `0x${string}`,
        abi: rewardBlocksAggregatorAbi,
        functionName: 'getPools',
      })) as unknown as Pools;
    },
    enabled: true,
    staleTime: 300000,
  });

  const formatReward = (amount?: bigint) => {
    if (amount === undefined) return '0';
    return parseFloat(formatUnits(amount, 18)).toLocaleString();
  };

  return {
    userStatus,
    pools,
    isLoading,
    isPoolsLoading,
    refetch,
    formatReward,
  };
};