import { useState, useMemo } from 'react';
import { useQueryClient, useQueries } from '@tanstack/react-query';
import {
  useActiveAccount,
  useSendTransaction,
} from 'thirdweb/react';
import { prepareContractCall, waitForReceipt, readContract, type ThirdwebContract } from 'thirdweb';
import { type Abi } from 'viem';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';
import { parseEther } from 'ethers';
import {
  drubContract,
  drub100BadgeContract,
} from '@/utils/contracts';

const BADGE_PRICE = parseEther('100');

export function useDrub100Badge() {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();
  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState('');

  const accountAddress = account?.address || '0x0000000000000000000000000000000000000000';

  const createThirdwebQuery = <TAbi extends Abi, TFunctionName extends string, TArgs extends readonly unknown[]>(
    contractInstance: ThirdwebContract<TAbi>,
    methodName: TFunctionName,
    params: TArgs,
    enabled: boolean = true,
  ) => ({
    queryKey: [contractInstance.address, methodName, ...params],
    queryFn: () => readContract({ contract: contractInstance, method: methodName as any, params: params as any }),
    enabled,
    staleTime: 300000, // 5 minutes
  });

  const queries = useMemo(() => {
    return [
      createThirdwebQuery(drub100BadgeContract, 'hasBadge', [accountAddress], !!account),
      createThirdwebQuery(drubContract, 'balanceOf', [accountAddress], !!account),
      createThirdwebQuery(drubContract, 'allowance', [accountAddress, drub100BadgeContract.address], !!account),
    ];
  }, [account, accountAddress]);

  const results = useQueries({ queries });
  
  const [
    { data: hasBadge },
    { data: drubBalance },
    { data: drubAllowance },
  ] = results;

  const canMint = drubBalance !== undefined && drubBalance >= BADGE_PRICE;

  const handleMint = async () => {
    if (!account) {
      setStatus('Please connect wallet.');
      return;
    }
    if (hasBadge) {
      setStatus('You already have this badge.');
      setTimeout(() => setStatus(''), 5000);
      return;
    }
    if (!canMint) {
      setStatus('Insufficient DRUB balance.');
      setTimeout(() => setStatus(''), 5000);
      return;
    }

    setIsMinting(true);
    setStatus('');

    try {
      if (drubAllowance === undefined || drubAllowance < BADGE_PRICE) {
        const approveTx = prepareContractCall({
          contract: drubContract,
          method: 'approve',
          params: [drub100BadgeContract.address, BADGE_PRICE],
        });
        const { transactionHash: approveTxHash } = await sendTx(approveTx);
        await waitForReceipt({ client, chain, transactionHash: approveTxHash });
        await queryClient.invalidateQueries({ queryKey: [drubContract.address, 'allowance', accountAddress, drub100BadgeContract.address] });
      }

      const mintTx = prepareContractCall({
        contract: drub100BadgeContract,
        method: 'mint',
        params: [],
      });
      const { transactionHash: mintTxHash } = await sendTx(mintTx);
      await waitForReceipt({ client, chain, transactionHash: mintTxHash });
      
      await queryClient.invalidateQueries({ queryKey: [drub100BadgeContract.address, 'hasBadge', accountAddress] });
      await queryClient.invalidateQueries({ queryKey: [drubContract.address, 'balanceOf', accountAddress] });
      
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message.substring(0, 50) : 'Transaction failed'}`);
    } finally {
      setIsMinting(false);
      setTimeout(() => setStatus(''), 5000); 
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
