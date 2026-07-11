import { useEffect } from 'react';

export default function HookDevModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onBackdropClick}>
      <div className="bg-neutral-900 text-neutral-200 max-w-4xl w-full max-h-[90vh] overflow-auto rounded-xl p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close modal"
        >
          <img src="/image.svg" alt="Close" className="w-8 h-8" />
        </button>

        <div className="space-y-6">
          <section>
            <h2 className="text-3xl font-bold mb-2 text-blue-400 flex items-center gap-3">
              <div className="flex justify-center items-center w-10 h-10 bg-blue-600 rounded-xl">
                <svg
                  className="shrink-0 size-8 text-white transform rotate-90"
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7l7-7 7 7" />
                  <path d="M4 17l7 7 7-7" />
                </svg>
              </div>
              About Hook Dev
            </h2>
            <p>
              <strong>Hook Dev</strong> is the technology arm of the <strong>Look Hook</strong> ecosystem, dedicated to
              building Web3 products and infrastructure that empower communities and strengthen our ecosystem.
            </p>
            <p>
              We provide a full development cycle — from concept to launch — covering protocols, NFTs, decentralized
              applications, and ecosystem utilities.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-blue-400">What We Offer</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full-cycle Web3 product development — from idea to market</li>
              <li>Protocols, NFTs, dApps — tailored to specific community needs</li>
              <li>Mini-apps for engagement and user retention</li>
              <li>Ecosystem integration with the Hash token</li>
              <li>Infrastructure solutions supporting scalability and security</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-blue-400">Our Focus</h3>
            <p>We prioritize projects and tools that:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Expand the Look Hook ecosystem</li>
              <li>Integrate and create utility for the Hash token</li>
              <li>Enhance transparency, usability, and culture in Web3</li>
              <li>Deliver long-term value for communities and builders</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-blue-400">Portfolio</h3>
            <p>Upcoming Hook Dev products and ecosystem apps will be listed here.</p>
            <p className="text-sm text-neutral-500">(MintApp and Mining Hash integrations in progress.)</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-blue-400">Get in Touch</h3>
            <p>
              Email:{' '}
              <a href="mailto:admin@lookhook.info" className="text-blue-400 underline">
                admin@lookhook.info
              </a>
            </p>
            <p>
              Twitter:{' '}
              <a href="https://x.com/LookHookInfo" className="text-blue-400 underline">
                @LookHook
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
