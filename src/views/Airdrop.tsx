import { useActiveAccount } from 'thirdweb/react';
import { useQuery } from '@tanstack/react-query';
import { achievementAggregatorContract } from '@/utils/contracts';
import { achievementAggregatorAbi } from '@/utils/achievementAggregatorAbi';
import { tipsPublicClient } from '@/lib/viem/client';
import { Spinner } from '@/components/Spinner';
import Faucet from '@/partials/Faucet';
import AirdropSection from '@/partials/AirdropSection';

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
}

export default function Airdrop() {
  const account = useActiveAccount();
  const address = account?.address as `0x${string}` | undefined;

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
      return result as UserAchievementStatus[];
    },
    enabled: !!address,
  });

  const formatAchievementValue = (value: bigint, name: string, isRequired: boolean = false) => {
    // Специальная обработка для "Coffee Supporter"
    if (name.includes('Coffee') || name.includes('кофе')) {
      if (value === 0n) return '0';
      // Если это требование (requiredValue), оно обычно равно 1
      if (isRequired && value < 1000000000000n) return value.toLocaleString();
      // Используем примерную стоимость чашки в 0.0015 ETH для оценки количества
      const cups = Number(value) / 1.5e15;
      return Math.max(1, Math.floor(cups)).toLocaleString();
    }

    // Если число очень большое (больше 10^12), скорее всего это wei или токен с 18 знаками
    if (value > 1000000000000n) {
      return Math.floor(Number(value) / 1e18).toLocaleString();
    }
    
    return value.toLocaleString();
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

  const achievedCount = achievements?.filter(a => a.isAchieved).length || 0;
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
        {achievements?.sort((a, b) => Number(a.order) - Number(b.order)).map((achievement) => (
          <div 
            key={achievement.id.toString()}
            className={`relative flex flex-col p-4 rounded-xl border transition-all duration-300 ${
              achievement.isAchieved 
                ? 'bg-neutral-900 border-blue-500/50 shadow-lg shadow-blue-500/10 glow-effect' 
                : 'bg-neutral-900/40 border-neutral-800 opacity-70 grayscale'
            }`}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <img 
                  src={achievement.imageUrl || '/assets/Gem.webp'} 
                  alt={achievement.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                {achievement.isAchieved && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-white leading-tight">{achievement.name}</h3>
            </div>
            
            <p className="text-xs text-gray-400 mb-4 grow">{achievement.description}</p>
            
            <div className="mt-auto">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500">Progress</span>
                <span className={achievement.isAchieved ? 'text-blue-400' : 'text-gray-400'}>
                  {formatAchievementValue(achievement.currentValue, achievement.name)} / {formatAchievementValue(achievement.requiredValue, achievement.name, true)}
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${achievement.isAchieved ? 'bg-blue-500' : 'bg-neutral-600'}`}
                  style={{ width: `${Math.min(100, (Number(achievement.currentValue) / Number(achievement.requiredValue)) * 100)}%` }}
                />
              </div>
            </div>
            
            {achievement.isAchieved && (
              <div className="mt-3 flex justify-end">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Unlocked</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Faucet />
    </div>
  );
}
