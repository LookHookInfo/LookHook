import { ConnectButton } from 'thirdweb/react';
import { client } from '../lib/thirdweb/client';
import { chain } from '../lib/thirdweb/chain';

export default function ConnectWalletButton() {
  return (
    <div className="inline-flex justify-center items-center text-sm font-semibold rounded-lg border border-gray-200 text-white hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
      <ConnectButton
        client={client}
        chain={chain}
        appMetadata={{
          name: 'LookHook App',
          url: 'https://example.com', // Replace with your app's URL
        }}
      />
    </div>
  );
}
