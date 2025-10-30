import { useToolCardLogic } from "@/hooks/useToolCardLogic";
import { ThirdwebContract, NFT } from "thirdweb";
import { client } from "@/lib/thirdweb/client";
import { MediaRenderer, TransactionButton } from "thirdweb/react";
import { formatUnits } from "viem";
import { setApprovalForAll } from "thirdweb/extensions/erc1155";
import { prepareContractCall } from "thirdweb";

interface ToolDetailModalProps {
  tool: NFT;
  address: string;
  usdcBalance: bigint;
  contractTools: ThirdwebContract;
  contractStaking: ThirdwebContract;
  onClose: () => void;
}

export function ToolDetailModal({
  tool,
  address,
  usdcBalance,
  contractTools,
  contractStaking,
  onClose,
}: ToolDetailModalProps) {
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

  const hasInsufficientFunds = usdcBalance < totalPrice;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 w-full max-w-sm mx-4 text-white"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="text-2xl leading-none">&times;</button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          </div>
        ) : (
          <>
            <MediaRenderer
              client={client}
              src={tool.metadata.image}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{tool.metadata.name}</h3>
            {tool.metadata.description && (
              <p className="text-sm text-neutral-300 mb-4">{tool.metadata.description}</p>
            )}

            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-neutral-300 mb-1">Quantity</label>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={1}
                className="w-full p-2 rounded-md bg-neutral-900 border border-neutral-600 text-white text-sm"
                placeholder="Quantity"
              />
            </div>

            <div className="flex flex-col mt-4 gap-2">
              <button
                onClick={handleBuy}
                disabled={!account || isBuying || hasInsufficientFunds}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuying ? "Processing..." : `Buy $${parseFloat(formatUnits(totalPrice, 6)).toFixed(2)} (Owned: ${ownAmount.toString()})`}
              </button>

              {isApprovedForStaking ? (
                <TransactionButton
                  transaction={handleStake}
                  disabled={ownAmount === 0n}
                  className="w-full"
                  onTransactionConfirmed={() => queryClient.invalidateQueries()}
                >
                  {`Equip (Owned: ${ownAmount.toString()})`}
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
                {`Unequip (Staked: ${stakedAmount.toString()})`}
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
          </>
        )}
      </div>
    </div>
  );
}