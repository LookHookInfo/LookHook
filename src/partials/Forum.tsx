export default function Forum() {
  return (
    <section className="w-full px-4 py-8 text-white">
      <div className="max-w-7xl mx-auto bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src="https://ipfs.io/ipfs/QmeWw8gp6H2RicpFG6aFhS77Wf9mZLpjQ3hubi8L1Bs4Lx"
              alt="HashCoin NFT"
              className="rounded-xl w-[90%] max-w-[320px] h-auto mx-auto"
            />

            {/* Social links */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
              <a
                href="https://t.me/ChainInside"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                Forum
              </a>

              <a
                href="https://x.com/ForumChain"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center size-8 rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700"
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
                className="inline-flex justify-center items-center size-8 rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <title>Discord</title>
                  <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2916a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.0994.246.1984.3728.292a.077.077 0 0 1-.0065.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.4189 0 1.3333-.9555 2.419-2.1569 2.419zm7.9748 0c-1.1825 0-2.1568-1.0857-2.1568-2.419 0-1.3332.9554-2.4189 2.1568-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.4189 0 1.3333-.946 2.419-2.1568 2.419Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white">
                Blockchain Forum
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  Web2
                </span>
                <span className="text-sm text-neutral-400 font-medium leading-none">
                  to{" "}
                  <a
                    href="https://chums.chat/#/!VOdEMBTNlpoBVIDtme:everscale.chat?via=everscale.chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white transition-colors"
                  >
                    WebFree
                  </a>
                </span>
              </div>
            </div>

            <p className="text-neutral-300 text-lg">
              Blockchain Forum is a Telegram community with easy topic
              navigation, where members discuss testnets, crypto trends, and
              project development. It brings together developers, investors, and
              enthusiasts who stay informed and share real Web3 experience.
            </p>

            <p className="text-neutral-400">
              The focus is on Bitcoin and other leading blockchains. We’re
              supported by Mining Hash — a project actively contributing to
              decentralized innovation.
            </p>

            {/* Checklist */}
            <ul className="space-y-2 sm:space-y-4">
              {[
                {
                  text: (
                    <>
                      <span className="font-bold">Your</span> Web Space
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      Early Access to <span className="font-bold">Trends</span>
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      <span className="font-bold">Lead</span> the Conversation
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
                  <span className="text-neutral-300">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
