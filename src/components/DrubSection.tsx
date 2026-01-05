import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import ConnectWalletButton from './ConnectWalletButton';

interface DrubSectionProps {
  className?: string;
  status: string;
  buyAmount: string;
  setBuyAmount: (amount: string) => void;
  drubPerHash: string;
  drubBalance: string;
  hashBalance: string;
  isBuying: boolean;
  isAddingLiquidity: boolean;
  isBurning: boolean;
  lpPositionsCount: string;
  isVaultEmpty: boolean;
  vaultHashBalance?: string;
  vaultDrubBalance?: string;
  handleBuyClick: () => void;
  handleSetMaxBuy: () => void;
  handleSliderChangeBuy: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sliderValueBuy: number;
  addLiquidity: () => void;
  burnAllPositions: () => void;
}

export function DrubSection({ 
  className,
  status,
  buyAmount,
  setBuyAmount,
  drubPerHash,
  drubBalance,
  hashBalance,
  isBuying,
  isAddingLiquidity,
  isBurning,
  lpPositionsCount,
  isVaultEmpty,
  vaultHashBalance,
  vaultDrubBalance,
  handleBuyClick,
  handleSetMaxBuy,
  handleSliderChangeBuy,
  sliderValueBuy,
  addLiquidity,
  burnAllPositions,
}: DrubSectionProps) {
  const account = useActiveAccount();
  const [contractCopied, setContractCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setContractCopied(true);
    setTimeout(() => setContractCopied(false), 2000);
  };
  
  const drubContractAddress = '0x1339c3a22ccdd7560B4Ccacd065Cd4b578BDA12d';

  return (
    <section className={`w-full text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full space-y-6">
        <h2 className="text-3xl font-bold text-white flex justify-between items-center">
          DRUB
          <div className="px-2 py-1 border border-neutral-700 rounded-md flex items-center justify-center text-sm">
            <span className="font-bold text-neutral-400 mr-1">contract:</span>
            <span className="text-white font-semibold mr-2">0x..12d</span>
            <button onClick={() => handleCopy(drubContractAddress)} title="Copy contract address">
              {contractCopied ? <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> : <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2.286a1 1 0 01.714 1.714L17 10m0 0l-3.143 3.143a1 1 0 01-1.714-.714L14 10m0 0H8"></path></svg>}
            </button>
          </div>
        </h2>
        <div className="bg-black/30 rounded-xl p-4 space-y-2 border border-neutral-700">
          <p className="text-sm text-neutral-400">
            Your DRUB Balance: <span className="text-white font-semibold">{drubBalance}</span>
          </p>
          <p className="text-sm text-neutral-400">
            Your HASH Balance: <span className="text-white font-semibold">{hashBalance}</span>
          </p>
        </div>
        <div className="w-full">
          <div className="flex items-center bg-black/30 border border-neutral-700 rounded-lg p-1">
            <input
              type="number"
              min="0"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder={`Balance: ${hashBalance} HASH`}
              className="flex-grow p-2 bg-transparent outline-none text-white text-lg w-full no-spin-buttons"
            />
            <button
              onClick={handleSetMaxBuy}
              className="bg-neutral-700 text-white font-bold py-2 px-4 rounded-md"
            >
              MAX
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sliderValueBuy}
            onChange={handleSliderChangeBuy}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer mt-2"
            disabled={!account || parseFloat(hashBalance) <= 0}
          />
        </div>
        {!account ? (
          <ConnectWalletButton />
        ) : (
          <>
            <button
                onClick={handleBuyClick}
                disabled={!buyAmount || parseFloat(buyAmount) <= 0 || isBuying || parseFloat(buyAmount) > parseFloat(hashBalance)}
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            >
                {isBuying ? (
                    <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⏳</span> Processing...
                    </span>
                ) : status ? (
                    status
                ) : (
                    `Buy ${(parseFloat(buyAmount || '0') * parseFloat(drubPerHash || '0')).toFixed(2)} DRUB`
                )}
            </button>
             {parseFloat(buyAmount) > parseFloat(hashBalance) && (
                <p className="text-red-500 text-sm mt-2 text-center">Insufficient HASH balance.</p>
            )}
            <div className="flex gap-x-2 mt-4">
              <button
                  onClick={addLiquidity}
                  disabled={!account || isAddingLiquidity || isVaultEmpty}
                  className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                  title={
                      vaultHashBalance === undefined || vaultDrubBalance === undefined
                          ? 'Loading Vault balances...'
                          : `Vault HASH: ${parseFloat(vaultHashBalance || '0').toFixed(2)} / Vault DRUB: ${parseFloat(vaultDrubBalance || '0').toFixed(2)}`
                  }
              >
                  {isAddingLiquidity ? (
                      <span className="flex items-center justify-center">
                          <span className="animate-spin mr-2">⏳</span> Processing...
                      </span>
                  ) : (
                      'Group liquidity'
                  )}
              </button>
              <button
                  onClick={burnAllPositions}
                  disabled={!account || isBurning || lpPositionsCount === '0'}
                  className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                  {isBurning ? (
                      <span className="flex items-center justify-center">
                          <span className="animate-spin mr-2">⏳</span> Processing...
                      </span>
                  ) : (
                      `Lock liquidity`
                  )}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
