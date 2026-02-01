import { useCallback, useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { useNameContract } from '../hooks/useNameContract';
import { useNameRewardContract } from '../hooks/useNameRewardContract';
import { Spinner } from '../components/Spinner';


interface DomainProps {
  className?: string;
}

export function Domain({ className }: DomainProps) {
  const account = useActiveAccount();

  const {
    nameInput,
    setNameInput,
    isTaken,
    isNameTakenLoading,
    price,
    displayPrice,
    isConfirming,
    unifiedClaim,
    maxNameLength,
    maxNamesPerAddress,
    registeredNamesCount,
    hasSufficientBalance,
  } = useNameContract();

  const { canClaim, hasClaimed, isClaiming, claimReward, poolRewardBalance, isDataLoading } = useNameRewardContract();

  const handleUnifiedClaim = useCallback(() => {
    unifiedClaim();
  }, [unifiedClaim]);

  // Memoize the complex disabled logic to prevent recalculating on every render
  const isButtonDisabled = useMemo(() => {
    return (
      isConfirming ||
      isTaken !== false || // Name must be available (not taken)
      !price ||
      !maxNameLength ||
      !maxNamesPerAddress ||
      (registeredNamesCount !== null && maxNamesPerAddress !== null && registeredNamesCount >= maxNamesPerAddress) ||
      (new Blob([nameInput]).size > maxNameLength) ||
      !hasSufficientBalance
    );
  }, [
    isConfirming,
    isTaken,
    price,
    maxNameLength,
    maxNamesPerAddress,
    registeredNamesCount,
    nameInput,
    hasSufficientBalance,
  ]);

  const formattedPrice = displayPrice ? (Number(displayPrice) / 1e18).toLocaleString() : '...';

  const getButtonContent = () => {
    if (isConfirming) {
      return (
        <span className="flex items-center justify-center">
          <span className="animate-spin mr-2">⏳</span>
          Processing...
        </span>
      );
    }
    // A specific check for insufficient balance to show a clear message
    if (isTaken === false && !hasSufficientBalance) {
      return 'Insufficient HASH balance';
    }
    return `🎉 Register for ${formattedPrice} HASH`;
  };

  const renderStatusIcon = () => {
    if (isNameTakenLoading) {
       return (
        <svg
          className="animate-spin h-7 w-7 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      );
    }
    if (isTaken === false) {
      return (
        <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (isTaken === true) {
      return (
        <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    // Render nothing if isTaken is null (initial state or error)
    return null;
  };

  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[90px] flex flex-col items-center relative">
            <div
              className="absolute -top-2 -left-2
                           bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                           text-white px-3 py-1 text-xs font-bold rounded-full
                           shadow-lg z-10"
            >
              Base
            </div>

            <img
              src="https://bafybeid4a5ecvk3pvunzk6exnazh6u2uuhlvjlcucpg3lm3sa5dskc6wbm.ipfs.w3s.link/namehash.png"
              alt="HashCoin NFT"
              className="rounded-xl w-full h-auto"
            />

            <div
              className="pt-6 flex flex-wrap items-center justify-center gap-2"
              title="only for holders of the NFT Plasma Cat collection"
            >
              {price !== null &&
                displayPrice !== null &&
                (price && displayPrice && displayPrice < price ? (
                  <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-green-500 text-green-500">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    50%Save
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-500 text-gray-500 opacity-50">
                    50%Save
                  </span>
                ))}
            </div>

            <div className="mt-4 w-full">
              {account && (
                <div className="relative group w-full">
                  <button
                    onClick={claimReward}
                    disabled={!canClaim || isClaiming || isDataLoading}
                    className={`relative flex items-center justify-center w-full px-4 py-2 rounded-lg transition text-sm font-medium border ${
                      canClaim && !isClaiming && !isDataLoading
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
                      'Reward'
                    )}
                  </button>
                  <div className="absolute z-50 bottom-full mb-2 w-max px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Pool: {poolRewardBalance} HASH
                    <br />
                    Complete the Galxe quest
                    <div className="tooltip-arrow" data-popper-arrow></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6 w-full">
            <div className="flex justify-between items-center flex-wrap gap-2 relative">
              <h2 className="text-3xl font-bold text-white">Name Hash</h2>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded whitespace-nowrap">
                  WEB3
                </span>
              </div>
            </div>

            <p className="text-neutral-400">Forever on-chain.</p>

            <div className="mt-4 w-full text-center">
              <div className="relative w-full mb-4 flex items-center input-style rounded-lg">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value.trim())}
                  placeholder="Enter a name"
                  className="flex-grow p-3 text-center bg-transparent outline-none pr-10 text-white text-lg w-full max-w-full"
                />

                <span className="pr-3 text-lg text-neutral-400">.hash</span>

                <div className="absolute inset-y-0 right-0 flex items-center pr-16 w-7 h-7">
                  {renderStatusIcon()}
                </div>
              </div>

              {!account ? (
                <ConnectWalletButton />
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={handleUnifiedClaim}
                    disabled={isButtonDisabled}
                    className={`w-full py-3 rounded-lg transition mb-4 ${
                      isButtonDisabled ? 'btn-disabled' : 'btn-full-width-green'
                    }`}
                  >
                    {getButtonContent()}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
