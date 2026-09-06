const BRIDGE_URL = 'https://faucet.lookhook.info/';

export default function Faucet() {
  return (
    <div className="mt-12 relative w-full">
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden group">
        {/* Creative Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/assets/faucet.webp')] bg-repeat bg-[length:60px_60px] group-hover:opacity-[0.05] transition-opacity duration-700"></div>

        {/* Animated Glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full animate-pulse"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-sky-500 blur-[40px] opacity-10 group-hover:opacity-25 transition-opacity duration-700"></div>
            <img
              src="/assets/faucet.webp"
              alt="Faucet"
              className="w-20 h-20 md:w-24 md:h-24 relative z-10 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Title and Action */}
          <div className="flex-1 flex flex-col md:flex-row items-center md:items-end justify-between w-full gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">
                <span className="text-sky-500">Hash</span> Faucet
              </h2>
              <p className="text-neutral-400 text-sm max-w-sm leading-relaxed">
                Get a <span className="text-white font-bold">$HASH</span> every 24 hours.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <a
                href={BRIDGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  relative overflow-hidden w-full md:w-56 py-3 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 border
                  bg-sky-600 border-sky-400 text-white shadow-lg shadow-sky-600/10 hover:shadow-sky-600/30 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2
                "
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                <span>Open Faucet</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
