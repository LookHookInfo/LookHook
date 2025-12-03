import { useCallback } from 'react';
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react';
import { namebadgeContract } from '../utils/contracts';
import { prepareContractCall } from 'thirdweb';

export function useNameBadgeContract() {
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction, isPending: isMinting } = useSendTransaction();

  const {
    data: balance,
    isLoading: isCheckingBadge,
    refetch: refetchHasBadge,
  } = useReadContract({
    contract: namebadgeContract,
    method: 'balanceOf',
    params: account ? [account.address] : undefined,
    queryOptions: {
      enabled: !!account,
    },
  });

  const hasBadge = balance !== undefined && balance > 0n;

  const claimBadge = useCallback(async () => {
    if (!account) {
      return;
    }
    try {
      const transaction = prepareContractCall({
        contract: namebadgeContract,
        method: 'claimBadge',
        params: [],
      });
      await sendTransaction(transaction);
      refetchHasBadge();
    } catch (error) {
      console.error('Error claiming badge:', error);
    }
  }, [account, sendTransaction, refetchHasBadge]);

  return {
    hasBadge,
    isCheckingBadge,
    isMinting,
    claimBadge,
  };
}
