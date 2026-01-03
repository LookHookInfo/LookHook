import { useState, useCallback, useEffect } from 'react';
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react';
import { balanceOf as erc20BalanceOf, approve } from 'thirdweb/extensions/erc20';
import { balanceOf as erc721BalanceOf } from 'thirdweb/extensions/erc721';
import { prepareContractCall, sendAndConfirmTransaction } from 'thirdweb';
import { parseEther } from 'viem';

import { gmContract, gmnftContract } from '../utils/contracts';

const BURN_AMOUNT = 30;
const BURN_AMOUNT_WEI = parseEther(String(BURN_AMOUNT));

export function useGMNFTContract() {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending: isTxPending } = useSendTransaction();
  const [isApproving, setIsApproving] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  const { data: gmBalance, refetch: refetchGMBalance } = useReadContract(erc20BalanceOf, {
    contract: gmContract,
    address: account?.address || '',
    queryOptions: { enabled: !!account },
  });

  const { data: gmnftBalance, refetch: refetchGMNFTBalance } = useReadContract(erc721BalanceOf, {
    contract: gmnftContract,
    owner: account?.address || '',
    queryOptions: { enabled: !!account },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    contract: gmContract,
    method: 'allowance',
    params: [account?.address || '', gmnftContract.address],
    queryOptions: { enabled: !!account },
  });

  const hasEnoughGM = gmBalance ? gmBalance >= BURN_AMOUNT_WEI : false;
  const hasGMNFT = gmnftBalance ? gmnftBalance > 0n : false;
  const isApproved = allowance ? allowance >= BURN_AMOUNT_WEI : false;

  const handleBurnAndMint = useCallback(async () => {
    if (!account) return;
    setIsBurning(true);
    try {
      const transaction = prepareContractCall({
        contract: gmnftContract,
        method: 'burnAndMint',
        params: [],
      });
      sendTransaction(transaction, {
        onSuccess: () => {
          refetchGMBalance();
          refetchGMNFTBalance();
        },
      });
    } catch (error) {
      console.error('Failed to burn and mint', error);
      setIsBurning(false); // Ensure burning is reset on error
    }
  }, [account, sendTransaction, refetchGMBalance, refetchGMNFTBalance]);

  const handleUnifiedAction = useCallback(async () => {
    if (!account) return;

    if (!isApproved) {
      setIsApproving(true);
      try {
        const approveTx = approve({
          contract: gmContract,
          spender: gmnftContract.address,
          amount: BURN_AMOUNT,
        });
        await sendAndConfirmTransaction({ transaction: approveTx, account });
        refetchAllowance();
        setIsApproving(false);
        await handleBurnAndMint(); // Proceed to mint after approval
      } catch (error) {
        console.error('Failed to approve GM tokens', error);
        setIsApproving(false);
      }
    } else {
      await handleBurnAndMint();
    }
  }, [account, isApproved, refetchAllowance, handleBurnAndMint]);

  const isProcessing = isTxPending || isApproving || isBurning;

  // Manually update isBurning based on isTxPending
  useEffect(() => {
    if (!isTxPending) {
      setIsBurning(false);
    }
  }, [isTxPending]);


  return {
    gmBalance,
    BURN_AMOUNT,
    hasEnoughGM,
    hasGMNFT,
    isApproved,
    isProcessing,
    handleUnifiedAction,
  };
}
