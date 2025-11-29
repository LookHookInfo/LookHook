import { useState } from "react";
import { useReadContract } from "thirdweb/react";
import { toEther } from "thirdweb";
import { buyMeACoffeeContract, nameContract } from "../utils/contracts";

export function useBuyCoffeeLogic() {
  const [coffeeCount, setCoffeeCount] = useState(1);
  const COFFEE_PRICE_USD = 5;

  const { data: totalCoffee, isLoading: isLoadingTotalCoffee } =
    useReadContract({
      contract: buyMeACoffeeContract,
      method: "totalCoffee",
      params: [],
    });

  const { data: topDonor, isLoading: isLoadingTopDonor } = useReadContract({
    contract: buyMeACoffeeContract,
    method: "topDonor",
    params: [],
  });

  const { data: topDonorAmount } = useReadContract({
    contract: buyMeACoffeeContract,
    method: "topDonorAmount",
    params: [],
  });

  const { data: coffeePriceInETH, isLoading: isLoadingCoffeePrice } =
    useReadContract({
      contract: buyMeACoffeeContract,
      method: "getCoffeePriceInETH",
      params: [],
    });

  const { data: topDonorName, isLoading: isLoadingTopDonorName } =
    useReadContract({
      contract: nameContract,
      method: "function getPrimaryName(address user) view returns (string)",
      params: [topDonor!],
      queryOptions: {
        enabled:
          !!topDonor &&
          topDonor !== "0x0000000000000000000000000000000000000000",
      },
    });

  const totalTipInWei = coffeePriceInETH
    ? BigInt(coffeeCount) * coffeePriceInETH
    : 0n;
  const totalTipInETH = toEther(totalTipInWei);
  const usdValue = COFFEE_PRICE_USD * coffeeCount;

  const formattedTopDonorAmount = topDonorAmount
    ? parseFloat(toEther(topDonorAmount)).toFixed(4)
    : "0";

  const shortTopDonorAddress = topDonor
    ? `${topDonor.slice(0, 6)}...${topDonor.slice(-4)}`
    : null;

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
    topDonor
  };
}
