import { useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { stakingContract, hashcoinContract } from '../utils/contracts';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { UserStakes } from '../components/UserStakesDisplay';
import { earlyPublicClient } from '../lib/viem/client';
import stakingAbi from '../utils/stakingAbi';
import erc20Abi from '../utils/erc20';
import { encodeFunctionData, parseUnits } from 'viem';

export type Status = 'idle' | 'pending' | 'success' | 'error';

export function useStakeContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>('idle');

  // Granular pending states
  const [stakingPending, setStakingPending] = useState<Set<number>>(new Set());
  const [unstakingPending, setUnstakingPending] = useState<Set<number>>(new Set());
  const [claimingRewardsPending, setClaimingRewardsPending] = useState<Set<number>>(new Set());

  const accountAddress = account?.address;

  const queryResults = useQueries({
    queries: [
      {
        queryKey: ['hashcoin', 'symbol'],
        queryFn: () => earlyPublicClient.readContract({
          address: hashcoinContract.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'symbol',
        }),
        staleTime: Infinity,
      },
      {
        queryKey: ['hashcoin', 'balanceOf', accountAddress],
        queryFn: () => earlyPublicClient.readContract({
          address: hashcoinContract.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300000,
      },
      {
        queryKey: ['staking', 'getUserStakes', accountAddress],
        queryFn: () => earlyPublicClient.readContract({
          address: stakingContract.address as `0x${string}`,
          abi: stakingAbi,
          functionName: 'getUserStakes',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300000,
      },
      {
        queryKey: ['staking', 'APR_3M'],
        queryFn: () => earlyPublicClient.readContract({
          address: stakingContract.address as `0x${string}`,
          abi: stakingAbi,
          functionName: 'APR_3M',
        }),
        staleTime: Infinity,
      },
      {
        queryKey: ['staking', 'APR_6M'],
        queryFn: () => earlyPublicClient.readContract({
          address: stakingContract.address as `0x${string}`,
          abi: stakingAbi,
          functionName: 'APR_6M',
        }),
        staleTime: Infinity,
      },
      {
        queryKey: ['staking', 'APR_12M'],
        queryFn: () => earlyPublicClient.readContract({
          address: stakingContract.address as `0x${string}`,
          abi: stakingAbi,
          functionName: 'APR_12M',
        }),
        staleTime: Infinity,
      },
      {
        queryKey: ['staking', 'getPoolInfo'],
        queryFn: () => earlyPublicClient.readContract({
          address: stakingContract.address as `0x${string}`,
          abi: stakingAbi,
          functionName: 'getPoolInfo',
        }),
        staleTime: 300000,
      },
      {
        queryKey: ['staking', 'getUserStakeSummary', accountAddress],
        queryFn: () => earlyPublicClient.readContract({
          address: stakingContract.address as `0x${string}`,
          abi: stakingAbi,
          functionName: 'getUserStakeSummary',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300000,
      },
      {
        queryKey: ['hashcoin', 'allowance', accountAddress, stakingContract.address],
        queryFn: () => earlyPublicClient.readContract({
          address: hashcoinContract.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [accountAddress as `0x${string}`, stakingContract.address as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300000,
      },
    ],
    combine: (results) => {
      return {
        tokenSymbol: results[0],
        walletBalance: results[1],
        userStakes: results[2],
        apr3M: results[3],
        apr6M: results[4],
        apr12M: results[5],
        poolInfo: results[6],
        stakedBalance: results[7],
        allowance: results[8],
        isLoading: results.some((res) => res.isLoading),
      };
    },
  });

  const {
    tokenSymbol: tokenSymbolResult,
    walletBalance: walletBalanceResult,
    userStakes: userStakesResult,
    apr3M: apr3MResult,
    apr6M: apr6MResult,
    apr12M: apr12MResult,
    poolInfo: poolInfoResult,
    stakedBalance: stakedBalanceResult,
    allowance: allowanceResult,
    isLoading: areQueriesLoading,
  } = queryResults;

  const tokenSymbol = tokenSymbolResult.data as string | undefined;
  const walletBalance = walletBalanceResult.data as bigint | undefined;
  const userStakes = userStakesResult.data as UserStakes | undefined;
  const apr3M = apr3MResult.data as bigint | undefined;
  const apr6M = apr6MResult.data as bigint | undefined;
  const apr12M = apr12MResult.data as bigint | undefined;
  const poolInfo = poolInfoResult.data as any;
  const stakedBalance = stakedBalanceResult.data as any;
  const allowance = allowanceResult.data as bigint | undefined;

  const isApproved = useCallback(
    (amount: string) => {
      if (allowance === undefined) return false;
      try {
        const amountWei = parseUnits(amount, 18);
        return amountWei <= allowance;
      } catch {
        return false;
      }
    },
    [allowance],
  );

  const stake = useCallback(
    async (amount: string, tierId: number) => {
      if (!account) throw new Error('Not connected');
      setStakingPending((prev) => new Set(prev).add(tierId));
      setStatus('pending');
      try {
        const amountWei = parseUnits(amount, 18);
        
        if (!isApproved(amount)) {
          const approveData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [stakingContract.address as `0x${string}`, amountWei],
          });
          const { transactionHash: approveHash } = await account.sendTransaction({
            to: hashcoinContract.address as `0x${string}`,
            data: approveData,
            chainId: 8453,
          });
          await earlyPublicClient.waitForTransactionReceipt({ hash: approveHash as `0x${string}` });
        }

        const stakeData = encodeFunctionData({
          abi: stakingAbi,
          functionName: 'stake',
          args: [amountWei, tierId],
        });
        const { transactionHash: stakeHash } = await account.sendTransaction({
          to: stakingContract.address as `0x${string}`,
          data: stakeData,
          chainId: 8453,
        });
        await earlyPublicClient.waitForTransactionReceipt({ hash: stakeHash as `0x${string}` });
        
        setStatus('success');
        queryClient.invalidateQueries({ queryKey: ['staking'] });
        queryClient.invalidateQueries({ queryKey: ['hashcoin'] });
      } catch (err) {
        setStatus('error');
        console.error(err);
      } finally {
        setStakingPending((prev) => {
          const next = new Set(prev);
          next.delete(tierId);
          return next;
        });
      }
    },
    [account, isApproved, queryClient],
  );

  const unstake = useCallback(
    async (tierId: number) => {
      if (!account) throw new Error('Not connected');
      setUnstakingPending((prev) => new Set(prev).add(tierId));
      setStatus('pending');
      try {
        const data = encodeFunctionData({
          abi: stakingAbi,
          functionName: 'unstake',
          args: [tierId],
        });
        const { transactionHash } = await account.sendTransaction({
          to: stakingContract.address as `0x${string}`,
          data,
          chainId: 8453,
        });
        await earlyPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
        
        setStatus('success');
        queryClient.invalidateQueries({ queryKey: ['staking'] });
        queryClient.invalidateQueries({ queryKey: ['hashcoin'] });
      } catch (err) {
        setStatus('error');
        console.error(err);
      } finally {
        setUnstakingPending((prev) => {
          const next = new Set(prev);
          next.delete(tierId);
          return next;
        });
      }
    },
    [account, queryClient],
  );

  const claim = useCallback(
    async (tierId: number) => {
      if (!account) throw new Error('Not connected');
      setClaimingRewardsPending((prev) => new Set(prev).add(tierId));
      setStatus('pending');
      try {
        const data = encodeFunctionData({
          abi: stakingAbi,
          functionName: 'claimReward',
          args: [tierId],
        });
        const { transactionHash } = await account.sendTransaction({
          to: stakingContract.address as `0x${string}`,
          data,
          chainId: 8453,
        });
        await earlyPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
        
        setStatus('success');
        queryClient.invalidateQueries({ queryKey: ['staking'] });
        queryClient.invalidateQueries({ queryKey: ['hashcoin'] });
      } catch (err) {
        setStatus('error');
        console.error(err);
      } finally {
        setClaimingRewardsPending((prev) => {
          const next = new Set(prev);
          next.delete(tierId);
          return next;
        });
      }
    },
    [account, queryClient],
  );

  return {
    tokenSymbol: tokenSymbol || '',
    stakeAPY: apr12M,
    walletBalance: walletBalance ? (walletBalance / 10n ** 18n).toString() : '0',
    stakedBalance: stakedBalance && stakedBalance[0] ? (stakedBalance[0] / 10n ** 18n).toString() : '0',
    userStakes,
    apr3M,
    apr6M,
    apr12M,
    poolInfo,
    isPoolInfoLoading: areQueriesLoading,
    stake,
    unstake,
    claim,
    isApproved,
    isStakingPending: (tierId: number) => stakingPending.has(tierId),
    isUnstakingPending: (tierId: number) => unstakingPending.has(tierId),
    isClaimingRewardsPending: (tierId: number) => claimingRewardsPending.has(tierId),
    status,
    setStatus,
  };
}
