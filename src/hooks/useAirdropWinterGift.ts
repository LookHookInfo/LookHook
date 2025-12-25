import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react';
import { airdropWinterGiftContract } from '../utils/contracts';
import { useCallback, useState, useEffect } from 'react';
import { prepareContractCall, toEther, getContractEvents, prepareEvent } from 'thirdweb';

export function useAirdropWinterGift() {
  const account = useActiveAccount();
  const [claimedCount, setClaimedCount] = useState<number | null>(null);

  const {
    data: claimableAmount,
    isLoading: isClaimableAmountLoading,
    refetch: refetchClaimableAmount,
  } = useReadContract({
    contract: airdropWinterGiftContract,
    method: 'getClaimableAmount',
    params: [account?.address || ''],
    queryOptions: {
      enabled: !!account,
    },
  });

  const { data: isClaimed, isLoading: isClaimedLoading } = useReadContract({
    contract: airdropWinterGiftContract,
    method: 'claimed',
    params: [account?.address || ''],
    queryOptions: {
      enabled: !!account,
    },
  });

  const { data: welcomeCount, isLoading: isWelcomeCountLoading } = useReadContract({
    contract: airdropWinterGiftContract,
    method: 'welcomeCount',
    params: [],
  });

  const { data: welcomeLimit, isLoading: isWelcomeLimitLoading } = useReadContract({
    contract: airdropWinterGiftContract,
    method: 'WELCOME_LIMIT',
    params: [],
  });

  const { mutate: sendClaimTransaction, isPending: isClaiming } = useSendTransaction();
  const { mutate: sendWelcomeClaimTransaction, isPending: isWelcomeClaiming } = useSendTransaction();

  useEffect(() => {
    async function fetchClaimedCount() {
      const claimedEvent = prepareEvent({
        signature: 'event Claimed(address indexed user, uint256 amount)',
      });
      const claimedEvents = await getContractEvents({
        contract: airdropWinterGiftContract,
        events: [claimedEvent],
      });
      setClaimedCount(claimedEvents.length);
    }
    fetchClaimedCount();
  }, []);

  const isWelcomeBonusAvailable =
    !isWelcomeCountLoading &&
    !isWelcomeLimitLoading &&
    typeof welcomeCount === 'bigint' &&
    typeof welcomeLimit === 'bigint' &&
    welcomeCount < welcomeLimit;

  const handleClaim = useCallback(async () => {
    if (!account) return;
    const tx = prepareContractCall({
      contract: airdropWinterGiftContract,
      method: 'claim',
    });
    sendClaimTransaction(tx, {
      onSuccess: () => {
        refetchClaimableAmount();
      },
    });
  }, [account, sendClaimTransaction, refetchClaimableAmount]);

  const handleWelcomeClaim = useCallback(async () => {
    if (!account) return;
    const tx = prepareContractCall({
      contract: airdropWinterGiftContract,
      method: 'welcomeClaim',
    });
    sendWelcomeClaimTransaction(tx, {
      onSuccess: () => {
        refetchClaimableAmount();
      },
    });
  }, [account, sendWelcomeClaimTransaction, refetchClaimableAmount]);

  const isLoading =
    isClaimableAmountLoading || isClaimedLoading || isWelcomeCountLoading || isWelcomeLimitLoading;

  const formattedClaimableAmount = claimableAmount ? parseFloat(toEther(claimableAmount)) : 0;

  return {
    claimableAmount: formattedClaimableAmount,
    isClaimed,
    isWelcomeBonusAvailable,
    handleClaim,
    handleWelcomeClaim,
    isLoading: isLoading || isClaiming || isWelcomeClaiming,
    claimedCount,
  };
}

