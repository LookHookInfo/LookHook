import { useActiveAccount } from "thirdweb/react";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { stakeRewardClaimContract, hashcoinContract } from "../utils/contracts";
import { prepareContractCall } from "thirdweb";

export const useStakeRewardClaim = () => {
    const account = useActiveAccount();
    const address = account?.address;

    const { data: canClaim, isLoading: isCanClaimLoading, refetch: refetchCanClaim } = useReadContract({
        contract: stakeRewardClaimContract,
        method: "canClaim",
        params: address ? [address] : [],
        queryOptions: {
            enabled: !!address,
        },
    });

    const { data: contractBalance, isLoading: isBalanceLoading } = useReadContract({
        contract: hashcoinContract,
        method: "balanceOf",
        params: [stakeRewardClaimContract.address],
    });

    const { mutate: sendTx, isPending: isClaiming } = useSendTransaction();

    const claimReward = () => {
        if (!canClaim || !account) return;
        const transaction = prepareContractCall({
            contract: stakeRewardClaimContract,
            method: "claim",
            params: [],
        });
        sendTx(transaction, {
            onSuccess: () => {
                refetchCanClaim();
            }
        });
    };

    return {
        canClaim,
        isCanClaimLoading,
        isClaiming,
        claimReward,
        rewardBalance: contractBalance,
        isBalanceLoading,
        refetchCanClaim,
    };
};