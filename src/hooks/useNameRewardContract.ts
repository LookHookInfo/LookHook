import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react';
import { nameRewardContract, ourNftContract, hashcoinContract } from '../utils/contracts';
import { useCallback } from 'react';
import { prepareContractCall, toEther } from 'thirdweb';

export function useNameRewardContract() {
  const account = useActiveAccount();
  const address = account?.address;

  const { data: canClaim, isLoading: isCanClaimLoading } = useReadContract({
    contract: nameRewardContract,
    method: 'canClaim',
    params: [address || ''],
    queryOptions: {
      enabled: !!address,
    },
  });

  const { data: hasClaimed, isLoading: isClaimedLoading } = useReadContract({
    contract: nameRewardContract,
    method: 'claimed',
    params: [address || ''],
    queryOptions: {
      enabled: !!address,
    },
  });

  const { data: ourNftBalance, isLoading: isOurNftBalanceLoading } = useReadContract({
    contract: ourNftContract,
    method: 'balanceOf',
    params: [address || ''],
    queryOptions: {
      enabled: !!address,
    },
  });

  const { data: poolBalance, isLoading: isPoolBalanceLoading } = useReadContract({
    contract: hashcoinContract,
    method: 'balanceOf',
    params: [nameRewardContract.address],
  });

  const poolRewardBalance = poolBalance ? parseFloat(toEther(poolBalance)).toFixed(2) : '0';

  const hasOurNft = ourNftBalance && ourNftBalance > 0n;

  const { mutate: sendClaimTx, isPending: isClaiming } = useSendTransaction();

  const claimReward = useCallback(() => {
    if (!canClaim) return;

    const transaction = prepareContractCall({
      contract: nameRewardContract,
      method: 'claim',
      params: [],
    });
    sendClaimTx(transaction);
  }, [canClaim, sendClaimTx]);

  return {
    canClaim,
    hasClaimed,
    isClaiming,
    poolRewardBalance,
    isDataLoading: isCanClaimLoading || isClaimedLoading || isOurNftBalanceLoading || isPoolBalanceLoading,
    claimReward,
    hasOurNft,
  };
}
