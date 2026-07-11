import { useActiveAccount } from 'thirdweb/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { encodeFunctionData } from 'viem';
import { dswNftContract } from '@/utils/contracts';
import { hashAchievementNFTsAbi } from '@/utils/hashAchievementNFTsAbi';
import { dropPublicClient } from '@/lib/viem/client';

// Маппинг achievementId → имя функции минта
const ACHIEVEMENT_MINT_FN: Record<number, 'mintDolphin' | 'mintShark' | 'mintWhale'> = {
  10: 'mintDolphin',
  11: 'mintShark',
  12: 'mintWhale',
};

const DSW_NFT_ADDRESS = dswNftContract.address as `0x${string}`;

export function useAchievementNFTClaim() {
  const account = useActiveAccount();
  const address = account?.address as `0x${string}` | undefined;
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: async (achievementId: bigint) => {
      if (!account) throw new Error('Wallet not connected');

      const fnName = ACHIEVEMENT_MINT_FN[Number(achievementId)];
      if (!fnName) throw new Error('Invalid achievement ID');

      const data = encodeFunctionData({
        abi: hashAchievementNFTsAbi,
        functionName: fnName,
      });

      const { transactionHash } = await account.sendTransaction({
        to: DSW_NFT_ADDRESS,
        data,
        chainId: 8453,
      });

      return dropPublicClient.waitForTransactionReceipt({ hash: transactionHash });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAchievements', address] });
    },
  });

  return {
    claimNFT: (id: bigint) => claimMutation.mutate(id),
    isClaiming: claimMutation.isPending,
    claimError: claimMutation.error,
  };
}
