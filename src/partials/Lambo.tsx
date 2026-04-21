interface LamboProps {
  className?: string;
}

const EligibilityIndicator = ({ tooltip, icon }: { tooltip: string; icon: string }) => (
  <div className="relative group flex items-center">
    <div className="relative">
      <img
        src={icon}
        alt={tooltip}
        className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-neutral-600 group-hover:border-neutral-500 transition-all duration-200 grayscale opacity-40"
      />
      <div
        className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-neutral-800 bg-neutral-500"
      ></div>
    </div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
      {tooltip}
    </div>
  </div>
);

export default function Lambo({ className }: LamboProps) {
  const eligibilityCriteria = [
    { key: 'lambo1', tooltip: 'Soon', icon: '/assets/hashcoin.webp' },
    { key: 'lambo2', tooltip: 'Soon', icon: '/assets/hashcoin.webp' },
    { key: 'lambo3', tooltip: 'Soon', icon: '/assets/hashcoin.webp' },
    { key: 'lambo4', tooltip: 'Soon', icon: '/assets/hashcoin.webp' },
  ];

  const renderEligibility = () => {
    return (
      <div className="flex flex-row gap-3">
        {eligibilityCriteria.map((criterion) => (
          <EligibilityIndicator
            key={criterion.key}
            tooltip={criterion.tooltip}
            icon={criterion.icon}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`w-full text-white bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 flex flex-col ${className ?? ''}`}
    >
      <div className="flex-grow flex flex-col md:flex-row gap-8 items-start">
        {/* Image Block */}
        <div className="w-1/2 mx-auto md:w-40 lg:w-[140px] flex-shrink-0 relative flex flex-col items-center">
          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white px-2 py-1 text-xs font-bold rounded-full shadow-lg z-10">
            Base
          </div>
          <img src="/assets/Lamba.webp" alt="Lambo" className="rounded-full w-full h-auto object-cover" />
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Don't wait for alt season.\n\nClaim your reward RIGHT NOW.\n\nThe Mining Hash team @HashCoinFarm is rewarding the community with $HASH tokens.\n\n👇")}&url=${encodeURIComponent("https://x.com/HashCoinFarm/status/2046233258837389702")}&hashtags=AltSeason,CryptoRewards,MiningHash,HASH,Airdrop,ClaimNow,CryptoCommunity`}
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

        {/* Text Content Block */}
        <div className="flex-1 w-full min-w-0 space-y-4 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-center flex-wrap gap-2 relative mb-4">
              <h2 className="text-3xl font-bold text-white line-clamp-1">Lambo</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  fifth
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-neutral-300">Reward for your activity.</p>

              <div className="flex flex-wrap gap-2">{renderEligibility()}</div>
            </div>
          </div>

          {/* Claim Button Stub */}
          <div className="mt-auto pt-4 w-full relative">
            <div className="relative group w-full">
              <button
                disabled={true}
                className="relative flex items-center justify-center w-full py-3 rounded-lg text-xl font-bold border border-gray-500 text-gray-500 opacity-50 cursor-not-allowed bg-neutral-800"
              >
                <span>Progress to Claim: 0%</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
