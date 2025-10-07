import { useEffect } from "react";

export default function HookCapitalModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onBackdropClick}
    >
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
                <span className="text-white text-4xl font-extrabold transform rotate-[15deg] scale-95">
                  ₿
                </span>
              </div>
              About the Fund
            </h2>
            <p>
              <strong>Hook Capital</strong> is a strategic initiative by{" "}
              <strong>Look Hook</strong>, built to support Web3 projects with growth potential and strong community roots.
            </p>
            <p>
              We combine capital, experience, and access to the Look Hook ecosystem to help builders launch impactful and culture-driven products.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-blue-400">What We Offer</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Seed & Pre-Seed support — early-stage investments in exchange for tokens</li>
              <li>Partnerships & Promotion — help with community building, listings, and exposure</li>
              <li>Look Hook Dev Infrastructure — access to smart contracts, hosting, audits</li>
              <li>Hook DEV & Analytics — technical support, research, on-chain metrics</li>
              <li>Ecosystem Integration — MintApp, Mining Hash, Staking Protocol, and more</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-blue-400">Our Focus</h3>
            <p>We support projects that:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Prioritize and grow their communities</li>
              <li>Are built on open and scalable infrastructure (L2, Base, zk, etc.)</li>
              <li>Operate in the realms of memecoins, NFTs, DeFi, or dev tools</li>
              <li>Embrace on-chain transparency and culture</li>
              <li>Already have a token or plan to launch one</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-blue-400">Portfolio</h3>
            <p>Our first projects will be listed here soon.</p>
            <p className="text-sm text-neutral-500">(Mining Hash is the first candidate.)</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-blue-400">Get in Touch</h3>
            <p>
              Email:{" "}
              <a
                href="mailto:admin@lookhook.info"
                className="text-blue-400 underline"
              >
                admin@lookhook.info
              </a>
            </p>
            <p>
              Twitter:{" "}
              <a
                href="https://x.com/LookHookInfo"
                className="text-blue-400 underline"
              >
                @LookHook
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
