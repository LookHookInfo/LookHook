import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Wallet } from 'thirdweb/wallets';
import { whaleContract } from '../utils/contracts';
import { encodeFunctionData } from 'viem';
import { earlyPublicClient } from '../lib/viem/client';
import { whaleContractAbi } from '../utils/whaleContractAbi';

import { useEffect } from 'react';

interface WhaleAchievementProps {
  wallet: Wallet;
}

const DOLPHIN_THRESHOLD = 1000n * 10n ** 18n;
const SHARK_THRESHOLD = 10000n * 10n ** 18n;
const WHALE_THRESHOLD = 25000n * 10n ** 18n;

export function DolphinAchievement({ wallet }: WhaleAchievementProps) {
  const account = wallet.getAccount();
  const ownerAddress = account?.address;
  const queryClient = useQueryClient();

  const {
    data: whaleContractData,
    isLoading: isLoadingWhaleContract,
    refetch: refetchWhaleContract,
  } = useQuery({
    queryKey: ['whaleContract', 'getUserStatus', ownerAddress],
    queryFn: () => earlyPublicClient.readContract({
      address: whaleContract.address as `0x${string}`,
      abi: whaleContractAbi,
      functionName: 'getUserStatus',
      args: [ownerAddress as `0x${string}`],
    }),
    enabled: !!ownerAddress,
  });

  useEffect(() => {
    if (ownerAddress) {
      refetchWhaleContract();
    }
  }, [ownerAddress, refetchWhaleContract]);

  const currentRewards = whaleContractData ? whaleContractData[0] : 0n;
  const canMint = whaleContractData ? whaleContractData[1] : false;
  const hasNft = whaleContractData ? whaleContractData[4] : false;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account || !canMint || hasNft) return;

      const data = encodeFunctionData({
        abi: whaleContractAbi,
        functionName: 'mintDolphin',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: whaleContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return earlyPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whaleContract', 'getUserStatus', ownerAddress] });
    },
    onError: (error: Error) => {
      console.error('Failed to mint Dolphin:', error);
    },
  });

  const progressText = `Earned: ${Number(currentRewards / 10n ** 18n)}/${Number(DOLPHIN_THRESHOLD / 10n ** 18n)} HASH`;
  const titleText = hasNft
    ? 'Dolphin Owned!'
    : canMint
      ? 'Claim your Dolphin NFT!'
      : `Dolphin – Keep mining (${progressText})`;

  const handleDolphinClaim = async () => {
    if (canMint && !hasNft && ownerAddress && !claimMutation.isPending) {
      claimMutation.mutate();
    }
  };

  if (!ownerAddress) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Connect wallet to see achievement"
      >
        <span className="text-neutral-400 text-xs">?</span>
      </div>
    );
  }

  if (isLoadingWhaleContract) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Loading Dolphin..."
      >
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className={`size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden
        ${canMint && !hasNft ? 'cursor-pointer glow-effect' : ''} ${claimMutation.isPending ? 'cursor-not-allowed' : ''}`}
      title={titleText}
      onClick={handleDolphinClaim}
    >
      <img
        src="/assets/Dolphin.webp"
        alt="Dolphin Achievement"
        className={`size-10 ${!hasNft && !canMint ? 'opacity-50' : ''}`}
      />
      {canMint && !hasNft && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-xs font-bold">
          CLAIM
        </div>
      )}
      {claimMutation.isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <span className="text-neutral-400 text-xs">...</span>
        </div>
      )}
    </div>
  );
}

export function SharkAchievement({ wallet }: WhaleAchievementProps) {
  const account = wallet.getAccount();
  const ownerAddress = account?.address;
  const queryClient = useQueryClient();

  const {
    data: whaleContractData,
    isLoading: isLoadingWhaleContract,
    refetch: refetchWhaleContract,
  } = useQuery({
    queryKey: ['whaleContract', 'getUserStatus', ownerAddress],
    queryFn: () => earlyPublicClient.readContract({
      address: whaleContract.address as `0x${string}`,
      abi: whaleContractAbi,
      functionName: 'getUserStatus',
      args: [ownerAddress as `0x${string}`],
    }),
    enabled: !!ownerAddress,
  });

  useEffect(() => {
    if (ownerAddress) {
      refetchWhaleContract();
    }
  }, [ownerAddress, refetchWhaleContract]);

  const currentRewards = whaleContractData ? whaleContractData[0] : 0n;
  const canMint = whaleContractData ? whaleContractData[2] : false;
  const hasNft = whaleContractData ? whaleContractData[5] : false;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account || !canMint || hasNft) return;

      const data = encodeFunctionData({
        abi: whaleContractAbi,
        functionName: 'mintShark',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: whaleContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return earlyPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whaleContract', 'getUserStatus', ownerAddress] });
    },
    onError: (error: Error) => {
      console.error('Failed to mint Shark:', error);
    },
  });

  const progressText = `Earned: ${Number(currentRewards / 10n ** 18n)}/${Number(SHARK_THRESHOLD / 10n ** 18n)} HASH`;
  const titleText = hasNft
    ? 'Shark Owned!'
    : canMint
      ? 'Claim your Shark NFT!'
      : `Shark – Keep mining (${progressText})`;

  const handleSharkClaim = async () => {
    if (canMint && !hasNft && ownerAddress && !claimMutation.isPending) {
      claimMutation.mutate();
    }
  };

  if (!ownerAddress) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Connect wallet to see achievement"
      >
        <span className="text-neutral-400 text-xs">?</span>
      </div>
    );
  }

  if (isLoadingWhaleContract) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Loading Shark..."
      >
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className={`size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden
        ${canMint && !hasNft ? 'cursor-pointer glow-effect' : ''} ${claimMutation.isPending ? 'cursor-not-allowed' : ''}`}
      title={titleText}
      onClick={handleSharkClaim}
    >
      <img
        src="/assets/Shark.webp"
        alt="Shark Achievement"
        className={`size-10 ${!hasNft && !canMint ? 'opacity-50' : ''}`}
      />
      {canMint && !hasNft && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-xs font-bold">
          CLAIM
        </div>
      )}
      {claimMutation.isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <span className="text-neutral-400 text-xs">...</span>
        </div>
      )}
    </div>
  );
}

export function WhaleAchievement({ wallet }: WhaleAchievementProps) {
  const account = wallet.getAccount();
  const ownerAddress = account?.address;
  const queryClient = useQueryClient();

  const {
    data: whaleContractData,
    isLoading: isLoadingWhaleContract,
    refetch: refetchWhaleContract,
  } = useQuery({
    queryKey: ['whaleContract', 'getUserStatus', ownerAddress],
    queryFn: () => earlyPublicClient.readContract({
      address: whaleContract.address as `0x${string}`,
      abi: whaleContractAbi,
      functionName: 'getUserStatus',
      args: [ownerAddress as `0x${string}`],
    }),
    enabled: !!ownerAddress,
  });

  useEffect(() => {
    if (ownerAddress) {
      refetchWhaleContract();
    }
  }, [ownerAddress, refetchWhaleContract]);

  const currentRewards = whaleContractData ? whaleContractData[0] : 0n;
  const canMint = whaleContractData ? whaleContractData[3] : false;
  const hasNft = whaleContractData ? whaleContractData[6] : false;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account || !canMint || hasNft) return;

      const data = encodeFunctionData({
        abi: whaleContractAbi,
        functionName: 'mintWhale',
        args: [],
      });

      const { transactionHash } = await account.sendTransaction({
        to: whaleContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });

      return earlyPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whaleContract', 'getUserStatus', ownerAddress] });
    },
    onError: (error: Error) => {
      console.error('Failed to mint Whale:', error);
    },
  });

  const progressText = `Earned: ${Number(currentRewards / 10n ** 18n)}/${Number(WHALE_THRESHOLD / 10n ** 18n)} HASH`;
  const titleText = hasNft
    ? 'Whale Owned!'
    : canMint
      ? 'Claim your Whale NFT!'
      : `Whale – Keep mining (${progressText})`;

  const handleWhaleClaim = async () => {
    if (canMint && !hasNft && ownerAddress && !claimMutation.isPending) {
      claimMutation.mutate();
    }
  };

  if (!ownerAddress) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Connect wallet to see achievement"
      >
        <span className="text-neutral-400 text-xs">?</span>
      </div>
    );
  }

  if (isLoadingWhaleContract) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Loading Whale..."
      >
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className={`size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden
        ${canMint && !hasNft ? 'cursor-pointer glow-effect' : ''} ${claimMutation.isPending ? 'cursor-not-allowed' : ''}`}
      title={titleText}
      onClick={handleWhaleClaim}
    >
      <img
        src="/assets/Whale.webp"
        alt="Whale Achievement"
        className={`size-10 ${!hasNft && !canMint ? 'opacity-50' : ''}`}
      />
      {canMint && !hasNft && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-xs font-bold">
          CLAIM
        </div>
      )}
      {claimMutation.isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <span className="text-neutral-400 text-xs">...</span>
        </div>
      )}
    </div>
  );
}
