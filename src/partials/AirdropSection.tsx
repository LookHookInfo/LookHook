import { useAirdrop } from '@/hooks/useAirdrop';
import { formatUnits, parseUnits } from 'viem';
import { Spinner } from '@/components/Spinner';

// Mapping of contract reasons to pretty names and default amounts
const ALL_POSSIBLE_DROPS = [
  { reason: 'GemFun v1', name: 'GemFun v1', amount: parseUnits('30000', 18) },
  { reason: 'Zealy Spin', name: 'Zealy Spin Winner', amount: parseUnits('15000', 18) },
  { reason: 'Beta Tester', name: 'Beta Tester', amount: parseUnits('30000', 18) },
  { reason: 'DRUB Badge NFT', name: 'DRUB Badge', amount: parseUnits('15000', 18) },
  { reason: 'Dolphin NFT', name: 'Dolphin NFT', amount: parseUnits('30000', 18) },
];

export default function AirdropSection() {
  const { stats, airdrops, isLoading, isClaiming, handleClaim, address } = useAirdrop();

  if (!address) return null;

  const pendingAmount = stats?.pending || 0n;

  return (
    <div className="mb-8">
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
                  <h2 className="text-2xl font-bold text-white tracking-tight">Community Airdrop</h2>
                  <p className="text-gray-400 text-sm">Your contribution to the ecosystem</p>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-3">Rewards List</h3>
                
                {isLoading ? (
                  <div className="py-10 flex justify-center"><Spinner className="h-6 w-6 text-blue-500" /></div>
                ) : (
                  ALL_POSSIBLE_DROPS.map((item, idx) => {
                    const actualDrop = airdrops?.find(d => d.reason === item.reason);
                    const isEligible = !!actualDrop;
                    const isClaimed = actualDrop?.claimed || false;
                    const isPending = isEligible && !isClaimed;
                    
                    const displayAmount = actualDrop ? actualDrop.amount : item.amount;
                    // Safe formatting for large BigInts
                    const amountFormatted = Number(formatUnits(displayAmount, 18)).toLocaleString('en-US', { maximumFractionDigits: 0 });

                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between py-2.5 px-4 rounded-xl border transition-all duration-300 ${
                          isPending 
                            ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20' 
                            : isEligible && isClaimed 
                              ? 'bg-green-500/5 border-green-500/10 opacity-70'
                              : 'bg-neutral-950/20 border-neutral-800/40 opacity-40 grayscale'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isPending 
                              ? 'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse' 
                              : isEligible && isClaimed 
                                ? 'bg-green-500' 
                                : 'bg-neutral-700'
                          }`} />
                          <div className={`text-xs font-bold ${isPending ? 'text-white' : isEligible && isClaimed ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.name}
                          </div>
                        </div>
                        
                        <div className="text-right flex items-center gap-6">
                          <div className={`text-xs font-mono font-bold ${isPending ? 'text-blue-400' : isEligible && isClaimed ? 'text-green-600' : 'text-gray-700'}`}>
                            {amountFormatted} HASH
                          </div>
                          <div className={`text-[9px] font-black uppercase tracking-wider w-16 text-center ${isPending ? 'text-blue-400' : isEligible && isClaimed ? 'text-green-800' : 'text-gray-800'}`}>
                            {isPending ? 'READY' : isEligible && isClaimed ? 'CLAIMED' : 'LOCKED'}
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
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
