import { useEffect } from 'react';
import type { Wallet } from 'thirdweb/wallets';
import { useDisconnect } from 'thirdweb/react';

interface ProfileModalProps {
  wallet: Wallet;
  onClose: () => void;
  registeredName: string | null | undefined;
}

export default function ProfileModal({ wallet, onClose, registeredName }: ProfileModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  const { disconnect } = useDisconnect();
  const shortAddress = `${wallet.getAccount()?.address.slice(0, 6)}...${wallet.getAccount()?.address.slice(-4)}`;
  const displayName = registeredName ? `${registeredName}.hash` : shortAddress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onBackdropClick}>
      <div className="bg-neutral-900 text-neutral-200 max-w-md w-full max-h-[90vh] overflow-auto rounded-xl p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close modal"
        >
          <img src="/image.svg" alt="Close" className="w-8 h-8" />
        </button>
        <div className="space-y-6">
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-blue-400">Profile</h2>
            <p className="text-lg font-mono" title={wallet.getAccount()?.address}>
              {displayName}
            </p>
          </section>

          <div className="border-t border-neutral-700"></div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={async () => {
                await disconnect(wallet);
                onClose();
              }}
              className="px-8 py-2.5 font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all border border-red-500 hover:border-red-600 shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 active:scale-95"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
