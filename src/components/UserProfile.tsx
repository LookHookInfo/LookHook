import { useState } from 'react';
import { useActiveWallet } from 'thirdweb/react';
import { ConnectButton } from 'thirdweb/react';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';
import ProfileModal from './ProfileModal';
import { useNameContract } from '../hooks/useNameContract';

export default function UserProfile() {
  const wallet = useActiveWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const account = wallet?.getAccount();

  const { registeredName } = useNameContract();

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

  const iconToDisplay = <img src="/assets/Cat.webp" alt="User Avatar" className="size-5 rounded-full" />;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-x-2 px-4 py-2 text-sm font-semibold rounded-lg border border-neutral-700 text-white hover:bg-neutral-800 transition-colors"
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
          registeredName={registeredName}
        />
      )}
    </>
  );
}
