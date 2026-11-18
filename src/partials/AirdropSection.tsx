import { useAirdrop } from '@/hooks/useAirdrop';
import { formatUnits, parseUnits } from 'viem';
import { Spinner } from '@/components/Spinner';


// Metadata for known reward reasons
const REWARD_METADATA: Record<string, { name: string; icon: string; description: string; defaultAmount: bigint }> = {
  'GemFun v1': { 
    name: 'GemFun v1', 
    icon: '/assets/Gem.webp', 
    description: 'Early platform adopter',
    defaultAmount: parseUnits('30000', 18)
  },
  'Zealy Spin': { 
    name: 'Zealy Spin', 
    icon: '/assets/zealy.webp', 
    description: 'Quest competition winner',
    defaultAmount: parseUnits('15000', 18)
  },
  'Beta Tester': { 
    name: 'Beta Tester', 
    icon: '/assets/hash.webp', 
    description: 'Platform stability contributor',
    defaultAmount: parseUnits('30000', 18)
  },
  'DRUB Badge NFT': { 
    name: 'DRUB Badge', 
    icon: '/assets/BadgeDRUB.webp', 
    description: 'Exclusive NFT holder reward',
    defaultAmount: parseUnits('15000', 18)
  },
  'Dolphin NFT': { 
    name: 'Dolphin NFT', 
    icon: '/assets/Whale.webp', 
    description: 'Dolphin NFT ownership reward',
    defaultAmount: parseUnits('30000', 18)
  },
};

export default function AirdropSection() {
  const { stats, airdrops, isLoading, isClaiming, handleClaim, address } = useAirdrop();

  if (!address) return null;

  const pendingAmount = stats?.pending || 0n;

  // Generate the full list of rewards to display
  const getDisplayRewards = () => {
    const rewards = [];
    const processedReasons = new Set<string>();

    // 1. Add all known rewards from metadata
    for (const [reason, meta] of Object.entries(REWARD_METADATA)) {
      const userDrop = airdrops?.find(d => d.reason === reason);
      rewards.push({
        reason,
        name: meta.name,
        icon: meta.icon,
        description: meta.description,
        amount: userDrop ? userDrop.amount : meta.defaultAmount,
        isEligible: !!userDrop,
        isClaimed: userDrop?.claimed || false,
      });
      processedReasons.add(reason);
    }

    // 2. Add any extra rewards the user might have that aren't in metadata
    airdrops?.forEach(drop => {
      if (!processedReasons.has(drop.reason)) {
        rewards.push({
          reason: drop.reason,
          name: drop.reason,
          icon: '/assets/Gem.webp',
          description: 'Special contribution reward',
          amount: drop.amount,
          isEligible: true,
          isClaimed: drop.claimed,
        });
      }
    });

    return rewards;
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Candy Cane Upcoming Airdrop */}
      <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg-flex-row gap-8 items-center justify-between">
            
            <div className="flex-1 w-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 shadow-lg shadow-red-500/5">
                  <img src="/assets/candy%20cane.webp" alt="Candy Cane" className="w-12 h-12 object-contain drub-bounce-animation" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Candy Cane Airdrop 4</h2>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider animate-pulse">Upcoming</span>
                  </div>
                  <p className="text-gray-400 text-sm">Holiday Rewards for Our Entire Community</p>
                </div>
              </div>
            </div>

            <div className="lg:w-72 w-full shrink-0">
              <div className="bg-red-500/5 rounded-2xl border border-red-500/10 p-4 shadow-inner flex flex-col items-center">
                <button
                  disabled
                  className="w-full py-4 h-auto text-sm font-bold uppercase tracking-widest bg-neutral-800 text-neutral-500 border border-neutral-700/50 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Dec 2026</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}