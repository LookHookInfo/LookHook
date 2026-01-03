import { useState, useCallback } from 'react';
import { useActiveAccount, useReadContract, useSendAndConfirmTransaction } from 'thirdweb/react';
import { prepareContractCall, toWei } from 'thirdweb';
import { stakingContract, hashcoinContract } from '../utils/contracts';

export type Status = 'idle' | 'pending' | 'success' | 'error';

export function useStakeContract() {
  const account = useActiveAccount();
  const [status, setStatus] = useState<Status>('idle');
  const { mutateAsync: sendAndConfirm, isPending } = useSendAndConfirmTransaction();

  const { data: tokenSymbol } = useReadContract({
    contract: hashcoinContract,
    method: 'symbol',
    params: [],
  });

  const { data: walletBalance, refetch: refreshBalances } = useReadContract({
    contract: hashcoinContract,
    method: 'balanceOf',
    params: [account?.address || '0x0'],
    queryOptions: { enabled: !!account?.address },
  });

  const { data: userStakes, refetch: refetchUserStakes } = useReadContract({
    contract: stakingContract,
    method: 'getUserStakes',
    params: [account?.address || '0x0'],
    queryOptions: { enabled: !!account?.address },
  });

  const { data: apr3M } = useReadContract({ contract: stakingContract, method: 'APR_3M', params: [] });
  const { data: apr6M } = useReadContract({ contract: stakingContract, method: 'APR_6M', params: [] });
  const { data: apr12M } = useReadContract({ contract: stakingContract, method: 'APR_12M', params: [] });

  const { data: poolInfo, isLoading: isPoolInfoLoading } = useReadContract({
    contract: stakingContract,
    method: 'getPoolInfo',
    params: [],
  });

  const { data: stakedBalance } = useReadContract({
    contract: stakingContract,
    method: 'getUserStakeSummary',
    params: [account?.address || '0x0'],
    queryOptions: { enabled: !!account?.address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    contract: hashcoinContract,
    method: 'allowance',
    params: [account?.address || '0x0', stakingContract.address],
    queryOptions: { enabled: !!account?.address },
  });

  const isApproved = useCallback(
    (amount: string) => {
      if (!allowance) return false;
      try {
        const amountWei = toWei(amount);
        return BigInt(amountWei) <= BigInt(allowance.toString());
      } catch {
        return false;
      }
    },
    [allowance],
  );

  const stake = useCallback(
    async (amount: string, tierId: number) => {
      if (!account) throw new Error('Not connected');
      setStatus('pending');
      try {
        const amountWei = toWei(amount);
        if (!isApproved(amount)) {
          const approveTx = prepareContractCall({
            contract: hashcoinContract,
            method: 'approve',
            params: [stakingContract.address, amountWei],
          });
          await sendAndConfirm(approveTx);
          refetchAllowance();
        }

        const stakeTx = prepareContractCall({
          contract: stakingContract,
          method: 'stake',
          params: [amountWei, tierId],
        });
        await sendAndConfirm(stakeTx);
        setStatus('success');
        refetchUserStakes();
        refreshBalances();
      } catch (err) {
        setStatus('error');
        console.error(err);
      } finally {
        // isSending and isConfirming are handled by useSendAndConfirmTransaction
      }
    },
    [account, sendAndConfirm, setStatus, refetchUserStakes, refreshBalances, isApproved, refetchAllowance],
  );

  const unstake = useCallback(
    async (tierId: number) => {
      if (!account) throw new Error('Not connected');
      setStatus('pending');
      try {
        const unstakeTx = prepareContractCall({
          contract: stakingContract,
          method: 'unstake',
          params: [tierId],
        });
        await sendAndConfirm(unstakeTx);
        setStatus('success');
        refetchUserStakes();
        refreshBalances();
      } catch (err) {
        setStatus('error');
        console.error(err);
      } finally {
        // isSending and isConfirming are handled by useSendAndConfirmTransaction
      }
    },
    [account, sendAndConfirm, setStatus, refetchUserStakes, refreshBalances],
  );

  const claim = useCallback(
    async (tierId: number) => {
      if (!account) throw new Error('Not connected');
      setStatus('pending');
      try {
        const claimTx = prepareContractCall({
          contract: stakingContract,
          method: 'claimReward',
          params: [tierId],
        });
        await sendAndConfirm(claimTx);
        setStatus('success');
        refetchUserStakes();
      } catch (err) {
        setStatus('error');
        console.error(err);
      } finally {
        // isSending and isConfirming are handled by useSendAndConfirmTransaction
      }
    },
    [account, sendAndConfirm, setStatus, refetchUserStakes],
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
    isPoolInfoLoading,
    stake,
    unstake,
    claim,
    isApproved,
    refetchAllowance,
    isPending, // Expose isPending
    status, // Return status
    setStatus, // Return setStatus
    refreshBalances: () => {
      refreshBalances();
      refetchUserStakes();
      refetchAllowance();
    },
  };
}
