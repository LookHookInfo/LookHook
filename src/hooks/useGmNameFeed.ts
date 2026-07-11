import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { namePublicClient, publicClient } from '../lib/viem/client';
import { gmNameAggregatorContract } from '../utils/contracts';
import { gmNameAggregatorAbi } from '../utils/gmNameAggregatorAbi';

interface DomainFeed {
  namePrice: bigint;
  hasDiscount: boolean;
  nameBalance: bigint;
  primaryName: string;
  hashBalance: bigint;
}

interface NameRewardFeed {
  canClaim: boolean;
  claimed: boolean;
  nftBalance: bigint;
  poolBalance: bigint;
}

interface GmFeed {
  gmBalance: bigint;
  gmnftBalance: bigint;
  allowance: bigint;
  canClaimNow: boolean;
  nextAvailable: bigint;
  nftHolder: boolean;
  staker: boolean;
  userStake: bigint;
}

interface GmNameFeedData {
  domain: DomainFeed;
  nameReward: NameRewardFeed;
  gm: GmFeed;
}

export function useGmNameFeed() {
  const account = useActiveAccount();
  const address = account?.address as `0x${string}` | undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ['gmNameFeed', address],
    queryFn: async (): Promise<GmNameFeedData> => {
      if (!address) throw new Error('No address');

      const aggregatorAddress = gmNameAggregatorContract.address as `0x${string}`;
      const abi = gmNameAggregatorAbi;

      const [domainResult, nameRewardResult, gmResult] = await Promise.all([
        namePublicClient.readContract({
          address: aggregatorAddress,
          abi,
          functionName: 'getDomainFeed',
          args: [address],
        }),
        namePublicClient.readContract({
          address: aggregatorAddress,
          abi,
          functionName: 'getNameRewardFeed',
          args: [address],
        }),
        publicClient.readContract({
          address: aggregatorAddress,
          abi,
          functionName: 'getGmFeed',
          args: [address],
        }),
      ]);

      const d = domainResult as any;
      const nr = nameRewardResult as any;
      const g = gmResult as any;

      return {
        domain: {
          namePrice: d.namePrice as bigint,
          hasDiscount: d.hasDiscount as boolean,
          nameBalance: d.nameBalance as bigint,
          primaryName: d.primaryName as string,
          hashBalance: d.hashBalance as bigint,
        },
        nameReward: {
          canClaim: nr.canClaim as boolean,
          claimed: nr.claimed as boolean,
          nftBalance: nr.nftBalance as bigint,
          poolBalance: nr.poolBalance as bigint,
        },
        gm: {
          gmBalance: g.gmBalance as bigint,
          gmnftBalance: g.gmnftBalance as bigint,
          allowance: g.allowance as bigint,
          canClaimNow: g.canClaimNow as boolean,
          nextAvailable: g.nextAvailable as bigint,
          nftHolder: g.nftHolder as boolean,
          staker: g.staker as boolean,
          userStake: g.userStake as bigint,
        },
      };
    },
    enabled: !!address,
    staleTime: 60_000,
  });

  return {
    domain: data?.domain,
    nameReward: data?.nameReward,
    gm: data?.gm,
    isLoading,
    error,
  };
}
