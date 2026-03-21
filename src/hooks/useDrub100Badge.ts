import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { drub100BadgeContract } from '../utils/contracts';
import { xPublicClient } from '../lib/viem/client';
import { drub100BadgeAbi } from '../utils/drub100BadgeAbi';

export function useDrub100Badge() {
  const account = useActiveAccount();
  const accountAddress = account?.address as `0x${string}` | undefined;

  const queries = useMemo(() => {
    return [
      {
        queryKey: ['drub100Badge', 'hasBadge', accountAddress],
        queryFn: async () => {
          if (!accountAddress) return false;
          return await xPublicClient.readContract({
            address: drub100BadgeContract.address as `0x${string}`,
            abi: drub100BadgeAbi,
            functionName: 'hasBadge',
            args: [accountAddress],
          });
        },
        enabled: !!accountAddress,
        staleTime: 300000,
      },
    ] as const;
  }, [accountAddress]);

  const results = useQueries({ queries });

  const [{ data: hasDrub100Badge, isLoading: isLoadingHasDrub100Badge, refetch: refetchHasDrub100Badge }] = results;

  return {
    hasDrub100Badge: (hasDrub100Badge as boolean) ?? false,
    isLoadingHasDrub100Badge,
    refetchHasDrub100Badge,
  };
}
