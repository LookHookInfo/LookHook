interface ForumProps {
  className?: string;
}

export default function Forum({ className }: ForumProps) {
  return (
    <section className={`w-full px-4 py-4 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Image and Links */}
          <div className="w-full lg:w-[140px] flex flex-col items-center relative">
            <img
              src="https://ipfs.io/ipfs/QmeWw8gp6H2RicpFG6aFhS77Wf9mZLpjQ3hubi8L1Bs4Lx"
              alt="Blockchain Forum"
              className="rounded-xl w-full h-auto scale-90"
            />

            <a
              href="https://t.me/ChainInside"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Forum
            </a>

            {/* Social links under button */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <a
                href="https://x.com/ForumChain"
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
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white">Forum</h2>
              <div className="flex items-center gap-2">
                <a
                  href="https://chums.chat/#/!VOdEMBTNlpoBVIDtme:everscale.chat?via=everscale.chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-2.5 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded hover:bg-white hover:text-black transition-colors"
                >
                  WebFree
                </a>
              </div>
            </div>

            <p className="text-neutral-400">
              Blockchain Forum - a Telegram community uniting people passionate about testnets, blockchain, and Web3.
              Join the community and be part of the conversation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
