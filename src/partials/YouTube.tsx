import { useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useYouTubeReward } from '../hooks/useYouTubeReward';
import { Spinner } from '../components/Spinner';

interface YouTubeProps {
  className?: string;
}

export default function YouTube({ className }: YouTubeProps) {
  const account = useActiveAccount();
  const {
    handleClaim,
    canClaim,
    hasClaimed,
    rewardAmount,
    poolRewardBalance,
    isClaiming,
    isCheckingCanClaim,
    isCheckingHasClaimed,
    refetchCanClaim,
  } = useYouTubeReward();

  // Effect to refetch claim status when the user changes their connected wallet.
  useEffect(() => {
    if (account?.address) {
      refetchCanClaim();
    }
  }, [account?.address, refetchCanClaim]);

  const isLoading = isCheckingCanClaim || isCheckingHasClaimed;
  // Determine if the reward button should be interactive.
  const rewardButtonActive = account && canClaim && !hasClaimed && !isClaiming && !isLoading;
  // Determine if the Galxe button (stub for now) should glow.
  const galxeButtonGlow = account && !canClaim && !hasClaimed && !isClaiming && !isLoading;

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
            src="/assets/YouTube.webp"
            alt="Tube Role"
            className="rounded-full w-full h-auto object-cover"
          />
          <a
            href="https://app.galxe.com/quest/bAFdwDecXS6NRWsbYqVAgh"
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              galxeButtonGlow
                ? 'border-neutral-700 text-white bg-neutral-800 glow-effect'
                : 'border-gray-500 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Galxe
          </a>
        </div>

        {/* Text content */}
        <div className="flex-1 w-full min-w-0 space-y-4 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-center flex-wrap gap-2 relative mb-4">
              <h2 className="text-3xl font-bold text-white line-clamp-1">Tube Role</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  Web3
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-neutral-300">
                Post a video about Mining Hash in the live crypto channel. (Role+NFT+Reward)
              </p>
            </div>
          </div>

          {/* Reward Button with Custom Tooltip */}
          <div className="mt-auto pt-4 w-full relative">
            <div className="relative group w-full">
              <button
                onClick={handleClaim}
                disabled={!rewardButtonActive}
                className={`relative flex items-center justify-center w-full py-3 rounded-lg text-xl font-bold border transition-colors overflow-hidden ${
                  rewardButtonActive
                    ? 'border-neutral-700 text-white bg-neutral-800 glow-effect cursor-pointer'
                    : 'border-gray-500 text-gray-500 opacity-50 cursor-not-allowed'
                }`}
              >
                {isClaiming ? (
                  <>
                    <Spinner className="w-5 h-5 mr-2" />
                    Claiming...
                  </>
                ) : hasClaimed ? (
                  'Claimed'
                ) : (
                  <span>Claim {rewardAmount} HASH</span>
                )}
              </button>
              <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Pool: {poolRewardBalance} HASH
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
