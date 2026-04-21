import { useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { encodeFunctionData } from 'viem';
import { ambaNftContract } from '../utils/contracts';
import { xPublicClient } from '../lib/viem/client';
import { useQueryClient, useQueries, useMutation } from '@tanstack/react-query';
import { ambaNftAbi } from '../utils/ambaNftAbi';

export const useAmbaRole = () => {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address as `0x${string}` | undefined;

  const queries = useMemo(() => {
    return [
      {
        queryKey: ['amba', 'eligibility', accountAddress],
        queryFn: async () => {
          if (!accountAddress) return { hasTube: false, hasGram: false, hasX: false };
          const [hasTube, hasGram, hasX] = await xPublicClient.readContract({
            address: ambaNftContract.address as `0x${string}`,
            abi: ambaNftAbi,
            functionName: 'checkEligibility',
            args: [accountAddress],
          });
          return { hasTube, hasGram, hasX };
        },
        enabled: !!accountAddress,
        staleTime: 60000,
      },
      {
        queryKey: ['amba', 'balance', accountAddress],
        queryFn: async () => {
          if (!accountAddress) return 0n;
          return await xPublicClient.readContract({
            address: ambaNftContract.address as `0x${string}`,
            abi: ambaNftAbi,
            functionName: 'balanceOf',
            args: [accountAddress],
          });
        },
        enabled: !!accountAddress,
        staleTime: 60000,
      },
    ] as const;
  }, [accountAddress]);

  const results = useQueries({ queries });

  const [
    { data: eligibility, isLoading: isLoadingEligibility, refetch: refetchEligibility },
    { data: balance, isLoading: isLoadingBalance },
  ] = results;

  const hasMinted = (balance ?? 0n) > 0n;
  const canMint = eligibility ? (eligibility.hasTube && eligibility.hasGram && eligibility.hasX && !hasMinted) : false;

  const mintMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!canMint) throw new Error('You are not eligible to mint this NFT or already minted.');

      const data = encodeFunctionData({
        abi: ambaNftAbi,
        functionName: 'mint',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: ambaNftContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return xPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amba'] });
    },
    onError: (error: Error) => {
      console.error('Amba NFT mint failed', error);
    },
  });

  return {
    handleMint: () => mintMutation.mutate(),
    eligibility,
    isLoading: isLoadingEligibility || isLoadingBalance,
    hasMinted,
    canMint,
    isMinting: mintMutation.isPending,
    refetchEligibility,
    error: mintMutation.error,
  };
};
