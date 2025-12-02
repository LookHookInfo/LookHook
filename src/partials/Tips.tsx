import { TransactionButton, useActiveAccount } from 'thirdweb/react';
import { prepareContractCall } from 'thirdweb';
import { buyMeACoffeeContract } from '../utils/contracts';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { useBuyCoffeeLogic } from '../hooks/useBuyCoffeeLogic';

interface TipsProps {
  className?: string;
}

export default function Tips({ className }: TipsProps) {
  const account = useActiveAccount();
  const {
    coffeeCount,
    setCoffeeCount,
    isLoadingTopDonor,
    isLoadingCoffeePrice,
    isLoadingTopDonorName,
    totalTipInWei,
    totalTipInETH,
    usdValue,
    formattedTopDonorAmount,
    topDonorDisplayName,
    topDonor,
    totalCoffee,
    isLoadingTotalCoffee,
  } = useBuyCoffeeLogic();

  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          <div className="w-full lg:w-[150px] flex flex-col items-center relative">
            <div
              className="absolute -top-2 -left-2
                         bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                         text-white px-3 py-1 text-xs font-bold rounded-full
                         shadow-lg z-10"
            >
              Base
            </div>

            <img
              src="https://ipfs.io/ipfs/Qmb9uRpG5dpCfZ8mYCpcBqubnj4mRcrbTQpuniMRYXxXM3"
              alt="HashCoin NFT"
              className="rounded-xl w-full h-auto"
            />

            <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
              {isLoadingTopDonor || (isLoadingTopDonorName && topDonor) ? (
                <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-500 text-gray-500">
                  Loading...
                </span>
              ) : topDonorDisplayName ? (
                <span
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-green-400 text-green-300 break-all text-center animate-pulse shadow-lg shadow-green-500/20"
                  title={`Coffee Hero: ${formattedTopDonorAmount} ETH`}
                >
                  {topDonorDisplayName}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-500 text-gray-500">
                  No donor yet
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white">Tips</h2>
              <div className="flex items-center gap-2">
                {isLoadingTotalCoffee ? (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                    Loading...
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                    {totalCoffee ? totalCoffee.toString() : '0'} Brews
                  </span>
                )}
              </div>
            </div>

            <p className="text-neutral-400">On-Chain Coffee</p>

            <div className="flex items-center justify-center gap-2 w-full mb-4">
              <button
                onClick={() => setCoffeeCount((prev) => Math.max(1, prev - 1))}
                className="p-3 text-xl w-10 h-10 rounded-md bg-transparent hover:bg-neutral-700 text-white border border-neutral-700 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-lg font-semibold text-white flex-grow text-center">
                {coffeeCount} Coffee{coffeeCount > 1 ? 's' : ''}
                {usdValue && <span className="text-sm text-neutral-400"> (~${usdValue})</span>}
              </span>
              <button
                onClick={() => setCoffeeCount((prev) => prev + 1)}
                className="p-3 text-xl w-10 h-10 rounded-md bg-transparent hover:bg-neutral-700 text-white border border-neutral-700 flex items-center justify-center"
              >
                +
              </button>
            </div>

            {account ? (
              <TransactionButton
                transaction={() =>
                  prepareContractCall({
                    contract: buyMeACoffeeContract,
                    method: 'buyMeMultipleCoffee',
                    params: [BigInt(coffeeCount)],
                    value: totalTipInWei,
                  })
                }
                onTransactionSent={() => setCoffeeCount(1)}
                onError={(error) => console.error('Transaction error', error)}
                className={`!w-full !py-3 !rounded-lg !transition !mb-4 !text-white ${
                  account ? '!bg-[#4CAF50] !hover:bg-[#45a049]' : '!bg-[#555] !text-[#aaa] !cursor-not-allowed'
                }`}
              >
                {isLoadingCoffeePrice ? 'Loading...' : `Send Coffee (${parseFloat(totalTipInETH).toFixed(4)} ETH)`}
              </TransactionButton>
            ) : (
              <div className="flex flex-col items-center gap-y-3">
                <ConnectWalletButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
