import { useState } from 'react';
import {
  useReadContract,
  useActiveAccount,
  useSendTransaction,
} from 'thirdweb/react';
import { prepareContractCall, waitForReceipt } from 'thirdweb';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';
import { parseEther } from 'ethers';
import {
  drubContract,
  drub100BadgeContract,
} from '@/utils/contracts';

const BADGE_PRICE = parseEther('100');

export function useDrub100Badge() {
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();
  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState('');

  const { data: hasBadge, refetch: refetchHasBadge } = useReadContract({
    contract: drub100BadgeContract,
    method: 'hasBadge',
    params: [account?.address || '0x0'],
    queryOptions: { enabled: !!account },
  });

  const { data: drubBalance, refetch: refetchDrubBalance } = useReadContract({
    contract: drubContract,
    method: 'balanceOf',
    params: [account?.address || '0x0'],
    queryOptions: { enabled: !!account },
  });

  const { data: drubAllowance, refetch: refetchDrubAllowance } = useReadContract({
    contract: drubContract,
    method: 'allowance',
    params: [account?.address || '0x0', drub100BadgeContract.address],
    queryOptions: { enabled: !!account },
  });

  const canMint = drubBalance !== undefined && drubBalance >= BADGE_PRICE;

  const handleMint = async () => {
    if (!account) {
      setStatus('Please connect wallet.');
      return;
    }
    if (hasBadge) {
      // This status is likely still desired, as it's an immediate feedback and not part of the transaction
      setStatus('You already have this badge.');
      setTimeout(() => setStatus(''), 5000);
      return;
    }
    if (!canMint) {
      // This status is likely still desired
      setStatus('Insufficient DRUB balance.');
      setTimeout(() => setStatus(''), 5000);
      return;
    }

    setIsMinting(true);
    setStatus(''); // Clear any previous status

    try {
      if (drubAllowance === undefined || drubAllowance < BADGE_PRICE) {
        const approveTx = prepareContractCall({
          contract: drubContract,
          method: 'approve',
          params: [drub100BadgeContract.address, BADGE_PRICE],
        });
        const { transactionHash: approveTxHash } = await sendTx(approveTx);
        await waitForReceipt({ client, chain, transactionHash: approveTxHash });
        refetchDrubAllowance();
      }

      const mintTx = prepareContractCall({
        contract: drub100BadgeContract,
        method: 'mint',
        params: [],
      });
      const { transactionHash: mintTxHash } = await sendTx(mintTx);
      await waitForReceipt({ client, chain, transactionHash: mintTxHash });
      
      refetchHasBadge();
      refetchDrubBalance();
      // No success message as per user's request
    } catch (error) {
      // Clear status on error as well, relying on spinner for feedback
      setStatus(''); 
    } finally {
      setIsMinting(false);
      // Keep a short delay to clear any remaining status messages
      setTimeout(() => setStatus(''), 500); 
    }
  };

  return {
    hasBadge,
    isMinting,
    status,
    canMint,
    handleMint,
  };
}
