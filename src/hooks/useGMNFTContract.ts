import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { parseEther, encodeFunctionData } from 'viem';

import { gmContract, gmnftContract } from '../utils/contracts';
import { publicClient } from '../lib/viem/client';
import GMAbi from '../utils/GMAbi';
import { gmnftAbi } from '../utils/gmnftAbi';
import { useGmNameFeed } from './useGmNameFeed';

const BURN_AMOUNT_STRING = '30';
const BURN_AMOUNT_WEI = parseEther(BURN_AMOUNT_STRING);

export function useGMNFTContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { gm, isLoading } = useGmNameFeed();

  const gmBalance = gm?.gmBalance;
  const gmnftBalance = gm?.gmnftBalance;
  const allowance = gm?.allowance;

  const hasEnoughGM = gmBalance ? gmBalance >= BURN_AMOUNT_WEI : false;
  const hasGMNFT = gmnftBalance ? gmnftBalance > 0n : false;
  const isApproved = allowance ? allowance >= BURN_AMOUNT_WEI : false;

  const canClaimNow = gm?.canClaimNow ?? false;
  const nextAvailableTimestamp = gm ? Number(gm.nextAvailable) : 0;
  const isEligible = gm ? gm.nftHolder || gm.staker : false;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected');

      const data = encodeFunctionData({
        abi: GMAbi,
        functionName: 'claim',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: gmContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return await publicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      queryClient.invalidateQueries({ queryKey: ['gmNameFeed'] });
    },
  });

  const approveMutation = useMutation<unknown, Error, void, { previousAllowance?: bigint }>({
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected');

      const data = encodeFunctionData({
        abi: GMAbi,
        functionName: 'approve',
        args: [gmnftContract.address as `0x${string}`, BURN_AMOUNT_WEI],
      });

      const { transactionHash } = await account.sendTransaction({
        to: gmContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return await publicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['gmNameFeed'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gmNameFeed'] });
    },
  });

  const burnAndMintMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected');

      const data = encodeFunctionData({
        abi: gmnftAbi,
        functionName: 'burnAndMint',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: gmnftContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return await publicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['gmNameFeed'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gmNameFeed'] });
    },
  });

  const handleUnifiedAction = async () => {
    if (!account) return;
    try {
      if (!isApproved) {
        await approveMutation.mutateAsync();
      }
      await burnAndMintMutation.mutateAsync();
    } catch (error) {
      console.error('Failed during the unified action:', error);
    }
  };

  const isProcessing = approveMutation.isPending || burnAndMintMutation.isPending || claimMutation.isPending;

  return {
    gmBalance,
    BURN_AMOUNT: Number(BURN_AMOUNT_STRING),
    hasEnoughGM,
    hasGMNFT,
    isApproved,
    isProcessing,
    handleUnifiedAction,
    canClaimNow,
    nextAvailableTimestamp,
    isEligible,
    isLoadingClaimInfo: isLoading,
    handleClaim: () => {
      if (canClaimNow && !claimMutation.isPending) {
        claimMutation.mutate();
      }
    },
    isClaiming: claimMutation.isPending,
  };
}
