import { useState, useMemo } from 'react';
import {
  useActiveAccount,
  useSendTransaction,
} from 'thirdweb/react';
import { useQueries, useQueryClient } from '@tanstack/react-query'; // Добавлен useQueryClient
import { prepareContractCall, waitForReceipt, readContract, type ThirdwebContract } from 'thirdweb';
import { type Abi } from 'viem';
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
  const queryClient = useQueryClient(); // Инициализируем QueryClient
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();
  const [status, setStatus] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

  // Individual loading states for each action
  const [isBuying, setIsBuying] = useState(false);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  // New Batched Contract Reads using useQueries
  const accountAddress = account?.address || '0x0000000000000000000000000000000000000000';
  const vaultAddress = vaultDrubContract.address;

  // Define a helper function to create Thirdweb contract calls that useQueries can execute
  const createThirdwebQuery = <TAbi extends Abi, TFunctionName extends string, TArgs extends readonly unknown[]>(
    contractInstance: ThirdwebContract<TAbi>,
    methodName: TFunctionName,
    params: TArgs,
    enabled: boolean = true,
  ) => ({
    queryKey: [contractInstance.address, methodName, ...params],
    queryFn: () => readContract({ contract: contractInstance, method: methodName as any, params: params as any }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 min
    refetchInterval: 1000 * 60 * 5, // 5 min
  });

  const queries = useMemo(() => {
    return [
      // DRUB Contract Queries
      createThirdwebQuery(drubContract, 'getDrubPerHash', []),
      createThirdwebQuery(drubContract, 'totalSupply', []),
      createThirdwebQuery(drubContract, 'balanceOf', [accountAddress], !!account),
      createThirdwebQuery(drubContract, 'balanceOf', [vaultAddress]),
      createThirdwebQuery(drubContract, 'rubPerUsd', []),

      // HASH Contract Queries
      createThirdwebQuery(hashcoinContract, 'balanceOf', [accountAddress], !!account),
      createThirdwebQuery(hashcoinContract, 'allowance', [accountAddress, drubContract.address], !!account),
      createThirdwebQuery(hashcoinContract, 'balanceOf', [vaultAddress]),

      // NFPM Contract Query
      createThirdwebQuery(nfpmContract, 'balanceOf', [vaultAddress]),
    ];
  }, [account, accountAddress, vaultAddress]);

  const results = useQueries({ queries });

  // Extract data from results
  const [
    { data: drubPerHash },
    { data: drubTotalSupply },
    { data: drubBalance },
    { data: vaultDrubBalance },
    { data: rubPerUsd },
    { data: hashBalance },
    { data: hashAllowanceToDrub },
    { data: vaultHashBalance },
    { data: lpPositionsCount },
  ] = results;

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
        // refetchAll() удален, так как он будет вызван после покупки
      }

      // Step 3: Buy DRUB
      const buyTx = prepareContractCall({
        contract: drubContract,
        method: 'buyDRUB',
        params: [amountWei],
      });
      const { transactionHash: buyTxHash } = await sendTx(buyTx);
      await waitForReceipt({ client, chain, transactionHash: buyTxHash });
      
      // Инвалидируем запросы, которые могли измениться после покупки
      await queryClient.invalidateQueries({ queryKey: [drubContract.address, 'balanceOf', accountAddress], exact: true });
      await queryClient.invalidateQueries({ queryKey: [drubContract.address, 'totalSupply'], exact: true });
      await queryClient.invalidateQueries({ queryKey: [drubContract.address, 'getDrubPerHash'], exact: true });
      await queryClient.invalidateQueries({ queryKey: [drubContract.address, 'rubPerUsd'], exact: true });
      
      await queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', accountAddress], exact: true });
      await queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'allowance'], exact: false });
      
      await queryClient.invalidateQueries({ queryKey: [nfpmContract.address, 'balanceOf', vaultAddress], exact: true });
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
      // Инвалидируем запросы, которые могли измениться после добавления ликвидности
      await queryClient.invalidateQueries({ queryKey: [drubContract.address, 'balanceOf', accountAddress], exact: true });
      await queryClient.invalidateQueries({ queryKey: [drubContract.address, 'balanceOf', vaultAddress], exact: true });
      
      await queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', accountAddress], exact: true });
      await queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', vaultAddress], exact: true });
      
      await queryClient.invalidateQueries({ queryKey: [nfpmContract.address, 'balanceOf', vaultAddress], exact: true });      setStatus('');
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
      // Инвалидируем запросы, которые могли измениться после сжигания позиций
      await queryClient.invalidateQueries({ queryKey: [drubContract.address, 'balanceOf', accountAddress], exact: true });
      await queryClient.invalidateQueries({ queryKey: [drubContract.address, 'balanceOf', vaultAddress], exact: true });
      
      await queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', accountAddress], exact: true });
      await queryClient.invalidateQueries({ queryKey: [hashcoinContract.address, 'balanceOf', vaultAddress], exact: true });
      
      await queryClient.invalidateQueries({ queryKey: [nfpmContract.address, 'balanceOf', vaultAddress], exact: true });      setStatus('');
    } catch (error) {
      setStatus(`Burn LP failed: ${error instanceof Error ? error.message.substring(0, 100) : String(error)}`);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsBurning(false);
    }
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
