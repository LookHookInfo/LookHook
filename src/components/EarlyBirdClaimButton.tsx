import { useEffect, useState, useCallback } from 'react';
import { useActiveWallet } from 'thirdweb/react';
import { earlyBirdContract } from '../utils/contracts';
import { useQueries, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { earlyPublicClient } from '../lib/viem/client';
import { earlyBirdAbi } from '../utils/earlyBirdAbi';
import { encodeFunctionData, parseUnits } from 'viem';

const TOKEN_IDS_TO_CHECK = [0n, 1n, 2n, 3n, 4n, 5n];

const getStakeInfoForTokenAbi = {
  type: 'function',
  name: 'getStakeInfoForToken',
  inputs: [
    { type: 'uint256', name: '_tokenId' },
    { type: 'address', name: '_staker' },
  ],
  outputs: [
    { type: 'uint256', name: '_tokensStaked' },
    { type: 'uint256', name: '_rewards' },
  ],
  stateMutability: 'view',
} as const;

// --- Reusable OpenSea Link Button ---
const OpenSeaLinkButton = () => (
  <a
    href="https://opensea.io/collection/earlyhash"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-lg border border-neutral-700 text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
    title="View on OpenSea"
  >
    <img src="/assets/Sea.webp" alt="OpenSea" className="w-6 h-6" />
  </a>
);

// --- Inner Component (handles the main logic) ---
const ClaimButtonInner = ({ stakingContractAddress, address }: { stakingContractAddress: string; address: string }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const wallet = useActiveWallet();
  const account = wallet?.getAccount();
  const queryClient = useQueryClient();

  // --- Base contract reads ---
  const { data: claimDeadline } = useQuery({
    queryKey: ['claimDeadline', earlyBirdContract.address],
    queryFn: () => earlyPublicClient.readContract({
      address: earlyBirdContract.address as `0x${string}`,
      abi: earlyBirdAbi,
      functionName: 'CLAIM_DEADLINE',
    }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: isClaimOpen, isLoading: isClaimOpenLoading } = useQuery({
    queryKey: ['isClaimOpen', earlyBirdContract.address],
    queryFn: () => earlyPublicClient.readContract({
      address: earlyBirdContract.address as `0x${string}`,
      abi: earlyBirdAbi,
      functionName: 'isClaimOpen',
    }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: hasClaimed, isLoading: hasClaimedLoading } = useQuery({
    queryKey: ['hasClaimed', earlyBirdContract.address, address],
    queryFn: () => earlyPublicClient.readContract({
      address: earlyBirdContract.address as `0x${string}`,
      abi: earlyBirdAbi,
      functionName: 'hasClaimed',
      args: [address as `0x${string}`],
    }),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
  });

  const stakeInfoQueries = useQueries({
    queries: TOKEN_IDS_TO_CHECK.map((tokenId) => ({
      queryKey: ['getStakeInfoForToken', stakingContractAddress, tokenId.toString(), address],
      queryFn: () => earlyPublicClient.readContract({
        address: stakingContractAddress as `0x${string}`,
        abi: [getStakeInfoForTokenAbi],
        functionName: 'getStakeInfoForToken',
        args: [tokenId, address as `0x${string}`],
      }),
      enabled: !!address && !!stakingContractAddress,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isStakeInfoLoading = stakeInfoQueries.some((query) => query.isLoading);

  const totalRewards = stakeInfoQueries.reduce((acc: bigint, query) => {
    const data = query.data;
    if (data && Array.isArray(data) && data[1]) {
      return acc + (data[1] as bigint);
    }
    return acc;
  }, 0n);

  const hasEnoughHash = totalRewards >= parseUnits('1', 18);

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected');

      const data = encodeFunctionData({
        abi: earlyBirdAbi,
        functionName: 'claim',
        args: [TOKEN_IDS_TO_CHECK],
      });

      const { transactionHash } = await account.sendTransaction({
        to: earlyBirdContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return earlyPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasClaimed', earlyBirdContract.address, address] });
    },
    onError: (error: Error) => {
      console.error('Claim failed', error);
    },
  });

  const handleClaim = useCallback(() => {
    claimMutation.mutate();
  }, [claimMutation]);

  useEffect(() => {
    let animationFrameId: number;
    let lastUpdateTime = 0;

    const updateCountdown = (now: number) => {
      if (!claimDeadline) return;

      if (now - lastUpdateTime < 1000) {
        animationFrameId = requestAnimationFrame(updateCountdown);
        return;
      }

      lastUpdateTime = now;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const difference = Number(claimDeadline) - nowInSeconds;
      setTimeLeft(difference > 0 ? difference : 0);

      if (difference > 0) {
        animationFrameId = requestAnimationFrame(updateCountdown);
      }
    };

    if (claimDeadline) {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const difference = Number(claimDeadline) - nowInSeconds;
      setTimeLeft(difference > 0 ? difference : 0);

      if (difference > 0) {
        animationFrameId = requestAnimationFrame(updateCountdown);
      }
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [claimDeadline]);

  const days = Math.floor(timeLeft / (60 * 60 * 24));
  const hours = Math.floor((timeLeft % (60 * 60 * 24)) / (60 * 60));

  const isLoading = isClaimOpenLoading || hasClaimedLoading || isStakeInfoLoading;
  const isButtonDisabled =
    isLoading || claimMutation.isPending || !Boolean(isClaimOpen) || Boolean(hasClaimed) || !hasEnoughHash;

  let buttonContent: React.ReactNode = 'Claim Early';
  if (claimMutation.isPending) {
    buttonContent = (
      <span className="flex items-center justify-center">
        <span className="animate-spin mr-2">⏳</span>
        Processing...
      </span>
    );
  } else if (!address) {
    buttonContent = 'Connect Wallet';
  } else if (isLoading) {
    buttonContent = 'Loading...';
  } else if (!isClaimOpen && timeLeft <= 0) {
    buttonContent = 'Claim ended';
  }

  let tooltip = 'Claim your Early NFT';
  if (isButtonDisabled && !hasClaimed) {
    if (isLoading) tooltip = 'Loading...';
    else if (claimMutation.isPending) tooltip = 'Processing transaction...';
    else if (!isClaimOpen && timeLeft <= 0) tooltip = 'Claim period is over';
    else if (!hasEnoughHash) tooltip = 'Get 1 HASH token using mining.';
  } else if (hasClaimed) {
    tooltip = 'You have already claimed this NFT';
  }

  let mainAction: React.ReactNode;
  if (hasClaimed) {
    mainAction = (
      <div className="inline-flex items-center justify-center cursor-not-allowed px-3 py-1 text-sm font-medium rounded-lg border border-green-500 text-green-500">
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Claimed
      </div>
    );
  } else {
    mainAction = (
      <button
        onClick={handleClaim}
        disabled={Boolean(isButtonDisabled)}
        className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-lg border border-neutral-700 text-white bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${!isButtonDisabled ? 'glow-effect' : ''}`}
      >
        {buttonContent}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2" title={tooltip}>
      {mainAction}
      {timeLeft > 0 && (
        <div className="flex items-center px-2 py-1 text-sm font-medium rounded-lg border border-neutral-700 text-white bg-neutral-800 whitespace-nowrap">
          <span className="mr-1">⏳</span>
          <span>
            {days}d {hours}h
          </span>
        </div>
      )}
    </div>
  );
};

// --- Outer Component (handles loading the staking contract address) ---
export default function EarlyBirdClaimButton() {
  const wallet = useActiveWallet();
  const address = wallet?.getAccount()?.address;

  const { data: stakingContractAddress, isLoading: isStakingAddrLoading } = useQuery({
    queryKey: ['stakingContractAddress', earlyBirdContract.address],
    queryFn: () => earlyPublicClient.readContract({
      address: earlyBirdContract.address as `0x${string}`,
      abi: earlyBirdAbi,
      functionName: 'stakingContract',
    }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex items-center justify-center gap-2">
      {isStakingAddrLoading || !address || !stakingContractAddress ? (
        <div
          className="flex items-center justify-center gap-2"
          title={isStakingAddrLoading ? 'Loading...' : 'Connect wallet to claim'}
        >
          <button
            disabled
            className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-lg border border-neutral-700 text-white bg-neutral-800 opacity-50 cursor-not-allowed"
          >
            {isStakingAddrLoading ? 'Loading...' : 'Claim Early'}
          </button>
        </div>
      ) : (
        <ClaimButtonInner stakingContractAddress={String(stakingContractAddress!)} address={address!} />
      )}
      <OpenSeaLinkButton />
    </div>
  );
}
