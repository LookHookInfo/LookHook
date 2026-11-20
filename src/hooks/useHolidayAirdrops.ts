import { useCallback, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { encodeFunctionData } from 'viem';
import { dropPublicClient } from '@/lib/viem/client';
import { candyCaneAbi, sockAirdropAbi, sockTokenAbi } from '@/utils/holidayAirdropsAbi';

const CANDY_CANE = '0xb364bE6aBCF7B2Bab04c98274d00791dE3DEF327' as const;
export const SOCKS_AIRDROP = '0xC9C79168b895cf373CE1461C558b930E7C819B44' as const;
const SOCKS_NFT = '0xfB9E265ecF12e252930f73302202bc16523F206A' as const;
const CHAIN_ID = 8453;

export function useHolidayAirdrops() {
  const account = useActiveAccount();
  const address = account?.address as `0x${string}` | undefined;
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<'candy' | 'socks' | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const {
    data: constants,
    isLoading: isConstantsLoading,
    isError: isConstantsError,
  } = useQuery({
    queryKey: ['holidayAirdrops', 'constants'],
    enabled: !!address,
    queryFn: async () => {
      const [farmNft, totalSocks] = await dropPublicClient.multicall({
        contracts: [
          { address: CANDY_CANE, abi: candyCaneAbi, functionName: 'farmNFT' },
          { address: SOCKS_NFT, abi: sockTokenAbi, functionName: 'totalSupply' },
        ] as const,
        allowFailure: false,
      });
      return { farmNft: farmNft as `0x${string}`, totalSocks: Number(totalSocks) };
    },
    staleTime: Infinity,
  });

  const {
    data: status,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useQuery({
    queryKey: ['holidayAirdrops', address],
    enabled: !!address && !!constants,
    queryFn: async () => {
      const ids = Array.from({ length: constants!.totalSocks }, (_, index) => BigInt(index + 1));
      const lowerAddress = address!.toLowerCase();

      const [hasMinted, candyDeadline, farmBalance, socksDeadline, rewardPerSock] =
        (await dropPublicClient.multicall({
          contracts: [
            { address: CANDY_CANE, abi: candyCaneAbi, functionName: 'hasMinted', args: [address!] },
            { address: CANDY_CANE, abi: candyCaneAbi, functionName: 'claimDeadline' },
            { address: constants!.farmNft, abi: sockTokenAbi, functionName: 'balanceOf', args: [address!] },
            { address: SOCKS_AIRDROP, abi: sockAirdropAbi, functionName: 'claimDeadline' },
            { address: SOCKS_AIRDROP, abi: sockAirdropAbi, functionName: 'rewardPerSock' },
          ] as const,
          allowFailure: false,
        })) as unknown as [boolean, bigint, bigint, bigint, bigint];

      const claimedFlags = await dropPublicClient.multicall({
        contracts: ids.map((id) => ({
          address: SOCKS_AIRDROP,
          abi: sockAirdropAbi,
          functionName: 'claimed' as const,
          args: [id] as const,
        })),
        allowFailure: false,
      });

      const owners = (await dropPublicClient.multicall({
        contracts: ids.map((id) => ({
          address: SOCKS_NFT,
          abi: sockTokenAbi,
          functionName: 'ownerOf' as const,
          args: [id] as const,
        })),
        allowFailure: false,
      })) as unknown as string[];

      const claimedIds: bigint[] = [];
      const ownedIds: bigint[] = [];
      const myUnclaimedIds: bigint[] = [];

      ids.forEach((id, index) => {
        if (claimedFlags[index]) claimedIds.push(id);
        if (owners[index]?.toLowerCase() === lowerAddress) {
          ownedIds.push(id);
          if (!claimedFlags[index]) myUnclaimedIds.push(id);
        }
      });

      return {
        hasMinted,
        candyDeadline,
        farmBalance,
        socksDeadline,
        rewardPerSock,
        claimedIds,
        ownedIds,
        myUnclaimedIds,
      };
    },
    staleTime: 60_000,
  });

  const isError = isConstantsError || isStatusError;
  const isLoading = !!address && (isConstantsLoading || isStatusLoading || (!status && !isError));

  const claimCandy = useCallback(async () => {
    if (!account || !address) return;
    setPending('candy');
    setClaimError(null);
    try {
      const data = encodeFunctionData({ abi: candyCaneAbi, functionName: 'mint' });
      const { transactionHash } = await account.sendTransaction({
        to: CANDY_CANE,
        data,
        chainId: CHAIN_ID,
      });
      await dropPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
      await queryClient.invalidateQueries({ queryKey: ['holidayAirdrops', address] });
    } catch (err) {
      console.error('Candy Cane claim failed', err);
      setClaimError('Candy Cane claim failed. Please try again.');
    } finally {
      setPending(null);
    }
  }, [account, address, queryClient]);

  const claimSocks = useCallback(async () => {
    if (!account || !address || !status || status.myUnclaimedIds.length === 0) return;
    setPending('socks');
    setClaimError(null);
    try {
      const data = encodeFunctionData({
        abi: sockAirdropAbi,
        functionName: 'claimBatch',
        args: [status.myUnclaimedIds],
      });
      const { transactionHash } = await account.sendTransaction({
        to: SOCKS_AIRDROP,
        data,
        chainId: CHAIN_ID,
      });
      await dropPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
      await queryClient.invalidateQueries({ queryKey: ['holidayAirdrops', address] });
    } catch (err) {
      console.error('Socks claim failed', err);
      setClaimError('HASH claim failed. Please try again.');
    } finally {
      setPending(null);
    }
  }, [account, address, status, queryClient]);

  return {
    hasFarmNft: (status?.farmBalance ?? 0n) > 0n,
    hasMinted: status?.hasMinted ?? false,
    socksBalance: BigInt(status?.ownedIds.length ?? 0),
    unclaimedSocks: status?.myUnclaimedIds.length ?? 0,
    rewardPerSock: status?.rewardPerSock ?? 0n,
    candyDeadline: status?.candyDeadline ?? 0n,
    socksDeadline: status?.socksDeadline ?? 0n,
    totalSocks: constants?.totalSocks ?? 0,
    claimedIds: status?.claimedIds ?? [],
    ownedIds: status?.ownedIds ?? [],
    isLoading,
    isError,
    address,
    isConnected: !!address,
    pending,
    claimError,
    claimCandy,
    claimSocks,
  };
}
