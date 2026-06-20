import { useAirdrop } from '@/hooks/useAirdrop';
import { formatUnits, parseUnits } from 'viem';
import { Spinner } from '@/components/Spinner';
import { getTwitterShareUrl } from '@/utils/twitterConfig';


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

  const displayRewards = getDisplayRewards();

  return (
    <div className="mb-8 space-y-6">
      {/* Candy Cane Upcoming Airdrop */}
      <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            
            <div className="flex-1 w-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 shadow-lg shadow-red-500/5">
                  <img src="/assets/candy%20cane.webp" alt="Candy Cane" className="w-12 h-12 object-contain drub-bounce-animation" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Candy Cane Airdrop 5</h2>
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

      <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            <div className="flex-1 w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
                  <img src="/assets/Airdrop2.png" alt="HASH" className="w-10 h-10 object-contain drub-bounce-animation" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Community Airdrop 3</h2>
                  <p className="text-gray-400 text-sm">Your contribution to the ecosystem</p>
                </div>
              </div>

              <div className="space-y-3 w-full">
                <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">Rewards List</h3>
                
                {isLoading ? (
                  <div className="py-10 flex justify-center"><Spinner className="h-6 w-6 text-blue-500" /></div>
                ) : (
                  displayRewards.map((item, idx) => {
                    const isPending = item.isEligible && !item.isClaimed;
                    const isClaimed = item.isEligible && item.isClaimed;
                    const isLocked = !item.isEligible;
                    
                    const amountFormatted = Number(formatUnits(item.amount, 18)).toLocaleString('en-US', { maximumFractionDigits: 0 });

                    return (
                      <div 
                        key={`${item.reason}-${idx}`} 
                        className={`group/item flex items-center justify-between py-3 px-4 rounded-xl border transition-all duration-300 ${
                          isPending 
                            ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40 shadow-sm' 
                            : isClaimed
                              ? 'bg-neutral-950/20 border-neutral-800/40 opacity-60'
                              : 'bg-neutral-950/10 border-neutral-800/20 opacity-30 grayscale'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`relative p-2 rounded-lg ${isPending ? 'bg-blue-500/10' : 'bg-neutral-800/30'}`}>
                            <img src={item.icon} alt="" className="w-6 h-6 object-contain" />
                            {isPending && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]" />
                            )}
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${isPending ? 'text-white' : 'text-gray-400'}`}>
                              {item.name}
                            </div>
                            <div className="text-[10px] text-gray-500 leading-tight">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right flex items-center gap-6">
                          <div className={`text-sm font-mono font-bold ${isPending ? 'text-blue-400' : isClaimed ? 'text-green-600' : 'text-gray-700'}`}>
                            {amountFormatted} <span className="text-[10px] opacity-70">HASH</span>
                          </div>
                          <div className={`text-[9px] font-black uppercase tracking-wider w-18 text-center py-1 rounded border transition-colors ${
                            isPending 
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                              : isClaimed
                                ? 'bg-green-500/5 text-green-600 border-green-500/10'
                                : 'bg-neutral-800/20 text-gray-700 border-neutral-800/40'
                          }`}>
                            {isPending ? 'READY' : isClaimed ? 'CLAIMED' : 'LOCKED'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="lg:w-72 w-full shrink-0">
              <div className="bg-blue-500/5 rounded-2xl border border-blue-500/10 p-6 shadow-inner flex flex-col items-center">
                <div className="text-center mb-6">
                   <div className="text-4xl font-black text-white mb-1 tracking-tighter">
                     {isLoading ? <span className="animate-pulse">...</span> : Math.floor(Number(formatUnits(pendingAmount, 18))).toLocaleString()}
                   </div>
                   <div className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em]">Ready to Claim</div>
                </div>
                
                <button
                  onClick={handleClaim}
                  disabled={isClaiming || pendingAmount === 0n || isLoading}
                  className={`btn-claim-glow w-full py-4 !h-auto text-lg transition-all duration-300 ${
                    (pendingAmount === 0n || isLoading) ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : ''
                  }`}
                >
                  {isClaiming ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="h-4 w-4 text-white" />
                      <span>Processing</span>
                    </div>
                  ) : (
                    'Claim Rewards'
                  )}
                </button>

                <a
                  href={getTwitterShareUrl('airdrop')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/40 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932Z" />
                  </svg>
                  <span>Share allocation</span>
                </a>
                
                {pendingAmount > 0n && (
                  <p className="mt-4 text-[10px] text-center text-gray-500 font-medium">
                    All eligible rewards will be claimed in one transaction.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
