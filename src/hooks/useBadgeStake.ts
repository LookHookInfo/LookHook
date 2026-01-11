import { useActiveAccount } from "thirdweb/react";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { badgeStakeContract } from "../utils/contracts";
import { prepareContractCall } from "thirdweb";

export const useBadgeStake = () => {
    const account = useActiveAccount();
    const address = account?.address;

    const { data: isEligible, isLoading: isEligibilityLoading, refetch: refetchEligibility } = useReadContract({
        contract: badgeStakeContract,
        method: "isEligible",
        params: address ? [address] : [],
        queryOptions: {
            enabled: !!address,
        },
    });

    const { mutate: sendTx, isPending: isClaiming } = useSendTransaction();

    const claimBadge = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
        if (!isEligible || !account) return;
        const transaction = prepareContractCall({
            contract: badgeStakeContract,
            method: "claimBadge",
            params: [],
        });
        sendTx(transaction, {
            onSuccess: () => {
                refetchEligibility();
                onSuccess?.();
            }
        });
    };

    return {
        isEligible,
        isEligibilityLoading,
        isClaiming,
        claimBadge,
    };
};
