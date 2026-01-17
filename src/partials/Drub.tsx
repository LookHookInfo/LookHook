import { useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { DrubSection } from '../components/DrubSection';
import { useDrubContract } from '../hooks/useDrubContract';
import { useDrub100Badge } from '../hooks/useDrub100Badge';
import { useDrubReward } from '../hooks/useDrubReward';
import { Spinner } from '../components/Spinner';

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

  const { hasBadge, isMinting, status: badgeStatus, canMint, handleMint } = useDrub100Badge();
  const { canClaim, hasClaimed, isClaiming, rewardAmount, poolRewardBalance, handleClaim, status: rewardStatus } = useDrubReward();


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
    
  const badgeButtonActive = account && !isMinting && !hasBadge && canMint;
  const rewardButtonActive = account && canClaim && !hasClaimed && !isClaiming;

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
              <div className="flex flex-row justify-center items-center space-x-4 mt-4 text-center">
                <a
                  href="https://app.galxe.com/quest/3xVdUNg8fS7gA4A5rp1gqT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white font-bold"
                >
                  Galxe
                </a>
                
                <div className="relative group">
                  <button
                    onClick={handleMint}
                    disabled={!badgeButtonActive}
                    className={`relative flex items-center justify-center px-4 py-2 rounded-lg transition text-sm font-medium border ${
                      badgeButtonActive
                        ? 'border-neutral-700 text-white bg-neutral-800 glow-effect cursor-pointer'
                        : 'border-gray-500 text-gray-500 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {isMinting && <Spinner />}
                    <span className={isMinting ? 'ml-2' : ''}>{hasBadge ? 'Owned' : 'Badge'}</span>
                  </button>
                  <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Buy for 100 DRUB
                    <div className="tooltip-arrow" data-popper-arrow></div>
                  </div>
                </div>

                <div className="relative group">
                  <button
                    onClick={handleClaim}
                    disabled={!rewardButtonActive}
                    className={`relative flex items-center justify-center px-4 py-2 rounded-lg transition text-sm font-medium border ${
                      rewardButtonActive
                        ? 'border-neutral-700 text-white bg-neutral-800 glow-effect cursor-pointer'
                        : 'border-gray-500 text-gray-500 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {isClaiming && <Spinner />}
                    <span className={isClaiming ? 'ml-2' : ''}>{hasClaimed ? 'Owned' : 'Reward'}</span>
                  </button>
                  <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Pool: {poolRewardBalance} HASH 
                    <br />
                    Claim: {rewardAmount} HASH on Galxe
                    <div className="tooltip-arrow" data-popper-arrow></div>
                  </div>
                </div>

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
              </div>
              {(badgeStatus || rewardStatus) && <p className="text-center text-sm text-gray-400 mt-2">{badgeStatus || rewardStatus}</p>}

                    <ul className="space-y-1 sm:space-y-2">
                      {[
                        { text: (
                            <>
                              <span className="font-bold">Central bank</span> rate 
                            </>
                          ), type: 'default' },
                        { text: (
                            <>
                              Decentralized <span className="font-bold">pool</span>
                            </>
                          ), type: 'default' },
                        { text: (
                            <>
                              Experimental mode
                            </>
                          ), type: 'warning' },
                      ].map((item, index) => (
                        <li className="flex gap-x-3" key={index}>
                          <span className={`mt-0.5 size-6 flex justify-center items-center rounded-lg border ${item.type === 'warning' ? 'border-yellow-400 text-yellow-400' : 'border-gray-200 text-white dark:border-neutral-700'}`}>
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