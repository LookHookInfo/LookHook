import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { readContract } from 'thirdweb';
import { drub100BadgeContract } from '../utils/contracts';

export function useDrub100Badge() {
  const account = useActiveAccount();
  const accountAddress = account?.address ?? '0x0000000000000000000000000000000000000000';

  const queries = useMemo(() => {
    return [
      {
        queryKey: ['drub100Badge', 'hasBadge', accountAddress],
        queryFn: () => readContract({ contract: drub100BadgeContract, method: 'hasBadge', params: [accountAddress] }),
        enabled: !!account,
        staleTime: 300000, // Cache for 5 minutes
      },
    ] as const;
  }, [account, accountAddress]);

  const results = useQueries({ queries });

  const [{ data: hasDrub100Badge, isLoading: isLoadingHasDrub100Badge, refetch: refetchHasDrub100Badge }] = results;

  return {
    hasDrub100Badge: hasDrub100Badge ?? false,
    isLoadingHasDrub100Badge,
    refetchHasDrub100Badge,
  };
}
