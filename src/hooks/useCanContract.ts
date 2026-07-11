import { useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { canPublicClient } from '../lib/viem/client';
import { canAbi } from '../utils/canAbi';
import { galxeAbi } from '../utils/galxeAbi';
import { encodeFunctionData } from 'viem';

const CAN_CONTRACT_ADDRESS = '0x8530ae4f43f9847c457C86Ed246Cdaa6077D66cF';
const GALXE_NFT_ADDRESS = '0x5B3b6A9B18A5621f46837622F165849776d7Cc93';

async function getUserTokenIds(accountAddress: `0x${string}`): Promise<bigint[] | null> {
  try {
    const balance = await canPublicClient.readContract({
      address: GALXE_NFT_ADDRESS,
      abi: galxeAbi,
      functionName: 'balanceOf',
      args: [accountAddress],
    });
    const count = Number(balance);
    if (count === 0) return [];
    const ids: bigint[] = [];
    for (let i = 0; i < count; i++) {
      const id = await canPublicClient.readContract({
        address: GALXE_NFT_ADDRESS,
        abi: galxeAbi,
        functionName: 'tokenOfOwnerByIndex',
        args: [accountAddress, BigInt(i)],
      });
      ids.push(id);
    }
    return ids;
  } catch {
    return null;
  }
}

export function useCanContract() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [isBurning, setIsBurning] = useState(false);

  const { data: totalBurned, isLoading: isTotalBurnedLoading } = useQuery({
    queryKey: ['can', 'totalBurned'],
    queryFn: () => canPublicClient.readContract({
      address: CAN_CONTRACT_ADDRESS,
      abi: canAbi,
      functionName: 'totalBurned',
    }),
    staleTime: 300000,
  });

  const { data: remaining, isLoading: isRemainingLoading } = useQuery({
    queryKey: ['can', 'remainingNFTs'],
    queryFn: () => canPublicClient.readContract({
      address: CAN_CONTRACT_ADDRESS,
      abi: canAbi,
      functionName: 'remainingNFTs',
    }),
    staleTime: 300000,
  });

  const { data: maxSupply } = useQuery({
    queryKey: ['can', 'MAX_NFT_SUPPLY'],
    queryFn: () => canPublicClient.readContract({
      address: CAN_CONTRACT_ADDRESS,
      abi: canAbi,
      functionName: 'MAX_NFT_SUPPLY',
    }),
    staleTime: Infinity,
  });

  const { data: isApprovedForAll, isLoading: isCheckingApproval } = useQuery({
    queryKey: ['can', 'isApprovedForAll', account?.address],
    queryFn: () => canPublicClient.readContract({
      address: GALXE_NFT_ADDRESS,
      abi: galxeAbi,
      functionName: 'isApprovedForAll',
      args: [account!.address as `0x${string}`, CAN_CONTRACT_ADDRESS],
    }),
    enabled: !!account?.address,
    staleTime: 300000,
  });

  const { data: userTokenIds, isLoading: isUserTokensLoading } = useQuery({
    queryKey: ['can', 'userTokens', account?.address],
    queryFn: () => {
      if (!account?.address) return null;
      return getUserTokenIds(account.address as `0x${string}`);
    },
    enabled: !!account?.address,
    staleTime: 300000,
  });

  const isEnumerable = userTokenIds !== null;
  const balance = userTokenIds?.length ?? 0;
  const reward = balance * 4000;

  const doApprove = useCallback(async () => {
    if (!account) return;
    const data = encodeFunctionData({
      abi: galxeAbi,
      functionName: 'setApprovalForAll',
      args: [CAN_CONTRACT_ADDRESS, true],
    });
    const { transactionHash } = await account.sendTransaction({
      to: GALXE_NFT_ADDRESS,
      data,
      chainId: 8453,
    });
    await canPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    queryClient.invalidateQueries({ queryKey: ['can', 'isApprovedForAll'] });
  }, [account, queryClient]);

  const burnAll = useCallback(async () => {
    if (!account || !userTokenIds || userTokenIds.length === 0) return;
    setIsBurning(true);
    try {
      if (!isApprovedForAll) {
        await doApprove();
      }
      const data = encodeFunctionData({
        abi: canAbi,
        functionName: 'burnAndRedeem',
        args: [userTokenIds],
      });
      const { transactionHash } = await account.sendTransaction({
        to: CAN_CONTRACT_ADDRESS,
        data,
        chainId: 8453,
      });
      await canPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
      const prevBurned = queryClient.getQueryData(['can', 'totalBurned']) as bigint | undefined;
      const prevRemaining = queryClient.getQueryData(['can', 'remainingNFTs']) as bigint | undefined;
      queryClient.setQueryData(['can', 'totalBurned'], (prevBurned ?? 0n) + BigInt(userTokenIds.length));
      queryClient.setQueryData(['can', 'remainingNFTs'], (prevRemaining ?? 0n) - BigInt(userTokenIds.length));
      queryClient.setQueryData(['can', 'userTokens', account?.address], []);
    } catch (err) {
      console.error('Burn failed', err);
    } finally {
      setIsBurning(false);
    }
  }, [account, userTokenIds, isApprovedForAll, doApprove, queryClient]);

  const burned = totalBurned !== undefined ? Number(totalBurned) : 0;
  const max = maxSupply !== undefined ? Number(maxSupply) : 500;
  const remainingNfts = remaining !== undefined ? Number(remaining) : max;
  const progress = max > 0 ? (burned / max) * 100 : 0;
  const isLoading = isTotalBurnedLoading || isRemainingLoading;

  return {
    totalBurned: burned,
    maxSupply: max,
    remainingNFTs: remainingNfts,
    progress,
    isLoading,
    isApprovedForAll: isApprovedForAll ?? false,
    isCheckingApproval,
    isBurning,
    isEnumerable,
    balance,
    reward,
    isUserTokensLoading,
    userTokenIds,
    burnAll,
  };
}
