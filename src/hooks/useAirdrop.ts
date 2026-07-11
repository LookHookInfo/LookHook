import { useActiveAccount } from 'thirdweb/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { airdropContract } from '@/utils/contracts';
import { airdropAbi } from '@/utils/airdropAbi';
import { dropPublicClient } from '@/lib/viem/client';
import { encodeFunctionData, parseAbi } from 'viem';

interface UserAirdrop {
  amount: bigint;
  claimed: boolean;
  reason: string;
}

const erc721Abi = parseAbi(['function balanceOf(address owner) view returns (uint256)']);
const DRUB_NFT = '0x10B0885B68B7890A3F8678120ABa7bCAfF6B168B';
const DOLPHIN_NFT = '0x7aa5fc50D0E4A400545E34055134C89F2b310080';

export function useAirdrop() {
  const account = useActiveAccount();
  const address = account?.address as `0x${string}` | undefined;
  const queryClient = useQueryClient();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['airdropStats', address],
    queryFn: async () => {
      if (!address) return { total: 0n, claimed: 0n, pending: 0n };
      const result = await dropPublicClient.readContract({
        address: airdropContract.address as `0x${string}`,
        abi: airdropAbi,
        functionName: 'getTotalAirdropAmount',
        args: [address],
      });
      const [total, claimed, pending] = result as [bigint, bigint, bigint];
      return { total, claimed, pending };
    },
    enabled: !!address,
  });

  const { data: airdrops, isLoading: isLoadingAirdrops } = useQuery({
    queryKey: ['userAirdrops', address],
    queryFn: async () => {
      if (!address) return [] as UserAirdrop[];
      
      // 1. Get explicit airdrops from contract mapping
      const contractDrops = await dropPublicClient.readContract({
        address: airdropContract.address as `0x${string}`,
        abi: airdropAbi,
        functionName: 'getAirdrops',
        args: [address],
      }) as UserAirdrop[];

      // 2. Check NFT eligibility manually (since pending NFTs aren't in getAirdrops mapping)
      const [drubBal, dolphinBal] = await Promise.all([
        dropPublicClient.readContract({ address: DRUB_NFT, abi: erc721Abi, functionName: 'balanceOf', args: [address] }),
        dropPublicClient.readContract({ address: DOLPHIN_NFT, abi: erc721Abi, functionName: 'balanceOf', args: [address] }),
      ]);

      const finalDrops = [...contractDrops];

      // Add DRUB if not already claimed and user has NFT
      const hasClaimedDrub = contractDrops.some(d => d.reason === 'DRUB Badge NFT' && d.claimed);
      if (drubBal > 0n && !hasClaimedDrub && !contractDrops.some(d => d.reason === 'DRUB Badge NFT')) {
        finalDrops.push({ amount: 15000n * 10n**18n, claimed: false, reason: 'DRUB Badge NFT' });
      }

      // Add Dolphin if not already claimed and user has NFT
      const hasClaimedDolphin = contractDrops.some(d => d.reason === 'Dolphin NFT' && d.claimed);
      if (dolphinBal > 0n && !hasClaimedDolphin && !contractDrops.some(d => d.reason === 'Dolphin NFT')) {
        finalDrops.push({ amount: 30000n * 10n**18n, claimed: false, reason: 'Dolphin NFT' });
      }

      return finalDrops;
    },
    enabled: !!address,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected');
      
      const data = encodeFunctionData({
        abi: airdropAbi,
        functionName: 'claimAllAirdrops',
      });

      const { transactionHash } = await account.sendTransaction({
        to: airdropContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return dropPublicClient.waitForTransactionReceipt({ hash: transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airdropStats', address] });
      queryClient.invalidateQueries({ queryKey: ['userAirdrops', address] });
    },
  });

  return {
    stats,
    airdrops,
    isLoading: isLoadingStats || isLoadingAirdrops,
    isClaiming: claimMutation.isPending,
    handleClaim: () => claimMutation.mutate(),
    address,
  };
}
