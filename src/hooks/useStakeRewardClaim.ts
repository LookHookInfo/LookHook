import { useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { stakeRewardClaimContract, hashcoinContract } from '../utils/contracts';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { stakePublicClient } from '../lib/viem/client';
import { stakeRewardClaimAbi } from '../utils/stakeRewardClaimAbi';
import erc20Abi from '../utils/erc20';
import { encodeFunctionData } from 'viem';

export const useStakeRewardClaim = () => {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address;

  const [isClaiming, setIsClaiming] = useState(false);

  const queryResults = useQueries({
    queries: [
      {
        queryKey: ['stakeRewardClaim', 'canClaim', accountAddress],
        queryFn: () => stakePublicClient.readContract({
          address: stakeRewardClaimContract.address as `0x${string}`,
          abi: stakeRewardClaimAbi,
          functionName: 'canClaim',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300000,
      },
      {
        queryKey: ['hashcoin', 'balanceOf', stakeRewardClaimContract.address],
        queryFn: () => stakePublicClient.readContract({
          address: hashcoinContract.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [stakeRewardClaimContract.address as `0x${string}`],
        }),
        staleTime: 300000,
      },
    ],
    combine: (results) => {
      return {
        canClaim: results[0],
        contractBalance: results[1],
        isLoading: results.some((res) => res.isLoading),
      };
    },
  });

  const {
    canClaim: canClaimResult,
    contractBalance: contractBalanceResult,
    isLoading: areQueriesLoading,
  } = queryResults;

  const canClaim = canClaimResult.data as boolean | undefined;
  const rewardBalance = contractBalanceResult.data as bigint | undefined;

  const claimReward = useCallback(async () => {
    if (!canClaim || !account) {
      console.error('Cannot claim: missing eligibility or wallet not connected.');
      return;
    }

    setIsClaiming(true);
    try {
      const data = encodeFunctionData({
        abi: stakeRewardClaimAbi,
        functionName: 'claim',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: stakeRewardClaimContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      await stakePublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
      
      queryClient.invalidateQueries({ queryKey: ['stakeRewardClaim'] });
      queryClient.invalidateQueries({ queryKey: ['hashcoin', 'balanceOf'] });
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setIsClaiming(false);
    }
  }, [canClaim, account, queryClient]);

  return {
    canClaim,
    isCanClaimLoading: areQueriesLoading,
    isClaiming,
    claimReward,
    rewardBalance,
    isBalanceLoading: areQueriesLoading,
    refetchCanClaim: () => queryClient.invalidateQueries({ queryKey: ['stakeRewardClaim'] }),
  };
};
