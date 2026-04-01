interface TelegramProps {
  className?: string;
}

export default function Telegram({ className }: TelegramProps) {
  return (
    <div
      className={`w-full text-white bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 flex flex-col ${className ?? ''}`}
    >
      <div className="flex-grow flex flex-col md:flex-row gap-8 items-start">
        {/* Image Block */}
        <div className="w-1/2 mx-auto md:w-40 lg:w-[140px] flex-shrink-0 relative flex flex-col items-center">
          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white px-2 py-1 text-xs font-bold rounded-full shadow-lg z-10">
            Base
          </div>
          <img src="/assets/Telegram.webp" alt="Telegram" className="rounded-full w-full h-auto object-cover" />
          <div className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-500 text-gray-500 cursor-not-allowed">
            Soon
          </div>
        </div>

        {/* Text Content Block */}
        <div className="flex-1 w-full min-w-0 space-y-4 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-center flex-wrap gap-2 relative mb-4">
              <h2 className="text-3xl font-bold text-white line-clamp-1">Gram Role</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  Web3
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-neutral-300">Make a post about Mining Hash in the live crypto community. (Role+NFT+Reward)</p>
            </div>
          </div>

          {/* Button Stub */}
          <div className="mt-auto pt-4 w-full relative">
            <div className="relative group w-full">
              <button
                disabled={true}
                className="relative flex items-center justify-center w-full py-3 rounded-lg text-xl font-bold border border-gray-500 text-gray-500 opacity-50 cursor-not-allowed bg-neutral-800"
              >
                <span>Coming Soon</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
