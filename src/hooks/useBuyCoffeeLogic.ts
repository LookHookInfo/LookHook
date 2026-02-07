import { useState, useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { readContract, type ThirdwebContract } from 'thirdweb';
import { toEther } from 'thirdweb/utils';
import { type Abi } from 'viem';
import { buyMeACoffeeContract, nameContract } from '../utils/contracts';

export function useBuyCoffeeLogic() {
  const [coffeeCount, setCoffeeCount] = useState(1);
  const COFFEE_PRICE_USD = 5;

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
      createThirdwebQuery(buyMeACoffeeContract, 'totalCoffee', []),
      createThirdwebQuery(buyMeACoffeeContract, 'topDonor', []),
      createThirdwebQuery(buyMeACoffeeContract, 'topDonorAmount', []),
      createThirdwebQuery(buyMeACoffeeContract, 'getCoffeePriceInETH', []),
    ];
  }, []);

  const results = useQueries({ queries });

  const [
    { data: totalCoffee, isLoading: isLoadingTotalCoffee },
    { data: topDonor, isLoading: isLoadingTopDonor },
    { data: topDonorAmount },
    { data: coffeePriceInETH, isLoading: isLoadingCoffeePrice },
  ] = results;

  // Dependent query for topDonorName using useQuery for better readability
  const { data: topDonorName, isLoading: isLoadingTopDonorName } = useQuery({
    queryKey: [nameContract.address, 'getPrimaryName', topDonor],
    queryFn: () =>
      readContract({
        contract: nameContract,
        method: 'getPrimaryName',
        params: [topDonor!],
      }),
    enabled: !!topDonor && topDonor !== '0x0000000000000000000000000000000000000000',
    staleTime: 300000, // 5 minutes
  });

  const totalTipInWei = coffeePriceInETH ? BigInt(coffeeCount) * coffeePriceInETH : 0n;
  const totalTipInETH = toEther(totalTipInWei);
  const usdValue = COFFEE_PRICE_USD * coffeeCount;

  const formattedTopDonorAmount = topDonorAmount ? parseFloat(toEther(topDonorAmount)).toFixed(4) : '0';

  const shortTopDonorAddress = topDonor ? `${topDonor.slice(0, 6)}...${topDonor.slice(-4)}` : null;

  const topDonorDisplayName = topDonorName
    ? topDonorName.length > 12
      ? `${topDonorName.slice(0, 10)}....hash`
      : `${topDonorName}.hash`
    : shortTopDonorAddress;

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
  };
}
