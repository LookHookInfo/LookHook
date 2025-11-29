import { useEffect } from "react";

export default function HookPromoteModal({ onClose }: { onClose: () => void }) {
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
          {/* About Hook Promote */}
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
                  <path d="M5 19L19 5" />
                  <polyline points="9 5 19 5 19 15" />
                </svg>
              </div>
              About Hook Promote
            </h2>
            <p>
              <strong>Hook Promote</strong> helps your project stand out in the Web3 space — from emerging startups to established blockchains. We handle media outreach, community engagement, and strategic growth across multiple platforms.
            </p>
          </section>

          {/* What We Offer */}
          <section>
            <h3 className="text-xl font-semibold text-blue-400">What We Offer</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Media campaigns and articles to maximize project visibility</li>
              <li>Engagement with communities to increase reach and adoption</li>
              <li>Listings on crypto aggregators, calendars, and service platforms</li>
              <li>On-chain quests and challenges for community interaction</li>
              <li>Integration with platforms like Galxe, Zealy, and others</li>
            </ul>
          </section>

          {/* Our Focus */}
          <section>
            <h3 className="text-xl font-semibold text-blue-400">Our Focus</h3>
            <p>We focus on helping projects that aim to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Grow their community organically and through campaigns</li>
              <li>Gain exposure on key Web3 media and aggregators</li>
              <li>Engage users through fun on-chain quests and challenges</li>
              <li>Enhance visibility and adoption in the crypto ecosystem</li>
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
