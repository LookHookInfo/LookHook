import { useReadContract, useSendAndConfirmTransaction } from 'thirdweb/react';
import type { Wallet } from 'thirdweb/wallets';
import { whaleContract } from '../utils/contracts';
import { prepareContractCall } from 'thirdweb';

import { useEffect } from 'react';

interface WhaleAchievementProps {
  wallet: Wallet;
}

const DOLPHIN_THRESHOLD = 1000n * 10n ** 18n;
const SHARK_THRESHOLD = 10000n * 10n ** 18n;
const WHALE_THRESHOLD = 25000n * 10n ** 18n;

export function DolphinAchievement({ wallet }: WhaleAchievementProps) {
  const ownerAddress = wallet.getAccount()?.address;

  const {
    data: whaleContractData,
    isLoading: isLoadingWhaleContract,
    refetch: refetchWhaleContract,
  } = useReadContract({
    contract: whaleContract,
    method: 'getUserStatus',
    params: [ownerAddress || ''],
    queryOptions: {
      enabled: !!ownerAddress,
    },
  });

  useEffect(() => {
    if (ownerAddress) {
      refetchWhaleContract();
    }
  }, [ownerAddress, refetchWhaleContract]);

  // ABI: [earnedHASH, dolphinAvailable, sharkAvailable, whaleAvailable, hasDolphinNFT, hasSharkNFT, hasWhaleNFT]
  const currentRewards = whaleContractData ? whaleContractData[0] : 0n;
  const canMint = whaleContractData ? whaleContractData[1] : false;
  const hasNft = whaleContractData ? whaleContractData[4] : false;

  const mintDolphinTransaction = prepareContractCall({
    contract: whaleContract,
    method: 'mintDolphin',
    params: [],
  });

  const { mutate: sendAndConfirmDolphin, isPending: isMintingDolphin } = useSendAndConfirmTransaction();

  const progressText = `Earned: ${Number(currentRewards / 10n ** 18n)}/${Number(DOLPHIN_THRESHOLD / 10n ** 18n)} HASH`;
  const titleText = hasNft
    ? 'Dolphin Owned!'
    : canMint
      ? 'Claim your Dolphin NFT!'
      : `Dolphin – Keep mining (${progressText})`;

  const handleDolphinClaim = async () => {
    console.log('🐬 Claim Attempt:', { canMint, hasNft, currentRewards: Number(currentRewards) });

    if (canMint && !hasNft && ownerAddress && !isMintingDolphin) {
      try {
        await sendAndConfirmDolphin(mintDolphinTransaction, {
          onSuccess: () => {
            refetchWhaleContract();
          },
          onError: (error: any) => {
            console.error('Failed to mint Dolphin:', error);
          },
        });
      } catch (error) {
        console.error('Failed to mint Dolphin:', error);
      }
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
        ${canMint && !hasNft ? 'cursor-pointer glow-effect' : ''} ${isMintingDolphin ? 'cursor-not-allowed' : ''}`}
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
      {isMintingDolphin && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <span className="text-neutral-400 text-xs">...</span>
        </div>
      )}
    </div>
  );
}

export function SharkAchievement({ wallet }: WhaleAchievementProps) {
  const ownerAddress = wallet.getAccount()?.address;

  const {
    data: whaleContractData,
    isLoading: isLoadingWhaleContract,
    refetch: refetchWhaleContract,
  } = useReadContract({
    contract: whaleContract,
    method: 'getUserStatus',
    params: [ownerAddress || ''],
    queryOptions: {
      enabled: !!ownerAddress,
    },
  });

  useEffect(() => {
    if (ownerAddress) {
      refetchWhaleContract();
    }
  }, [ownerAddress, refetchWhaleContract]);

  // ABI: [earnedHASH, dolphinAvailable, sharkAvailable, whaleAvailable, hasDolphinNFT, hasSharkNFT, hasWhaleNFT]
  const currentRewards = whaleContractData ? whaleContractData[0] : 0n;
  const canMint = whaleContractData ? whaleContractData[2] : false;
  const hasNft = whaleContractData ? whaleContractData[5] : false;

  const mintSharkTransaction = prepareContractCall({
    contract: whaleContract,
    method: 'mintShark',
    params: [],
  });

  const { mutate: sendAndConfirmShark, isPending: isMintingShark } = useSendAndConfirmTransaction();

  const progressText = `Earned: ${Number(currentRewards / 10n ** 18n)}/${Number(SHARK_THRESHOLD / 10n ** 18n)} HASH`;
  const titleText = hasNft
    ? 'Shark Owned!'
    : canMint
      ? 'Claim your Shark NFT!'
      : `Shark – Keep mining (${progressText})`;

  const handleSharkClaim = async () => {
    console.log('🦈 Claim Attempt:', { canMint, hasNft, currentRewards: Number(currentRewards) });

    if (canMint && !hasNft && ownerAddress && !isMintingShark) {
      try {
        await sendAndConfirmShark(mintSharkTransaction, {
          onSuccess: () => {
            refetchWhaleContract();
          },
          onError: (error: any) => {
            console.error('Failed to mint Shark:', error);
          },
        });
        setTimeout(() => refetchWhaleContract(), 3000);
      } catch (error) {
        console.error('Failed to mint Shark:', error);
      }
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
        ${canMint && !hasNft ? 'cursor-pointer glow-effect' : ''} ${isMintingShark ? 'cursor-not-allowed' : ''}`}
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
      {isMintingShark && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <span className="text-neutral-400 text-xs">...</span>
        </div>
      )}
    </div>
  );
}

export function WhaleAchievement({ wallet }: WhaleAchievementProps) {
  const ownerAddress = wallet.getAccount()?.address;

  const {
    data: whaleContractData,
    isLoading: isLoadingWhaleContract,
    refetch: refetchWhaleContract,
  } = useReadContract({
    contract: whaleContract,
    method: 'getUserStatus',
    params: [ownerAddress || ''],
    queryOptions: {
      enabled: !!ownerAddress,
    },
  });

  useEffect(() => {
    if (ownerAddress) {
      refetchWhaleContract();
    }
  }, [ownerAddress, refetchWhaleContract]);

  // ABI: [earnedHASH, dolphinAvailable, sharkAvailable, whaleAvailable, hasDolphinNFT, hasSharkNFT, hasWhaleNFT]
  const currentRewards = whaleContractData ? whaleContractData[0] : 0n;
  const canMint = whaleContractData ? whaleContractData[3] : false;
  const hasNft = whaleContractData ? whaleContractData[6] : false;

  const mintWhaleTransaction = prepareContractCall({
    contract: whaleContract,
    method: 'mintWhale',
    params: [],
  });

  const { mutate: sendAndConfirmWhale, isPending: isMintingWhale } = useSendAndConfirmTransaction();

  const progressText = `Earned: ${Number(currentRewards / 10n ** 18n)}/${Number(WHALE_THRESHOLD / 10n ** 18n)} HASH`;
  const titleText = hasNft
    ? 'Whale Owned!'
    : canMint
      ? 'Claim your Whale NFT!'
      : `Whale – Keep mining (${progressText})`;

  const handleWhaleClaim = async () => {
    if (canMint && !hasNft && ownerAddress && !isMintingWhale) {
      try {
        await sendAndConfirmWhale(mintWhaleTransaction, {
          onSuccess: () => {
            refetchWhaleContract();
          },
          onError: (error: any) => {
            console.error('Failed to mint Whale:', error);
          },
        });
        setTimeout(() => refetchWhaleContract(), 3000);
      } catch (error) {
        console.error('Failed to mint Whale:', error);
      }
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
        ${canMint && !hasNft ? 'cursor-pointer glow-effect' : ''} ${isMintingWhale ? 'cursor-not-allowed' : ''}`}
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
      {isMintingWhale && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <span className="text-neutral-400 text-xs">...</span>
        </div>
      )}
    </div>
  );
}
