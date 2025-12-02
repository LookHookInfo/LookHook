import { useToolCardLogic } from '@/hooks/useToolCardLogic';
import { ThirdwebContract, NFT } from 'thirdweb';
import { client } from '@/lib/thirdweb/client';
import { MediaRenderer, TransactionButton } from 'thirdweb/react';
import { formatUnits } from 'viem';
import { setApprovalForAll } from 'thirdweb/extensions/erc1155';
import { prepareContractCall } from 'thirdweb';

interface ToolDetailModalProps {
  tool: NFT;
  address: string;
  usdcBalance: bigint;
  contractTools: ThirdwebContract;
  contractStaking: ThirdwebContract<any>;
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
    incrementQuantity,
    decrementQuantity,
  } = useToolCardLogic({ tool, address, contractTools, contractStaking });

  const hasInsufficientFunds = usdcBalance < totalPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
      <div
        className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 w-full max-w-sm mx-4 text-white"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          </div>
        ) : (
          <>
            <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
              <MediaRenderer client={client} src={tool.metadata.image} className="w-full h-full object-cover" />
              {/* Name Overlay */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-fit px-2 py-1 bg-gray-200 bg-opacity-75 rounded-lg text-center">
                <h3 className="text-xl font-bold text-gray-800 truncate">{tool.metadata.name}</h3>
              </div>
              {/* Description Overlay */}
              {tool.metadata.description && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-fit px-2 py-1 bg-gray-200 bg-opacity-75 rounded-lg text-center">
                  <p className="text-sm font-bold text-gray-800 truncate">{tool.metadata.description}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="px-3 py-1 border border-neutral-600 rounded-md text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-12 text-center text-white text-lg font-semibold">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="px-3 py-1 border border-neutral-600 rounded-md text-white hover:bg-neutral-700"
              >
                +
              </button>
            </div>

            <div className="flex flex-col mt-4 gap-2">
              {/* Buy Button */}
              <button
                onClick={handleBuy}
                disabled={!account || isBuying || hasInsufficientFunds}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuying ? 'Processing...' : `Buy $${parseFloat(formatUnits(totalPrice, 6)).toFixed(2)}`}
              </button>

              {/* Equip/Approve Button */}
              {isApprovedForStaking ? (
                <TransactionButton
                  transaction={() => handleStake(BigInt(quantity))}
                  disabled={ownAmount === 0n || quantity > ownAmount}
                  className="w-full justify-center px-4 py-2 text-sm font-medium bg-neutral-700 border border-neutral-600 text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
                  onTransactionConfirmed={() => queryClient.invalidateQueries()}
                >
                  Equip {ownAmount > 0n ? `(${ownAmount.toString()})` : ''}
                </TransactionButton>
              ) : (
                <TransactionButton
                  transaction={() => {
                    if (!account) throw new Error('Not connected');
                    return setApprovalForAll({
                      contract: contractTools,
                      operator: contractStaking.address,
                      approved: true,
                    });
                  }}
                  disabled={ownAmount === 0n}
                  className="w-full justify-center px-4 py-2 text-sm font-medium bg-neutral-700 border border-neutral-600 text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
                  onTransactionConfirmed={() => refetchStakingApproval()}
                >
                  Approve
                </TransactionButton>
              )}

              {/* Unequip Button */}
              <TransactionButton
                transaction={() =>
                  prepareContractCall({
                    contract: contractStaking,
                    method: 'function withdraw(uint256, uint64)',
                    params: [tool.id, BigInt(quantity)],
                  })
                }
                disabled={stakedAmount === 0n || quantity > stakedAmount}
                className="w-full justify-center px-4 py-2 text-sm font-medium bg-neutral-700 border border-neutral-600 text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
                onTransactionConfirmed={() => queryClient.invalidateQueries()}
              >
                Unequip {stakedAmount > 0n ? `(${stakedAmount.toString()})` : ''}
              </TransactionButton>

              {/* Claim Button */}
              <TransactionButton
                transaction={() =>
                  prepareContractCall({
                    contract: contractStaking,
                    method: 'function claimRewards(uint256)',
                    params: [tool.id],
                  })
                }
                disabled={claimableRewards === 0n}
                className="w-full justify-center px-4 py-2 text-sm font-medium bg-neutral-700 border border-neutral-600 text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
                onTransactionConfirmed={() => queryClient.invalidateQueries()}
              >
                Claim {claimableRewards ? `(${parseFloat(formatUnits(claimableRewards, 18)).toFixed(4)})` : ''}
              </TransactionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
