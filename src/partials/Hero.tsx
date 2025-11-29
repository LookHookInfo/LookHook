
export default function Hero(){
    return (
<div className="max-w-[85rem] px-4 py-4 sm:px-6 lg:px-8 lg:py-6 mx-auto">
  <div className="h-0.5 w-full rounded-full my-8 animated-gradient-line"></div>
  <div className="mt-5 lg:mt-16 grid lg:grid-cols-3 gap-8 lg:gap-12">
    <div className="lg:col-span-1">
      <h2 className="font-bold text-2xl md:text-3xl text-gray-300 dark:text-neutral-200">
        About Us
      </h2>
      <p className="mt-2 md:mt-4 text-gray-400 dark:text-neutral-500">
      Look Hook is a team and platform building practical tools and products for the Web3 and digital assets space.
      </p>
      <p className="mt-2 md:mt-4 text-gray-400 dark:text-neutral-500">
      We develop technologies that help projects grow, investors discover strong ideas, and users enjoy seamless blockchain experiences.
      </p>
    </div>
    <div className="lg:col-span-2">
      <div className="grid sm:grid-cols-2 gap-8 md:gap-12">
        <div className="flex gap-x-5">
        <svg className="shrink-0 mt-1 size-6 text-blue-600 dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121m0-12.728l2.121 2.121m8.486 8.486l2.121 2.121M12 8a4 4 0 100 8 4 4 0 000-8z" />
</svg>
          <div className="grow">
            <h3 className="text-lg font-semibold text-gray-300 dark:text-white">
              Web3 Apps
            </h3>
            <p className="mt-1 text-gray-400 dark:text-neutral-400">
              Developing innovative blockchain-based applications for decentralized services.
            </p>
          </div>
        </div>
        <div className="flex gap-x-5">
        <svg className="shrink-0 mt-1 size-6 text-blue-600 dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M21.43 2.58l-2.93 18.46a1 1 0 01-1.47.7l-4.11-3.02-1.97 1.9a.75.75 0 01-1.27-.5v-4.17L18.7 6.6a.25.25 0 00-.3-.39L6.45 11.72l-3.9-1.22a.75.75 0 01-.02-1.42L20.5 2.03a.75.75 0 01.93.55z" />
</svg>
          <div className="grow">
            <h3 className="text-lg font-semibold text-gray-300 dark:text-white">
              Telegram Mini-Apps
            </h3>
            <p className="mt-1 text-gray-400 dark:text-neutral-400">
              Building functional and user-friendly mini-apps for Telegram with blockchain integration.
            </p>
          </div>
        </div>
        <div className="flex gap-x-5">
        <svg className="shrink-0 mt-1 size-6 text-blue-600 dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm4 8h2a2 2 0 110 4H9v-4zm4 0h2a2 2 0 010 4h-2v-4z" />
</svg>
          <div className="grow">
            <h3 className="text-lg font-semibold text-gray-300 dark:text-white">
              NFT Collections & Minting
            </h3>
            <p className="mt-1 text-gray-400 dark:text-neutral-400">
              Creating unique NFT collections with individualized phased minting for various purposes.
            </p>
          </div>
        </div>
        <div className="flex gap-x-5">
        <svg className="shrink-0 mt-1 size-6 text-blue-600 dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" />
</svg>
          <div className="grow">
            <h3 className="text-lg font-semibold text-gray-300 dark:text-white">
              Web3 Project Audits
            </h3>
            <p className="mt-1 text-gray-400 dark:text-neutral-400">
              Evaluating the security, efficiency, and transparency of Web3 projects using best practices and tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    )
}