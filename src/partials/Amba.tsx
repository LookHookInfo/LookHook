import { useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useAmbaRole } from '../hooks/useAmbaRole';
import { Spinner } from '../components/Spinner';

interface AmbaProps {
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

export default function Amba({ className }: AmbaProps) {
  const account = useActiveAccount();
  const {
    handleMint,
    eligibility,
    isLoading,
    hasMinted,
    canMint,
    isMinting,
    refetchEligibility,
  } = useAmbaRole();

  // Effect to refetch eligibility when the user changes their connected wallet.
  useEffect(() => {
    if (account?.address) {
      refetchEligibility();
    }
  }, [account?.address, refetchEligibility]);

  const eligibilityCriteria = [
    { key: 'hasTube', tooltip: 'Tube role', status: eligibility?.hasTube ?? false, icon: '/assets/YouTube.webp' },
    { key: 'hasGram', tooltip: 'Gram role', status: eligibility?.hasGram ?? false, icon: '/assets/Telegram.webp' },
    { key: 'hasX', tooltip: 'X role', status: eligibility?.hasX ?? false, icon: '/assets/Xrole.webp' },
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

  // Calculate progress percentage for the bar
  let progressCount = 0;
  if (eligibility?.hasTube) progressCount++;
  if (eligibility?.hasGram) progressCount++;
  if (eligibility?.hasX) progressCount++;
  const progressPercentage = (progressCount / 3) * 100;

  return (
    <div
      className={`w-full text-white bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 flex flex-col ${className ?? ''}`}
    >
      <div className="flex-grow flex flex-col md:flex-row gap-8 items-start">
        {/* Image and Links */}
        <div className="w-1/2 mx-auto md:w-40 lg:w-[140px] flex-shrink-0 relative flex flex-col items-center">
          <div
            className="absolute -top-2 -left-2
                         bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                         text-white px-2 py-1 text-xs font-bold rounded-full
                         shadow-lg z-10"
          >
            Base
          </div>

          <img
            src="/assets/Amba.webp"
            alt="Amba Role"
            className="rounded-full w-full h-auto object-cover"
          />
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("🎭 Claim your Amba Role @HashCoinFarm\n\nOne task stands between you and the on-chain badge:\n\n🎥 Record a short video review (token / product / guide)\n\n👇 Reply with your video here:")}&url=${encodeURIComponent("https://x.com/HashCoinFarm/status/2040370416435511556")}&hashtags=Community,NFT,Mining,Crypto,Role,Amba`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center px-6 py-2 text-sm font-bold rounded-lg border transition-all duration-300 border-sky-500 text-white bg-sky-600/20 hover:bg-sky-600/40 glow-effect"
          >
            <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
            Tweet
          </a>
        </div>

        {/* Text content */}
        <div className="flex-1 w-full min-w-0 space-y-4 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-center flex-wrap gap-2 relative mb-4">
              <h2 className="text-3xl font-bold text-white line-clamp-1">Amba Role</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  Web3
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">{renderEligibility()}</div>
            </div>
          </div>

          {/* Mint Button */}
          <div className="mt-auto pt-4 w-full relative">
            <div className="relative group w-full">
              <button
                onClick={handleMint}
                disabled={!canMint || isMinting || hasMinted || isLoading}
                className={`relative flex items-center justify-center w-full py-3 rounded-lg text-xl font-bold border transition-colors overflow-hidden ${
                  canMint && !hasMinted
                    ? 'border-neutral-700 text-white bg-neutral-800 glow-effect cursor-pointer'
                    : 'border-gray-500 text-gray-500 opacity-50 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <Spinner className="w-6 h-6" />
                ) : isMinting ? (
                  <>
                    <Spinner className="w-5 h-5 mr-2" />
                    Minting...
                  </>
                ) : hasMinted ? (
                  'Soulbound Minted'
                ) : canMint ? (
                  <span>Mint Amba NFT</span>
                ) : (
                  <>
                    <div
                      className="absolute top-0 left-0 h-full bg-sky-500/30"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                    <span className="relative z-10">Progress: {Math.round(progressPercentage)}%</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
