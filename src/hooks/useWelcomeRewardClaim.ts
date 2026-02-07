import { useMemo } from 'react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall, waitForReceipt, readContract } from 'thirdweb';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';
import { formatUnits } from 'ethers';
import { useQueryClient, useQueries, useMutation } from '@tanstack/react-query';
import { welcomeRewardContract, hashcoinContract } from '../utils/contracts';

export function useWelcomeRewardClaim() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { mutateAsync: sendTx } = useSendTransaction();
  const accountAddress = account?.address ?? '0x0000000000000000000000000000000000000000';

  const queries = useMemo(() => {
    return [
      {
        queryKey: ['welcome', 'canClaim', accountAddress],
        queryFn: () => readContract({ contract: welcomeRewardContract, method: 'canClaim', params: [accountAddress] }),
        enabled: !!account,
        staleTime: 900000, // Cache for 15 minutes (15 * 60 * 1000 ms)
      },
      {
        queryKey: ['welcome', 'poolBalance', welcomeRewardContract.address],
        queryFn: () =>
          readContract({ contract: hashcoinContract, method: 'balanceOf', params: [welcomeRewardContract.address] }),
        enabled: !!account,
        staleTime: 900000, // Cache for 15 minutes
      },
      {
        queryKey: ['welcome', 'hasClaimed', accountAddress],
        queryFn: () => readContract({ contract: welcomeRewardContract, method: 'claimed', params: [accountAddress] }),
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

  // As per info.txt, rewardAmount is 2000 HASH
  const rewardAmount = '2,000';

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Please connect wallet.');
      if (!canClaim) throw new Error('You are not eligible to claim this reward.');

      const tx = prepareContractCall({ contract: welcomeRewardContract, method: 'claim', params: [] });
      const { transactionHash } = await sendTx(tx);
      return waitForReceipt({ client, chain, transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcome', 'canClaim', accountAddress] });
      queryClient.invalidateQueries({ queryKey: ['welcome', 'poolBalance', welcomeRewardContract.address] });
      queryClient.invalidateQueries({ queryKey: ['welcome', 'hasClaimed', accountAddress] });
    },
    onError: (error: Error) => {
      console.error('Welcome Reward claim failed', error);
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
    rewardAmount,
    poolRewardBalance: formattedPoolRewardBalance,
    isClaiming: claimMutation.isPending,
    isCheckingCanClaim,
    isLoadingPoolBalance,
    isCheckingHasClaimed,
    refetchCanClaim,
    error: claimMutation.error,
  };
}
