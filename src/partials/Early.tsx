import { useState, useEffect, useCallback, useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { earlyBirdContract } from '../utils/contracts';
import { useQueries, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { earlyPublicClient } from '../lib/viem/client';
import { earlyBirdAbi } from '../utils/earlyBirdAbi';
import { encodeFunctionData, parseUnits } from 'viem';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { Spinner } from '../components/Spinner';

interface EarlyProps {
  className?: string;
}

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

function formatTime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function Early({ className }: EarlyProps) {
  const account = useActiveAccount();
  const address = account?.address;
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(0);

  // 1. Contract Reads
  const { data: stakingContractAddress } = useQuery({
    queryKey: ['stakingContractAddress', earlyBirdContract.address],
    queryFn: () => earlyPublicClient.readContract({
      address: earlyBirdContract.address as `0x${string}`,
      abi: earlyBirdAbi,
      functionName: 'stakingContract',
    }),
    staleTime: Infinity,
  });

  const { data: claimDeadline } = useQuery({
    queryKey: ['claimDeadline', earlyBirdContract.address],
    queryFn: () => earlyPublicClient.readContract({
      address: earlyBirdContract.address as `0x${string}`,
      abi: earlyBirdAbi,
      functionName: 'CLAIM_DEADLINE',
    }),
    staleTime: Infinity,
  });

  const { data: isClaimOpen } = useQuery({
    queryKey: ['isClaimOpen', earlyBirdContract.address],
    queryFn: () => earlyPublicClient.readContract({
      address: earlyBirdContract.address as `0x${string}`,
      abi: earlyBirdAbi,
      functionName: 'isClaimOpen',
    }),
    staleTime: 60000,
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
    staleTime: 300000,
  });

  // 2. Eligibility (Staking Rewards)
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
      staleTime: 300000,
    })),
  });

  const totalRewards = useMemo(() => {
    return stakeInfoQueries.reduce((acc: bigint, query) => {
      const data = query.data;
      if (data && Array.isArray(data) && data[1]) {
        return acc + (data[1] as bigint);
      }
      return acc;
    }, 0n);
  }, [stakeInfoQueries]);

  const hasEnoughHash = totalRewards >= parseUnits('1', 18);
  const isStakeInfoLoading = stakeInfoQueries.some((q) => q.isLoading);

  // 3. Mutation
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
  });

  // 4. Countdown Timer
  useEffect(() => {
    if (!claimDeadline) return;
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(claimDeadline) - now;
      setTimeLeft(diff > 0 ? diff : 0);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [claimDeadline]);

  // UI States
  const isLoading = hasClaimedLoading || isStakeInfoLoading;
  const isEnded = !isClaimOpen && timeLeft <= 0;
  const isButtonActive = account && isClaimOpen && hasEnoughHash && !hasClaimed && !claimMutation.isPending && !isLoading;

  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start h-full">
          {/* Left Column: Image & Status */}
          <div className="w-full lg:w-[130px] flex flex-col items-center relative shrink-0">
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg z-10">
              Base
            </div>
            <img src="/assets/Early.webp" alt="Early Bird NFT" className="rounded-xl w-full h-auto shadow-2xl" />
            
            {/* Holding Status Section */}
            {account && (
              <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
                {hasClaimed ? (
                  <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Hold NFT
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-500 text-gray-500 opacity-50">
                    Not Hold
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Info & Large Action */}
          <div className="flex-1 flex flex-col space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">Early Bird</h2>
                {timeLeft > 0 && (
                  <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center gap-2 shadow-inner">
                    <span className="text-sky-400 animate-pulse">⏳</span>
                    <span className="text-white font-mono font-bold text-sm">{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
                  The First identity of LookHook. Exclusive NFT for early miners who earned at least 1 HASH.
                </p>
                
                {!hasClaimed && account && !isEnded && (
                  <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-700/50 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-neutral-500">Eligibility Progress</span>
                      <span className={hasEnoughHash ? 'text-green-400' : 'text-sky-400'}>
                        {hasEnoughHash ? '1.00 / 1.00 HASH' : `${(Number(totalRewards) / 1e18).toFixed(2)} / 1.00 HASH`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${hasEnoughHash ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-sky-500'}`}
                        style={{ width: `${Math.min((Number(totalRewards) / 1e18) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Row (Xrole Style) */}
            <div className="pt-2 flex items-center gap-3">
              {!account ? (
                <div className="w-full">
                  <ConnectWalletButton />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => isButtonActive && claimMutation.mutate()}
                    disabled={!isButtonActive}
                    className={`flex-1 py-3 rounded-lg text-xl font-bold border transition-all uppercase tracking-tighter flex items-center justify-center ${
                      isButtonActive
                        ? 'border-neutral-700 text-white bg-neutral-800 glow-effect cursor-pointer'
                        : 'border-neutral-700 text-neutral-500 bg-neutral-900/30 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {claimMutation.isPending ? (
                      <Spinner className="w-5 h-5 mr-2" />
                    ) : hasClaimed ? (
                      'Claimed'
                    ) : isEnded ? (
                      'Soon'
                    ) : (
                      'Claim Early'
                    )}
                  </button>

                  <a
                    href="https://opensea.io/collection/earlyhash"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center size-[52px] rounded-lg border border-neutral-700 bg-neutral-900/50 hover:bg-neutral-700 transition-all transform hover:scale-105 shrink-0"
                    title="OpenSea"
                  >
                    <img src="/assets/Sea.webp" alt="OpenSea" className="size-8" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
