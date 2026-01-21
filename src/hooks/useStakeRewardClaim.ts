import { useState, useCallback, useMemo } from 'react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { stakeRewardClaimContract, hashcoinContract } from '../utils/contracts';
import { prepareContractCall, readContract, waitForReceipt } from 'thirdweb';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import type { ThirdwebContract } from 'thirdweb';

// Helper function from optimization plan to structure queries (copied from useStakeContract)
const createThirdwebQuery = ({
  contract,
  method,
  params = [],
  queryOptions = {},
}: {
  contract: ThirdwebContract<any>;
  method: string;
  params?: unknown[];
  queryOptions?: object;
}) => {
  const queryKey = [contract.chain.id, contract.address, method, params];
  return {
    queryKey,
    queryFn: () => readContract({ contract, method, params } as any),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Prevent refetching on window focus
    ...queryOptions,
  };
};

export const useStakeRewardClaim = () => {
    const account = useActiveAccount();
    const queryClient = useQueryClient();
    const { mutateAsync: sendTx } = useSendTransaction();
    const accountAddress = account?.address || '0x0000000000000000000000000000000000000000';

    const [isClaiming, setIsClaiming] = useState(false);

    const queries = useMemo(() => {
      return [
        // 0: canClaim (stakeRewardClaimContract.canClaim)
        createThirdwebQuery({
            contract: stakeRewardClaimContract,
            method: 'canClaim',
            params: [accountAddress],
            queryOptions: { enabled: !!account?.address },
        }),
        // 1: contractBalance (hashcoinContract.balanceOf)
        createThirdwebQuery({
            contract: hashcoinContract,
            method: 'balanceOf',
            params: [stakeRewardClaimContract.address],
        }),
      ];
    }, [account?.address, accountAddress]);

    const queryResults = useQueries({
      queries,
      combine: (results) => {
        return {
          canClaim: results[0],
          contractBalance: results[1],
          isLoading: results.some((res) => res.isLoading),
        };
      },
    });

    const {
      canClaim: canClaimResult,
      contractBalance: contractBalanceResult,
      isLoading: areQueriesLoading,
    } = queryResults;

    const canClaim = canClaimResult.data as boolean | undefined;
    const rewardBalance = contractBalanceResult.data as bigint | undefined;

    const invalidateRewardClaimQueries = useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queries[0].queryKey }); // canClaim
      queryClient.invalidateQueries({ queryKey: queries[1].queryKey }); // contractBalance
      // Also invalidate user's HASH balance if it changes after claiming rewards
      queryClient.invalidateQueries({ 
        queryKey: [hashcoinContract.chain.id, hashcoinContract.address, 'balanceOf', [accountAddress]]
      });
    }, [queryClient, queries, accountAddress]);

    const claimReward = useCallback(async () => {
        if (!canClaim || !account) {
          console.error("Cannot claim: missing eligibility or wallet not connected.");
          return;
        }

        setIsClaiming(true);
        try {
            const transaction = prepareContractCall({
                contract: stakeRewardClaimContract,
                method: "claim",
                params: [],
            });
            const { transactionHash } = await sendTx(transaction);
            await waitForReceipt({
                transactionHash,
                chain: stakeRewardClaimContract.chain,
                client: stakeRewardClaimContract.client,
            });
            invalidateRewardClaimQueries();
        } catch (error) {
            console.error('Error claiming reward:', error);
        } finally {
            setIsClaiming(false);
        }
    }, [canClaim, account, sendTx, invalidateRewardClaimQueries]);

    return {
        canClaim,
        isCanClaimLoading: areQueriesLoading,
        isClaiming,
        claimReward,
        rewardBalance,
        isBalanceLoading: areQueriesLoading,
        refetchCanClaim: invalidateRewardClaimQueries, // This now invalidates instead of refetching a single query
    };
};