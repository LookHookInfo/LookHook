import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { encodeFunctionData } from 'viem';
import { namePublicClient } from '../lib/viem/client';
import { nameContract, hashcoinContract } from '../utils/contracts';
import { nameContractAbi } from '../utils/nameContractAbi';
import erc20Abi from '../utils/erc20';
import { useGmNameFeed } from './useGmNameFeed';

const MAX_NAME_LENGTH = 15;
const MAX_NAMES_PER_ADDRESS = 20;

export function useNameContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address;

  const [nameInput, setNameInput] = useState('');
  const [isNameTakenLoading, setIsNameTakenLoading] = useState(false);
  const [isTaken, setIsTaken] = useState<boolean | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const { domain, isLoading } = useGmNameFeed();

  const price = domain?.namePrice;
  const hasDiscount = domain?.hasDiscount;
  const registeredNamesCount = domain?.nameBalance;
  const balance = domain?.hashBalance;
  const registeredName = domain?.primaryName;

  // Debounced check for name availability (not in aggregator)
  useEffect(() => {
    if (!nameInput) {
      setIsTaken(null);
      return;
    }

    setIsNameTakenLoading(true);
    const handler = setTimeout(async () => {
      try {
        const taken = await namePublicClient.readContract({
          address: nameContract.address as `0x${string}`,
          abi: nameContractAbi,
          functionName: 'isNameTaken',
          args: [nameInput],
        }) as boolean;
        setIsTaken(taken);
      } catch (error) {
        console.error('Failed to check if name is taken:', error);
        setIsTaken(null);
      } finally {
        setIsNameTakenLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [nameInput]);

  const displayPrice = useMemo(() => {
    if (!price) return undefined;
    return hasDiscount ? price / 2n : price;
  }, [price, hasDiscount]);

  const hasSufficientBalance = useMemo(() => {
    if (balance === undefined || displayPrice === undefined) return false;
    return balance >= displayPrice;
  }, [balance, displayPrice]);

  const unifiedClaim = useCallback(async () => {
    if (!account || !displayPrice || !nameInput) {
      console.error('Required information is missing for claim.');
      return;
    }

    setIsConfirming(true);
    try {
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [nameContract.address as `0x${string}`, displayPrice],
      });

      const { transactionHash: approveHash } = await account.sendTransaction({
        to: hashcoinContract.address as `0x${string}`,
        data: approveData,
        chainId: 8453,
      });

      await namePublicClient.waitForTransactionReceipt({ hash: approveHash as `0x${string}` });

      const registerData = encodeFunctionData({
        abi: nameContractAbi,
        functionName: 'register',
        args: [nameInput],
      });

      const { transactionHash: registerHash } = await account.sendTransaction({
        to: nameContract.address as `0x${string}`,
        data: registerData,
        chainId: 8453,
      });

      await namePublicClient.waitForTransactionReceipt({ hash: registerHash as `0x${string}` });

      await queryClient.invalidateQueries({ queryKey: ['gmNameFeed'] });
      setIsTaken(true);
    } catch (error) {
      console.error('Unified claim error:', error);
    } finally {
      setIsConfirming(false);
    }
  }, [account, displayPrice, nameInput, queryClient]);

  return {
    nameInput,
    setNameInput,
    isTaken,
    isNameTakenLoading,
    price,
    displayPrice,
    balance,
    registeredName,
    registeredNamesCount: registeredNamesCount !== undefined ? Number(registeredNamesCount) : null,
    isLoading,
    isConfirming,
    hasSufficientBalance,
    unifiedClaim,
    maxNameLength: MAX_NAME_LENGTH,
    maxNamesPerAddress: MAX_NAMES_PER_ADDRESS,
  };
}
