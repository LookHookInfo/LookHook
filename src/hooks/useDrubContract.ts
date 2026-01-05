import { useState, useMemo } from 'react';
import {
  useReadContract,
  useActiveAccount,
  useSendTransaction,
} from 'thirdweb/react';
import { prepareContractCall, waitForReceipt } from 'thirdweb';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';
import { formatUnits, parseEther } from 'ethers';
import {
  drubContract,
  vaultDrubContract,
  hashcoinContract,
  nfpmContract,
} from '@/utils/contracts';

export function useDrubContract() {
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();
  const [status, setStatus] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

  // Individual loading states for each action
  const [isBuying, setIsBuying] = useState(false);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  // DRUB Contract Reads
  const { data: drubPerHash, refetch: refetchDrubPerHash } = useReadContract({
    contract: drubContract,
    method: 'getDrubPerHash',
    params: [],
  });

  const { data: drubTotalSupply, refetch: refetchDrubTotalSupply } =
    useReadContract({
      contract: drubContract,
      method: 'totalSupply',
      params: [],
    });

  const { data: drubBalance, refetch: refetchDrubBalance } = useReadContract({
    contract: drubContract,
    method: 'balanceOf',
    params: [account?.address || '0x0000000000000000000000000000000000000000'],
    queryOptions: { enabled: !!account },
  });

  // HASH Contract Reads
  const { data: hashBalance, refetch: refetchHashBalance } = useReadContract({
    contract: hashcoinContract,
    method: 'balanceOf',
    params: [account?.address || '0x0000000000000000000000000000000000000000'],
    queryOptions: { enabled: !!account },
  });

  const { data: hashAllowanceToDrub, refetch: refetchHashAllowanceToDrub } =
    useReadContract({
      contract: hashcoinContract,
      method: 'allowance',
      params: [account?.address || '0x0000000000000000000000000000000000000000', drubContract.address],
      queryOptions: { enabled: !!account },
    });

  // Vault Contract Reads
  const { data: vaultHashBalance, refetch: refetchVaultHashBalance } = useReadContract({
    contract: hashcoinContract,
    method: 'balanceOf',
    params: [vaultDrubContract.address],
    queryOptions: { enabled: true },
  });

  const { data: vaultDrubBalance, refetch: refetchVaultDrubBalance } = useReadContract({
    contract: drubContract,
    method: 'balanceOf',
    params: [vaultDrubContract.address],
    queryOptions: { enabled: true },
  });

  const { data: lpPositionsCount, refetch: refetchLpPositionsCount } =
    useReadContract({
      contract: nfpmContract,
      method: 'balanceOf',
      params: [vaultDrubContract.address],
      queryOptions: { enabled: true },
    });

  // Central Bank Rate (Rub per Usd)
  const { data: rubPerUsd, refetch: refetchRubPerUsd } = useReadContract({
    contract: drubContract,
    method: 'rubPerUsd',
    params: [],
    queryOptions: { enabled: true },
  });

  const isVaultEmpty = useMemo(() => {
    if (vaultHashBalance === undefined || vaultDrubBalance === undefined) {
      return true;
    }
    const oneTokenInWei = parseEther('1');
    return vaultHashBalance < oneTokenInWei || vaultDrubBalance < oneTokenInWei;
  }, [vaultHashBalance, vaultDrubBalance]);

  // Unified Buy Function
  const unifiedBuy = async () => {
    if (!account || !buyAmount) {
      setStatus('Please connect wallet and enter an amount.');
      return;
    }
    setIsBuying(true);
    setStatus('Processing...');

    try {
      const amountWei = parseEther(buyAmount);

      // Step 1: Use allowance from the hook
      const currentAllowance = hashAllowanceToDrub ?? 0n;

      // Step 2: Approve if necessary
      if (currentAllowance < amountWei) {
        const approveTx = prepareContractCall({
          contract: hashcoinContract,
          method: 'approve',
          params: [drubContract.address, amountWei],
        });
        const { transactionHash: approveTxHash } = await sendTx(approveTx);
        await waitForReceipt({ client, chain, transactionHash: approveTxHash });
        refetchHashAllowanceToDrub();
      }

      // Step 3: Buy DRUB
      const buyTx = prepareContractCall({
        contract: drubContract,
        method: 'buyDRUB',
        params: [amountWei],
      });
      const { transactionHash: buyTxHash } = await sendTx(buyTx);
      await waitForReceipt({ client, chain, transactionHash: buyTxHash });
      
      refetchAll();
      setStatus(''); // Clear status on success
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message.substring(0, 50) : 'Transaction failed'}`);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsBuying(false);
    }
  };


  // Functions for Vault's liquidity management (triggered by user)
  const addLiquidity = async () => {
    if (!account) {
      setStatus('Please connect your wallet.');
      return;
    }
    setIsAddingLiquidity(true);
    setStatus('Processing...');
    try {
      const transaction = prepareContractCall({
        contract: vaultDrubContract,
        method: 'addLiquidity',
        params: [], 
      });

      const { transactionHash } = await sendTx(transaction);
      await waitForReceipt({ client, chain, transactionHash });
      refetchAll(); 
      setStatus('');
    } catch (error) {
      setStatus(`Add liquidity failed: ${error instanceof Error ? error.message.substring(0, 100) : String(error)}`);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  const burnAllPositions = async () => {
    if (!account) {
      setStatus('Please connect your wallet.');
      return;
    }
    setIsBurning(true);
    setStatus('Processing...');
    try {
      const transaction = prepareContractCall({
        contract: vaultDrubContract,
        method: 'burnAllPositions',
        params: [],
      });
      const { transactionHash } = await sendTx(transaction);
      await waitForReceipt({ client, chain, transactionHash });
      refetchAll();
      setStatus('');
    } catch (error) {
      setStatus(`Burn LP failed: ${error instanceof Error ? error.message.substring(0, 100) : String(error)}`);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsBurning(false);
    }
  };

  const refetchAll = () => {
    refetchDrubPerHash();
    refetchDrubTotalSupply();
    refetchDrubBalance();
    refetchHashBalance();
    refetchHashAllowanceToDrub();
    refetchVaultHashBalance();
    refetchVaultDrubBalance();
    refetchLpPositionsCount();
    refetchRubPerUsd(); // Add new refetch
  };

  return {
    status,
    buyAmount,
    setBuyAmount,
    drubPerHash: drubPerHash ? parseFloat(formatUnits(drubPerHash, 18)).toFixed(4) : '0.0000',
    drubTotalSupply: drubTotalSupply ? parseFloat(formatUnits(drubTotalSupply, 18)).toFixed(2) : '0.00',
    drubBalance: drubBalance ? parseFloat(formatUnits(drubBalance, 18)).toFixed(2) : '0.00',
    hashBalance: hashBalance ? parseFloat(formatUnits(hashBalance, 18)).toFixed(0) : '0',
    rubPerUsd: rubPerUsd ? parseFloat(formatUnits(rubPerUsd, 18)).toFixed(2) : '0.00', // Return new value
    unifiedBuy, // The only function needed for the buy button
    refetchAll,
    isBuying,
    isAddingLiquidity,
    isBurning,
    addLiquidity,
    burnAllPositions,
    lpPositionsCount: lpPositionsCount?.toString() || '0', 
    isVaultEmpty,
    vaultHashBalance: vaultHashBalance !== undefined ? formatUnits(vaultHashBalance, 18) : '0.00',
    vaultDrubBalance: vaultDrubBalance !== undefined ? formatUnits(vaultDrubBalance, 18) : '0.00',
  };
}