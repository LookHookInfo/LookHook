import { useDrubContract } from '../hooks/useDrubContract';

export default function Drub() {
  const {
    status,
    setStatus,
    buyAmount,
    setBuyAmount,
    drubPerHash,
    drubTotalSupply,
    drubBalance,
    hashBalance,
    isApproved,
    approve,
    buyDrub,
  } = useDrubContract();

  const handleBuyClick = () => {
    if (!isApproved) {
      approve();
    } else {
      buyDrub();
    }
  };

  return (
    <div className="max-w-[85rem] px-4 py-4 sm:px-6 lg:px-8 lg:py-6 mx-auto">
      <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
        <div className="mt-5 sm:mt-10 lg:mt-0 lg:col-span-5">
          <div className="space-y-6 sm:space-y-8 relative">
            <div className="space-y-2 md:space-y-4">
              <h2 className="font-bold text-3xl lg:text-4xl text-gray-300 dark:text-neutral-200">
                <img
                  src="https://bafybeidzrpc2umwvsx5vwnlgup44fh5elckp73ecp5qmghrku6kcoxcthm.ipfs.w3s.link/Logo.png"
                  alt="HashCoin NFT"
                  className="rounded-xl w-16 h-16 inline-block mr-2 align-middle"
                  style={{ animation: 'drubBounce 3s ease-in-out infinite' }}
                />
                Stablecoin DRUB
              </h2>
              <p className="text-gray-400 dark:text-neutral-500">
                A decentralized Web3 token backed by HASH. Buy DRUB with HASH and enhance liquidity.
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-4 space-y-2 border border-neutral-700">
              <p className="text-sm text-neutral-400">
                1 HASH = <span className="text-white font-semibold">{parseFloat(drubPerHash).toFixed(4)} DRUB</span>
              </p>
              <p className="text-sm text-neutral-400">
                Total Supply: <span className="text-white font-semibold">{parseFloat(drubTotalSupply).toFixed(2)} DRUB</span>
              </p>
               <p className="text-sm text-neutral-400">
                Your DRUB Balance: <span className="text-white font-semibold">{parseFloat(drubBalance).toFixed(2)}</span>
              </p>
              <p className="text-sm text-neutral-400">
                Your HASH Balance: <span className="text-white font-semibold">{parseFloat(hashBalance).toFixed(2)}</span>
              </p>
            </div>

            <ul className="space-y-2 sm:space-y-4">
              {[
                { text: <>Decentralized & Transparent</> },
                { text: <>Backed by HASH reserves</> },
                { text: <>Community-driven liquidity</> },
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

        <div className="lg:col-span-7 mt-10 lg:mt-0">
            <div className="bg-black/30 border border-neutral-700 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-white">Buy DRUB</h3>
                <div className="relative">
                    <input
                        type="number"
                        className="w-full p-4 pr-20 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                       <span className="text-gray-400">HASH</span>
                    </div>
                </div>
                 <button
                    onClick={handleBuyClick}
                    disabled={!buyAmount || parseFloat(buyAmount) <= 0 || !!status}
                    className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {status ? status : (isApproved ? 'Buy DRUB' : 'Approve HASH')}
                </button>
                 {parseFloat(buyAmount) > parseFloat(hashBalance) && (
                    <p className="text-red-500 text-sm mt-2">Insufficient HASH balance.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
