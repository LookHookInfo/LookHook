import { useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useXroleReward } from '../hooks/useXroleReward';
import { Spinner } from '../components/Spinner';

interface XroleProps {
  className?: string;
}

export default function Xrole({ className }: XroleProps) {
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
  } = useXroleReward();

  // Effect to refetch claim status when the user changes their connected wallet.
  // This ensures the UI always reflects the status for the current account.
  useEffect(() => {
    if (account?.address) {
      refetchCanClaim();
    }
  }, [account?.address, refetchCanClaim]);

  const isLoading = isCheckingCanClaim || isCheckingHasClaimed;
  // Determine if the reward button should be interactive.
  const rewardButtonActive = account && canClaim && !hasClaimed && !isClaiming && !isLoading;
  // Determine if the Galxe button should glow to attract attention.
  const galxeButtonGlow = account && !canClaim && !hasClaimed && !isClaiming && !isLoading;

  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Image and Links */}
          <div className="w-full lg:w-[140px] flex flex-col items-center relative">
            <img
              src="https://ipfs.io/ipfs/bafybeieiwzuctm3xrqhwn2gvbds3jgwvt6nvfd53xdfoj2erklcnigfozy"
              alt="Blockchain Forum"
              className="rounded-xl w-full h-auto scale-90"
            />
            <a
              href="https://app.galxe.com/quest/bAFdwDecXS6NRWsbYqVAgh/GCFK7tYE1U"
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
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white">X Role</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  Web3
                </span>
              </div>
            </div>

            <p className="text-neutral-400">
              Support Mining Hash with a unique tweet and earn an exclusive X Role + NFT + reward!
            </p>
            
            {/* Reward Button with Custom Tooltip */}
            <div className="flex pt-0">
              <div className="relative group w-full">
                <button
                  onClick={handleClaim}
                  disabled={!rewardButtonActive}
                  className={`relative flex items-center justify-center w-full px-4 py-2 rounded-lg transition text-sm font-medium border ${
                    rewardButtonActive
                      ? 'border-neutral-700 text-white bg-neutral-800 glow-effect cursor-pointer'
                      : 'border-gray-500 text-gray-500 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isClaiming ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
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
                  <br />
                  Complete the Galxe quest
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
