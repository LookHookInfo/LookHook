import { useActiveAccount } from "thirdweb/react";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { badgeStakeContract } from "../utils/contracts";
import { prepareContractCall } from "thirdweb";
import { useQueryClient } from "@tanstack/react-query";

export const useBadgeStake = () => {
    const queryClient = useQueryClient();
    const account = useActiveAccount();
    const address = account?.address;

    const { data: isEligible, isLoading: isEligibilityLoading } = useReadContract({
        contract: badgeStakeContract,
        method: "isEligible",
        params: address ? [address] : [],
        queryOptions: {
            enabled: !!address,
            staleTime: 300000, // 5 minutes
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
                queryClient.invalidateQueries({ queryKey: [badgeStakeContract.address, "isEligible", address] });
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
