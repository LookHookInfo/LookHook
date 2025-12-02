interface NFTCardProps {
  className?: string;
}

export default function NFTCard({ className }: NFTCardProps) {
  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Image and Links */}
          <div className="w-full lg:w-[140px] flex flex-col items-center relative">
            <div
              className="absolute -top-2 -left-2
                         bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                         text-white px-3 py-1 text-xs font-bold rounded-full
                         shadow-lg z-10"
            >
              Base
            </div>

            <img
              src="https://ipfs.io/ipfs/QmSNSLzJwsVye4QJqdjTo4oF5XnvWg5uWGKUY74jHBAStw"
              alt="NFT Claim App"
              className="rounded-xl w-full h-auto scale-90"
            />

            <a
              href="https://mintapp.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Website
            </a>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <a
                href="https://t.me/ChainInside/1824"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center size-8 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <title>Telegram</title>
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>

              <a
                href="https://x.com/ForumChain/status/1922984506320998468"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center size-8 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors"
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
                className="inline-flex justify-center items-center size-8 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <title>Discord</title>
                  <path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.078.037 13.5 13.5 0 0 0-.608 1.25 18.5 18.5 0 0 0-5.487 0 11.7 11.7 0 0 0-.618-1.25.077.077 0 0 0-.078-.037A19.8 19.8 0 0 0 3.678 4.37 15.9 15.9 0 0 0 .1 18.058a.082.082 0 0 0 .031.056 20.1 20.1 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 12.4 12.4 0 0 0 1.226-1.994.076.076 0 0 0-.042-.106 13.5 13.5 0 0 1-1.872-.892.077.077 0 0 1-.008-.128l.372-.292a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.06 0a.074.074 0 0 1 .079.01l.373.292a.077.077 0 0 1-.007.128 13.2 13.2 0 0 1-1.873.89.077.077 0 0 0-.04.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 20.1 20.1 0 0 0 6.002-3.03.077.077 0 0 0 .031-.055A15.9 15.9 0 0 0 20.317 4.37ZM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2 relative">
              <h2 className="text-3xl font-bold text-white">NFT Claim</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  Web3
                </span>
              </div>
            </div>

            <p className="text-neutral-400">
              <strong>Plasma Cat</strong> is an NFT collection that grants access to community events, quests, and early
              access to product features. After the mint, we will airdrop the <strong>$CATSH</strong> meme token.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
