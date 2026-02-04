import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall, waitForReceipt, readContract } from 'thirdweb';
import { balanceOf as erc20BalanceOf } from 'thirdweb/extensions/erc20';
import { balanceOf as erc721BalanceOf } from 'thirdweb/extensions/erc721';
import { formatUnits } from 'ethers';

import { 
  gmnftContract, 
  badgeStakeContract, 
  earlyBirdContract, 
  heliRewardContract,
  hashcoinContract,
} from '../utils/contracts';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';

export function useHeliDrop() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { mutateAsync: sendTx } = useSendTransaction();
  const accountAddress = account?.address;

  const queries = useQueries({
    queries: [
      // Balance checks for UI indicators
      {
        queryKey: ['heliDrop', 'gmnftBalance', accountAddress],
        queryFn: () => erc721BalanceOf({ contract: gmnftContract, owner: accountAddress! }),
        enabled: !!accountAddress,
        staleTime: 300_000, // 5 minutes
      },
      {
        queryKey: ['heliDrop', 'badgeStakeBalance', accountAddress],
        queryFn: () => erc20BalanceOf({ contract: badgeStakeContract, address: accountAddress! }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      {
        queryKey: ['heliDrop', 'earlyBirdBalance', accountAddress],
        queryFn: () => erc721BalanceOf({ contract: earlyBirdContract, owner: accountAddress! }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      // Reward contract state checks
      {
        queryKey: ['heliDrop', 'hasClaimed', accountAddress],
        queryFn: () => readContract({ contract: heliRewardContract, method: 'claimed', params: [accountAddress!] }),
        enabled: !!accountAddress,
        staleTime: 300_000,
      },
      {
        queryKey: ['heliDrop', 'rewardAmount'],
        queryFn: () => readContract({ contract: heliRewardContract, method: 'rewardAmount' }),
        enabled: true,
        staleTime: Infinity, // This value is unlikely to change often
      },
      {
        queryKey: ['heliDrop', 'poolRewardBalance'],
        queryFn: () => erc20BalanceOf({ contract: hashcoinContract, address: heliRewardContract.address }),
        enabled: true, // This is also a static value, can be fetched without an account
        staleTime: 300_000,
      },
    ],
  });

  const [
    gmnftResult,
    badgeResult,
    earlyBirdResult,
    hasClaimedResult,
    rewardAmountResult,
    poolRewardBalanceResult,
  ] = queries;

  // --- DERIVED STATE FROM QUERIES ---

  const isLoading = queries.some(q => q.isLoading);

  // Individual asset ownership for UI
  const hasGmnft = gmnftResult.data ? gmnftResult.data > 0n : false;
  const hasBadge = badgeResult.data ? badgeResult.data > 0n : false;
  const hasEarlyBird = earlyBirdResult.data ? earlyBirdResult.data > 0n : false;
  
  // Claim status
  const hasClaimed = hasClaimedResult.data ?? false;
  
  // Client-side derived claim eligibility to save an RPC call
  const canClaim = hasGmnft && hasBadge && hasEarlyBird && !hasClaimed;

  const formattedRewardAmount = rewardAmountResult.data 
    ? parseFloat(formatUnits(rewardAmountResult.data, 18)).toLocaleString() 
    : '0';

  const formattedPoolRewardBalance = poolRewardBalanceResult.data
    ? parseFloat(formatUnits(poolRewardBalanceResult.data, 18)).toLocaleString()
    : '0';

  // --- MUTATION FOR CLAIMING ---

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!canClaim) throw new Error('You are not eligible to claim this reward.');

      const tx = prepareContractCall({ 
        contract: heliRewardContract,
        method: 'claim',
        params: [],
      });
      const { transactionHash } = await sendTx(tx);
      return waitForReceipt({ client, chain, transactionHash });
    },
    onSuccess: () => {
      // Invalidate all queries related to this hook to refresh the entire component state
      queryClient.invalidateQueries({ queryKey: ['heliDrop', accountAddress] });
      queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', accountAddress] });
    },
    onError: (error: Error) => {
      console.error("HeliDrop Reward claim failed", error);
    },
  });

  const handleClaim = () => {
    claimMutation.mutate();
  };

      // --- RETURN UNIFIED STATE ---
  
    return {
      isLoading,
      // Individual ownership status
      hasGmnft,
      hasBadge,
      hasEarlyBird,
      // Claiming state and actions
      canClaim,
      hasClaimed,
      rewardAmount: formattedRewardAmount,
      isClaiming: claimMutation.isPending,
      handleClaim,
      error: claimMutation.error,
      poolRewardBalance: formattedPoolRewardBalance,
    };}
