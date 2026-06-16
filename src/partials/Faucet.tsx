import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatUnits, encodeFunctionData } from 'viem';
import { faucetContract } from '@/utils/contracts';
import { faucetAbi } from '@/utils/faucetAbi';
import { tipsPublicClient } from '@/lib/viem/client';

export default function Faucet() {
  const account = useActiveAccount();
  const address = account?.address as `0x${string}` | undefined;
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { data: faucetBalance = 0n } = useQuery({
    queryKey: ['faucetBalance'],
    queryFn: () => tipsPublicClient.readContract({
      address: faucetContract.address as `0x${string}`,
      abi: faucetAbi,
      functionName: 'getFaucetBalance',
    }),
    refetchInterval: 30000,
  });

  const { data: canClaim = false, refetch: refetchCanClaim } = useQuery({
    queryKey: ['faucetCanClaim', address],
    queryFn: () => {
      if (!address) return false;
      return tipsPublicClient.readContract({
        address: faucetContract.address as `0x${string}`,
        abi: faucetAbi,
        functionName: 'canClaim',
        args: [address],
      });
    },
    enabled: !!address,
  });

  const { data: timeUntilNext = 0n, refetch: refetchTimeUntilNext } = useQuery({
    queryKey: ['faucetTimeUntilNext', address],
    queryFn: async () => {
      if (!address) return 0n;
      return tipsPublicClient.readContract({
        address: faucetContract.address as `0x${string}`,
        abi: faucetAbi,
        functionName: 'getTimeUntilNextClaim',
        args: [address],
      }) as Promise<bigint>;
    },
    enabled: !!address,
  });

  useEffect(() => {
    if (timeUntilNext > 0n) {
      setTimeLeft(Number(timeUntilNext));
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            refetchCanClaim();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
    }
  }, [timeUntilNext, refetchCanClaim]);

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Not connected');
      const data = encodeFunctionData({
        abi: faucetAbi,
        functionName: 'claim',
      });
      const { transactionHash } = await account.sendTransaction({
        to: faucetContract.address as `0x${string}`,
        data,
        chainId: 8453,
      });
      console.log('Transaction sent:', transactionHash);
      const receipt = await tipsPublicClient.waitForTransactionReceipt({ hash: transactionHash });
      console.log('Transaction confirmed:', receipt.transactionHash);
      return receipt;
    },
    onSuccess: async () => {
      // Small delay to allow RPC nodes to sync the new state
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Invalidate all related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['faucetCanClaim', address] }),
        queryClient.invalidateQueries({ queryKey: ['faucetTimeUntilNext', address] }),
        queryClient.invalidateQueries({ queryKey: ['faucetBalance'] }),
        queryClient.invalidateQueries({ queryKey: ['userAchievements', address] }), // Refresh achievements too
      ]);
      
      // Explicit refetch as a backup
      refetchCanClaim();
      refetchTimeUntilNext();
    },
  });

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-12 relative w-full">
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden group">
        
        {/* Creative Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/assets/faucet.webp')] bg-repeat bg-[length:60px_60px] group-hover:opacity-[0.05] transition-opacity duration-700"></div>
        
        {/* Animated Glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full animate-pulse"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          
          {/* Left Side: Logo with Radial Glow */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-sky-500 blur-[40px] opacity-10 group-hover:opacity-25 transition-opacity duration-700"></div>
            <img 
              src="/assets/faucet.webp" 
              alt="Faucet" 
              className="w-32 h-32 md:w-44 md:h-44 relative z-10 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Right Side: Content and Action */}
          <div className="flex-1 flex flex-col md:flex-row items-center md:items-end justify-between w-full gap-8">
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">
                <span className="text-sky-500">Hash</span> Faucet
              </h2>
              <p className="text-neutral-400 text-sm max-w-sm mb-6 leading-relaxed">
                The OG way to get free coins. Claim <span className="text-white font-bold">20 $HASH</span> tokens every 24 hours.
              </p>

              <div className="flex gap-4">
                <div className="bg-black/40 backdrop-blur-sm border border-neutral-800 rounded-xl px-4 py-2 flex flex-col min-w-[120px]">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5 text-center">Faucet Pool</span>
                  <span className="text-sky-500 font-mono font-bold text-sm text-center">
                    {Number(formatUnits(faucetBalance, 18)).toLocaleString()}
                  </span>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm border border-neutral-800 rounded-xl px-4 py-2 flex flex-col min-w-[120px]">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5 text-center">Next Claim</span>
                  {address ? (
                    canClaim ? (
                      <span className="text-green-500 font-bold text-sm uppercase animate-pulse text-center">Ready!</span>
                    ) : (
                      <span className="text-neutral-300 font-mono font-bold text-sm text-center">
                        {timeLeft > 0 ? formatTime(timeLeft) : '...'}
                      </span>
                    )
                  ) : (
                    <span className="text-neutral-500 font-bold text-[10px] italic text-center py-0.5">Connect Wallet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Claim Button */}
            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={() => claimMutation.mutate()}
                disabled={!address || !canClaim || claimMutation.isPending}
                className={`
                  relative overflow-hidden w-full md:w-56 py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 border
                  ${!address || !canClaim || claimMutation.isPending
                    ? 'border-neutral-800 text-neutral-600 bg-neutral-900/30 cursor-not-allowed'
                    : 'bg-sky-600 border-sky-400 text-white shadow-lg shadow-sky-600/10 hover:shadow-sky-600/30 hover:-translate-y-1 active:translate-y-0'
                  }
                `}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {claimMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>WAIT...</span>
                    </>
                  ) : (
                    'Claim $HASH'
                  )}
                </div>
                {address && canClaim && !claimMutation.isPending && (
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
