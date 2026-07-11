import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { encodeFunctionData } from 'viem';
import { namePublicClient } from '../lib/viem/client';
import { nameContract, hashcoinContract } from '../utils/contracts';
import { nameContractAbi } from '../utils/nameContractAbi';
import erc20Abi from '../utils/erc20';

const MAX_NAME_LENGTH = 15;
const MAX_NAMES_PER_ADDRESS = 20;

export function useNameContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const accountAddress = account?.address;

  // State for the user's input
  const [nameInput, setNameInput] = useState('');
  const [isNameTakenLoading, setIsNameTakenLoading] = useState(false);
  const [isTaken, setIsTaken] = useState<boolean | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const queryResults = useQueries({
    queries: [
      {
        queryKey: ['nameContract', 'PRICE'],
        queryFn: () => namePublicClient.readContract({
          address: nameContract.address as `0x${string}`,
          abi: nameContractAbi,
          functionName: 'PRICE',
        }),
        staleTime: Infinity,
      },
      {
        queryKey: ['nameContract', 'hasDiscount', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: nameContract.address as `0x${string}`,
          abi: nameContractAbi,
          functionName: 'hasDiscount',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300000,
      },
      {
        queryKey: ['nameContract', 'balanceOf', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: nameContract.address as `0x${string}`,
          abi: nameContractAbi,
          functionName: 'balanceOf',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300000,
      },
      {
        queryKey: ['hashcoinContract', 'balanceOf', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: hashcoinContract.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300000,
      },
      {
        queryKey: ['nameContract', 'getPrimaryName', accountAddress],
        queryFn: () => namePublicClient.readContract({
          address: nameContract.address as `0x${string}`,
          abi: nameContractAbi,
          functionName: 'getPrimaryName',
          args: [accountAddress as `0x${string}`],
        }),
        enabled: !!accountAddress,
        staleTime: 300000,
      },
    ],
    combine: (results) => {
      return {
        priceResult: results[0],
        hasDiscountResult: results[1],
        registeredNamesCountResult: results[2],
        hashBalanceResult: results[3],
        registeredNameResult: results[4],
        isLoading: results.some((res) => res.isLoading),
      };
    },
  });

  const {
    priceResult,
    hasDiscountResult,
    registeredNamesCountResult,
    hashBalanceResult,
    registeredNameResult,
    isLoading: areInitialQueriesLoading,
  } = queryResults;

  // Debounced check for name availability
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

  const price = priceResult.data as bigint | undefined;
  const hasDiscount = hasDiscountResult.data as boolean | undefined;
  const registeredNamesCount = registeredNamesCountResult.data as bigint | undefined;
  const balance = hashBalanceResult.data as bigint | undefined;
  const registeredName = registeredNameResult.data as string | undefined;

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
      // 1. Approve HASH spending
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

      // 2. Register the name
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

      console.log('Successfully registered name. Invalidating specific queries...');
      
      await queryClient.invalidateQueries({ queryKey: ['nameContract'] });
      await queryClient.invalidateQueries({ queryKey: ['hashcoinContract', 'balanceOf', accountAddress] });
      
      setIsTaken(true);
    } catch (error) {
      console.error('Unified claim error:', error);
    } finally {
      setIsConfirming(false);
    }
  }, [account, displayPrice, nameInput, queryClient, accountAddress]);

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
    isLoading: areInitialQueriesLoading,
    isConfirming: isConfirming,
    hasSufficientBalance,
    unifiedClaim: unifiedClaim,
    maxNameLength: MAX_NAME_LENGTH,
    maxNamesPerAddress: MAX_NAMES_PER_ADDRESS,
  };
}
