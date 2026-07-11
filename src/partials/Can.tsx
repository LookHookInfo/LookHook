import { useActiveAccount } from 'thirdweb/react';
import { useCanContract } from '../hooks/useCanContract';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { Spinner } from '../components/Spinner';

interface CanProps {
  className?: string;
}

export default function Can({ className }: CanProps) {
  const account = useActiveAccount();
  const {
    totalBurned, maxSupply, progress,
    isBurning, balance, reward, isUserTokensLoading,
    burnAll,
  } = useCanContract();

  const hasNfts = balance > 0;

  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[140px] flex flex-col items-center flex-shrink-0 relative">
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white px-2 py-1 text-xs font-bold rounded-full shadow-lg z-10">
              Base
            </div>
            <img
              src="/assets/gas.webp"
              alt="CAN"
              className="rounded-xl w-full h-auto"
            />
            <a
              href="https://app.galxe.com/quest/bAFdwDecXS6NRWsbYqVAgh/GCt2XtZkN9"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-neutral-700 text-white bg-neutral-800 glow-effect"
            >
              Galxe
            </a>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white">Gas Can🔥</h2>
              <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                burn🔥
              </span>
            </div>

            <p className="text-neutral-400 text-sm">
              Get <span className="text-white font-semibold">NFT</span> for Galxe quest.
            </p>

            <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-700/50 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-neutral-500">Progress</span>
                <span className="text-neutral-400">{totalBurned} / {maxSupply}</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700 bg-gradient-to-r from-amber-500 to-red-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2">
              {!account ? (
                <ConnectWalletButton />
              ) : (
                <button
                  onClick={burnAll}
                  disabled={!hasNfts || isBurning || isUserTokensLoading}
                  className={`w-full py-3 rounded-lg text-lg font-bold border transition-all uppercase tracking-tighter flex items-center justify-center ${
                    hasNfts && !isUserTokensLoading
                      ? 'border-neutral-700 text-white bg-neutral-800 glow-effect cursor-pointer'
                      : 'border-neutral-700 text-neutral-500 bg-neutral-900/30 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isUserTokensLoading ? (
                    <Spinner className="w-5 h-5 mr-2" />
                  ) : isBurning ? (
                    <><Spinner className="w-5 h-5 mr-2" /> Burning...</>
                  ) : (
                    `Burn ${balance || 1} NFT${balance !== 1 ? 's' : ''} → ${(balance ? reward : 4000).toLocaleString()} HASH`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
