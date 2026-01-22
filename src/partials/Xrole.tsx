interface XroleProps {
  className?: string;
}

export default function Xrole({ className }: XroleProps) {
  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Image and Links */}
          <div className="w-full lg:w-[140px] flex flex-col items-center relative">
            <img
              src="https://ipfs.io/ipfs/bafybeieiwzuctm3xrqhwn2gvbds3jgwvt6nvfd53xdfoj2erklcnigfozy"
              alt="Blockchain Forum"
              className="rounded-xl w-full h-auto scale-90"
            />

            <a
              href="https://app.galxe.com/quest/bAFdwDecXS6NRWsbYqVAgh"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Galxe
            </a>
          </div>

          {/* Text content */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white">X Role</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  Web3
                </span>
              </div>
            </div>

            <p className="text-neutral-400">
              Support Mining Hash with a unique tweet and earn an exclusive X Role + NFT + reward!
            </p>
            <div className="flex pt-0">
              <button
                disabled={true}
                className="relative flex items-center justify-center w-full px-4 py-2 rounded-lg transition text-sm font-medium border border-gray-500 text-gray-500 opacity-50 cursor-not-allowed"
              >
                <span>Reward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
