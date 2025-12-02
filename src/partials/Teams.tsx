interface SocialLinkProps {
  href: string;
  svgPath: string;
  title: string;
}

const SocialLink = ({ href, svgPath, title }: SocialLinkProps) => {
  return (
    <a
      className="inline-flex justify-center items-center size-8 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg
        className="shrink-0 size-4"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <title>{title}</title>
        <path d={svgPath} />
      </svg>
    </a>
  );
};

export default function Teams() {
  return (
    <div className="max-w-[85rem] px-4 py-4 sm:px-6 lg:px-8 lg:py-6 mx-auto">
      {/* Section Title */}
      <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
        <h2 className="text-2xl font-bold md:text-4xl md:leading-tight dark:text-white">Our Team</h2>
        <p className="mt-1 text-gray-400 dark:text-neutral-400">Creative people</p>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Team Member 1 */}
        <div className="flex flex-col rounded-xl p-4 md:p-6 bg-white border border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
          <div className="flex items-center gap-x-4">
            <img
              className="rounded-full size-20"
              src="https://ipfs.io/ipfs/QmQqYYWnxKsonNaUGU5CLHrZzapxwRUht4NPUs1qpA8CJK"
              alt="Avatar"
            />
            <div className="grow">
              <h3 className="font-medium text-gray-800 dark:text-neutral-200">Konstantin Moiseev</h3>
              <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">Founder / DEV</p>
            </div>
          </div>
          <p className="mt-3 text-gray-500 dark:text-neutral-500">
            Leading strategist and innovator driving Web3 solutions.
          </p>

          {/* Social Links */}
          <div className="mt-3 space-x-1">
            <SocialLink
              href="https://x.com/PrimeBlocks"
              svgPath="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932Z"
              title="X"
            />
            <SocialLink
              href="https://t.me/Artistmail"
              svgPath="M9.993 16.2l-.39 5.52c.558 0 .8-.24 1.09-.528l2.614-2.49 5.418 3.94c.993.546 1.697.258 1.97-.918l3.57-16.773h.001c.315-1.44-.508-2.004-1.455-1.655L2.147 9.765c-1.388.548-1.37 1.32-.237 1.668l5.798 1.815 13.438-8.466c.633-.45 1.21-.202.736.288L9.993 16.2z"
              title="Telegram"
            />
            <SocialLink
              href="https://www.linkedin.com/in/konstantin-moiseev/"
              svgPath="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
              title="LinkedIn"
            />
          </div>
        </div>

        {/* Team Member 2 */}
        <div className="flex flex-col rounded-xl p-4 md:p-6 bg-white border border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
          <div className="flex items-center gap-x-4">
            <img
              className="rounded-full size-20"
              src="https://ipfs.io/ipfs/QmSPSEdJM7Q2qwVWjNN9fJCchrSpaEy2mnfSGBHcTgbtqC"
              alt="Avatar"
            />
            <div className="grow">
              <h3 className="font-medium text-gray-800 dark:text-neutral-200">ArteMois</h3>
              <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">NFT Creator</p>
            </div>
          </div>
          <p className="mt-3 text-gray-500 dark:text-neutral-500">
            Artist crafting unique visual concepts for NFTs and blockchain products.
          </p>

          {/* Social Links */}
          <div className="mt-3 space-x-1">
            <SocialLink
              href="https://x.com/Arte_Mois"
              svgPath="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932Z"
              title="X"
            />
          </div>
        </div>

        {/* Team Member 3 */}
        <div className="flex flex-col rounded-xl p-4 md:p-6 bg-white border border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
          <div className="flex items-center gap-x-4">
            <img
              className="rounded-full size-20"
              src="https://bafybeia3rbslwopxuh3trswj2igpcmv6ygycofyztpdxi2rohjnmxnzqu4.ipfs.w3s.link/Logo.png"
              alt="Avatar"
            />
            <div className="grow">
              <h3 className="font-medium text-gray-800 dark:text-neutral-200">Chain Inside</h3>
              <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">Community MOD</p>
            </div>
          </div>
          <p className="mt-3 text-gray-500 dark:text-neutral-500">Fostering community growth and engagement in Web3.</p>

          {/* Social Links */}
          <div className="mt-3 space-x-1">
            <SocialLink
              href="https://x.com/ForumChain"
              svgPath="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932Z"
              title="X"
            />
            <SocialLink
              href="https://t.me/ChainInside"
              svgPath="M9.993 16.2l-.39 5.52c.558 0 .8-.24 1.09-.528l2.614-2.49 5.418 3.94c.993.546 1.697.258 1.97-.918l3.57-16.773h.001c.315-1.44-.508-2.004-1.455-1.655L2.147 9.765c-1.388.548-1.37 1.32-.237 1.668l5.798 1.815 13.438-8.466c.633-.45 1.21-.202.736.288L9.993 16.2z"
              title="Telegram"
            />
            <SocialLink
              href="https://www.linkedin.com/company/lookhook"
              svgPath="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
              title="LinkedIn"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
