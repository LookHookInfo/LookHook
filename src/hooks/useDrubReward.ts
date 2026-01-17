import { useState } from 'react';
import {
  useReadContract,
  useActiveAccount,
  useSendTransaction,
} from 'thirdweb/react';
import { prepareContractCall, waitForReceipt } from 'thirdweb';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';
import { formatUnits } from 'ethers';
import { drubRewardContract, hashcoinContract } from '@/utils/contracts';

export function useDrubReward() {
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();
  const [isClaiming, setIsClaiming] = useState(false);
  const [status, setStatus] = useState('');

  const { data: canClaim, refetch: refetchCanClaim } = useReadContract({
    contract: drubRewardContract,
    method: 'canClaim',
    params: [account?.address || '0x0'],
    queryOptions: { enabled: !!account },
  });

  const { data: hasClaimed, refetch: refetchHasClaimed } = useReadContract({
    contract: drubRewardContract,
    method: 'claimed',
    params: [account?.address || '0x0'],
    queryOptions: { enabled: !!account },
  });

  const { data: rewardAmount } = useReadContract({
    contract: drubRewardContract,
    method: 'rewardAmount',
    params: [],
  });

  const { data: poolRewardBalance } = useReadContract({
    contract: hashcoinContract, // The REWARD token is hashcoinContract
    method: 'balanceOf',
    params: [drubRewardContract.address],
  });

  const handleClaim = async () => {
    if (!account) {
      setStatus('Please connect wallet.');
      setTimeout(() => setStatus(''), 5000);
      return;
    }
    if (!canClaim) {
      setStatus('You are not eligible to claim.');
      setTimeout(() => setStatus(''), 5000);
      return;
    }
    if (hasClaimed) {
      setStatus('You have already claimed this reward.');
      setTimeout(() => setStatus(''), 5000);
      return;
    }

    setIsClaiming(true);
    setStatus('');

    try {
      const tx = prepareContractCall({
        contract: drubRewardContract,
        method: 'claim',
        params: [],
      });
      const { transactionHash } = await sendTx(tx);
      await waitForReceipt({ client, chain, transactionHash });
      refetchCanClaim();
      refetchHasClaimed(); // Refetch claimed status after successful claim
    } catch (error) {
      // Error status is cleared quickly as per user preference
      setStatus('');
      console.error("Claim failed", error);
    } finally {
      setIsClaiming(false);
      setTimeout(() => setStatus(''), 500);
    }
  };

  return {
    canClaim,
    hasClaimed,
    isClaiming,
    rewardAmount: rewardAmount ? parseFloat(formatUnits(rewardAmount, 18)).toLocaleString() : '0',
    poolRewardBalance: poolRewardBalance ? parseFloat(formatUnits(poolRewardBalance, 18)).toLocaleString() : '0',
    handleClaim,
    status,
  };
}
