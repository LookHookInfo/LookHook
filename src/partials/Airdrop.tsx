interface AirdropProps {
  className?: string;
}

export default function Airdrop({ className }: AirdropProps) {
  // All dynamic logic for airdrop/claim removed as quest is completed

  return (
    <div
      className={`w-full h-full text-white bg-neutral-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-neutral-700 flex flex-col ${className ?? ''}`}
    >
      <div className="flex-grow flex flex-col md:flex-row gap-8 items-start">
        {/* Image Block */}
        <div className="flex-shrink-0 w-40 h-40 relative">
          <div
            className="absolute -top-2 -left-2
                         bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                         text-white px-3 py-1 text-xs font-bold rounded-full
                         shadow-lg z-10"
          >
            Base
          </div>
          <img src="/assets/Airdrop.webp" alt="Airdrop" className="rounded-xl w-full h-full object-cover" />
          {/* claimedCount display removed */}
        </div>

        {/* Text Content Block */}
        <div className="flex-1 space-y-6 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-center flex-wrap gap-2 relative mb-4">
              <h2 className="text-3xl font-bold text-white line-clamp-1">Airdrop</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  first
                </span>
              </div>
            </div>

            <p className="text-neutral-400 text-sm line-clamp-3">
              Special airdrop for early participants (Zealy, Sea, Tips, Name).
            </p>
          </div>

          <div className="mt-2 text-center text-xs font-medium text-gray-400 border border-gray-500 rounded-lg py-1.5 px-3">
            Airdrop has ended
          </div>
        </div>
      </div>

      {/* Action Button Block */}
      <div className="mt-4 w-full">
        <button disabled className="w-full py-3 rounded-lg transition btn-disabled">
          Completed
        </button>
      </div>
    </div>
  );
}
