import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { useNameContract } from '../hooks/useNameContract';
import { useNameBadgeContract } from '../hooks/useNameBadgeContract';

interface DomainProps {
  className?: string;
}

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export function Domain({ className }: DomainProps) {
  const account = useActiveAccount();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const {
    price,
    displayPrice,
    isConfirming,
    isPending,
    unifiedClaim,
    isNameTaken,
    maxNameLength,
    maxNamesPerAddress,
    registeredNamesCount,
  } = useNameContract(setStatus);

  const { hasBadge, isMinting, claimBadge } = useNameBadgeContract();

  useEffect(() => {
    if (!name) {
      setStatus('idle');
      return;
    }

    if (maxNameLength !== null && new Blob([name]).size > maxNameLength) {
      setStatus('error');
      return;
    }

    if (registeredNamesCount !== null && maxNamesPerAddress !== null && registeredNamesCount >= maxNamesPerAddress) {
      setStatus('error');
      return;
    }

    setStatus('checking');
    let cancelled = false;

    const handler = setTimeout(async () => {
      try {
        const taken = await isNameTaken(name);
        if (!cancelled) setStatus(taken ? 'taken' : 'available');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [name, isNameTaken, maxNameLength, maxNamesPerAddress, registeredNamesCount]);

  const handleUnifiedClaim = useCallback(() => {
    unifiedClaim(name);
  }, [unifiedClaim, name]);

  const isButtonDisabled =
    isPending ||
    isConfirming ||
    status !== 'available' ||
    !price ||
    !maxNameLength ||
    !maxNamesPerAddress ||
    (registeredNamesCount !== null && maxNamesPerAddress !== null && registeredNamesCount >= maxNamesPerAddress);

  const formattedPrice = displayPrice ? (Number(displayPrice) / 1e18).toLocaleString() : '...';

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
                    50% Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-500 text-gray-500 opacity-50">
                    50% Inactive
                  </span>
                ))}
            </div>

            <div className="mt-4 w-full">
              {account && (
                <button
                  onClick={claimBadge}
                  disabled={!registeredNamesCount || registeredNamesCount === 0 || isMinting || hasBadge}
                  className={`w-full py-2 rounded-lg transition text-sm font-medium border ${
                    !registeredNamesCount || registeredNamesCount === 0 || hasBadge
                      ? 'border-gray-500 text-gray-500 opacity-50 cursor-not-allowed'
                      : 'border-neutral-700 text-white bg-neutral-800 glow-effect'
                  }`}
                >
                  {isMinting ? 'Minting...' : hasBadge ? 'Badge Minted' : 'Badge'}
                </button>
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
                  value={name}
                  onChange={(e) => setName(e.target.value.trim())}
                  placeholder="Enter a name"
                  className="flex-grow p-3 text-center bg-transparent outline-none pr-10 text-white text-lg w-full max-w-full"
                />

                <span className="pr-3 text-lg text-neutral-400">.hash</span>

                <div className="absolute inset-y-0 right-0 flex items-center pr-16 w-7 h-7">
                  {status === 'checking' && (
                    <svg
                      className="animate-spin h-7 w-7 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}

                  {status === 'available' && (
                    <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}

                  {(status === 'taken' || status === 'error') && (
                    <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
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
                    {isPending || isConfirming ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⏳</span>
                        Processing...
                      </span>
                    ) : (
                      `🎉 Register for ${formattedPrice} HASH`
                    )}
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
