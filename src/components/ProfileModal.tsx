import { useEffect } from "react";
import type { Wallet } from "thirdweb/wallets";
import { useDisconnect, useWalletBalance, useReadContract } from "thirdweb/react";
import { hashcoinContract, earlyBirdContract, buyMeACoffeeContract, nameContract } from "../utils/contracts";
import EarlyBirdClaimButton from "./EarlyBirdClaimButton";

interface ProfileModalProps {
  wallet: Wallet;
  onClose: () => void;
  hasCatNft: boolean;
  isNftLoading: boolean;
  registeredName: string | null;
}

// Hashcoin Achievement Component
function HashcoinAchievement({ wallet }: { wallet: Wallet }) {
  const { data: balance, isLoading: isBalanceLoading } = useWalletBalance({
    chain: hashcoinContract.chain,
    address: wallet.getAccount()?.address,
    client: hashcoinContract.client,
    tokenAddress: hashcoinContract.address,
  });

  const formattedBalance = balance ? `${parseInt(balance.displayValue).toString()} ${balance.symbol}` : "0 HASH";
  const HASHCOIN_ACHIEVEMENT_THRESHOLD = 10000;

  const hasEnoughHash = balance && balance.value >= BigInt(HASHCOIN_ACHIEVEMENT_THRESHOLD) * (10n ** BigInt(balance.decimals));

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group"
      title={isBalanceLoading ? "Loading..." : `Balance: ${formattedBalance}`}
    >
      <img src="/image.svg" alt="Hashcoin Logo" className={`size-10 ${!hasEnoughHash ? 'opacity-50' : ''}`} />
    </div>
  );
}

// Nft Achievement Component
function NftAchievement({ hasNft, isLoading }: { hasNft: boolean, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group" title="Loading NFT...">
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasNft ? "NFT Owned" : "No NFT owned"}
    >
      <img src="/Cat.webp" alt="NFT Achievement" className={`size-10 ${!hasNft ? 'opacity-50' : ''}`} />
    </div>
  );
}

// Early NFT Achievement Component
function EarlyNftAchievement({ wallet }: { wallet: Wallet }) {
  const ownerAddress = wallet.getAccount()?.address;

  const { data: balance, isLoading: isBalanceLoading } = useReadContract({
    contract: earlyBirdContract,
    method: "function balanceOf(address owner) view returns (uint256)",
    params: [ownerAddress || ""],
    queryOptions: {
      enabled: !!ownerAddress,
    },
  });

  const hasNft = balance && balance > 0n;

  if (!ownerAddress) {
    return (
      <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group" title="Connect wallet to see achievement">
        <span className="text-neutral-400 text-xs">?</span>
      </div>
    );
  }
  
  if (isBalanceLoading) {
    return (
      <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group" title="Loading Early NFT...">
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasNft ? "Early NFT Owned" : "Early NFT Not Owned"}
    >
      <img src="/Early.webp" alt="Early NFT Achievement" className={`size-10 ${!hasNft ? 'opacity-50' : ''}`} />
    </div>
  );
}

// Tips Achievement Component
function TipsAchievement({ wallet }: { wallet: Wallet }) {
  const ownerAddress = wallet.getAccount()?.address;

  const { data: userTips, isLoading: isTipsLoading } = useReadContract({
    contract: buyMeACoffeeContract,
    method: "tipsFromUsers",
    params: [ownerAddress || ""],
    queryOptions: {
      enabled: !!ownerAddress,
    },
  });

  const hasTipped = userTips && userTips > 0n;

  if (!ownerAddress) {
    return (
      <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group" title="Connect wallet to see achievement">
        <span className="text-neutral-400 text-xs">?</span>
      </div>
    );
  }

  if (isTipsLoading) {
    return (
      <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group" title="Loading Tips...">
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasTipped ? "Coffee Tipper!" : "Tip coffee to get this achievement"}
    >
      <img src="/tips.webp" alt="Tips Achievement" className={`size-10 ${!hasTipped ? 'opacity-50' : ''}`} />
    </div>
  );
}

// Name Hash Achievement Component
function NameAchievement({ wallet }: { wallet: Wallet }) {
  const ownerAddress = wallet.getAccount()?.address;

  const { data: balance, isLoading: isBalanceLoading } = useReadContract({
    contract: nameContract,
    method: "function balanceOf(address owner) view returns (uint256)",
    params: [ownerAddress || ""],
    queryOptions: {
      enabled: !!ownerAddress,
    },
  });

  const hasNameNft = balance && balance > 0n;

  if (!ownerAddress) {
    return (
      <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group" title="Connect wallet to see achievement">
        <span className="text-neutral-400 text-xs">?</span>
      </div>
    );
  }

  if (isBalanceLoading) {
    return (
      <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group" title="Loading Name NFT...">
        <span className="text-neutral-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <div
      className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden"
      title={hasNameNft ? "You own a .hash name!" : "Register a .hash name to unlock"}
    >
      <img src="/Name.webp" alt="Name Hash Achievement" className={`size-10 ${!hasNameNft ? 'opacity-50' : ''}`} />
    </div>
  );
}

export default function ProfileModal({ wallet, onClose, hasCatNft, isNftLoading, registeredName }: ProfileModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onBackdropClick}
    >
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
            <h2 className="text-2xl font-bold mb-2 text-blue-400">
              Profile
            </h2>
            <p className="text-lg font-mono" title={wallet.getAccount()?.address}>
              {displayName}
            </p>
          </section>

          <div className="border-t border-neutral-700"></div>

          <section>
            <h3 className="text-xl font-semibold text-blue-400 mb-4">
              Achievements
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <HashcoinAchievement wallet={wallet} />
              <NftAchievement hasNft={hasCatNft} isLoading={isNftLoading} />
              <EarlyNftAchievement wallet={wallet} />
              <TipsAchievement wallet={wallet} />
              <NameAchievement wallet={wallet} />
              {[...Array(7)].map((_, index) => (
                <div key={index} className="size-12 rounded-full bg-neutral-700 flex items-center justify-center" title="Soon"></div>
              ))}
              <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden" title="Soon">
                <img src="/WL.webp" alt="WL Achievement" className="size-10 opacity-50" />
              </div>
              {[...Array(4)].map((_, index) => (
                <div key={index + 7} className="size-12 rounded-full bg-neutral-700 flex items-center justify-center" title="Soon"></div>
              ))}
              <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden" title="Soon">
                <img src="/OG.webp" alt="OG Achievement" className="size-10 opacity-50" />
              </div>
              {[...Array(1)].map((_, index) => (
                <div key={index + 11} className="size-12 rounded-full bg-neutral-700 flex items-center justify-center" title="Soon"></div>
              ))}
              <div className="size-12 rounded-full bg-neutral-700 flex items-center justify-center relative group overflow-hidden" title="Soon">
                <img src="/GM.webp" alt="GM Achievement" className="size-10 opacity-50" />
              </div>
            </div>
          </section>

          <div className="border-t border-neutral-700"></div>

          <div className="mt-6 space-y-4">
            <div>
              <EarlyBirdClaimButton variant="minimal" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <button title="Conditions not met" disabled className="inline-flex items-center justify-center w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 cursor-not-allowed">
                OG
              </button>
              <button title="Conditions not met" disabled className="inline-flex items-center justify-center w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 cursor-not-allowed">
                Beta
              </button>
              <button title="Via WL" disabled className="inline-flex items-center justify-center w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 cursor-not-allowed">
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
