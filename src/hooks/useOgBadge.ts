import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { encodeFunctionData } from 'viem';
import { ogMiningBadgeContract, contractTools } from '../utils/contracts';
import { ogPublicClient, miningPublicClient } from '../lib/viem/client';
import { ogMiningBadgeAbi } from '../utils/ogMiningBadgeAbi';

export function useOgBadge() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address as `0x${string}` | undefined;

  const queries = useQueries({
    queries: [
      // Check if user already has the badge
      {
        queryKey: ['ogBadge', 'hasBadge', accountAddress],
        queryFn: async () => {
          if (!accountAddress) return false;
          const balance = await ogPublicClient.readContract({
            address: ogMiningBadgeContract.address as `0x${string}`,
            abi: ogMiningBadgeAbi,
            functionName: 'balanceOf',
            args: [accountAddress],
          });
          return (balance as bigint) > 0n;
        },
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      // Check if user bought the container (ID 5)
      {
        queryKey: ['ogBadge', 'containerClaimed', accountAddress],
        queryFn: async () => {
          if (!accountAddress) return false;
          const data = await miningPublicClient.readContract({
            address: contractTools.address as `0x${string}`,
            abi: [
              {
                name: 'getSupplyClaimedByWallet',
                type: 'function',
                stateMutability: 'view',
                inputs: [
                  { name: 'tokenId', type: 'uint256' },
                  { name: 'conditionId', type: 'uint256' },
                  { name: 'wallet', type: 'address' },
                ],
                outputs: [{ name: '', type: 'uint256' }],
              },
            ] as const,
            functionName: 'getSupplyClaimedByWallet',
            args: [5n, 0n, accountAddress],
          });
          return (data as bigint) > 0n;
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

      const data = encodeFunctionData({
        abi: ogMiningBadgeAbi,
        functionName: 'mint',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: ogMiningBadgeContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return ogPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
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
