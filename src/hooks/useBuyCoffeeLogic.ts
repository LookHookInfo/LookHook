import { useState, useMemo } from 'react';
import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react'; // Remove useSendTransaction here
import { toEther } from 'thirdweb/utils'; // Keep helper for now
import { encodeFunctionData } from 'viem';
import { buyMeACoffeeContract, nameContract } from '../utils/contracts';
import { tipsPublicClient, publicClient } from '../lib/viem/client';
import CoffeeQuestAbi from '../utils/buyMeACoffeeAbi';
import { nameContractAbi } from '../utils/nameContractAbi';

export function useBuyCoffeeLogic() {
  const [coffeeCount, setCoffeeCount] = useState(1);
  const COFFEE_PRICE_USD = 5;
  const account = useActiveAccount(); // This is the Thirdweb Account object
  const queryClient = useQueryClient();
  // const { mutateAsync: sendTx } = useSendTransaction(); // REMOVED THIS LINE

  const queries = useMemo(() => {
    return [
      {
        queryKey: [buyMeACoffeeContract.address, 'totalCoffee'],
        queryFn: async () => tipsPublicClient.readContract({
          address: buyMeACoffeeContract.address as `0x${string}`,
          abi: CoffeeQuestAbi,
          functionName: 'totalCoffee',
          args: [],
        }),
        staleTime: 300000,
      },
      {
        queryKey: [buyMeACoffeeContract.address, 'topDonor'],
        queryFn: async () => tipsPublicClient.readContract({
          address: buyMeACoffeeContract.address as `0x${string}`,
          abi: CoffeeQuestAbi,
          functionName: 'topDonor',
          args: [],
        }),
        staleTime: 300000,
      },
      {
        queryKey: [buyMeACoffeeContract.address, 'topDonorAmount'],
        queryFn: async () => tipsPublicClient.readContract({
          address: buyMeACoffeeContract.address as `0x${string}`,
          abi: CoffeeQuestAbi,
          functionName: 'topDonorAmount',
          args: [],
        }),
        staleTime: 300000,
      },
      {
        queryKey: [buyMeACoffeeContract.address, 'getCoffeePriceInETH'],
        queryFn: async () => tipsPublicClient.readContract({
          address: buyMeACoffeeContract.address as `0x${string}`,
          abi: CoffeeQuestAbi,
          functionName: 'getCoffeePriceInETH',
          args: [],
        }),
        staleTime: 300000,
      },
    ] as const;
  }, []);

  const results = useQueries({ queries });

  const totalCoffee = results[0].data as bigint | undefined;
  const topDonor = results[1].data as `0x${string}` | undefined;
  const topDonorAmount = results[2].data as bigint | undefined;
  const coffeePriceInETH = results[3].data as bigint | undefined;

  const isLoadingTotalCoffee = results[0].isLoading;
  const isLoadingTopDonor = results[1].isLoading;
  const isLoadingCoffeePrice = results[3].isLoading;

  const { data: topDonorName, isLoading: isLoadingTopDonorName } = useQuery({
    queryKey: [nameContract.address, 'getPrimaryName', topDonor],
    queryFn: async () => {
      if (!topDonor || topDonor === '0x0000000000000000000000000000000000000000') return null;
      return tipsPublicClient.readContract({
        address: nameContract.address as `0x${string}`,
        abi: nameContractAbi,
        functionName: 'getPrimaryName',
        args: [topDonor as `0x${string}`],
      });
    },
    enabled: !!topDonor && topDonor !== '0x0000000000000000000000000000000000000000',
    staleTime: 300000,
  });

  const totalTipInWei = coffeePriceInETH ? BigInt(coffeeCount) * coffeePriceInETH : 0n;
  const totalTipInETH = toEther(totalTipInWei);
  const usdValue = COFFEE_PRICE_USD * coffeeCount;

  const formattedTopDonorAmount = topDonorAmount ? parseFloat(toEther(topDonorAmount)).toFixed(4) : '0';

  const topDonorAddress = topDonor as string | undefined;
  const shortTopDonorAddress = topDonorAddress ? `${topDonorAddress.slice(0, 6)}...${topDonorAddress.slice(-4)}` : null;

  const topDonorDisplayName = topDonorName
    ? (topDonorName as string).length > 12
      ? `${(topDonorName as string).slice(0, 10)}....hash`
      : `${topDonorName}.hash`
    : shortTopDonorAddress;

  const { mutate: buyCoffee, isPending: isBuyingCoffee } = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected');
      if (totalTipInWei === 0n) throw new Error('Coffee price not loaded or zero');

      const data = encodeFunctionData({
        abi: CoffeeQuestAbi,
        functionName: 'buyMeMultipleCoffee',
        args: [BigInt(coffeeCount)],
      });

      const { transactionHash } = await account.sendTransaction({ // Use account.sendTransaction directly
        to: buyMeACoffeeContract.address as `0x${string}`,
        data,
        value: totalTipInWei,
        chainId: 8453,
      });

      return tipsPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [buyMeACoffeeContract.address] });
    },
    onError: (error) => {
      console.error('❌ Failed to buy coffee:', error);
    },
  });

  return {
    coffeeCount,
    setCoffeeCount,
    totalCoffee,
    isLoadingTotalCoffee,
    isLoadingTopDonor,
    topDonorAmount,
    coffeePriceInETH,
    isLoadingCoffeePrice,
    isLoadingTopDonorName,
    totalTipInWei,
    totalTipInETH,
    usdValue,
    formattedTopDonorAmount,
    topDonorDisplayName,
    topDonor,
    buyCoffee,
    isBuyingCoffee,
  };
}
