import { useCountdown } from '../hooks/useCountdown';

interface HeliDropProps {
  className?: string;
}

export default function HeliDrop({ className }: HeliDropProps) {
  const targetDate = '2026-05-15T00:00:00';
  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  const pad = (num: number) => num.toString().padStart(2, '0');

  const getTimerContent = () => {
    if (days + hours + minutes + seconds <= 0) {
      return '00:00:00:00';
    }
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

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
        <div className="flex-1 space-y-6 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-center flex-wrap gap-2 relative mb-4">
              <h2 className="text-3xl font-bold text-white line-clamp-1">HeliDrop</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  third
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-neutral-300 text-sm">
                A surprise reward that drops from above for those who actively participate in and support Mining Hash.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {['Soon', 'Soon', 'Soon'].map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg bg-gradient-to-r from-gray-600 to-gray-500 text-gray-300 border border-gray-500"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Timer button with slow glow effect */}
          <div className="mt-4 w-full relative">
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