import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { useGMNFTContract } from '../hooks/useGMNFTContract';
import { formatEther } from 'viem';

interface GMProps {
  className?: string;
}

export default function GM({ className }: GMProps) {
  const account = useActiveAccount();
  const [copied, setCopied] = useState(false);
  const [gmPriceUsd, setGmPriceUsd] = useState<string | null>(null);
  const [hashPriceUsd, setHashPriceUsd] = useState<string | null>(null);
  const gmAddress = '0x1e2390B4021B64B05Bc7AfF53E0122eb648DdC19';
  const truncatedAddress = `0x..${gmAddress.slice(-3)}`;

  const { gmBalance, BURN_AMOUNT, hasGMNFT, isProcessing, handleUnifiedAction } = useGMNFTContract();

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const gmResponse = await fetch(
          'https://api.geckoterminal.com/api/v2/networks/base/pools/0x9baf8cd5787c2ff300020a6d91a5fb16a917f8df',
        );
        const gmData = await gmResponse.json();
        const gmUsd = parseFloat(gmData.data.attributes.base_token_price_usd).toFixed(2);
        setGmPriceUsd(gmUsd);

        const hashResponse = await fetch(
          'https://api.geckoterminal.com/api/v2/networks/base/pools/0x9ab05414f0a3872a78459693f3e3c9ea3f0d6e71',
        );
        const hashData = await hashResponse.json();
        const hashUsd = parseFloat(hashData.data.attributes.base_token_price_usd);
        setHashPriceUsd(hashUsd.toString());
      } catch (error) {
        console.error('Failed to fetch token prices:', error);
        setGmPriceUsd('N/A');
        setHashPriceUsd('N/A');
      }
    };
    fetchPrices();
  }, []);

  const gmToHash =
    gmPriceUsd && hashPriceUsd && hashPriceUsd !== 'N/A' && gmPriceUsd !== 'N/A'
      ? (parseFloat(gmPriceUsd) / parseFloat(hashPriceUsd)).toFixed(0)
      : null;

  const gmBalanceFormatted = gmBalance ? parseFloat(formatEther(gmBalance)).toFixed(2) : '0';
  const progressPercentage = Math.min((parseFloat(gmBalanceFormatted) / BURN_AMOUNT) * 100, 100);
  const isButtonDisabled = isProcessing || hasGMNFT || parseFloat(gmBalanceFormatted) < BURN_AMOUNT;
  const buttonTooltip = `${gmBalanceFormatted} / ${BURN_AMOUNT} GM`;

  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[130px] flex flex-col items-center relative">
            <div
              className="absolute -top-2 -left-2
                         bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                         text-white px-3 py-1 text-xs font-bold rounded-full
                         shadow-lg z-10"
            >
              Base
            </div>
            <img
              src="https://bafybeihjwg5c4zsl335gpxu7y4nspp5gcy26udisdbpogt7edrvac6iiwu.ipfs.w3s.link/"
              alt="HashCoin NFT"
              className="rounded-xl w-full h-auto"
            />
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2 w-full">
              {!account ? (
                <ConnectWalletButton />
              ) : (
                <button
                  onClick={handleUnifiedAction}
                  disabled={isButtonDisabled}
                  className={`w-full py-2 rounded-lg transition text-sm font-medium border relative overflow-hidden ${
                    isButtonDisabled
                      ? 'border-gray-500 text-gray-500 opacity-50 cursor-not-allowed'
                      : 'border-neutral-700 text-white bg-neutral-800 glow-effect cursor-pointer'
                  }`}
                  title={buttonTooltip}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-sky-500/30"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                  <span className="relative z-10">{hasGMNFT ? 'Burned🔥' : 'Burn 30 GM'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white">Morning!</h2>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 border border-neutral-700 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold text-sm mr-2">{truncatedAddress}</span>
                  <button
                    className="text-gray-400 hover:text-white dark:hover:text-neutral-200 focus:outline-none"
                    onClick={() => {
                      navigator.clipboard.writeText(gmAddress);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
                    }}
                    title="Copy contract address"
                  >
                    {copied ? (
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2.286a1 1 0 01.714 1.714L17 10m0 0l-3.143 3.143a1 1 0 01-1.714-.714L14 10m0 0H8"
                        ></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-neutral-400">
              GM is already trading on UniSwap! FARM & STAKE role holders receive tokens every 24 hours. ☕️
            </p>
            <a
              href="https://app.uniswap.org/explore/pools/base/0x9baf8cd5787c2ff300020a6d91a5fb16a917f8df"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center px-4 py-2 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors mt-4"
              title="Trade on Uniswap"
            >
              {gmPriceUsd && gmToHash ? (
                <>
                  <span>1 GM = {gmToHash} HASH&nbsp;</span>
                  <span className="text-neutral-400">(</span>
                  <span className="text-neutral-400">$</span>
                  <span className="text-neutral-400">{gmPriceUsd}</span>
                  <span className="text-neutral-400">)</span>
                </>
              ) : (
                'UniSwap'
              )}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
