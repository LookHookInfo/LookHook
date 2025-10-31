import { useState } from "react";
import {
  MediaRenderer,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { useQuery } from "@tanstack/react-query";
import { getNFTs } from "thirdweb/extensions/erc1155";
import { balanceOf as erc20BalanceOf } from "thirdweb/extensions/erc20";
import { ThirdwebContract, NFT } from "thirdweb";
import { formatUnits } from "viem";

import { client } from "../lib/thirdweb/client";
import { contractTools, contractStaking, usdcContract } from "../utils/contracts";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { ToolDetailModal } from "@/components/ToolDetailModal";

// #region Main Game Component
function Game() {
  const account = useActiveAccount();
  const [selectedTool, setSelectedTool] = useState<NFT | null>(null);

  const { data: usdcBalanceData } = useReadContract(erc20BalanceOf, {
    contract: usdcContract,
    address: account?.address || "",
    queryOptions: { enabled: !!account },
  });
  const usdcBalance = usdcBalanceData || 0n;

  return (
    <div className="relative">
      <GameContent
        account={account}
        onSelectTool={setSelectedTool}
        usdcBalance={usdcBalance}
      />
      {selectedTool && account && (
        <ToolDetailModal
          tool={selectedTool}
          address={account.address}
          contractTools={contractTools}
          contractStaking={contractStaking}
          onClose={() => setSelectedTool(null)}
          usdcBalance={usdcBalance}
        />
      )}
      {!account && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center rounded-xl z-20">
          <ConnectWalletButton />
        </div>
      )}
    </div>
  );
}

function GameContent({ 
  account,
  onSelectTool,
  usdcBalance,
}: { 
  account: ReturnType<typeof useActiveAccount> | undefined;
  onSelectTool: (tool: NFT) => void;
  usdcBalance: bigint;
}) {
  const { data: allTools, isLoading: isLoadingTools } = useQuery({
    queryKey: ["allTools"],
    queryFn: () => getNFTs({ contract: contractTools }),
  });

  if (isLoadingTools) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className={`${!account ? 'pointer-events-none' : ''}`}>
      <ToolGrid
        address={account?.address || ""}
        allTools={allTools}
        onSelectTool={onSelectTool}
        usdcBalance={usdcBalance}
      />
    </div>
  );
}
// #endregion

// #region Helper Components

function Section({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-700 rounded-xl p-4">
      <div className="text-lg font-semibold mb-4">{title}</div>
      {children}
    </div>
  );
}

function ToolGrid({
  address,
  allTools,
  onSelectTool,
  usdcBalance,
}: {
  address: string;
  allTools: NFT[] | undefined;
  onSelectTool: (tool: NFT) => void;
  usdcBalance: bigint;
}) {
  const titleWithBalance = (
    <div className="flex justify-between items-center">
      <span>Inventory</span>
      {address && (
        <div className="flex items-center gap-2 text-sm font-normal">
          <img
            src="/usdc.png"
            alt="USDC logo"
            className="w-5 h-5"
          />
          <span>{parseFloat(formatUnits(usdcBalance, 6)).toFixed(2)}</span>
        </div>
      )}
    </div>
  );

  return (
    <Section title={titleWithBalance}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {allTools?.map((tool) => (
          <ToolCard
            key={tool.id.toString()}
            tool={tool}
            onClick={() => onSelectTool(tool)}
          />
        ))}
      </div>
    </Section>
  );
}

function ToolCard({
  tool,
  onClick,
}: {
  tool: NFT;
  onClick: () => void;
}) {
  return (
    <div 
      className="border border-neutral-800 rounded-lg p-4 cursor-pointer hover:border-neutral-600 transition-colors duration-200"
      onClick={onClick}
    >
      <div className="relative w-full h-36 mt-2 rounded-lg aspect-square object-cover overflow-hidden">
        <MediaRenderer
          client={client}
          src={tool.metadata.image}
          className="w-full h-full object-cover"
        />
        {/* Name Overlay */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-fit px-2 py-1 bg-gray-200 bg-opacity-75 rounded-lg text-center">
          <p className="font-bold text-sm text-gray-800 truncate">{tool.metadata.name}</p>
        </div>
        {/* Description Overlay */}
        {tool.metadata.description && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-fit px-2 py-1 bg-gray-200 bg-opacity-75 rounded-lg text-center">
            <p className="font-bold text-xs text-gray-800 truncate">{tool.metadata.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// #endregion

export default function Mining() {
  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
        <div className="mt-5 sm:mt-10 lg:mt-0 lg:col-span-4">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2 md:space-y-4">
              <h2 className="font-bold text-3xl lg:text-4xl text-gray-300 dark:text-neutral-200">
                <img
                  src="https://bafkreigg2isvgh4zxqdojs5bdmfhkw7hugqikptcewd6zeegvfcnxufw4a.ipfs.dweb.link/"
                  alt="Stake"
                  className="rounded-xl w-16 h-16 inline-block mr-2 align-middle"
                />
                Mining Hash
              </h2>
              <p className="text-neutral-300 text-lg">
                Mining Hash is an NFT-powered mining project where users stake
                specialized NFT devices to earn $HASH rewards. It introduces a
                modern, gamified approach to decentralized mining, combining
                digital collectibles with DeFi incentives.
              </p>

              <p className="text-neutral-400">
                Players build their mining inventory by collecting NFT
                equipment, turning NFTs into productive assets. The stronger
                your NFT setup, the higher your mining speed and overall $HASH
                earnings.
              </p>
              <div className="flex justify-center items-center space-x-4 mt-4 gleam-effect">
                <a
                  href="https://app.galxe.com/quest/bAFdwDecXS6NRWsbYqVAgh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white font-bold relative z-10"
                >
                  Galxe
                </a>
                <a
                  href="https://quest.intract.io/project/mining-hash/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white font-bold relative z-10"
                >
                  Intract
                </a>
                <a
                  href="https://guild.xyz/hashcoin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white font-bold relative z-10"
                >
                  Guild
                </a>
              </div>
            </div>
            <ul className="space-y-2 sm:space-y-4">
              {[
                {
                  text: (
                    <>
                      <span className="font-bold">Web3</span> on Base
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      NFT Mining of <span className="font-bold">HASH</span>
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      <span className="font-bold">Community</span> Incentives
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
        <div className="lg:col-span-8">
          <Game />
        </div>
      </div>
    </div>
  );
}