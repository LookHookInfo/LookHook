import { useActiveAccount } from 'thirdweb/react';
import { useCountdown } from '../hooks/useCountdown';
import { useHeliDropEligibility } from '../hooks/useHeliDropEligibility';
import { Spinner } from '../components/Spinner';

interface HeliDropProps {
  className?: string;
}

const EligibilityIndicator = ({ tooltip, status, icon }: { tooltip: string, status: boolean, icon: string }) => (
    <div className="relative group flex items-center">
        <div className="relative">
            <img src={icon} alt={tooltip} className="w-14 h-14 rounded-full object-cover border-2 border-neutral-600 group-hover:border-neutral-500 transition-all duration-200" />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-neutral-800 ${status ? 'bg-green-500' : 'bg-neutral-500'}`}></div>
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            {tooltip}
        </div>
    </div>
);




export default function Lambos({ className }: HeliDropProps) {
  const targetDate = '2026-05-15T00:00:00';
  const { days, hours, minutes, seconds } = useCountdown(targetDate);
  const account = useActiveAccount();
  const { isLoading, hasGmnft, hasBadge, hasEarlyBird } = useHeliDropEligibility();

  const pad = (num: number) => num.toString().padStart(2, '0');

  const getTimerContent = () => {
    if (days + hours + minutes + seconds <= 0) {
      return '00:00:00:00';
    }
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const eligibilityCriteria = [
      { key: 'hasGmnft', tooltip: 'GM role', status: hasGmnft, icon: '/assets/GM.webp' },
      { key: 'hasBadge', tooltip: 'Stake role', status: hasBadge, icon: '/assets/Stake.webp' },
      { key: 'hasEarlyBird', tooltip: 'Early role', status: hasEarlyBird, icon: '/assets/Early.webp' },
  ];

  const renderEligibility = () => {
    if (!account) {
        return <p className="text-neutral-400 text-sm text-center">Connect your wallet to check eligibility.</p>
    }
    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }
    return (
        <div className="flex flex-row gap-3">
            {eligibilityCriteria.map(criterion => (
                <EligibilityIndicator key={criterion.key} tooltip={criterion.tooltip} status={criterion.status} icon={criterion.icon} />
            ))}
        </div>
    );
  }

  return (
    <div
      className={`w-full h-full text-white bg-neutral-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-neutral-700 flex flex-col ${className ?? ''}`}
    >
      <div className="flex-grow flex flex-col md:flex-row gap-8 items-start">
        {/* Image Block */}
        <div className="flex-shrink-0 w-40 h-40 relative">
          <div
            className="absolute -top-2 -left-2
                         bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                         text-white px-2 py-1 text-xs font-bold rounded-full
                         shadow-lg z-10"
          >
            Base
          </div>
          <img src="/assets/HeliDrop.webp" alt="HeliDrop" className="rounded-full w-full h-full object-cover" />
        </div>

        {/* Text Content Block */}
        <div className="flex-1 space-y-4 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-center flex-wrap gap-2 relative mb-4">
              <h2 className="text-3xl font-bold text-white line-clamp-1">HeliDrop</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  third
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-neutral-300 text-sm">
                A surprise reward that drops from above for those who actively participate in and support Mining Hash.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {renderEligibility()}
              </div>
            </div>
          </div>

          {/* Timer button with slow glow effect */}
          <div className="mt-auto pt-4 w-full relative">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-700/30 via-gray-600/30 to-gray-500/30 animate-pulse-slow blur-sm"></div>
            <button
              disabled={true}
              className="relative flex items-center justify-center w-full py-3 rounded-lg text-xl font-bold border border-neutral-700 text-white bg-neutral-800 cursor-default"
            >
              {getTimerContent()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}