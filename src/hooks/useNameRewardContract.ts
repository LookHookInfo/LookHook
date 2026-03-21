import { useActiveAccount } from 'thirdweb/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nameRewardContract, ourNftContract, hashcoinContract } from '../utils/contracts';
import { useCallback } from 'react';
import { formatUnits, encodeFunctionData } from 'viem';
import { namePublicClient } from '../lib/viem/client';
import { nameRewardAbi } from '../utils/nameRewardAbi';
import { gmnftAbi } from '../utils/gmnftAbi';
import erc20Abi from '../utils/erc20';

export function useNameRewardContract() {
  const account = useActiveAccount();
  const address = account?.address;
  const queryClient = useQueryClient();

  const { data: canClaim, isLoading: isCanClaimLoading } = useQuery({
    queryKey: ['nameReward', 'canClaim', address],
    queryFn: () => namePublicClient.readContract({
      address: nameRewardContract.address as `0x${string}`,
      abi: nameRewardAbi,
      functionName: 'canClaim',
      args: [address as `0x${string}`],
    }),
    enabled: !!address,
  });

  const { data: hasClaimed, isLoading: isClaimedLoading } = useQuery({
    queryKey: ['nameReward', 'claimed', address],
    queryFn: () => namePublicClient.readContract({
      address: nameRewardContract.address as `0x${string}`,
      abi: nameRewardAbi,
      functionName: 'claimed',
      args: [address as `0x${string}`],
    }),
    enabled: !!address,
  });

  const { data: ourNftBalance, isLoading: isOurNftBalanceLoading } = useQuery({
    queryKey: ['ourNft', 'balanceOf', address],
    queryFn: () => namePublicClient.readContract({
      address: ourNftContract.address as `0x${string}`,
      abi: gmnftAbi,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    }),
    enabled: !!address,
  });

  const { data: poolBalance, isLoading: isPoolBalanceLoading } = useQuery({
    queryKey: ['hashcoin', 'balanceOf', nameRewardContract.address],
    queryFn: () => namePublicClient.readContract({
      address: hashcoinContract.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [nameRewardContract.address as `0x${string}`],
    }),
  });

  const poolRewardBalance = poolBalance ? parseFloat(formatUnits(poolBalance as bigint, 18)).toFixed(2) : '0';

  const hasOurNft = !!ourNftBalance && (ourNftBalance as bigint) > 0n;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account || !canClaim) return;

      const data = encodeFunctionData({
        abi: nameRewardAbi,
        functionName: 'claim',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: nameRewardContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return namePublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nameReward'] });
      queryClient.invalidateQueries({ queryKey: ['hashcoin', 'balanceOf', address] });
    },
  });

  const claimReward = useCallback(() => {
    claimMutation.mutate();
  }, [claimMutation]);

  return {
    canClaim: !!canClaim,
    hasClaimed: !!hasClaimed,
    isClaiming: claimMutation.isPending,
    poolRewardBalance,
    isDataLoading: isCanClaimLoading || isClaimedLoading || isOurNftBalanceLoading || isPoolBalanceLoading,
    claimReward,
    hasOurNft,
  };
}
