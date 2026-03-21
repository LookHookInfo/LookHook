import { useToolCardLogic } from '@/hooks/useToolCardLogic';
import { ThirdwebContract, NFT } from 'thirdweb';
import { client } from '@/lib/thirdweb/client';
import { MediaRenderer } from 'thirdweb/react';
import { formatUnits, encodeFunctionData } from 'viem';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contractStaking, contractTools } from '../utils/contracts';
import { miningPublicClient } from '../lib/viem/client';
import { contractToolsAbi } from '../utils/contractToolsAbi';
import { contractStakingAbi } from '../utils/contractStakingAbi';


interface ToolDetailModalProps {
  tool: NFT;
  address: string;
  usdcBalance: bigint;
  onClose: () => void;
}

export function ToolDetailModal({ tool, address, usdcBalance, onClose }: ToolDetailModalProps) {
  const {
    quantity,
    account,
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
    isPurchaseEnabled,
    isSoldOut,
    hasEnoughUSDC,
    handleWithdraw,
    handleClaimRewards,
    isWithdrawing,
    isClaiming,
  } = useToolCardLogic({ tool, address, usdcBalance });

  const queryClient = useQueryClient();

  const approveStakingMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Not connected');

      const data = encodeFunctionData({
        abi: contractToolsAbi,
        functionName: 'setApprovalForAll',
        args: [contractStaking.address as `0x${string}`, true],
      });

      const { transactionHash } = await account.sendTransaction({
        to: contractTools.address as `0x${string}`,
        data,
        chainId: 8453,
      });
      return miningPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
    },
    onSuccess: () => {
      refetchStakingApproval();
    },
    onError: (error) => {
      console.error('❌ Failed to approve for staking:', error);
    },
  });


  const getBuyButtonText = () => {
    if (isSoldOut) return 'Sold Out';
    if (totalPrice > 0n) return `Buy $${parseFloat(formatUnits(totalPrice, 6)).toFixed(2)}`;
    return 'Unavailable';
  };


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
                disabled={!isPurchaseEnabled || isBuying}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuying ? 'Processing...' : getBuyButtonText()}
              </button>

              {/* Equip/Approve Button */}
              {isApprovedForStaking ? (
                <button
                  onClick={() => handleStake(BigInt(quantity))}
                  disabled={ownAmount === 0n || quantity > ownAmount || isBuying}
                  className="w-full justify-center px-4 py-2 text-sm font-medium bg-neutral-700 border border-neutral-600 text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
                >
                  Equip {ownAmount > 0n ? `(${ownAmount.toString()})` : ''}
                </button>
              ) : (
                <button
                  onClick={() => approveStakingMutation.mutate()}
                  disabled={ownAmount === 0n || approveStakingMutation.isPending}
                  className="w-full justify-center px-4 py-2 text-sm font-medium bg-neutral-700 border border-neutral-600 text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
                >
                  {approveStakingMutation.isPending ? 'Approving...' : 'Approve'}
                </button>
              )}

              {/* Unequip Button */}
              <button
                onClick={() => handleWithdraw(BigInt(quantity))}
                disabled={stakedAmount === 0n || quantity > stakedAmount || isWithdrawing}
                className="w-full justify-center px-4 py-2 text-sm font-medium bg-neutral-700 border border-neutral-600 text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
              >
                {isWithdrawing ? 'Unequipping...' : `Unequip ${stakedAmount > 0n ? `(${stakedAmount.toString()})` : ''}`}
              </button>

              {/* Claim Button */}
              <button
                onClick={handleClaimRewards}
                disabled={claimableRewards === 0n || isClaiming}
                className="w-full justify-center px-4 py-2 text-sm font-medium bg-neutral-700 border border-neutral-600 text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
              >
                {isClaiming ? 'Claiming...' : `Claim ${claimableRewards ? `(${parseFloat(formatUnits(claimableRewards, 18)).toFixed(4)})` : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
