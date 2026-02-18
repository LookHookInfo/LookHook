import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall, waitForReceipt, readContract } from 'thirdweb';
import { ogMiningBadgeContract, contractTools } from '../utils/contracts';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';

export function useOgBadge() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { mutateAsync: sendTx } = useSendTransaction();
  const accountAddress = account?.address;

  const queries = useQueries({
    queries: [
      // Check if user already has the badge
      {
        queryKey: ['ogBadge', 'hasBadge', accountAddress],
        queryFn: () =>
          readContract({
            contract: ogMiningBadgeContract,
            method: 'hasBadge',
            params: [accountAddress!],
          }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      // Check if user bought the container (ID 5)
      {
        queryKey: ['ogBadge', 'containerClaimed', accountAddress],
        queryFn: async () => {
          const data = await readContract({
            contract: contractTools,
            method: 'function getSupplyClaimedByWallet(uint256 tokenId, uint256 conditionId, address wallet) view returns (uint256)',
            params: [5n, 0n, accountAddress!],
          });
          return data > 0n;
        },
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
    ],
  });

  const [hasBadgeResult, containerClaimedResult] = queries;

  const isLoading = queries.some((q) => q.isLoading);
  const hasBadge = hasBadgeResult.data ?? false;
  const boughtContainer = containerClaimedResult.data ?? false;

  // Logic: can claim if bought container and hasn't claimed yet
  const canClaim = boughtContainer && !hasBadge;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!canClaim) throw new Error('You are not eligible or already claimed.');

      const tx = prepareContractCall({
        contract: ogMiningBadgeContract,
        method: 'mint',
        params: [],
      });
      const { transactionHash } = await sendTx(tx);
      return waitForReceipt({ client, chain, transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ogBadge', accountAddress] });
    },
    onError: (error: Error) => {
      console.error('OG Badge claim failed', error);
    },
  });

  return {
    isLoading,
    hasBadge,
    boughtContainer,
    canClaim,
    isClaiming: claimMutation.isPending,
    handleClaim: () => claimMutation.mutate(),
    error: claimMutation.error,
  };
}
