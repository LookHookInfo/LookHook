// partials/Drub.tsx
interface DrubProps {
  className?: string;
}

export default function Drub({ className }: DrubProps) {
  return (
    <section className={`w-full px-4 py-8 text-white ${className ?? ""}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Image and Socials */}
          <div className="w-full lg:w-[200px] flex flex-col items-center">
            <img
              src="https://bafybeidzrpc2umwvsx5vwnlgup44fh5elckp73ecp5qmghrku6kcoxcthm.ipfs.w3s.link/Logo.png"
              alt="HashCoin NFT"
              className="rounded-xl w-full h-auto"
              style={{ animation: "drubBounce 3s ease-in-out infinite" }}
            />

            {/* Social links */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
              <a
                href="https://trub.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                Vercel App
              </a>

              <a
                href="https://t.me/ChainInside/4808"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                Forum
              </a>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white">DRUB</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  MVP
                </span>
              </div>
            </div>

            <p className="text-neutral-400">
              Decentralized Ruble Lending Protocol is a smart contract that
              enables users to obtain loans in the DRUB stablecoin using
              cryptocurrency assets as collateral. The protocol combines a
              decentralized approach with a centralized oracle at the current
              MVP stage.
            </p>
          </div>
        </div>
      </div>

      {/* Встроенный CSS для анимации */}
      <style>
        {`
          @keyframes drubBounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </section>
  );
}
