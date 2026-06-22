import { useActiveAccount } from 'thirdweb/react';
import { useQuery } from '@tanstack/react-query';
import { achievementAggregatorContract, dswNftContract } from '@/utils/contracts';
import { achievementAggregatorAbi } from '@/utils/achievementAggregatorAbi';
import { hashAchievementNFTsAbi } from '@/utils/hashAchievementNFTsAbi';
import { tipsPublicClient } from '@/lib/viem/client';
import { Spinner } from '@/components/Spinner';
import Faucet from '@/partials/Faucet';
import AirdropSection from '@/partials/AirdropSection';
import { useAchievementNFTClaim } from '@/hooks/useAchievementNFTClaim';
import { formatUnits } from 'viem';

interface UserAchievementStatus {
  id: bigint;
  name: string;
  description: string;
  imageUrl: string;
  requiredValue: bigint;
  currentValue: bigint;
  isAchieved: boolean;
  isActive: boolean;
  order: bigint;
  canClaim: boolean;
  isClaimable: boolean;
}

// ID ачивок NFT (Dolphin / Shark / Whale)
const NFT_CLAIM_IDS = new Set([10n, 11n, 12n]);

export default function Airdrop() {
  const account = useActiveAccount();
  const address = account?.address as `0x${string}` | undefined;

  // Получаем все ачивки пользователя с агрегатора — он уже всё правильно посчитал
  // Для 10/11/12: currentValue = balanceOf коллекции, canClaim = доступен ли tier
  const { data: achievements, isLoading, error } = useQuery({
    queryKey: ['userAchievements', address],
    queryFn: async () => {
      if (!address) return [];
      const result = await tipsPublicClient.readContract({
        address: achievementAggregatorContract.address as `0x${string}`,
        abi: achievementAggregatorAbi,
        functionName: 'getUserAchievements',
        args: [address],
      });
      return (result as unknown as UserAchievementStatus[]).map((a) => ({
        ...a,
        canClaim: a.canClaim ?? false,
        isClaimable: a.isClaimable ?? false,
      }));
    },
    enabled: !!address,
  });

  const { claimNFT, isClaiming: isClaimingNFT } = useAchievementNFTClaim();

  // Пороги HASH для NFT-достижений (Dolphin/Shark/Whale)
  const NFT_STAKE_THRESHOLDS: Record<number, bigint> = {
    10: 1000n * 10n ** 18n,
    11: 10000n * 10n ** 18n,
    12: 25000n * 10n ** 18n,
  };

  // Текущие стейкинг-реварды пользователя (в wei)
  const { data: stakeRewards } = useQuery({
    queryKey: ['stakeRewards', address],
    queryFn: async () => {
      if (!address) return 0n;
      const result = await tipsPublicClient.readContract({
        address: dswNftContract.address as `0x${string}`,
        abi: hashAchievementNFTsAbi,
        functionName: 'getUserStatus',
        args: [address],
      });
      const arr = result as [bigint, boolean, boolean, boolean, boolean, boolean, boolean];
      return arr[0];
    },
    enabled: !!address,
    staleTime: 300000,
  });

  const earnedRewards = stakeRewards ?? 0n;

  /**
   * Форматирование прогресса.
   *  - HASH-ачивки (Dolphin/Shark/Whale): currentValue = количество NFT у пользователя.
   *  - Coffee Supporter: wei → чашки.
   *  - Остальные: human-формат с clamp.
   */
  const formatProgress = (a: UserAchievementStatus): string => {
    const current = a.currentValue;
    const required = a.requiredValue;

    // Coffee Supporter: wei → чашки
    if (a.name.includes('Coffee') || a.name.includes('кофе')) {
      const cups = Number(current) / 1.5e15;
      const requiredCups = Number(required) / 1.5e15;
      const cur = Math.max(1, Math.floor(cups));
      const req = Math.max(1, Math.floor(requiredCups));
      return `${cur} / ${req}`;
    }

    // HASH-ачивки (Dolphin/Shark/Whale): прогресс по стейкинг-ревардам
    if (NFT_CLAIM_IDS.has(a.id)) {
      const threshold = NFT_STAKE_THRESHOLDS[Number(a.id)];
      if (threshold) {
        const cur = Math.floor(Number(formatUnits(earnedRewards, 18)));
        const req = Math.floor(Number(formatUnits(threshold, 18)));
        return `${cur.toLocaleString('en-US')} / ${req.toLocaleString('en-US')} HASH`;
      }
      return `${0} / ${Number(required).toLocaleString('en-US')}`;
    }

    // Большие wei-значения (Hashcoin Holder 18 decimals)
    if (required > 10n ** 12n) {
      const cur = Number(formatUnits(current, 18));
      const req = Number(formatUnits(required, 18));
      const curClamped = Math.min(cur, req);
      return `${Math.floor(curClamped).toLocaleString('en-US')} / ${Math.floor(req).toLocaleString('en-US')}`;
    }

    // Малые значения (count)
    const curClamped = current > required ? required : current;
    return `${curClamped.toString()} / ${required.toString()}`;
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <img src="/assets/Airdrop.webp" alt="Airdrop" className="w-32 h-32 mb-6 animate-pulse" />
        <h1 className="text-3xl font-bold text-white mb-2">AirDrop Hub</h1>
        <p className="text-gray-400 max-w-md">
          Connect your wallet to check your eligibility for community rewards, achievements, and upcoming airdrops.
        </p>
        <Faucet />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 text-red-500">
        <p>Error loading achievements. Please try again later.</p>
      </div>
    );
  }

  const achievedCount = achievements?.filter((a) => a.isAchieved).length || 0;
  const totalCount = achievements?.length || 0;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-4">
          <img src="/assets/Airdrop.webp" alt="Airdrop" className="w-16 h-16" />
          <div>
            <h1 className="text-2xl font-bold text-white">Your Achievements</h1>
            <p className="text-gray-400">Track your progress and unlock rewards</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-500">{achievedCount} / {totalCount}</div>
          <div className="text-sm text-gray-500">Unlocked</div>
        </div>
      </div>

      <AirdropSection />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {achievements
          ?.slice()
          .sort((a, b) => Number(a.order) - Number(b.order))
          .map((achievement) => {
            const isNFTClaim = NFT_CLAIM_IDS.has(achievement.id);
            const progressPercent = isNFTClaim
              ? (() => {
                  const threshold = NFT_STAKE_THRESHOLDS[Number(achievement.id)];
                  return threshold ? Math.min(Number(earnedRewards * 100n / threshold), 100) : 0;
                })()
              : Math.min(
                  (Number(achievement.currentValue) / Number(achievement.requiredValue)) * 100,
                  100,
                );

            // Цвета подсветки по тиру
            const tierStyles =
              achievement.id === 10n
                ? {
                    border: 'border-cyan-400/60',
                    shadow: 'shadow-lg shadow-cyan-500/20',
                    ring: 'ring-1 ring-cyan-400/30',
                    bar: 'bg-gradient-to-r from-cyan-500 to-blue-500',
                    text: 'text-cyan-400',
                  }
                : achievement.id === 11n
                  ? {
                      border: 'border-blue-400/60',
                      shadow: 'shadow-lg shadow-blue-500/20',
                      ring: 'ring-1 ring-blue-400/30',
                      bar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
                      text: 'text-blue-400',
                    }
                  : achievement.id === 12n
                    ? {
                        border: 'border-indigo-400/60',
                        shadow: 'shadow-lg shadow-indigo-500/20',
                        ring: 'ring-1 ring-indigo-400/30',
                        bar: 'bg-gradient-to-r from-indigo-500 to-purple-500',
                        text: 'text-indigo-400',
                      }
                    : null;

            // Для claimable NFT: canClaim переопределяет isAchieved
            // (юзер может иметь canClaim=true, но balance=0 → isAchieved=false)
            const isAchieved = achievement.isAchieved;
            const effectiveIsAchieved = isNFTClaim
              ? (isAchieved || achievement.canClaim)
              : isAchieved;

            // Уже сминчен ли этот tier (currentValue >= required и canClaim = false)
            const tierAlreadyMinted =
              isNFTClaim && isAchieved && !achievement.canClaim;

            return (
              <div
                key={achievement.id.toString()}
                className={`relative flex flex-col p-4 rounded-xl border transition-all duration-300 ${
                  effectiveIsAchieved
                    ? isNFTClaim && tierStyles
                      ? `bg-neutral-900 ${tierStyles.border} ${tierStyles.shadow} ${tierStyles.ring} glow-effect`
                      : 'bg-neutral-900 border-blue-500/50 shadow-lg shadow-blue-500/10 glow-effect'
                    : 'bg-neutral-900/40 border-neutral-800 opacity-70 grayscale'
                }`}
              >
                {/* Header: Image + Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <img
                      src={achievement.imageUrl || '/assets/Gem.webp'}
                      alt={achievement.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    {effectiveIsAchieved && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}

                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white leading-tight text-sm truncate">
                      {achievement.name}
                    </h3>

                  </div>
                </div>

                <p className="text-[11px] text-gray-400 mb-4 grow leading-snug">
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                <div className="mt-auto">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500">
                      {isNFTClaim ? 'HASH Rewards' : 'Progress'}
                    </span>
                    <span
                      className={
                        effectiveIsAchieved
                          ? isNFTClaim && tierStyles
                            ? `${tierStyles.text} font-bold`
                            : 'text-blue-400'
                          : isNFTClaim && tierStyles
                            ? `${tierStyles.text} opacity-70`
                            : 'text-gray-400'
                      }
                    >
                      {formatProgress(achievement)}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        effectiveIsAchieved
                          ? isNFTClaim && tierStyles
                            ? tierStyles.bar
                            : 'bg-blue-500'
                          : isNFTClaim && tierStyles
                            ? `${tierStyles.bar} opacity-40`
                            : 'bg-neutral-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Action Row */}
                {effectiveIsAchieved && (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                      Unlocked
                    </span>
                    {isNFTClaim && !tierAlreadyMinted && (
                      achievement.canClaim ? (
                        <button
                          onClick={() => claimNFT(achievement.id)}
                          disabled={isClaimingNFT}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isClaimingNFT ? (
                            <Spinner className="h-3 w-3 text-white" />
                          ) : (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          )}
                          <span>Claim NFT</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Loading…
                        </span>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Completed Airdrops Section */}
      <div className="mt-16 mb-12">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
          <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.3em] whitespace-nowrap">
            Historical Record
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group overflow-hidden bg-neutral-900/40 border border-neutral-800/60 p-5 rounded-2xl transition-all duration-500 hover:border-neutral-700/80 hover:bg-neutral-900/60">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <img src="/assets/Airdrop.webp" alt="" className="w-16 h-16 object-contain grayscale blur-sm" />
            </div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 shrink-0 bg-neutral-950/50 rounded-xl border border-neutral-800/50 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500">
                <img src="/assets/Airdrop.webp" alt="Completed Airdrop" className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-gray-300 font-bold tracking-tight group-hover:text-white transition-colors">
                    Genesis Airdrop
                  </h3>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-neutral-800 text-gray-500 uppercase">
                    April 2025
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                  The First Distribution - For Those Who Believed First.
                </p>
                <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-neutral-700" />
                  Completed
                </div>
              </div>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-neutral-900/40 border border-neutral-800/60 p-5 rounded-2xl transition-all duration-500 hover:border-neutral-700/80 hover:bg-neutral-900/60">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <img src="/assets/Drop.webp" alt="" className="w-16 h-16 object-contain grayscale blur-sm" />
            </div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 shrink-0 bg-neutral-950/50 rounded-xl border border-neutral-800/50 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500">
                <img src="/assets/Drop.webp" alt="Completed Airdrop" className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-gray-300 font-bold tracking-tight group-hover:text-white transition-colors">
                    Community Reward II
                  </h3>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-neutral-800 text-gray-500 uppercase">
                    Dec 2025
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                  Global Holiday Rewards - Honoring Our Early Supporters.
                </p>
                <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-neutral-700" />
                  Completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Faucet />
    </div>
  );
}


