export default function Features() {
  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
        <div className="lg:col-span-7">
          <div className="grid grid-cols-12 gap-2 sm:gap-6 items-center lg:-translate-x-10">
            <div className="col-span-4">
              <img
                className="rounded-xl"
                src="https://ipfs.io/ipfs/QmTqqHTGhD2U6N32wEjR4WxKHVRopeDj7V4BeUwuwdzzTu"
                alt="Features Image"
                loading="lazy"
              />
            </div>

            <div className="col-span-3">
              <img
                className="rounded-xl"
                src="https://ipfs.io/ipfs/QmRHdKniyVZGmWp7MbKmFRCFdoU5XF8y3d3m8KU1aAaaA2"
                alt="Features Image"
                loading="lazy"
              />
            </div>

            <div className="col-span-5">
              <img
                className="rounded-xl"
                src="https://ipfs.io/ipfs/QmZFEJbinReQyaYPFEdUrG7usUAb2auvdwrkbtPCNwquk5"
                alt="Features Image"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-10 lg:mt-0 lg:col-span-5">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2 md:space-y-4">
              <h2 className="font-bold text-3xl lg:text-4xl text-gray-300 dark:text-neutral-200">
                Look Hook Products
              </h2>
              <p className="text-gray-400 dark:text-neutral-500">
                Look Hook builds next-gen Web3 products using account
                abstraction, gasless transactions, and on-chain identity —
                seamless, secure, and user-centric.
              </p>
            </div>
            <ul className="space-y-2 sm:space-y-4">
              {[
                {
                  text: (
                    <>
                      <span className="font-bold">Account</span> Abstraction
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      Gasless – users don’t pay for <span className="font-bold">gas</span>
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      <span className="font-bold">Decentralized</span> infrastructure
                    </>
                  ),
                },
              ].map((item, index) => (
                <li className="flex gap-x-3" key={index}>
                  <span className="mt-0.5 size-6 flex justify-center items-center rounded-lg border border-gray-200 text-white dark:border-neutral-700">
                    <svg
                      className="size-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                    </svg>
                  </span>
                  <div className="grow">
                    <span className="text-sm sm:text-base text-gray-300 dark:text-neutral-500">
                      {item.text}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
