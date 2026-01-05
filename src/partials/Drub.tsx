import { useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { DrubSection } from '../components/DrubSection';
import { useDrubContract } from '../hooks/useDrubContract';

export default function Drub() {
  const account = useActiveAccount();
  const {
    status,
    buyAmount,
    setBuyAmount,
    drubPerHash,
    drubTotalSupply,
    drubBalance,
    hashBalance,
    unifiedBuy,
    refetchAll,
    isBuying,
    isAddingLiquidity,
    isBurning,
    addLiquidity,
    burnAllPositions,
    lpPositionsCount,
    isVaultEmpty,
    vaultHashBalance,
    vaultDrubBalance,
    rubPerUsd,
  } = useDrubContract();

  useEffect(() => {
    if (account) {
      const interval = setInterval(() => {
        refetchAll();
      }, 15000); 
      return () => clearInterval(interval);
    }
  }, [account, refetchAll]);

  const handleSetMaxBuy = () => {
    const maxAmount = Math.floor(parseFloat(hashBalance) > 0.1 ? (parseFloat(hashBalance) - 0.05) : parseFloat(hashBalance));
    setBuyAmount(maxAmount.toString());
  }

  const handleSliderChangeBuy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = Number(e.target.value);
    const maxAmount = Number(hashBalance);
    const newAmount = Math.floor(maxAmount > 0 ? (maxAmount * percentage) / 100 : 0);
    setBuyAmount(newAmount.toString());
  };

  const sliderValueBuy = buyAmount && hashBalance && Number(hashBalance) > 0
    ? Math.floor((Number(buyAmount) / Number(hashBalance)) * 100)
    : 0;

  return (
    <div className="max-w-[85rem] px-4 py-4 sm:px-6 lg:px-8 lg:py-6 mx-auto">
      <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
                <div className="mt-5 sm:mt-10 lg:mt-0 lg:col-span-4">
                  <div className="space-y-4 sm:space-y-6 relative">
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2
                             bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                             text-white px-3 py-1 text-xs font-bold rounded-full
                             shadow-lg"
                    >
                      Base
                    </div>
                    <div className="space-y-2 md:space-y-4">
                      <h2 className="font-bold text-3xl lg:text-4xl text-gray-300 dark:text-neutral-200">
                        <img
                          src="https://bafybeidzrpc2umwvsx5vwnlgup44fh5elckp73ecp5qmghrku6kcoxcthm.ipfs.w3s.link/Logo.png"
                          alt="HashCoin NFT"
                          className="rounded-xl w-16 h-16 inline-block mr-2 align-middle"
                          style={{ animation: 'drubBounce 3s ease-in-out infinite' }}
                        />
                        Stablecoin
                      </h2>
                      <p className="text-gray-400 dark:text-neutral-500">
                        A decentralized Web3 token backed by HASH.
                      </p>
                    </div>            <div className="bg-black/30 rounded-xl p-4 space-y-2 border border-neutral-700">
                      <p className="text-sm text-neutral-400">
                        🏛 ЦБ РФ : <span className="text-white font-semibold">{rubPerUsd} RUB/USD</span>
                      </p>
                      <p className="text-sm text-neutral-400 flex justify-between items-center">
                        <span>1 HASH = <span className="text-white font-semibold">{drubPerHash} DRUB</span></span>
                      </p>
                      <p className="text-sm text-neutral-400">
                        Total Supply: <span className="text-white font-semibold">{drubTotalSupply} DRUB</span>
                      </p>
                      <p className="text-sm text-neutral-400">
                        Locked: <span className="text-white font-semibold">{(parseFloat(drubTotalSupply) / 2).toFixed(2)} DRUB</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-x-2 mt-2">
                      <button
                        disabled
                        className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-500 text-gray-500 opacity-50"
                      >
                        100p badge
                      </button>
                      <a
                        href="https://lookhook.info"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-neutral-700 opacity-50 pointer-events-none"
                      >
                        Website
                      </a>
                      <a
                        href="https://x.com/DRUBcoin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex justify-center items-center size-8 rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700"
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                          <title>X</title>
                          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932Z" />
                        </svg>
                      </a>
                      <a
                        href="https://discord.com/invite/D55sWhNgcb"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex justify-center items-center size-8 rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700"
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                          <title>Discord</title>
                          <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2916a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.0994.246.1984.3728.292a.077.077 0 0 1-.0065.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.4189 0 1.3333-.9555 2.419-2.1569 2.419zm7.9748 0c-1.1825 0-2.1568-1.0857-2.1568-2.419 0-1.3332.9554-2.4189 2.1568-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.4189 0 1.3333-.946 2.419-2.1568 2.419Z" />
                        </svg>
                      </a>
                    </div>

                    <ul className="space-y-1 sm:space-y-2">
                      {[
                        { text: (
                            <>
                              <span className="font-bold">Central bank</span> rate 
                            </>
                          )},
                        { text: (
                            <>
                              Decentralized <span className="font-bold">pool</span>
                            </>
                          )},
                      ].map((item, index) => (
                        <li className="flex gap-x-3" key={index}>
                          <span className="mt-0.5 size-6 flex justify-center items-center rounded-lg border border-gray-200 text-white dark:border-neutral-700">
                            <svg
                              className="size-3.5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                            </svg>
                          </span>
                          <div className="grow">
                            <span className="text-sm sm:text-base text-gray-300 dark:text-neutral-500">{item.text}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
        <div className="lg:col-span-8 mt-10 lg:mt-0">
          <DrubSection 
            status={status}
            buyAmount={buyAmount}
            setBuyAmount={setBuyAmount}
            drubPerHash={drubPerHash}
            drubBalance={drubBalance}
            hashBalance={hashBalance}
            isBuying={isBuying}
            isAddingLiquidity={isAddingLiquidity}
            isBurning={isBurning}
            lpPositionsCount={lpPositionsCount}
            isVaultEmpty={isVaultEmpty}
            vaultHashBalance={vaultHashBalance}
            vaultDrubBalance={vaultDrubBalance}
            handleBuyClick={unifiedBuy}
            handleSetMaxBuy={handleSetMaxBuy}
            handleSliderChangeBuy={handleSliderChangeBuy}
            sliderValueBuy={sliderValueBuy}
            addLiquidity={addLiquidity}
            burnAllPositions={burnAllPositions}
          />
        </div>
      </div>
    </div>
  );
}