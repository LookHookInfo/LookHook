import { useEffect, useMemo, useState, useCallback } from 'react';
import { useActiveWallet, useSendTransaction } from 'thirdweb/react';
import { getContract, prepareContractCall, toWei, readContract } from 'thirdweb';
import { earlyBirdContract } from '../utils/contracts';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

// --- ABI Snippets ---
const isClaimOpenAbi = {
  type: 'function',
  name: 'isClaimOpen',
  inputs: [],
  outputs: [{ type: 'bool' }],
  stateMutability: 'view',
} as const;
const hasClaimedAbi = {
  type: 'function',
  name: 'hasClaimed',
  inputs: [{ type: 'address' }],
  outputs: [{ type: 'bool' }],
  stateMutability: 'view',
} as const;
const claimDeadlineAbi = {
  type: 'function',
  name: 'CLAIM_DEADLINE',
  inputs: [],
  outputs: [{ type: 'uint256' }],
  stateMutability: 'view',
} as const;
const claimAbi = {
  type: 'function',
  name: 'claim',
  inputs: [{ internalType: 'uint256[]', name: 'tokenIds', type: 'uint256[]' }],
  outputs: [],
  stateMutability: 'nonpayable',
} as const;
const getStakingContractAddressAbi = {
  type: 'function',
  name: 'stakingContract',
  inputs: [],
  outputs: [{ type: 'address' }],
  stateMutability: 'view',
} as const;
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

const TOKEN_IDS_TO_CHECK = [0n, 1n, 2n, 3n, 4n, 5n];

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
  const queryClient = useQueryClient(); // Initialize queryClient

  const { mutateAsync: sendTx, isPending } = useSendTransaction();

  // --- Base contract reads ---
  const { data: claimDeadline, isLoading: isDeadlineLoading } = useQuery({
    queryKey: ['claimDeadline', earlyBirdContract.address],
    queryFn: () =>
      readContract({
        contract: earlyBirdContract,
        method: claimDeadlineAbi,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
  const { data: isClaimOpen, isLoading: isClaimOpenLoading } = useQuery({
    queryKey: ['isClaimOpen', earlyBirdContract.address],
    queryFn: () =>
      readContract({
        contract: earlyBirdContract,
        method: isClaimOpenAbi,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
  const {
    data: hasClaimed,
    isLoading: hasClaimedLoading,
  } = useQuery({
    queryKey: ['hasClaimed', earlyBirdContract.address, address],
    queryFn: () =>
      readContract({
        contract: earlyBirdContract,
        method: hasClaimedAbi,
        params: [address],
      }),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // --- Staking contract logic ---
  const stakingContract = useMemo(() => {
    return getContract({
      client,
      chain: chain,
      address: stakingContractAddress,
    });
  }, [stakingContractAddress]);

  const stakeInfoQueries = useQueries({
    queries: TOKEN_IDS_TO_CHECK.map((tokenId) => ({
      queryKey: ['getStakeInfoForToken', stakingContractAddress, tokenId.toString(), address],
      queryFn: () =>
        readContract({
          contract: stakingContract,
          method: getStakeInfoForTokenAbi,
          params: [tokenId, address],
        }),
      enabled: !!address && !!stakingContractAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // 5 minutes
    })),
  });

  const allStakeInfos = stakeInfoQueries.map((query) => query.data);
  const isStakeInfoLoading = stakeInfoQueries.some((query) => query.isLoading);

  const totalRewards = allStakeInfos.reduce((acc, query) => {
    if (query && query[1]) {
      return acc + query[1];
    }
    return acc;
  }, 0n);

  const hasEnoughHash = totalRewards >= toWei('1');

  const handleClaim = useCallback(async () => {
    try {
      const transaction = await prepareContractCall({
        contract: earlyBirdContract,
        method: claimAbi,
        params: [TOKEN_IDS_TO_CHECK],
      });
      await sendTx(transaction, {
        onSuccess: () => {
          // Invalidate to re-fetch actual data from blockchain
          queryClient.invalidateQueries({ queryKey: ['hasClaimed', earlyBirdContract.address, address] });
        },
      });
    } catch (error) {
      console.error('Claim failed', error);
    }
  }, [sendTx, address, queryClient]);

  useEffect(() => {
    let animationFrameId: number;
    let lastUpdateTime = 0;

    const updateCountdown = (now: number) => {
      if (!claimDeadline) return; // Ensure claimDeadline is available within the loop

      // Throttle to update roughly once per second
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
      // Initial call to set time and start loop if needed
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

  const isLoading = isDeadlineLoading || isClaimOpenLoading || hasClaimedLoading || isStakeInfoLoading;
  const isButtonDisabled: boolean = isLoading || isPending || !Boolean(isClaimOpen) || Boolean(hasClaimed) || !hasEnoughHash;

  let buttonContent: React.ReactNode = 'Claim Early';
  if (isPending) {
    buttonContent = (
      <span className="flex items-center justify-center">
        <span className="animate-spin mr-2">⏳</span>
        Processing...
      </span>
    );
  } else if (!address) {
    // Prioritize "Connect Wallet" if address is not available
    buttonContent = 'Connect Wallet';
  } else if (isLoading) {
    buttonContent = 'Loading...';
  } else if (!isClaimOpen && timeLeft <= 0) {
    buttonContent = 'Claim ended';
  }

  let tooltip = 'Claim your Early NFT';
  if (isButtonDisabled && !hasClaimed) {
    if (isLoading) tooltip = 'Loading...';
    else if (isPending) tooltip = 'Processing transaction...';
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
    queryFn: () =>
      readContract({
        contract: earlyBirdContract,
        method: getStakingContractAddressAbi,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
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