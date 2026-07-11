import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { formatUnits, encodeFunctionData } from 'viem';
import { usdcContract, contractStaking, contractTools } from '@/utils/contracts';
import { miningPublicClient } from '../lib/viem/client';
import erc20Abi from '../utils/erc20';
import { contractStakingAbi } from '../utils/contractStakingAbi';
import { contractToolsAbi } from '../utils/contractToolsAbi';
import { ShopFeed, ToolPrice } from '../hooks/useMiningFeed';

interface UseToolCardLogicProps {
  toolIndex: number;
  address: string;
  shopFeed: ShopFeed;
  prices: ToolPrice[];
}

export function useToolCardLogic({ toolIndex, address, shopFeed, prices }: UseToolCardLogicProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const account = useActiveAccount();
  const queryClient = useQueryClient();

  // All data from aggregator - no RPC calls needed
  const toolState = shopFeed.tools[toolIndex];
  const price = prices[toolIndex];

  const ownAmount = toolState?.balance ?? 0n;
  const stakedAmount = toolState?.staked ?? 0n;
  const claimableRewards = toolState?.rewards ?? 0n;
  const isApprovedForStaking = shopFeed.isApprovedForStaking;
  const tokenAllowance = shopFeed.usdcAllowance;

  const pricePerToken = price?.pricePerToken ?? 0n;
  const totalPrice = pricePerToken * BigInt(quantity);

  const isSoldOut = price ? price.supplyClaimed >= price.maxClaimableSupply : false;
  const hasEnoughUSDC = shopFeed.usdcBalance >= totalPrice;
  const isPurchaseEnabled = !isSoldOut && pricePerToken > 0n && hasEnoughUSDC;

  const approveStakingMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Not connected');
      const data = encodeFunctionData({
        abi: contractToolsAbi,
        functionName: 'setApprovalForAll',
        args: [contractStaking.address as `0x${string}`, true],
      });
      const { transactionHash } = await account.sendTransaction({
        to: contractTools.address as `0x${string}`,
        data,
        chainId: 8453,
      });
      return miningPublicClient.waitForTransactionReceipt({ hash: transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miningFeed'] });
    },
  });

  const approveBuyMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Not connected');
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [contractTools.address as `0x${string}`, totalPrice],
      });
      const { transactionHash } = await account.sendTransaction({
        to: usdcContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });
      return miningPublicClient.waitForTransactionReceipt({ hash: transactionHash });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['miningFeed'] }),
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account || !price) throw new Error('Not connected or price not loaded');

      console.log('🚀 Starting claim process for tool:', toolIndex.toString());
      console.log('📊 Quantity:', quantity);
      console.log('💰 Price per token:', formatUnits(price.pricePerToken, 6), 'USDC');
      console.log('💳 Total price:', formatUnits(totalPrice, 6), 'USDC');

      // Check current allowance directly to avoid stale state issues
      const currentAllowance = await miningPublicClient.readContract({
        address: usdcContract.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [account.address as `0x${string}`, contractTools.address as `0x${string}`],
      });

      console.log('Current allowance:', formatUnits(currentAllowance, 6));

      if (currentAllowance < totalPrice) {
        console.log('Approving USDC...');
        const approveData = encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [contractTools.address as `0x${string}`, totalPrice],
        });
        const { transactionHash: approveHash } = await account.sendTransaction({
          to: usdcContract.address as `0x${string}`,
          data: approveData,
          chainId: 8453,
        });
        await miningPublicClient.waitForTransactionReceipt({ hash: approveHash });
        console.log('✅ USDC Approved, waiting for state sync...');
        // Add a small delay for the RPC to catch up
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('Final Claim Check:');
      console.log('- Currency:', price.currency);
      console.log('- Price per token (Condition):', price.pricePerToken.toString());
      console.log('- Max claimable per wallet:', price.maxClaimableSupply.toString());
      console.log('- Supply claimed:', price.supplyClaimed.toString());
      console.log('- Max supply:', price.maxClaimableSupply.toString());
      
      const defaultAllowlistProof = {
        proof: [] as `0x${string}`[],
        quantityLimitPerWallet: price.maxClaimableSupply,
        pricePerToken: price.pricePerToken,
        currency: price.currency,
      };

      const data = encodeFunctionData({
        abi: contractToolsAbi,
        functionName: 'claim',
        args: [
          account.address as `0x${string}`,
          BigInt(toolIndex),
          BigInt(quantity),
          price.currency,
          price.pricePerToken,
          defaultAllowlistProof,
          '0x',
        ],
      });

      console.log('Sending claim transaction...');
      const isNative = price.currency === '0x0000000000000000000000000000000000000000';
      
      try {
        const { transactionHash } = await account.sendTransaction({
          to: contractTools.address as `0x${string}`,
          data,
          chainId: 8453,
          value: isNative ? totalPrice : 0n,
        });

        console.log('Waiting for receipt:', transactionHash);
        const receipt = await miningPublicClient.waitForTransactionReceipt({ hash: transactionHash });
        console.log('✅ Claim successful:', receipt.transactionHash);
        return receipt;
      } catch (err: any) {
        console.error('❌ Detailed transaction error:', err);
        if (err.info?.error?.message) {
          console.error('Reason:', err.info.error.message);
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miningFeed'] });
    },
    onError: (error: any) => {
      console.error('❌ Claim failed:', error);
    }
  });

  const stakeMutation = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!account) throw new Error('Not connected');
      const data = encodeFunctionData({
        abi: contractStakingAbi,
        functionName: 'stake',
        args: [BigInt(toolIndex), amount],
      });
      const { transactionHash } = await account.sendTransaction({
        to: contractStaking.address as `0x${string}`,
        data,
        chainId: 8453,
      });
      return miningPublicClient.waitForTransactionReceipt({ hash: transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miningFeed'] });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!account) throw new Error('Not connected');
      const data = encodeFunctionData({
        abi: contractStakingAbi,
        functionName: 'withdraw',
        args: [BigInt(toolIndex), amount],
      });
      const { transactionHash } = await account.sendTransaction({
        to: contractStaking.address as `0x${string}`,
        data,
        chainId: 8453,
      });
      return miningPublicClient.waitForTransactionReceipt({ hash: transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miningFeed'] });
    },
  });

  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Not connected');
      const data = encodeFunctionData({
        abi: contractStakingAbi,
        functionName: 'claimRewards',
        args: [BigInt(toolIndex)],
      });
      const { transactionHash } = await account.sendTransaction({
        to: contractStaking.address as `0x${string}`,
        data,
        chainId: 8453,
      });
      return miningPublicClient.waitForTransactionReceipt({ hash: transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miningFeed'] });
    },
  });

  return {
    quantity,
    incrementQuantity,
    decrementQuantity,
    isLoading: false,
    ownAmount,
    stakedAmount,
    claimableRewards,
    totalPrice,
    isApprovedForStaking,
    isPurchaseEnabled,
    isSoldOut,
    hasEnoughUSDC,
    handleStake: (amount: bigint) => stakeMutation.mutate(amount),
    handleBuy: () => claimMutation.mutate(),
    isBuying: claimMutation.isPending || approveBuyMutation.isPending,
    handleWithdraw: (amount: bigint) => withdrawMutation.mutate(amount),
    handleClaimRewards: () => claimRewardsMutation.mutate(),
    isWithdrawing: withdrawMutation.isPending,
    isClaiming: claimRewardsMutation.isPending,
    handleApproveStaking: () => approveStakingMutation.mutate(),
    isApproving: approveStakingMutation.isPending,
  };
}
