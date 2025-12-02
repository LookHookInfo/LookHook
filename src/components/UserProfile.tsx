import { useState } from 'react';
import { useActiveWallet, useReadContract } from 'thirdweb/react';
import { ConnectButton } from 'thirdweb/react';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';
import ProfileModal from './ProfileModal';
import { nftCollectionContract, whaleContract } from '../utils/contracts';
import { useNameContract } from '../hooks/useNameContract';

export default function UserProfile() {
  const wallet = useActiveWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const account = wallet?.getAccount();

  const { registeredName } = useNameContract(() => {});

  const balanceOfAbi = {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ type: 'address', name: 'owner' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  } as const;

  const { data: balance, isLoading: isNftBalanceLoading } = useReadContract({
    contract: nftCollectionContract,
    method: balanceOfAbi,
    params: [account?.address || ''],
    queryOptions: {
      enabled: !!account,
    },
  });

  const { data: whaleContractData } = useReadContract({
    contract: whaleContract,
    method: 'getUserStatus',
    params: [account?.address || ''],
    queryOptions: {
      enabled: !!account,
    },
  });

  const hasCatNft = !!(balance && balance > 0n);

  const canMintDolphin = whaleContractData ? whaleContractData[1] : false;
  const hasDolphin = whaleContractData ? whaleContractData[4] : false;
  const canMintShark = whaleContractData ? whaleContractData[2] : false;
  const hasShark = whaleContractData ? whaleContractData[5] : false;
  const canMintWhale = whaleContractData ? whaleContractData[3] : false;
  const hasWhale = whaleContractData ? whaleContractData[6] : false;

  const shouldGlow = (canMintDolphin && !hasDolphin) || (canMintShark && !hasShark) || (canMintWhale && !hasWhale);

  if (!wallet) {
    return (
      <div className="inline-flex justify-center items-center text-sm font-semibold rounded-lg border border-gray-200 text-white hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
        <ConnectButton
          client={client}
          chain={chain}
          appMetadata={{
            name: 'LookHook App',
            url: 'https://lookhook.info',
          }}
        />
      </div>
    );
  }

  const shortAddress = account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : '';
  const displayName = registeredName ? `${registeredName}.hash` : shortAddress;

  let iconToDisplay;
  if (isNftBalanceLoading) {
    iconToDisplay = <div className="size-5 rounded-full bg-neutral-700 animate-pulse" />;
  } else if (hasCatNft) {
    iconToDisplay = <img src="/assets/Cat.webp" alt="User NFT" className="size-5 rounded-full" />;
  } else {
    iconToDisplay = (
      <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 3c-3.86 0-7 1.69-7 3.79V20h14v-3.21C19 14.69 15.86 13 12 13z" />
      </svg>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-x-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-white hover:bg-gray-700 transition-colors dark:border-neutral-700 dark:hover:bg-neutral-700 ${shouldGlow ? 'glow-effect' : ''}`}
      >
        {iconToDisplay}
        <span className="font-mono">{displayName}</span>
        <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {isModalOpen && (
        <ProfileModal
          wallet={wallet}
          onClose={() => setIsModalOpen(false)}
          hasCatNft={hasCatNft}
          isNftLoading={isNftBalanceLoading}
          registeredName={registeredName}
        />
      )}
    </>
  );
}
