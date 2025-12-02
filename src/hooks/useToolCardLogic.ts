import { useState } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  balanceOf as erc1155BalanceOf,
  getActiveClaimCondition,
  isApprovedForAll,
  claimTo,
} from 'thirdweb/extensions/erc1155';
import { allowance, approve } from 'thirdweb/extensions/erc20';
import { prepareContractCall, ThirdwebContract, NFT, sendAndConfirmTransaction } from 'thirdweb';
import { formatUnits } from 'viem';
import { usdcContract } from '@/utils/contracts';

// Props for the hook
interface UseToolCardLogicProps {
  tool: NFT;
  address: string;
  contractTools: ThirdwebContract;
  contractStaking: ThirdwebContract<any>;
}

export function useToolCardLogic({ tool, address, contractTools, contractStaking }: UseToolCardLogicProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };
  const [isBuying, setIsBuying] = useState(false);
  const account = useActiveAccount();
  const queryClient = useQueryClient();

  // Data fetching logic
  const { data: claimCondition } = useReadContract(getActiveClaimCondition, {
    contract: contractTools,
    tokenId: tool.id,
  });

  const { data: tokenAllowance, refetch: refetchTokenAllowance } = useReadContract(allowance, {
    contract: usdcContract,
    owner: address,
    spender: contractTools.address,
    queryOptions: { enabled: !!address && !!claimCondition },
  });

  const { data: balance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['balance', tool.id.toString(), address],
    queryFn: () => erc1155BalanceOf({ contract: contractTools, owner: address, tokenId: tool.id }),
  });

  const { data: stakeInfo, isLoading: isLoadingStakeInfo } = useReadContract({
    contract: contractStaking,
    method: 'function getStakeInfoForToken(uint256 _tokenId, address _staker) external view returns (uint256, uint256)',
    params: [tool.id, address],
  });

  const { data: isApprovedForStaking, refetch: refetchStakingApproval } = useQuery({
    queryKey: ['isApproved', address, contractStaking.address],
    queryFn: async () => {
      if (!account) return false;
      return isApprovedForAll({
        contract: contractTools,
        owner: account.address,
        operator: contractStaking.address,
      });
    },
    enabled: !!account,
  });

  // Derived state and calculations
  const [stakedAmount, claimableRewards] = stakeInfo || [0n, 0n];
  const ownAmount = balance || 0n;

  const unroundedPrice = claimCondition ? claimCondition.pricePerToken : 0n;
  const quantityAsBigInt = BigInt(quantity || '1');
  const unroundedTotalPrice = unroundedPrice * quantityAsBigInt;

  const smallestUnitPerCent = 10000n; // For 6-decimal USDC
  const totalPriceInCents = (unroundedTotalPrice + smallestUnitPerCent - 1n) / smallestUnitPerCent;
  const totalPrice = totalPriceInCents * smallestUnitPerCent;

  const isTokenApprovedForBuy = tokenAllowance && tokenAllowance >= totalPrice;

  // Transaction handlers
  const handleStake = (amount: bigint) => {
    if (!account) throw new Error('Not connected');
    return prepareContractCall({
      contract: contractStaking,
      method: 'function stake(uint256 _tokenId, uint64 _amount)',
      params: [tool.id, amount],
    });
  };

  const handleBuy = async () => {
    if (!account || !claimCondition) {
      throw new Error('Not connected or claim condition not loaded');
    }

    setIsBuying(true);
    try {
      if (!isTokenApprovedForBuy) {
        const approveTx = approve({
          contract: usdcContract,
          spender: contractTools.address,
          amount: formatUnits(totalPrice, 6),
        });
        await sendAndConfirmTransaction({
          transaction: approveTx,
          account,
        });
        refetchTokenAllowance();
      }

      const claimTx = claimTo({
        contract: contractTools,
        to: account.address,
        tokenId: tool.id,
        quantity: quantityAsBigInt,
      });
      await sendAndConfirmTransaction({
        transaction: claimTx,
        account,
      });

      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Failed to buy NFT', error);
    } finally {
      setIsBuying(false);
    }
  };

  return {
    quantity,
    incrementQuantity,
    decrementQuantity,
    account,
    queryClient,
    isLoading: isLoadingBalance || isLoadingStakeInfo,
    ownAmount,
    stakedAmount,
    claimableRewards,
    totalPrice,
    isApprovedForStaking,
    handleStake,
    refetchStakingApproval,
    isBuying,
    handleBuy,
  };
}
