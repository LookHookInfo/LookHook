import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { miningPublicClient } from '../lib/viem/client';
import { coreAggregatorContract } from '../utils/contracts';
import { coreAggregatorAbi } from '../utils/coreAggregatorAbi';

interface ToolState {
  balance: bigint;
  staked: bigint;
  rewards: bigint;
}

export interface ShopFeed {
  tools: ToolState[];
  isApprovedForStaking: boolean;
  usdcBalance: bigint;
  usdcAllowance: bigint;
  hashBalance: bigint;
  canMintFarmRole: boolean;
  hasFarmRole: boolean;
  galxeNftBalance: bigint;
  galxeBadgeBalance: bigint;
  galxeHasClaimed: boolean;
  galxeRewardAmount: bigint;
  primaryName: string;
  canClaimGalxe: boolean;
  galxeContractHash: bigint;
}

export interface ToolPrice {
  pricePerToken: bigint;
  currency: string;
  supplyClaimed: bigint;
  maxClaimableSupply: bigint;
}

interface MiningFeedData {
  shopFeed: ShopFeed;
  prices: ToolPrice[];
}

export function useMiningFeed() {
  const account = useActiveAccount();
  const address = account?.address as `0x${string}` | undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ['miningFeed', address],
    queryFn: async (): Promise<MiningFeedData> => {
      if (!address) throw new Error('No address');

      const [shopFeedResult, pricesResult] = await Promise.all([
        miningPublicClient.readContract({
          address: coreAggregatorContract.address as `0x${string}`,
          abi: coreAggregatorAbi,
          functionName: 'getShopFeed',
          args: [address],
        }),
        miningPublicClient.readContract({
          address: coreAggregatorContract.address as `0x${string}`,
          abi: coreAggregatorAbi,
          functionName: 'getShopPrices',
        }),
      ]);

      const sf = shopFeedResult as any;
      const tools: ToolState[] = sf.tools.map((t: any) => ({
        balance: t.balance as bigint,
        staked: t.staked as bigint,
        rewards: t.rewards as bigint,
      }));

      const shopFeed: ShopFeed = {
        tools,
        isApprovedForStaking: sf.isApprovedForStaking as boolean,
        usdcBalance: sf.usdcBalance as bigint,
        usdcAllowance: sf.usdcAllowance as bigint,
        hashBalance: sf.hashBalance as bigint,
        canMintFarmRole: sf.canMintFarmRole as boolean,
        hasFarmRole: sf.hasFarmRole as boolean,
        galxeNftBalance: sf.galxeNftBalance as bigint,
        galxeBadgeBalance: sf.galxeBadgeBalance as bigint,
        galxeHasClaimed: sf.galxeHasClaimed as boolean,
        galxeRewardAmount: sf.galxeRewardAmount as bigint,
        primaryName: sf.primaryName as string,
        canClaimGalxe: sf.canClaimGalxe as boolean,
        galxeContractHash: sf.galxeContractHash as bigint,
      };

      const prices: ToolPrice[] = ([...pricesResult] as unknown as any[]).map((p: any) => ({
        pricePerToken: p.pricePerToken as bigint,
        currency: p.currency as string,
        supplyClaimed: p.supplyClaimed as bigint,
        maxClaimableSupply: p.maxClaimableSupply as bigint,
      }));

      return { shopFeed, prices };
    },
    enabled: !!address,
    staleTime: 30_000,
  });

  return {
    shopFeed: data?.shopFeed,
    prices: data?.prices,
    isLoading,
    error,
  };
}
