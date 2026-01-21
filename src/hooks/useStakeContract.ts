import { useState, useCallback, useMemo } from 'react';
import { useActiveAccount, useSendAndConfirmTransaction } from 'thirdweb/react';
import { prepareContractCall, toWei, readContract } from 'thirdweb';
import { stakingContract, hashcoinContract } from '../utils/contracts';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import type { ThirdwebContract } from 'thirdweb';
import { UserStakes } from '../components/UserStakesDisplay'; // Import UserStakes type

export type Status = 'idle' | 'pending' | 'success' | 'error';

// Helper function from optimization plan to structure queries
const createThirdwebQuery = ({
  contract,
  method,
  params = [],
  queryOptions = {},
}: {
  contract: ThirdwebContract<any>;
  method: string;
  params?: unknown[];
  queryOptions?: object;
}) => {
  const queryKey = [contract.chain.id, contract.address, method, params];
  return {
    queryKey,
    queryFn: () => readContract({ contract, method, params } as any),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Prevent refetching on window focus
    ...queryOptions,
  };
};

export function useStakeContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>('idle');
  const { mutateAsync: sendAndConfirm } = useSendAndConfirmTransaction(); // Removed isPending from here

  // Granular pending states
  const [isStakingPending, setIsStakingPending] = useState(false);
  const [isUnstakingPending, setIsUnstakingPending] = useState(false);
  const [isClaimingRewardsPending, setIsClaimingRewardsPending] = useState(false);

  const accountAddress = account?.address || '0x0000000000000000000000000000000000000000';

  const queries = useMemo(() => {
    return [
      // 0: tokenSymbol (hashcoinContract.symbol)
      createThirdwebQuery({
        contract: hashcoinContract,
        method: 'symbol',
        params: [],
      }),
      // 1: walletBalance (hashcoinContract.balanceOf)
      createThirdwebQuery({
        contract: hashcoinContract,
        method: 'balanceOf',
        params: [accountAddress],
        queryOptions: { enabled: !!account?.address },
      }),
      // 2: userStakes (stakingContract.getUserStakes)
      createThirdwebQuery({
        contract: stakingContract,
        method: 'getUserStakes',
        params: [accountAddress],
        queryOptions: { enabled: !!account?.address },
      }),
      // 3: apr3M (stakingContract.APR_3M)
      createThirdwebQuery({
        contract: stakingContract,
        method: 'APR_3M',
        params: [],
      }),
      // 4: apr6M (stakingContract.APR_6M)
      createThirdwebQuery({
        contract: stakingContract,
        method: 'APR_6M',
        params: [],
      }),
      // 5: apr12M (stakingContract.APR_12M)
      createThirdwebQuery({
        contract: stakingContract,
        method: 'APR_12M',
        params: [],
      }),
      // 6: poolInfo (stakingContract.getPoolInfo)
      createThirdwebQuery({
        contract: stakingContract,
        method: 'getPoolInfo',
        params: [],
      }),
      // 7: stakedBalance (stakingContract.getUserStakeSummary)
      createThirdwebQuery({
        contract: stakingContract,
        method: 'getUserStakeSummary',
        params: [accountAddress],
        queryOptions: { enabled: !!account?.address },
      }),
      // 8: allowance (hashcoinContract.allowance)
      createThirdwebQuery({
        contract: hashcoinContract,
        method: 'allowance',
        params: [accountAddress, stakingContract.address],
        queryOptions: { enabled: !!account?.address },
      }),
    ];
  }, [account?.address, accountAddress]);

  const queryResults = useQueries({
    queries,
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
  const userStakes = userStakesResult.data as UserStakes | undefined; // Adjust type based on actual return
  const apr3M = apr3MResult.data as bigint | undefined;
  const apr6M = apr6MResult.data as bigint | undefined;
  const apr12M = apr12MResult.data as bigint | undefined;
  const poolInfo = poolInfoResult.data as [bigint, bigint] | undefined; // Adjust type based on actual return
  const stakedBalance = stakedBalanceResult.data as [bigint, bigint] | undefined; // Adjust type based on actual return
  const allowance = allowanceResult.data as bigint | undefined;

  const isApproved = useCallback(
    (amount: string) => {
      if (!allowance) return false;
      try {
        const amountWei = toWei(amount);
        return BigInt(amountWei) <= allowance;
      } catch {
        return false;
      }
    },
    [allowance],
  );

  const invalidateStakeQueries = useCallback(() => {
    // Invalidate queries that change after stake/unstake/claim
    queryClient.invalidateQueries({ queryKey: queries[1].queryKey }); // walletBalance
    queryClient.invalidateQueries({ queryKey: queries[2].queryKey }); // userStakes
    queryClient.invalidateQueries({ queryKey: queries[6].queryKey }); // poolInfo
    queryClient.invalidateQueries({ queryKey: queries[7].queryKey }); // stakedBalance
    queryClient.invalidateQueries({ queryKey: queries[8].queryKey }); // allowance
  }, [queryClient, queries]);


  const stake = useCallback(
    async (amount: string, tierId: number) => {
      if (!account) throw new Error('Not connected');
      setIsStakingPending(true); // Set specific pending state
      setStatus('pending');
      try {
        const amountWei = toWei(amount);
        // Approve if necessary
        if (!isApproved(amount)) {
          const approveTx = prepareContractCall({
            contract: hashcoinContract,
            method: 'approve',
            params: [stakingContract.address, amountWei],
          });
          await sendAndConfirm(approveTx);
        }

        const stakeTx = prepareContractCall({
          contract: stakingContract,
          method: 'stake',
          params: [amountWei, tierId],
        });
        await sendAndConfirm(stakeTx);
        setStatus('success');
        invalidateStakeQueries();
      } catch (err) {
        setStatus('error');
        console.error(err);
      } finally {
        setIsStakingPending(false); // Reset specific pending state
      }
    },
    [account, sendAndConfirm, setStatus, isApproved, invalidateStakeQueries],
  );

  const unstake = useCallback(
    async (tierId: number) => {
      if (!account) throw new Error('Not connected');
      setIsUnstakingPending(true); // Set specific pending state
      setStatus('pending');
      try {
        const unstakeTx = prepareContractCall({
          contract: stakingContract,
          method: 'unstake',
          params: [tierId],
        });
        await sendAndConfirm(unstakeTx);
        setStatus('success');
        invalidateStakeQueries();
      } catch (err) {
        setStatus('error');
        console.error(err);
      } finally {
        setIsUnstakingPending(false); // Reset specific pending state
      }
    },
    [account, sendAndConfirm, setStatus, invalidateStakeQueries],
  );

  const claim = useCallback(
    async (tierId: number) => {
      if (!account) throw new Error('Not connected');
      setIsClaimingRewardsPending(true); // Set specific pending state
      setStatus('pending');
      try {
        const claimTx = prepareContractCall({
          contract: stakingContract,
          method: 'claimReward',
          params: [tierId],
        });
        await sendAndConfirm(claimTx);
        setStatus('success');
        invalidateStakeQueries(); // Invalidate relevant queries after reward claim
      } catch (err) {
        setStatus('error');
        console.error(err);
      } finally {
        setIsClaimingRewardsPending(false); // Reset specific pending state
      }
    },
    [account, sendAndConfirm, setStatus, invalidateStakeQueries],
  );

  return {
    tokenSymbol: tokenSymbol || '',
    stakeAPY: apr12M, // Using 12M APR as a default display
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
    // Return granular pending states
    isStakingPending,
    isUnstakingPending,
    isClaimingRewardsPending,
    status,
    setStatus,
  };
}
