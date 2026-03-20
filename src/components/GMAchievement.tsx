import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { Wallet } from 'thirdweb/wallets';
import { gmContract } from '../utils/contracts';
import { useEffect, useState } from 'react';
import { publicClient } from '../lib/viem/client';
import GMAbi from '../utils/GMAbi';
import { encodeFunctionData } from 'viem';

interface GMAchievementProps {
  wallet: Wallet;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function GMAchievement({ wallet }: GMAchievementProps) {
  const account = wallet.getAccount();
  const ownerAddress = account?.address as `0x${string}` | undefined;
  const [countdown, setCountdown] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const queryClient = useQueryClient();

  const { data: claimInfo, isLoading: isLoadingClaimInfo } = useQuery({
    queryKey: ['getClaimInfo', gmContract.address, ownerAddress || ''],
    queryFn: async () => {
      if (!ownerAddress) return null;
      return await publicClient.readContract({
        address: gmContract.address as `0x${string}`,
        abi: GMAbi,
        functionName: 'getClaimInfo',
        args: [ownerAddress],
      });
    },
    enabled: !!ownerAddress,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const canClaimNow = claimInfo ? claimInfo[0] : false;
  const nextAvailableTimestamp = claimInfo ? Number(claimInfo[1]) : 0;
  const hasNFT = claimInfo ? claimInfo[2] : false;
  const hasStake = claimInfo ? claimInfo[3] : false;
  const isEligible = hasNFT || hasStake;

  useEffect(() => {
    let animationFrameId: number;
    let lastUpdateTime = 0;

    const updateCountdown = (now: number) => {
      if (now - lastUpdateTime < 1000) {
        animationFrameId = requestAnimationFrame(updateCountdown);
        return;
      }

      lastUpdateTime = now;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const timeLeft = Math.max(0, nextAvailableTimestamp - nowInSeconds);
      setCountdown(formatTime(timeLeft));

      if (timeLeft > 0) {
        animationFrameId = requestAnimationFrame(updateCountdown);
      } else if (!canClaimNow) {
        queryClient.invalidateQueries({ queryKey: ['getClaimInfo', gmContract.address, ownerAddress || ''] });
      }
    };

    if (nextAvailableTimestamp > 0) {
      const now = Math.floor(Date.now() / 1000);
      if (nextAvailableTimestamp - now > 0) {
        animationFrameId = requestAnimationFrame(updateCountdown);
      } else {
        setCountdown('00:00:00');
        if (!canClaimNow) {
          queryClient.invalidateQueries({ queryKey: ['getClaimInfo', gmContract.address, ownerAddress || ''] });
        }
      }
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [nextAvailableTimestamp, canClaimNow, queryClient, ownerAddress]);

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account || !ownerAddress) throw new Error('Wallet not connected');

      const data = encodeFunctionData({
        abi: GMAbi,
        functionName: 'claim',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: gmContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return await publicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getClaimInfo', gmContract.address, ownerAddress || ''] });
    },
    onError: (error) => {
      console.error('Failed to claim GM:', error);
    },
  });

  const handleClaim = async () => {
    if (canClaimNow && ownerAddress && !claimMutation.isPending) {
      claimMutation.mutate();
    }
  };

  if (!ownerAddress) {
    return (
      <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center" title="Connect wallet">
        <img src="/assets/GM.webp" alt="GM Achievement" className="size-10" />
      </div>
    );
  }

  if (isLoadingClaimInfo) {
    return (
      <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center" title="Loading...">
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  const titleText = canClaimNow
    ? 'GM! Click to claim your token'
    : isEligible
      ? 'Hover to see time until next claim'
      : 'Requires Farm NFT or 50k HASH staked (12m)';

  return (
    <div
      className={`size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden
        ${canClaimNow ? 'cursor-pointer glow-effect' : ''} ${claimMutation.isPending ? 'cursor-not-allowed' : ''}`}
      title={titleText}
      onClick={handleClaim}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img src="/assets/GM.webp" alt="GM Achievement" className="size-10" />

      {claimMutation.isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <span className="text-neutral-400 text-xs">...</span>
        </div>
      )}

      {!canClaimNow && isHovering && countdown && countdown !== '00:00:00' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-xs font-bold">
          {countdown}
        </div>
      )}

      {canClaimNow && !claimMutation.isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-xs font-bold">
          CLAIM
        </div>
      )}
    </div>
  );
}
