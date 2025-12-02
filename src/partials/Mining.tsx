import { useState } from 'react';
import { MediaRenderer, useActiveAccount, useReadContract } from 'thirdweb/react';
import { useQuery } from '@tanstack/react-query';
import { getNFTs } from 'thirdweb/extensions/erc1155';
import { balanceOf as erc20BalanceOf } from 'thirdweb/extensions/erc20';
import { NFT } from 'thirdweb';
import { formatUnits } from 'viem';

import { client } from '../lib/thirdweb/client';
import { contractTools, contractStaking, usdcContract, hashcoinContract } from '../utils/contracts';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { ToolDetailModal } from '@/components/ToolDetailModal';

// #region Main Game Component
function Game() {
  const account = useActiveAccount();
  const [selectedTool, setSelectedTool] = useState<NFT | null>(null);

  const { data: usdcBalanceData } = useReadContract(erc20BalanceOf, {
    contract: usdcContract,
    address: account?.address || '',
    queryOptions: { enabled: !!account },
  });
  const usdcBalance = usdcBalanceData || 0n;

  return (
    <div className="relative">
      <GameContent account={account} onSelectTool={setSelectedTool} usdcBalance={usdcBalance} />
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
        <div className="absolute inset-0 flex justify-center items-center rounded-xl z-20">
          <div className="text-center p-6 bg-neutral-800/90 border border-neutral-700 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Start Mining</h3>
            <p className="text-neutral-300 mb-4">Connect your wallet to manage your inventory.</p>
            <ConnectWalletButton />
          </div>
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
    queryKey: ['allTools'],
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
        address={account?.address || ''}
        allTools={allTools}
        onSelectTool={onSelectTool}
        usdcBalance={usdcBalance}
      />
    </div>
  );
}
// #endregion

// #region Helper Components

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
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
          <img src="/assets/usdc.webp" alt="USDC logo" className="w-5 h-5" />
          <span>{parseFloat(formatUnits(usdcBalance, 6)).toFixed(2)}</span>
        </div>
      )}
    </div>
  );

  return (
    <Section title={titleWithBalance}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {allTools?.map((tool) => (
          <ToolCard key={tool.id.toString()} tool={tool} onClick={() => onSelectTool(tool)} />
        ))}
      </div>
    </Section>
  );
}

function ToolCard({ tool, onClick }: { tool: NFT; onClick: () => void }) {
  return (
    <div
      className="border border-neutral-700 rounded-lg p-4 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative w-full h-36 mt-2 rounded-lg aspect-square object-cover overflow-hidden">
        <MediaRenderer client={client} src={tool.metadata.image} className="w-full h-full object-cover" />
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
  const { data: totalRewards, isLoading } = useReadContract({
    contract: contractStaking,
    method: 'getRewardTokenBalance',
    params: [],
  });

  const { data: tokenSymbol } = useReadContract({
    contract: hashcoinContract,
    method: 'symbol',
    params: [],
  });

  return (
    <div className="max-w-[85rem] px-4 py-4 sm:px-6 lg:px-8 lg:py-6 mx-auto">
      <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
        <div className="mt-5 sm:mt-10 lg:mt-0 lg:col-span-4">
          <div className="space-y-6 sm:space-y-8 relative">
            {/* Base */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2
                     bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                     text-white px-3 py-1 text-xs font-bold rounded-full
                     shadow-lg"
            >
              Base
            </div>

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
                Mining Hash is an NFT-based mining system where users stake NFT devices to earn $HASH. The stronger your
                inventory, the faster you mine. Quests and activities expand utility and support a growing ecosystem.
              </p>
            </div>

            {/* Reward Pool */}
            <div className="bg-black/30 rounded-xl p-4 border border-neutral-700">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Reward Pool:</span>
                <span className="text-white font-semibold">
                  {isLoading ? (
                    <div className="inline-block loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>
                  ) : (
                    `${totalRewards ? Math.floor(parseFloat(formatUnits(totalRewards, 18))).toLocaleString() : '0'} ${tokenSymbol || ''}`
                  )}
                </span>
              </div>
            </div>

            {/* Social links */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
              <a
                href="https://hashcoin.farm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                Website
              </a>

              <a
                href="https://t.me/ChainInside/524"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                Forum
              </a>

              <a
                href="https://x.com/HashCoinFarm"
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
                href="https://t.me/HashCoinNews"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center size-8 rounded-lg border border-gray-200 text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <title>Telegram</title>
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
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
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-yellow-400 border border-yellow-400 rounded">
                PoN
              </span>
              <span className="text-sm text-neutral-400 font-medium leading-none">Proof of NFT</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-8">
          <Game />
        </div>
      </div>
    </div>
  );
}
