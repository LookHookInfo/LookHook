import { useState } from "react";
import {
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNFTs, setApprovalForAll } from "thirdweb/extensions/erc1155";
import { balanceOf as erc20BalanceOf } from "thirdweb/extensions/erc20";
import { prepareContractCall, ThirdwebContract, NFT } from "thirdweb";
import { formatUnits } from "viem";

import { client } from "../lib/thirdweb/client";
import { contractTools, contractStaking, usdcContract } from "../utils/contracts";
import { useToolCardLogic } from "@/hooks/useToolCardLogic";

// #region Main Game Component
function Game() {
  const account = useActiveAccount();

  if (!account) {
    return (
      <div className="flex justify-center items-center h-full">
        <h3 className="text-xl font-semibold">
          Please connect your wallet to play.
        </h3>
      </div>
    );
  }

  return <GameContent address={account.address} />;
}

function GameContent({ address }: { address: string }) {
  const { data: allTools, isLoading: isLoadingTools } = useQuery({
    queryKey: ["allTools"],
    queryFn: () => getNFTs({ contract: contractTools }),
  });

  if (isLoadingTools) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ToolGrid
        address={address}
        allTools={allTools}
        contractTools={contractTools}
        contractStaking={contractStaking}
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
  contractTools,
  contractStaking,
}: {
  address: string;
  allTools: NFT[] | undefined;
  contractTools: ThirdwebContract;
  contractStaking: ThirdwebContract;
}) {
  const { data: usdcBalanceData } = useReadContract(erc20BalanceOf, {
    contract: usdcContract,
    address: address,
    queryOptions: { enabled: !!address },
  });

  const usdcBalance = usdcBalanceData || 0n;

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
            address={address}
            contractTools={contractTools}
            contractStaking={contractStaking}
            usdcBalance={usdcBalance}
          />
        ))}
      </div>
    </Section>
  );
}

function ToolCard({
  tool,
  address,
  contractTools,
  contractStaking,
  usdcBalance,
}: {
  tool: NFT;
  address: string;
  contractTools: ThirdwebContract;
  contractStaking: ThirdwebContract;
  usdcBalance: bigint;
}) {
  const {
    quantity,
    setQuantity,
    account,
    queryClient,
    isLoading,
    ownAmount,
    stakedAmount,
    claimableRewards,
    totalPrice,
    isApprovedForStaking,
    handleStake,
    refetchStakingApproval,
    isBuying,
    handleBuy,
  } = useToolCardLogic({ tool, address, contractTools, contractStaking });

  if (isLoading) {
    return (
      <div className="border border-neutral-800 rounded-lg p-4 min-h-[300px] flex justify-center items-center">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  const hasInsufficientFunds = usdcBalance < totalPrice;

  return (
    <div className="border border-neutral-800 rounded-lg p-4">
      <p className="font-semibold">{tool.metadata.name}</p>
      <MediaRenderer
        client={client}
        src={tool.metadata.image}
        className="w-full h-36 mt-2 rounded-lg"
      />

      <p className="text-sm mt-4">In Wallet: {ownAmount.toString()}</p>
      <p className="text-sm">Staked: {stakedAmount.toString()}</p>

      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        min={1}
        className="w-full mt-4 p-2 rounded-md bg-neutral-800 text-white text-sm"
        placeholder="Quantity"
      />

      <div className="flex flex-col mt-4 gap-2">
        <button
          onClick={handleBuy}
          disabled={!account || isBuying || hasInsufficientFunds}
          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBuying
            ? "Processing..."
            : hasInsufficientFunds
            ? "Insufficient USDC"
            : `Buy $${formatUnits(totalPrice, 6)}`}
        </button>

        {isApprovedForStaking ? (
          <TransactionButton
            transaction={handleStake}
            disabled={ownAmount === 0n}
            className="w-full"
            onTransactionConfirmed={() => queryClient.invalidateQueries()}
          >
            Equip
          </TransactionButton>
        ) : (
          <TransactionButton
            transaction={() => {
              if (!account) throw new Error("Not connected");
              return setApprovalForAll({
                contract: contractTools,
                operator: contractStaking.address,
                approved: true,
              });
            }}
            disabled={ownAmount === 0n}
            className="w-full"
            onTransactionConfirmed={() => refetchStakingApproval()}
          >
            Approve
          </TransactionButton>
        )}

        <TransactionButton
          transaction={() =>
            prepareContractCall({
              contract: contractStaking,
              method: "function withdraw(uint256, uint64)",
              params: [tool.id, BigInt(quantity)],
            })
          }
          disabled={stakedAmount === 0n}
          className="w-full"
          onTransactionConfirmed={() => queryClient.invalidateQueries()}
        >
          Unequip
        </TransactionButton>

        <TransactionButton
          transaction={() =>
            prepareContractCall({
              contract: contractStaking,
              method: "function claimRewards(uint256)",
              params: [tool.id],
            })
          }
          disabled={claimableRewards === 0n}
          className="w-full"
          onTransactionConfirmed={() => queryClient.invalidateQueries()}
        >
          Claim{" "}
          {claimableRewards
            ? `(${parseFloat(formatUnits(claimableRewards, 18)).toFixed(4)})`
            : ""}
        </TransactionButton>
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
