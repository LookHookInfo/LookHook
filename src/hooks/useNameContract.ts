import { useState, useMemo, useEffect, useCallback } from 'react';
import { readContract, prepareContractCall, waitForReceipt } from 'thirdweb';
import { useSendTransaction, useActiveAccount } from 'thirdweb/react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { nameContract, hashcoinContract } from '../utils/contracts';
import type { ThirdwebContract } from 'thirdweb';

const MAX_NAME_LENGTH = 15;
const MAX_NAMES_PER_ADDRESS = 20;

// Helper function from optimization plan to structure queries
const createThirdwebQuery = ({
  contract,
  method,
  params = [],
  queryOptions = {},
}: {
  contract: ThirdwebContract<any>; // Use a less strict type to avoid conflicts
  method: string;
  params?: unknown[];
  queryOptions?: object;
}) => {
  const queryKey = [contract.chain.id, contract.address, method, params];
  return {
    queryKey,
    queryFn: () => readContract({ contract, method, params } as any), // Use 'as any' to bypass strict type checking here
    ...queryOptions,
  };
};

export function useNameContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const { mutateAsync: sendTx } = useSendTransaction();
  const accountAddress = account?.address;

  // State for the user's input
  const [nameInput, setNameInput] = useState('');
  const [isNameTakenLoading, setIsNameTakenLoading] = useState(false);
  const [isTaken, setIsTaken] = useState<boolean | null>(null);
  const [isConfirming, setIsConfirming] = useState(false); // New loading state for the transaction

  const queries = useMemo(() => {
    return [
      createThirdwebQuery({
        contract: nameContract,
        method: 'PRICE',
      }),
      createThirdwebQuery({
        contract: nameContract,
        method: 'hasDiscount',
        params: [accountAddress],
        queryOptions: { enabled: !!accountAddress, staleTime: 300000 },
      }),
      createThirdwebQuery({
        contract: nameContract,
        method: 'balanceOf',
        params: [accountAddress],
        queryOptions: { enabled: !!accountAddress, staleTime: 300000 },
      }),
      createThirdwebQuery({
        contract: hashcoinContract,
        method: 'balanceOf',
        params: [accountAddress],
        queryOptions: { enabled: !!accountAddress, staleTime: 300000 },
      }),
      createThirdwebQuery({
        contract: nameContract,
        method: 'getPrimaryName',
        params: [accountAddress],
        queryOptions: { enabled: !!accountAddress, staleTime: 300000 },
      }),
    ];
  }, [accountAddress]);

  const queryResults = useQueries({
    queries,
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
        const taken = await readContract({
          contract: nameContract,
          method: 'isNameTaken',
          params: [nameInput],
        });
        setIsTaken(taken);
      } catch (error) {
        console.error('Failed to check if name is taken:', error);
        setIsTaken(null); // Set to null on error to indicate uncertainty
      } finally {
        setIsNameTakenLoading(false);
      }
    }, 500); // 500ms debounce timer

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
      const approveTx = await prepareContractCall({
        contract: hashcoinContract,
        method: 'approve',
        params: [nameContract.address, displayPrice],
      });
      const { transactionHash: approveHash } = await sendTx(approveTx);
      await waitForReceipt({
        client: hashcoinContract.client,
        chain: hashcoinContract.chain,
        transactionHash: approveHash,
      });

      // 2. Register the name
      const registerTx = await prepareContractCall({
        contract: nameContract,
        method: 'register',
        params: [nameInput],
      });
      const { transactionHash: registerHash } = await sendTx(registerTx);
      await waitForReceipt({
        client: nameContract.client,
        chain: nameContract.chain,
        transactionHash: registerHash,
      });

      console.log('Successfully registered name. Invalidating specific queries...');
      // More granular invalidation
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queries[2].queryKey }), // nameContract.balanceOf
        queryClient.invalidateQueries({ queryKey: queries[3].queryKey }), // hashcoinContract.balanceOf
        queryClient.invalidateQueries({ queryKey: queries[4].queryKey }), // nameContract.getPrimaryName
      ]);
      setIsTaken(true); // Optimistically set name as taken
    } catch (error) {
      console.error('Unified claim error:', error);
    } finally {
      setIsConfirming(false);
    }
  }, [account, displayPrice, nameInput, sendTx, queryClient, queries]);

  return {
    // Name input state and status
    nameInput,
    setNameInput,
    isTaken,
    isNameTakenLoading,

    // Original values from batched queries
    price,
    displayPrice,
    balance,
    registeredName,
    registeredNamesCount: registeredNamesCount !== undefined ? Number(registeredNamesCount) : null,

    // Statuses
    isLoading: areInitialQueriesLoading, // True when initial data is loading
    isConfirming: isConfirming, // True when the transaction is being confirmed

    // Booleans
    hasSufficientBalance,

    // Functions
    unifiedClaim: unifiedClaim,

    // Constants
    maxNameLength: MAX_NAME_LENGTH,
    maxNamesPerAddress: MAX_NAMES_PER_ADDRESS,
  };
}
