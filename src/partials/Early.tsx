import { useEarlyLoan, LOAN_PER_NFT, } from '../hooks/useEarlyLoan';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { Spinner } from '../components/Spinner';
import { useHashPrice } from '../hooks/useHashPrice';

interface EarlyProps {
  className?: string;
}

const formatHash = (value: bigint) => Number(value / 10n ** 18n).toLocaleString('en-US');

const OPEN_SEA_URL = 'https://opensea.io/collection/earlyhash';

export default function Early({ className }: EarlyProps) {
  const {
    step,
    label,
    onAction,
    isActionable,
    isPending,
    pendingLabel,
    isLoading,
    poolFormatted,
    slotsLeft,
    maxSupply,
  } = useEarlyLoan();

  const { hashPriceUsd } = useHashPrice();
  const loanAmount = Number(LOAN_PER_NFT / 10n ** 18n);
  const loanUsd = hashPriceUsd ? (loanAmount * hashPriceUsd).toFixed(0) : null;

  const statusText =
    step === 'connect'
      ? 'Connect wallet to start.'
      : step === 'loading'
        ? 'Checking your status…'
        : step === 'no-nft'
          ? 'No Early NFT found.'
          : step === 'borrow'
            ? 'Early NFT ready - get 150,000 HASH.'
            : step === 'repay'
              ? 'Active loan - repay to unlock your NFT.'
              : step === 'empty-pool'
                ? 'Loan pool is empty right now.'
                : step === 'no-slots'
                  ? 'Max supply reached.'
                  : '';

  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start h-full">
          {/* Left Column: Image, badge & slots */}
          <div className="w-full lg:w-[130px] flex flex-col items-center relative shrink-0">
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg z-10">
              Base
            </div>
            <img src="/assets/Early.webp" alt="Early Bird NFT" className="rounded-xl w-full h-auto shadow-2xl" />

            <div className="pt-6 flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Slots</span>
              <span className="text-sm font-semibold text-white">
                {slotsLeft} / {maxSupply}
              </span>
            </div>
          </div>

          {/* Right Column: Info & Action */}
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">Early Loan</h2>
              <a
                href={OPEN_SEA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded hover:bg-white hover:text-black transition-colors"
              >
                OpenSea
              </a>
            </div>

            <div className="space-y-1 text-xs leading-relaxed text-neutral-400">
              <p>🏦 0% loan - borrow anytime, any duration.</p>
              <ul className="space-y-0.5">
                <li>💎 Lock Early NFT → get {formatHash(LOAN_PER_NFT)} HASH</li>
              </ul>
              <p>
                🔓 1,000 HASH - unlock fee.
              </p>
            </div>

            <p className="text-xs font-medium text-sky-400">{statusText}</p>

            {/* Action with pool tooltip */}
            <div className="mt-auto pt-2 w-full relative">
              <div className="relative group w-full">
                {step === 'connect' || !isActionable ? (
                  step === 'connect' ? (
                    <ConnectWalletButton />
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 rounded-lg text-lg font-bold border border-neutral-700 text-neutral-500 bg-neutral-900/30 cursor-not-allowed opacity-60"
                    >
                      {isLoading ? (
                        <Spinner className="w-5 h-5 mx-auto" />
                      ) : step === 'no-nft' && loanUsd ? (
                        <>
                          {label} <span className="text-sky-400 ml-2">(~${loanUsd})</span>
                        </>
                      ) : (
                        label
                      )}
                    </button>
                  )
                ) : (
                  <button
                    onClick={onAction}
                    disabled={isPending}
                    className="w-full py-3 rounded-lg text-xl font-bold border border-neutral-700 text-white bg-neutral-800 glow-effect cursor-pointer transition-all uppercase tracking-tight flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Spinner className="w-5 h-5 mr-2" />
                        {pendingLabel}
                      </>
                    ) : step === 'borrow' && loanUsd ? (
                      <>
                        {label} <span className="text-sky-400 ml-2">(~${loanUsd})</span>
                      </>
                    ) : (
                      label
                    )}
                  </button>
                )}
                <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Pool: {poolFormatted} HASH
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
