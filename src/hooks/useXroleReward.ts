import { useMemo } from 'react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall, waitForReceipt, readContract } from 'thirdweb';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';
import { formatUnits } from 'ethers';
import { xroleRewardContract, hashcoinContract } from '../utils/contracts';
import { useQueryClient, useQueries, useMutation } from '@tanstack/react-query';

export const useXroleReward = () => {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { mutateAsync: sendTx } = useSendTransaction();
  const accountAddress = account?.address ?? '0x0000000000000000000000000000000000000000';

  // Strategy for RPC optimization and user comfort:
  // - Queries are only enabled when a wallet is connected.
  // - `canClaim` status is cached for 15 minutes. This reduces RPC calls while ensuring the UI updates
  //   within a reasonable timeframe if eligibility changes (e.g., user acquires the required NFT).
  // - `rewardAmount` is hardcoded to reduce RPC load, as this value is typically static on the contract.
  const queries = useMemo(() => {
    return [
      {
        queryKey: ['xrole', 'canClaim', accountAddress],
        queryFn: () => readContract({ contract: xroleRewardContract, method: 'canClaim', params: [accountAddress] }),
        enabled: !!account,
        staleTime: 900000, // Cache for 15 minutes (15 * 60 * 1000 ms)
      },
      {
        queryKey: ['xrole', 'poolBalance', xroleRewardContract.address],
        queryFn: () =>
          readContract({ contract: hashcoinContract, method: 'balanceOf', params: [xroleRewardContract.address] }),
        enabled: !!account,
        staleTime: 900000, // Cache for 15 minutes
      },
      {
        queryKey: ['xrole', 'hasClaimed', accountAddress],
        queryFn: () => readContract({ contract: xroleRewardContract, method: 'claimed', params: [accountAddress] }),
        enabled: !!account,
        staleTime: 900000, // Cache for 15 minutes
      },
    ] as const;
  }, [account, accountAddress]);

  const results = useQueries({ queries });

  const [
    { data: canClaim, isLoading: isCheckingCanClaim, refetch: refetchCanClaim },
    { data: poolRewardBalance, isLoading: isLoadingPoolBalance },
    { data: hasClaimed, isLoading: isCheckingHasClaimed },
  ] = results;

  // Hardcode reward amount to reduce RPC load, as this value is typically static on the contract.
  const rewardAmount = '4,000';

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!canClaim) throw new Error('You are not eligible to claim this reward.');

      const tx = prepareContractCall({ contract: xroleRewardContract, method: 'claim', params: [] });
      const { transactionHash } = await sendTx(tx);
      return waitForReceipt({ client, chain, transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xrole', 'canClaim', accountAddress] });
      queryClient.invalidateQueries({ queryKey: ['xrole', 'poolBalance', xroleRewardContract.address] });
      queryClient.invalidateQueries({ queryKey: ['xrole', 'hasClaimed', accountAddress] });
      // TODO: Optionally invalidate user's HASH balance if you track it elsewhere
      // queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', accountAddress] });
    },
    onError: (error: Error) => {
      console.error('XRole Reward claim failed', error);
    },
  });

  const handleClaim = () => {
    claimMutation.mutate();
  };

  const formattedPoolRewardBalance = poolRewardBalance
    ? parseFloat(formatUnits(poolRewardBalance, 18)).toLocaleString()
    : '0';

  return {
    handleClaim,
    canClaim: canClaim ?? false,
    hasClaimed: hasClaimed ?? false,
    rewardAmount, // Using the hardcoded value
    poolRewardBalance: formattedPoolRewardBalance,
    isClaiming: claimMutation.isPending,
    isCheckingCanClaim,
    isLoadingPoolBalance,
    isCheckingHasClaimed,
    refetchCanClaim,
    error: claimMutation.error,
  };
};
