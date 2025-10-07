import { useEffect, useMemo, useState, useCallback } from "react";
import { useActiveWallet, useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { earlyBirdContract } from "../utils/contracts";
import { client } from "../lib/thirdweb/client";
import { chain } from "../lib/thirdweb/chain";

// --- ABI Snippets ---
const isClaimOpenAbi = { type: "function", name: "isClaimOpen", inputs: [], outputs: [{ type: "bool" }], stateMutability: "view" } as const;
const hasClaimedAbi = { type: "function", name: "hasClaimed", inputs: [{ type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" } as const;
const claimDeadlineAbi = { type: "function", name: "CLAIM_DEADLINE", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" } as const;
const claimAbi = { type: "function", name: "claim", inputs: [{ internalType: "uint256[]", name: "tokenIds", type: "uint256[]" }], outputs: [], stateMutability: "nonpayable" } as const;
const getStakingContractAddressAbi = { type: "function", name: "stakingContract", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" } as const;
const getStakeInfoForTokenAbi = {
  type: "function", name: "getStakeInfoForToken",
  inputs: [{ type: "uint256", name: "_tokenId" }, { type: "address", name: "_staker" }],
  outputs: [{ type: "uint256", name: "_tokensStaked" }, { type: "uint256", name: "_rewards" }],
  stateMutability: "view"
} as const;

const TOKEN_IDS_TO_CHECK = [0n, 1n, 2n, 3n, 4n, 5n];

// --- Inner Component (handles the main logic) ---
const ClaimButtonInner = ({ 
  stakingContractAddress, 
  address, 
  variant 
}: { 
  stakingContractAddress: string; 
  address: string; 
  variant: 'default' | 'minimal';
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { mutateAsync: sendTx, isPending } = useSendTransaction();

  // --- Base contract reads ---
  const { data: claimDeadline, isLoading: isDeadlineLoading } = useReadContract({ contract: earlyBirdContract, method: claimDeadlineAbi });
  const { data: isClaimOpen, isLoading: isClaimOpenLoading } = useReadContract({ contract: earlyBirdContract, method: isClaimOpenAbi });
  const { data: hasClaimed, isLoading: hasClaimedLoading, refetch: refetchHasClaimed } = useReadContract({ contract: earlyBirdContract, method: hasClaimedAbi, params: [address], queryOptions: { enabled: !!address } });

  // --- Staking contract logic ---
  const stakingContract = useMemo(() => {
    return getContract({ client, chain: chain, address: stakingContractAddress });
  }, [stakingContractAddress]);

  // Explicitly call hooks for each token ID to respect the Rules of Hooks
  const { data: stakeInfo0, isLoading: isLoading0 } = useReadContract({ contract: stakingContract, method: getStakeInfoForTokenAbi, params: [TOKEN_IDS_TO_CHECK[0], address], queryOptions: { enabled: !!address } });
  const { data: stakeInfo1, isLoading: isLoading1 } = useReadContract({ contract: stakingContract, method: getStakeInfoForTokenAbi, params: [TOKEN_IDS_TO_CHECK[1], address], queryOptions: { enabled: !!address } });
  const { data: stakeInfo2, isLoading: isLoading2 } = useReadContract({ contract: stakingContract, method: getStakeInfoForTokenAbi, params: [TOKEN_IDS_TO_CHECK[2], address], queryOptions: { enabled: !!address } });
  const { data: stakeInfo3, isLoading: isLoading3 } = useReadContract({ contract: stakingContract, method: getStakeInfoForTokenAbi, params: [TOKEN_IDS_TO_CHECK[3], address], queryOptions: { enabled: !!address } });
  const { data: stakeInfo4, isLoading: isLoading4 } = useReadContract({ contract: stakingContract, method: getStakeInfoForTokenAbi, params: [TOKEN_IDS_TO_CHECK[4], address], queryOptions: { enabled: !!address } });
  const { data: stakeInfo5, isLoading: isLoading5 } = useReadContract({ contract: stakingContract, method: getStakeInfoForTokenAbi, params: [TOKEN_IDS_TO_CHECK[5], address], queryOptions: { enabled: !!address } });

  const allStakeInfos = [stakeInfo0, stakeInfo1, stakeInfo2, stakeInfo3, stakeInfo4, stakeInfo5];
  const isStakeInfoLoading = isLoading0 || isLoading1 || isLoading2 || isLoading3 || isLoading4 || isLoading5;

  const totalRewards = allStakeInfos.reduce((acc, query) => {
    if (query && query[1]) {
      return acc + query[1];
    }
    return acc;
  }, 0n);

  const hasEnoughHash = totalRewards >= toWei("1");

  const handleClaim = useCallback(async () => {
    try {
      const transaction = await prepareContractCall({ 
        contract: earlyBirdContract, 
        method: claimAbi, 
        params: [TOKEN_IDS_TO_CHECK] 
      });
      await sendTx(transaction);
      refetchHasClaimed(); // Refetch claim status after transaction
    } catch (error) {
      console.error("Claim failed", error);
    }
  }, [sendTx, refetchHasClaimed]);

  useEffect(() => {
    if (!claimDeadline) return;
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = Number(claimDeadline) - now;
      setTimeLeft(difference > 0 ? difference : 0);
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [claimDeadline]);

  const days = Math.floor(timeLeft / (60 * 60 * 24));
  const hours = Math.floor((timeLeft % (60 * 60 * 24)) / (60 * 60));

  const isLoading = isDeadlineLoading || isClaimOpenLoading || hasClaimedLoading || isStakeInfoLoading;
  const isButtonDisabled = isLoading || isPending || !isClaimOpen || hasClaimed || !hasEnoughHash;

  let buttonContent: React.ReactNode = "Claim Early NFT";
  if (isPending) {
    buttonContent = (
      <span className="flex items-center justify-center">
        <span className="animate-spin mr-2">⏳</span>
        Processing...
      </span>
    );
  } else if (isLoading) {
    buttonContent = "Loading...";
  } else if (!isClaimOpen && timeLeft <= 0) {
    buttonContent = "Claim ended";
  }

  let tooltip = "Claim your Early NFT";
  if (isButtonDisabled && !hasClaimed) {
    if (isLoading) tooltip = "Loading...";
    else if (isPending) tooltip = "Processing transaction...";
    else if (!isClaimOpen && timeLeft <= 0) tooltip = "Claim period is over";
    else if (!hasEnoughHash) tooltip = "Get 1 HASH token using mining.";
  } else if (hasClaimed) {
    tooltip = "You have already claimed this NFT";
  }

  if (variant === 'minimal') {
    // Special case for claimed state
    if (hasClaimed) {
      return (
        <div className="flex items-center justify-center gap-2" title={tooltip}>
            <div className="inline-flex items-center justify-center cursor-not-allowed px-3 py-1.5 text-sm font-medium rounded-lg border border-green-500 text-green-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Claimed
            </div>
            {timeLeft > 0 && (
              <div className="flex items-center text-sm font-medium text-white pointer-events-none">
                <span className="mr-1">⏳</span>
                <span>{days}d {hours}h</span>
              </div>
            )}
            <a href="https://opensea.io/collection/earlyhash" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-lg border border-neutral-700 text-white bg-neutral-800 hover:bg-neutral-700 transition-colors" title="View on OpenSea">
              <img src="/Sea.webp" alt="OpenSea" className="w-6 h-6" />
            </a>
        </div>
      );
    }
    // Default case for minimal variant
    return (
      <div className="flex items-center justify-center gap-2" title={tooltip}>
        <button
          onClick={handleClaim}
          disabled={isButtonDisabled}
          className={`inline-flex items-center justify-center cursor-pointer px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed`}>
          {buttonContent}
        </button>
        {timeLeft > 0 && (
          <div className="flex items-center text-sm font-medium text-white pointer-events-none">
            <span className="mr-1">⏳</span>
            <span>{days}d {hours}h</span>
          </div>
        )}
        <a href="https://opensea.io/collection/earlyhash" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-lg border border-neutral-700 text-white bg-neutral-800 hover:bg-neutral-700 transition-colors" title="View on OpenSea">
          <img src="/Sea.webp" alt="OpenSea" className="w-6 h-6" />
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2" title={tooltip}>
      <button
        onClick={handleClaim}
        disabled={isButtonDisabled}
        className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors border border-blue-500 hover:border-blue-600 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {buttonContent}
      </button>
      {timeLeft > 0 && (
        <div className="flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-neutral-700 text-white bg-neutral-800">
          <span className="mr-1">⏳</span>
          <span>{days}d {hours}h</span>
        </div>
      )}
      <a href="https://opensea.io/collection/0xce7d17ddEeBA3E62D9561a5Cb0A4c66c5BB270d2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border border-neutral-700 text-white bg-neutral-800 hover:bg-neutral-700 transition-colors" title="View on OpenSea">
        <img src="/Sea.webp" alt="OpenSea" className="w-8 h-8" />
      </a>
    </div>
  );
}

// --- Outer Component (handles loading the staking contract address) ---
export default function EarlyBirdClaimButton({ variant = 'default' }: { variant?: 'default' | 'minimal' }) {
  const wallet = useActiveWallet();
  const address = wallet?.getAccount()?.address;

  const { data: stakingContractAddress, isLoading: isStakingAddrLoading } = useReadContract({ contract: earlyBirdContract, method: getStakingContractAddressAbi });

  if (isStakingAddrLoading || !address || !stakingContractAddress) {
    // Render a disabled loading state until we have the contract address and user address
    const tooltip = isStakingAddrLoading ? "Loading..." : "Connect wallet to claim";
    const buttonText = isStakingAddrLoading ? "Loading..." : "Claim Early NFT";

    if (variant === 'minimal') {
        return (
            <div className="flex items-center justify-center gap-2" title={tooltip}>
              <div className={`relative inline-flex items-center justify-center cursor-not-allowed opacity-50 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-white dark:border-neutral-700 transition-colors`}>
                <span className="z-0 pointer-events-none">{buttonText}</span>
              </div>
            </div>
          );
    }

    return (
      <div className="flex items-center justify-center gap-2" title={tooltip}>
        <button
          disabled
          className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonText}
        </button>
      </div>
    );
  }

  return <ClaimButtonInner stakingContractAddress={stakingContractAddress!} address={address} variant={variant} />;
}
