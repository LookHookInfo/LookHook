interface DropProps {
  className?: string;
}

export default function Drop({ className }: DropProps) {
  return (
    <div className={`w-full h-full text-white bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 flex flex-col ${className ?? ""}`}>
      <div className="flex-grow flex flex-col md:flex-row gap-8 items-start">
        {/* Image Block */}
        <div className="flex-shrink-0 w-32 h-32 relative">
          <div
            className="absolute -top-2 -left-2
                         bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                         text-white px-2 py-1 text-xs font-bold rounded-full
                         shadow-lg z-10"
          >
            Base
          </div>
          <img
            src="/assets/Drop.webp"
            alt="Winter Gift"
            className="rounded-full w-full h-full object-cover"
          />
        </div>

        {/* Text Content Block */}
        <div className="flex-1 space-y-6 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-center flex-wrap gap-2 relative mb-4">
              <h2 className="text-3xl font-bold text-white line-clamp-1">Winter Gift</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  second
                </span>
              </div>
            </div>

            <p className="text-neutral-400 text-sm line-clamp-3">
              Preparing a snapshot for Amba, Stake, Name, Early, Tips, Hold,  and <span className="font-bold bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent">Plasma cat NFT</span>  holders. A gift for our community.
            </p>
          </div>

          <div className="mt-4 w-full">
            <button
              disabled
              className="w-full py-3 rounded-lg transition btn-disabled font-semibold"
            >
              Starts Dec 25
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
