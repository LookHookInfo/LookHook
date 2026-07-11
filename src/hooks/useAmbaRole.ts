
import { useActiveAccount } from 'thirdweb/react';
import { encodeFunctionData } from 'viem';
import { ambaNftContract } from '../utils/contracts';
import { xPublicClient } from '../lib/viem/client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ambaNftAbi } from '../utils/ambaNftAbi';
import { useSocialRewardsAggregator } from './useSocialRewardsAggregator';

export const useAmbaRole = () => {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { userStatus, isLoading: isAggregatorLoading, refetch: refetchAggregator } = useSocialRewardsAggregator();

  const ambaStatus = userStatus?.amba;

  const hasMinted = ambaStatus?.hasAmba ?? false;
  const canMint = ambaStatus?.canMint ?? false;

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
      queryClient.invalidateQueries({ queryKey: ['socialRewardsAggregator'] });
    },
    onError: (error: Error) => {
      console.error('Amba NFT mint failed', error);
    },
  });

  return {
    handleMint: () => mintMutation.mutate(),
    eligibility: ambaStatus ? {
      hasTube: ambaStatus.hasTube,
      hasGram: ambaStatus.hasGram,
      hasX: ambaStatus.hasX
    } : undefined,
    isLoading: isAggregatorLoading,
    hasMinted,
    canMint,
    isMinting: mintMutation.isPending,
    refetchEligibility: refetchAggregator,
    error: mintMutation.error,
  };
};
