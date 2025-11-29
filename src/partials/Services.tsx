import { useState } from "react";
import HookCapitalModal from "./HookCapitalModal";
import HookDevModal from "./HookDevModal";
import HookPromoteModal from "./HookPromoteModal";
import HookAnalyticsModal from "./HookAnalyticsModal";

type Service = {
  title: string;
  description: string;
  icon: React.ReactNode;
  modal?: React.ReactNode;
};

export default function Services() {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const services: Service[] = [
    {
      title: "Hook Capital",
      description:
        "Hook Capital is Look Hook's internal fund, created to support early-stage Web3 projects focusing on community, infrastructure, and on-chain culture.",
      icon: (
        <span className="text-white text-5xl font-extrabold transform rotate-[15deg] scale-95">
          ₿
        </span>
      ),
      modal: <HookCapitalModal onClose={() => setOpenModal(null)} />,
    },
    {
      title: "Hook Dev",
      description:
        "We design and build Web3 architecture — from concept to launch. Protocols, NFTs, dApps — a full-cycle approach.",
      icon: (
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
      ),
      modal: <HookDevModal onClose={() => setOpenModal(null)} />,
    },
    {
      title: "Hook Promote",
      description:
        "We make your project stand out: crypto marketing, listings, community gamification, and growth through integrations.",
      icon: (
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
      ),
      modal: <HookPromoteModal onClose={() => setOpenModal(null)} />,
    },
    {
      title: "Hook Analytics",
      description:
        "We read the blockchain like open code. In-depth audits, on-chain metrics, and a market-driven view of your project.",
      icon: (
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
      ),
      modal: <HookAnalyticsModal onClose={() => setOpenModal(null)} />,
    },
  ];

  return (
    <>
      {services.map(
        (service) => openModal === service.title && service.modal
      )}

      <div className="max-w-[85rem] px-4 py-4 sm:px-6 lg:px-8 lg:py-6 mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 items-start gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="group flex flex-col justify-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50 rounded-xl p-4 md:p-7 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 cursor-pointer"
              onClick={() => setOpenModal(service.title)}
            >
              <div className="flex justify-center items-center size-12 bg-blue-600 rounded-xl p-6">
                {service.icon}
              </div>
              <div className="mt-5">
                <h3 className="group-hover:text-gray-400 text-lg font-semibold text-gray-300 dark:text-white dark:group-hover:text-gray-400">
                  {service.title}
                </h3>
                <p className="mt-1 text-gray-400 dark:text-neutral-400">
                  {service.description}
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
