import { GMAchievement } from './GMAchievement';
import { useEffect } from 'react';
import type { Wallet } from 'thirdweb/wallets';
import { useDisconnect, useWalletBalance } from 'thirdweb/react';
import { useQuery } from '@tanstack/react-query'; // Added useQuery import
import {
  hashcoinContract,
  earlyBirdContract,
  buyMeACoffeeContract,
  nameContract,
  stakeNftContract,
  drubContract,
  drub100BadgeContract,
  xroleRewardContract,
} from '../utils/contracts';
import { readContract } from 'thirdweb'; // Added readContract import
import EarlyBirdClaimButton from './EarlyBirdClaimButton';
import { DolphinAchievement, SharkAchievement, WhaleAchievement } from './WhaleAchievements';

interface ProfileModalProps {
  wallet: Wallet;
  onClose: () => void;
  hasCatNft: boolean;
  isNftLoading: boolean;
  registeredName: string | null;
}

// Xrole Achievement Component
function XroleAchievement({ wallet }: { wallet: Wallet }) {
  const ownerAddress = wallet.getAccount()?.address;

  const { data: hasClaimed, isLoading: isClaimLoading } = useQuery({
    queryKey: ['xroleRewardClaimed', xroleRewardContract.address, ownerAddress],
    queryFn: () =>
      readContract({
        contract: xroleRewardContract,
        method: 'claimed',
        params: [ownerAddress || ''],
      }),
    enabled: !!ownerAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

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

  if (isClaimLoading) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Loading Xrole achievement..."
      >
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasClaimed ? 'Xrole achievement unlocked!' : 'Xrole achievement not unlocked'}
    >
      <img
        src="/assets/Xrole.webp"
        alt="Xrole Achievement"
        className={`size-10 ${!hasClaimed ? 'opacity-50' : ''}`}
      />
    </div>
  );
}

// Hashcoin Achievement Component
function HashcoinAchievement({ wallet }: { wallet: Wallet }) {
  const { data: balance, isLoading: isBalanceLoading } = useWalletBalance({
    chain: hashcoinContract.chain,
    address: wallet.getAccount()?.address,
    client: hashcoinContract.client,
    tokenAddress: hashcoinContract.address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const formattedBalance = balance ? `${parseInt(balance.displayValue).toString()} ${balance.symbol}` : '0 HASH';
  const HASHCOIN_ACHIEVEMENT_THRESHOLD = 10000;

  const hasEnoughHash =
    balance && balance.value >= BigInt(HASHCOIN_ACHIEVEMENT_THRESHOLD) * 10n ** BigInt(balance.decimals);

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
      title={isBalanceLoading ? 'Loading...' : `Balance: ${formattedBalance}`}
    >
      <img src="/image.svg" alt="Hashcoin Logo" className={`size-10 ${!hasEnoughHash ? 'opacity-50' : ''}`} />
    </div>
  );
}

// Drub Achievement Component
function DrubAchievement({ wallet }: { wallet: Wallet }) {
  const { data: balance, isLoading: isBalanceLoading } = useWalletBalance({
    chain: drubContract.chain,
    address: wallet.getAccount()?.address,
    client: drubContract.client,
    tokenAddress: drubContract.address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const formattedBalance = balance ? `${parseInt(balance.displayValue).toString()} ${balance.symbol}` : '0 DRUB';
  const DRUB_ACHIEVEMENT_THRESHOLD = 1000;

  const hasEnoughDrub =
    balance && balance.value >= BigInt(DRUB_ACHIEVEMENT_THRESHOLD) * 10n ** BigInt(balance.decimals);

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
      title={isBalanceLoading ? 'Loading...' : `Balance: ${formattedBalance}`}
    >
      <img
        src="/assets/Drub.webp"
        alt="Drub Logo"
        className={`size-10 ${!hasEnoughDrub ? 'opacity-50' : ''}`}
      />
    </div>
  );
}

// BadgeDrub Achievement Component
function BadgeDrubAchievement({ wallet }: { wallet: Wallet }) {
  const ownerAddress = wallet.getAccount()?.address;

  const { data: balance, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['drub100BadgeBalanceOf', drub100BadgeContract.address, ownerAddress],
    queryFn: () =>
      readContract({
        contract: drub100BadgeContract,
        method: 'balanceOf',
        params: [ownerAddress || ''],
      }),
    enabled: !!ownerAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const hasNft = balance && (Array.isArray(balance) ? (balance[0] as bigint) : (balance as bigint)) > 0n;

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

  if (isBalanceLoading) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Loading DRUB Badge NFT..."
      >
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasNft ? 'DRUB Badge Owned' : 'DRUB Badge Not Owned'}
    >
      <img
        src="/assets/BadgeDRUB.webp"
        alt="DRUB Badge Achievement"
        className={`size-10 ${!hasNft ? 'opacity-50' : ''}`}
      />
    </div>
  );
}

// Nft Achievement Component
function NftAchievement({ hasNft, isLoading }: { hasNft: boolean; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Loading NFT..."
      >
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasNft ? 'NFT Owned' : 'No NFT owned'}
    >
      <img src="/assets/Cat.webp" alt="NFT Achievement" className={`size-10 ${!hasNft ? 'opacity-50' : ''}`} />
    </div>
  );
}

// Early NFT Achievement Component
function EarlyNftAchievement({ wallet }: { wallet: Wallet }) {
  const ownerAddress = wallet.getAccount()?.address;

  const { data: balance, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['earlyNftBalanceOf', earlyBirdContract.address, ownerAddress],
    queryFn: () =>
      readContract({
        contract: earlyBirdContract,
        method: 'balanceOf',
        params: [ownerAddress || ''],
      }),
    enabled: !!ownerAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const hasNft = balance && (Array.isArray(balance) ? (balance[0] as bigint) : (balance as bigint)) > 0n;

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

  if (isBalanceLoading) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Loading Early NFT..."
      >
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasNft ? 'Early NFT Owned' : 'Early NFT Not Owned'}
    >
      <img src="/assets/Early.webp" alt="Early NFT Achievement" className={`size-10 ${!hasNft ? 'opacity-50' : ''}`} />
    </div>
  );
}

// Tips Achievement Component
function TipsAchievement({ wallet }: { wallet: Wallet }) {
  const ownerAddress = wallet.getAccount()?.address;

  const { data: userTips, isLoading: isTipsLoading } = useQuery({
    queryKey: ['tipsFromUsers', buyMeACoffeeContract.address, ownerAddress],
    queryFn: () =>
      readContract({
        contract: buyMeACoffeeContract,
        method: 'tipsFromUsers',
        params: [ownerAddress || ''],
      }),
    enabled: !!ownerAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const hasTipped = userTips && (Array.isArray(userTips) ? (userTips[0] as bigint) : (userTips as bigint)) > 0n;

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

  if (isTipsLoading) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Loading Tips..."
      >
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasTipped ? 'Coffee Tipper!' : 'Tip coffee to get this achievement'}
    >
      <img src="/assets/tips.webp" alt="Tips Achievement" className={`size-10 ${!hasTipped ? 'opacity-50' : ''}`} />
    </div>
  );
}

// Name Hash Achievement Component
function NameAchievement({ wallet }: { wallet: Wallet }) {
  const ownerAddress = wallet.getAccount()?.address;

  const { data: balance, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['nameContractBalanceOf', nameContract.address, ownerAddress],
    queryFn: () =>
      readContract({
        contract: nameContract,
        method: 'balanceOf',
        params: [ownerAddress || ''],
      }),
    enabled: !!ownerAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const hasNameNft = balance && (Array.isArray(balance) ? (balance[0] as bigint) : (balance as bigint)) > 0n;

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

  if (isBalanceLoading) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Loading Name NFT..."
      >
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasNameNft ? 'You own a .hash name!' : 'Register a .hash name to unlock'}
    >
      <img
        src="/assets/Name.webp"
        alt="Name Hash Achievement"
        className={`size-10 ${!hasNameNft ? 'opacity-50' : ''}`}
      />
    </div>
  );
}

// Stake NFT Achievement Component
function StakeNftAchievement({ wallet }: { wallet: Wallet }) {
  const ownerAddress = wallet.getAccount()?.address;

  const { data: balance, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['stakeNftBalanceOf', stakeNftContract.address, ownerAddress],
    queryFn: () =>
      readContract({
        contract: stakeNftContract,
        method: 'balanceOf',
        params: [ownerAddress || ''],
      }),
    enabled: !!ownerAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const hasNft = balance && (Array.isArray(balance) ? (balance[0] as bigint) : (balance as bigint)) > 0n;

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

  if (isBalanceLoading) {
    return (
      <div
        className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
        title="Loading Stake NFT..."
      >
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasNft ? 'Stake NFT Owned' : 'Stake NFT Not Owned'}
    >
      <img src="/assets/Stake.webp" alt="Stake NFT Achievement" className={`size-10 ${!hasNft ? 'opacity-50' : ''}`} />
    </div>
  );
}

export default function ProfileModal({ wallet, onClose, hasCatNft, isNftLoading, registeredName }: ProfileModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  const { disconnect } = useDisconnect();
  const shortAddress = `${wallet.getAccount()?.address.slice(0, 6)}...${wallet.getAccount()?.address.slice(-4)}`;
  const displayName = registeredName ? `${registeredName}.hash` : shortAddress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onBackdropClick}>
      <div className="bg-neutral-900 text-neutral-200 max-w-md w-full max-h-[90vh] overflow-auto rounded-xl p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close modal"
        >
          <img src="/image.svg" alt="Close" className="w-8 h-8" />
        </button>
        <div className="space-y-6">
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-blue-400">Profile</h2>
            <p className="text-lg font-mono" title={wallet.getAccount()?.address}>
              {displayName}
            </p>
          </section>

          <div className="border-t border-neutral-700"></div>

          <section>
            <h3 className="text-xl font-semibold text-blue-400 mb-4">Achievements</h3>
            <div className="grid grid-cols-4 gap-2">
              <HashcoinAchievement wallet={wallet} />
              <NftAchievement hasNft={hasCatNft} isLoading={isNftLoading} />
              <EarlyNftAchievement wallet={wallet} />
              <TipsAchievement wallet={wallet} />
              <NameAchievement wallet={wallet} />

              {/* Empty cells */}
              <DrubAchievement wallet={wallet} />
              <BadgeDrubAchievement wallet={wallet} />
              <XroleAchievement wallet={wallet} />

              <StakeNftAchievement wallet={wallet} />

              {/* Empty cells */}
              <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center" title="Soon" />
              <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center" title="Soon" />
              <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center" title="Soon" />

              <div
                className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
                title="Soon"
              >
                <img src="/assets/WL.webp" alt="WL Achievement" className="size-10 opacity-50" />
              </div>
              <DolphinAchievement wallet={wallet} />
              <SharkAchievement wallet={wallet} />
              <WhaleAchievement wallet={wallet} />

              {/* Empty cell */}
              <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center" title="Soon" />

              <div
                className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
                title="Soon"
              >
                <img src="/assets/OG.webp" alt="OG Achievement" className="size-10 opacity-50" />
              </div>

              {/* Empty cell */}
              <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center" title="Soon" />

              <GMAchievement wallet={wallet} />
            </div>
          </section>

          <div className="border-t border-neutral-700"></div>

          <div className="mt-6 space-y-4">
            <div>
              <EarlyBirdClaimButton />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <button
                title="Conditions not met"
                disabled
                className="inline-flex items-center justify-center w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 cursor-not-allowed"
              >
                OG
              </button>
              <button
                title="Conditions not met"
                disabled
                className="inline-flex items-center justify-center w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 cursor-not-allowed"
              >
                Beta
              </button>
              <button
                title="Via WL"
                disabled
                className="inline-flex items-center justify-center w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 cursor-not-allowed"
              >
                Core
              </button>
            </div>
          </div>

          <div className="border-t border-neutral-700"></div>

          <div className="mt-6 flex justify-center items-center gap-4">
            <button
              onClick={async () => {
                await disconnect(wallet);
                onClose();
              }}
              className="px-6 py-2 font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors border border-red-500 hover:border-red-600 shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
