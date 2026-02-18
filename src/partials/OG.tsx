import { useOgBadge } from '../hooks/useOgBadge';
import { Spinner } from '../components/Spinner';

interface OGProps {
  className?: string;
}

const EligibilityIndicator = ({ tooltip, status, icon }: { tooltip: string; status: boolean; icon: string }) => (
  <div className="relative group flex items-center">
    <div className="relative">
      <img
        src={icon}
        alt={tooltip}
        className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-neutral-600 group-hover:border-neutral-500 transition-all duration-200"
      />
      <div
        className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-neutral-800 ${status ? 'bg-green-500' : 'bg-neutral-500'}`}
      ></div>
    </div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
      {tooltip}
    </div>
  </div>
);

export default function OG({ className }: OGProps) {
  const { isLoading, hasBadge, boughtContainer, canClaim, isClaiming, handleClaim } = useOgBadge();

  const eligibilityCriteria = [
    { key: 'boughtContainer', tooltip: 'Bought Container', status: boughtContainer, icon: '/assets/CONTAINER.webp' },
  ];

  const renderEligibility = () => {
    return (
      <div className="flex flex-row gap-3">
        {eligibilityCriteria.map((criterion) => (
          <EligibilityIndicator
            key={criterion.key}
            tooltip={criterion.tooltip}
            status={criterion.status}
            icon={criterion.icon}
          />
        ))}
      </div>
    );
  };

  // Calculate progress percentage (only one criteria here)
  const progressPercentage = boughtContainer ? 100 : 0;

  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-5 sm:p-7 shadow-lg border border-neutral-700 h-full flex flex-col">
        <div className="flex-grow flex flex-col lg:flex-row gap-6 items-start">
          {/* Image and Links */}
          <div className="w-full lg:w-[120px] flex flex-col items-center relative flex-shrink-0">
            <div
              className="absolute -top-2 -left-2
                         bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                         text-white px-3 py-1 text-xs font-bold rounded-full
                         shadow-lg z-10"
            >
              Base
            </div>

            <img
              src="https://bafybeiewbedtuxd5naj74f2u4wwwykp36wkuiitdzurd7p5k4lp5zfw4we.ipfs.w3s.link/"
              alt="OG role"
              className="rounded-xl w-full h-auto scale-90"
            />

            <a
              href="https://vote.lookhook.info"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Vote
            </a>
          </div>

          {/* Text content */}
          <div className="flex-1 w-full min-w-0 space-y-4 flex flex-col">
            <div className="flex-grow">
              <div className="flex justify-between items-center flex-wrap gap-2 relative mb-3">
                <h2 className="text-3xl font-bold text-white">OG Team</h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                    Web3
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-neutral-400 text-sm md:text-base leading-normal">
                  <strong>I solemnly swear to protect and act for the benefit of the project</strong>. My contribution is my legacy, my
                  badge is my loyalty.
                </p>
              </div>
            </div>

            {/* Eligibility and Claim Button Row */}
            <div className="mt-auto pt-4 w-full flex items-center gap-4">
              <div className="flex-shrink-0">
                {renderEligibility()}
              </div>
              
              <div className="flex-1 relative group">
                <button
                  onClick={handleClaim}
                  disabled={!canClaim || isClaiming || hasBadge}
                  className={`relative flex items-center justify-center w-full py-3 rounded-lg text-xl font-bold border transition-colors overflow-hidden ${
                    canClaim && !hasBadge
                      ? 'border-neutral-700 text-white bg-neutral-800 glow-effect cursor-pointer'
                      : 'border-gray-500 text-gray-500 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <Spinner className="w-6 h-6" />
                  ) : isClaiming ? (
                    <>
                      <Spinner className="w-5 h-5 mr-2" />
                      Claiming...
                    </>
                  ) : hasBadge ? (
                    'Badge Claimed'
                  ) : canClaim ? (
                    <span>Claim OG</span>
                  ) : (
                    <>
                      <div
                        className="absolute top-0 left-0 h-full bg-sky-500/30"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                      <span className="relative z-10 text-sm md:text-base">I accept the oath✋.</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

