import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { NFT } from 'thirdweb';
import { formatUnits, encodeFunctionData } from 'viem';
import { usdcContract, contractStaking, contractTools } from '@/utils/contracts';
import { miningPublicClient } from '../lib/viem/client';
import erc20Abi from '../utils/erc20';
import { contractStakingAbi } from '../utils/contractStakingAbi';
import { contractToolsAbi } from '../utils/contractToolsAbi';

// Define a TypeScript type for the ClaimCondition struct
type ClaimCondition = {
  startTimestamp: bigint;
  maxClaimableSupply: bigint;
  supplyClaimed: bigint;
  quantityLimitPerWallet: bigint;
  merkleRoot: `0x${string}`;
  pricePerToken: bigint;
  currency: `0x${string}`;
  metadata: string;
};

interface UseToolCardLogicProps {
  tool: NFT;
  address: string;
  usdcBalance: bigint; // Pass usdcBalance as a prop
}

export function useToolCardLogic({ tool, address, usdcBalance }: UseToolCardLogicProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const account = useActiveAccount();
  const queryClient = useQueryClient();

  const { data: claimCondition, isLoading: isLoadingClaimCondition } = useQuery({
    queryKey: ['claimCondition', contractTools.address, tool.id.toString()],
    queryFn: async () => {
      try {
        const activeId = await miningPublicClient.readContract({
          address: contractTools.address as `0x${string}`,
          abi: contractToolsAbi,
          functionName: 'getActiveClaimConditionId',
          args: [tool.id],
        });
        const condition = await miningPublicClient.readContract({
          address: contractTools.address as `0x${string}`,
          abi: contractToolsAbi,
          functionName: 'getClaimConditionById',
          args: [tool.id, activeId],
        }) as ClaimCondition;
        return condition;

      } catch (error) {
        console.error('❌ Failed to fetch claimCondition:', error);
        return null;
      }
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
  });

  const { data: tokenAllowance, refetch: refetchTokenAllowance } = useQuery({
    queryKey: ['tokenAllowance', usdcContract.address, address, contractTools.address],
    queryFn: async () => {
      if (!address) return 0n;
      return miningPublicClient.readContract({
        address: usdcContract.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address as `0x${string}`, contractTools.address as `0x${string}`],
      });
    },
    enabled: !!address && !!claimCondition,
  });

  const { data: balance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['nftBalance', contractTools.address, address, tool.id.toString()],
    queryFn: async () => {
      if (!address) return 0n;
      return miningPublicClient.readContract({
        address: contractTools.address as `0x${string}`,
        abi: contractToolsAbi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`, tool.id],
      });
    },
    enabled: !!address,
  });

  const { data: stakeInfo, isLoading: isLoadingStakeInfo } = useQuery({
    queryKey: ['stakeInfo', contractStaking.address, tool.id.toString(), address],
    queryFn: async () => {
      if (!address) return [0n, 0n];
      return miningPublicClient.readContract({
        address: contractStaking.address as `0x${string}`,
        abi: contractStakingAbi,
        functionName: 'getStakeInfoForToken',
        args: [tool.id, address as `0x${string}`],
      });
    },
    enabled: !!address,
  });

  const { data: isApprovedForStaking, refetch: refetchStakingApproval } = useQuery({
    queryKey: ['isApprovedForStaking', contractTools.address, address, contractStaking.address],
    queryFn: async () => {
      if (!account) return false;
      return miningPublicClient.readContract({
        address: contractTools.address as `0x${string}`,
        abi: contractToolsAbi,
        functionName: 'isApprovedForAll',
        args: [account.address as `0x${string}`, contractStaking.address as `0x${string}`],
      });
    },
    enabled: !!account,
  });

  const [stakedAmount, claimableRewards] = stakeInfo || [0n, 0n];
  const ownAmount = balance || 0n;

  const pricePerToken = claimCondition?.pricePerToken ?? 0n;
  const totalPrice = pricePerToken * BigInt(quantity);

  const isSoldOut = claimCondition ? claimCondition.supplyClaimed >= claimCondition.maxClaimableSupply : false;
  const hasEnoughUSDC = usdcBalance >= totalPrice;
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
      refetchStakingApproval();
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
    onSuccess: () => refetchTokenAllowance(),
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account || !claimCondition) throw new Error('Not connected or claim condition not loaded');
      
      console.log('🚀 Starting claim process for tool:', tool.id.toString());
      console.log('📊 Quantity:', quantity);
      console.log('💰 Price per token:', formatUnits(claimCondition.pricePerToken, 6), 'USDC');
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
        refetchTokenAllowance();
      }

      console.log('Final Claim Check:');
      console.log('- Currency:', claimCondition.currency);
      console.log('- Price per token (Condition):', claimCondition.pricePerToken.toString());
      console.log('- Max claimable per wallet:', claimCondition.quantityLimitPerWallet.toString());
      console.log('- Supply claimed:', claimCondition.supplyClaimed.toString());
      console.log('- Max supply:', claimCondition.maxClaimableSupply.toString());
      
      const defaultAllowlistProof = {
        proof: [] as `0x${string}`[],
        quantityLimitPerWallet: claimCondition.quantityLimitPerWallet,
        pricePerToken: claimCondition.pricePerToken,
        currency: claimCondition.currency,
      };

      const data = encodeFunctionData({
        abi: contractToolsAbi,
        functionName: 'claim',
        args: [
          account.address as `0x${string}`,
          tool.id,
          BigInt(quantity),
          claimCondition.currency,
          claimCondition.pricePerToken,
          defaultAllowlistProof,
          '0x', // Missing 7th argument: _data
        ],
      });

      console.log('Sending claim transaction...');
      const isNative = claimCondition.currency === '0x0000000000000000000000000000000000000000';
      
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
        // If there is a reason in the error, log it
        if (err.info?.error?.message) {
          console.error('Reason:', err.info.error.message);
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nftBalance', contractTools.address, address] });
      queryClient.invalidateQueries({ queryKey: ['claimCondition', contractTools.address] });
      queryClient.invalidateQueries({ queryKey: ['usdcBalance', address] });
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
        args: [tool.id, amount],
      });
      const { transactionHash } = await account.sendTransaction({
        to: contractStaking.address as `0x${string}`,
        data,
        chainId: 8453,
      });
      return miningPublicClient.waitForTransactionReceipt({ hash: transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakeInfo', contractStaking.address] });
      queryClient.invalidateQueries({ queryKey: ['nftBalance', contractTools.address] });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!account) throw new Error('Not connected');
      const data = encodeFunctionData({
        abi: contractStakingAbi,
        functionName: 'withdraw',
        args: [tool.id, amount],
      });
      const { transactionHash } = await account.sendTransaction({
        to: contractStaking.address as `0x${string}`,
        data,
        chainId: 8453,
      });
      return miningPublicClient.waitForTransactionReceipt({ hash: transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakeInfo', contractStaking.address, tool.id.toString(), address] });
      queryClient.invalidateQueries({ queryKey: ['nftBalance', contractTools.address, address] });
    },
  });

  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Not connected');
      const data = encodeFunctionData({
        abi: contractStakingAbi,
        functionName: 'claimRewards',
        args: [tool.id],
      });
      const { transactionHash } = await account.sendTransaction({
        to: contractStaking.address as `0x${string}`,
        data,
        chainId: 8453,
      });
      return miningPublicClient.waitForTransactionReceipt({ hash: transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakeInfo', contractStaking.address, tool.id.toString(), address] });
    },
  });

  return {
    quantity,
    incrementQuantity,
    decrementQuantity,
    isLoading: isLoadingBalance || isLoadingStakeInfo || isLoadingClaimCondition,
    ownAmount,
    stakedAmount,
    claimableRewards,
    totalPrice,
    isApprovedForStaking,
    isPurchaseEnabled,
    isSoldOut,
    hasEnoughUSDC,
    handleStake: (amount: bigint) => stakeMutation.mutate(amount),
    refetchStakingApproval,
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
