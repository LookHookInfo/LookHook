import { useCallback } from 'react';
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react';
import { namebadgeContract } from '../utils/contracts';
import { prepareContractCall } from 'thirdweb';

export function useNameBadgeContract() {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending: isMinting } = useSendTransaction();

  const { data: hasBadge, isLoading: isCheckingBadge } = useReadContract({
    contract: namebadgeContract,
    method: 'badgeClaimed',
    params: [account?.address || ''],
    queryOptions: {
      enabled: !!account,
    },
  });

  const claimBadge = useCallback(async () => {
    console.log('claimBadge function called');
    if (!account) {
      console.log('No account connected, exiting claimBadge.');
      return;
    }
    try {
      console.log('Preparing claimBadge transaction...');
      const transaction = prepareContractCall({
        contract: namebadgeContract,
        method: 'claimBadge',
        params: [],
      });
      console.log('Transaction prepared:', transaction);

      console.log('Sending transaction...');
      const result = await sendTransaction(transaction);
      console.log('Transaction sent, result:', result);
    } catch (error) {
      console.error('Error claiming badge:', error);
    }
  }, [account, sendTransaction]);

  return {
    hasBadge,
    isCheckingBadge,
    isMinting,
    claimBadge,
  };
}
