import { useState, useCallback } from 'react';
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall, waitForReceipt } from 'thirdweb';
import { namebadgeContract } from '../utils/contracts';
import { useQueryClient } from '@tanstack/react-query';

export function useNameBadgeContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { mutateAsync: sendTx } = useSendTransaction();
  const accountAddress = account?.address || '0x0000000000000000000000000000000000000000';

  const [isMinting, setIsMinting] = useState(false);

  const balanceOfQueryKey = [namebadgeContract.chain.id, namebadgeContract.address, 'balanceOf', [accountAddress]];

  const {
    data: balance,
    isLoading: isCheckingBadge,
  } = useReadContract({
    contract: namebadgeContract,
    method: 'balanceOf',
    params: [accountAddress],
    queryOptions: {
      enabled: !!account,
      staleTime: 300000, // 5 minutes
    },
  });

  const hasBadge = balance !== undefined && balance > 0n;

  const claimBadge = useCallback(async () => {
    if (!account) {
      console.error("Wallet not connected");
      return;
    }

    setIsMinting(true);
    try {
      const transaction = prepareContractCall({
        contract: namebadgeContract,
        method: 'claimBadge',
        params: [],
      });
      const { transactionHash } = await sendTx(transaction);
      await waitForReceipt({ 
        transactionHash, 
        chain: namebadgeContract.chain, 
        client: namebadgeContract.client 
      });
      // Invalidate the query to refetch the balance
      await queryClient.invalidateQueries({ queryKey: balanceOfQueryKey });
    } catch (error) {
      console.error('Error claiming badge:', error);
    } finally {
      setIsMinting(false);
    }
  }, [account, sendTx, queryClient, balanceOfQueryKey]);

  return {
    hasBadge,
    isCheckingBadge,
    isMinting,
    claimBadge,
  };
}
