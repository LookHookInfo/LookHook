import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { encodeFunctionData } from 'viem';
import { buyMeACoffeeContract } from '../utils/contracts';
import { tipsPublicClient } from '../lib/viem/client';
import CoffeeQuestAbi from '../utils/buyMeACoffeeAbi';

export function useBuyCoffeeLogic() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();

  const { data: coffeePriceInETH, isLoading: isLoadingPrice } = useQuery({
    queryKey: [buyMeACoffeeContract.address, 'getCoffeePriceInETH'],
    queryFn: async () => tipsPublicClient.readContract({
      address: buyMeACoffeeContract.address as `0x${string}`,
      abi: CoffeeQuestAbi,
      functionName: 'getCoffeePriceInETH',
      args: [],
    }) as Promise<bigint>,
    staleTime: 600000, // 5 minutes
  });

  const { mutate: buyCoffee, isPending: isBuyingCoffee } = useMutation({
    mutationFn: async (count: number = 1) => {
      if (!account) throw new Error('Wallet not connected');
      if (!coffeePriceInETH) throw new Error('Coffee price not loaded');

      const totalValue = coffeePriceInETH * BigInt(count);
      const data = encodeFunctionData({
        abi: CoffeeQuestAbi,
        functionName: 'buyMeMultipleCoffee',
        args: [BigInt(count)],
      });

      const { transactionHash } = await account.sendTransaction({
        to: buyMeACoffeeContract.address as `0x${string}`,
        data,
        value: totalValue,
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
    buyCoffee,
    isBuyingCoffee,
    coffeePriceInETH,
    isLoadingPrice,
  };
}
