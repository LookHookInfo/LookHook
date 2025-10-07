// partials/Hashchain.tsx
interface HashchainProps {
  className?: string;
}

export default function Hashchain({ className }: HashchainProps) {
  return (
    <section className={`w-full px-4 py-8 text-white ${className ?? ""}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Image and Socials */}
          <div className="w-full lg:w-[200px] flex flex-col items-center">
            <img
              src="https://bafybeigxq4wv2jmp5axr4zkux6yksji35sravcjytxj6udstvp4vseskpa.ipfs.w3s.link/Dcoin.png"
              alt="HashCoin NFT"
              className="rounded-xl w-full h-auto"
            />

            {/* Social links */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-500 text-gray-500 bg-transparent">
                Vercel App
              </span>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white">Hash Chain</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  Devnet
                </span>
              </div>
            </div>

            <p className="text-neutral-400">
              One transaction - 1 kopeck. Instant confirmations, stable
              transaction costs without volatility. The perfect solution for
              micropayments, gaming and everyday transactions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
