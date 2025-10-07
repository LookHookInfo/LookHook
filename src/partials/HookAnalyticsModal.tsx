import { useEffect } from "react";

export default function HookAnalyticsModal({ onClose }: { onClose: () => void }) {
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
          {/* About Hook Analytics */}
          <section>
            <h2 className="text-3xl font-bold mb-2 text-blue-400 flex items-center gap-3">
              <div className="flex justify-center items-center w-12 h-12 bg-blue-600 rounded-xl">
                <svg
                  className="shrink-0 size-8 text-white"
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
                  <line x1="4" y1="20" x2="4" y2="10" />
                  <line x1="10" y1="20" x2="10" y2="6" />
                  <line x1="16" y1="20" x2="16" y2="14" />
                  <line x1="22" y1="20" x2="22" y2="3" />
                </svg>
              </div>
              About Hook Analytics
            </h2>
            <p>
              <strong>Hook Analytics</strong> provides in-depth insights into projects, teams, and smart contracts. We help you understand blockchain interactions and evaluate the ecosystem before engaging.
            </p>
            <span className="mt-2 inline-flex items-center gap-x-1.5 text-sm text-blue-600 decoration-2 group-hover:underline font-medium">
              Learn more
              <svg
                className="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </section>

          {/* What We Offer */}
          <section>
            <h3 className="text-xl font-semibold text-blue-400">What We Offer</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Project and team analysis to understand risks and opportunities</li>
              <li>Smart contract audits to ensure security and reliability</li>
              <li>Tracking on-chain transactions and activity patterns</li>
              <li>Detection of suspicious or unusual activity</li>
              <li>Market-driven analytics for strategic decision-making</li>
            </ul>
          </section>

          {/* Our Focus */}
          <section>
            <h3 className="text-xl font-semibold text-blue-400">Our Focus</h3>
            <p>We focus on helping projects and users:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gain clarity on blockchain projects and smart contracts</li>
              <li>Mitigate risks through on-chain tracking and audits</li>
              <li>Make informed decisions based on analytics and data</li>
              <li>Enhance transparency and security in Web3 interactions</li>
            </ul>
          </section>

          {/* Get in Touch */}
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
