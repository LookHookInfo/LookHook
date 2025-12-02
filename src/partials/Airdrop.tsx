import { useActiveAccount } from 'thirdweb/react';
import { airdropContract } from '@/utils/contracts';
import { useReadContract } from 'thirdweb/react';
import { prepareContractCall, toEther, getContractEvents, prepareEvent } from 'thirdweb';
import { TransactionButton } from 'thirdweb/react';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { useState, useEffect } from 'react';

interface AirdropProps {
  className?: string;
}

export default function Airdrop({ className }: AirdropProps) {
  const account = useActiveAccount();
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [claimedCount, setClaimedCount] = useState<number | null>(null);

  const {
    data: userStatus,
    isLoading: isUserStatusLoading,
    refetch: refetchUserStatus,
  } = useReadContract({
    contract: airdropContract,
    method: 'getUserStatus',
    params: [account?.address || ''],
    queryOptions: { enabled: !!account },
  });

  const { data: claimDeadline } = useReadContract({
    contract: airdropContract,
    method: 'claimDeadline',
    params: [],
  });

  useEffect(() => {
    async function fetchClaimedCount() {
      const preparedEvent = prepareEvent({
        signature: 'event Claimed(address indexed user, uint256 amount)',
      });
      const events = await getContractEvents({
        contract: airdropContract,
        events: [preparedEvent],
      });
      setClaimedCount(events.length);
    }
    fetchClaimedCount();
  }, []);

  useEffect(() => {
    if (claimDeadline) {
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const deadline = Number(claimDeadline);
        const diff = deadline - now;

        if (diff <= 0) {
          setRemainingTime('Airdrop has ended');
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (60 * 60 * 24));
        const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((diff % (60 * 60)) / 60);
        const seconds = Math.floor(diff % 60);

        setRemainingTime(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [claimDeadline]);

  return (
    <div
      className={`w-full h-full text-white bg-neutral-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-neutral-700 flex flex-col ${className ?? ''}`}
    >
      <div className="flex-grow flex flex-col md:flex-row gap-8 items-start">
        {/* Image Block */}
        <div className="flex-shrink-0 w-40 h-40 relative">
          <div
            className="absolute -top-2 -left-2
                       bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                       text-white px-3 py-1 text-xs font-bold rounded-full
                       shadow-lg z-10"
          >
            Base
          </div>
          <img src="/assets/Airdrop.webp" alt="Airdrop" className="rounded-xl w-full h-full object-cover" />
          {claimedCount !== null && (
            <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-lg">
              🪂 {claimedCount}
            </span>
          )}
        </div>

        {/* Text Content Block */}
        <div className="flex-1 space-y-6 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-center flex-wrap gap-2 relative mb-4">
              <h2 className="text-3xl font-bold text-white line-clamp-1">Airdrop</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  first
                </span>
              </div>
            </div>

            <p className="text-neutral-400 text-sm line-clamp-3">
              Special airdrop for early participants (Zealy, Sea, Tips, Name). Review contract for details.
            </p>
          </div>

          <div className="mt-2 text-center text-xs font-medium text-gray-400 border border-gray-500 rounded-lg py-1.5 px-3">
            {remainingTime}
          </div>
        </div>
      </div>

      {/* Action Button Block */}
      <div className="mt-4 w-full">
        {account ? (
          isUserStatusLoading ? (
            <button disabled className="w-full py-3 rounded-lg transition btn-disabled">
              Loading...
            </button>
          ) : userStatus ? (
            userStatus[2] ? (
              <TransactionButton
                transaction={() =>
                  prepareContractCall({
                    contract: airdropContract,
                    method: 'claim',
                  })
                }
                onTransactionConfirmed={() => refetchUserStatus()}
                className="w-full py-3 rounded-lg transition !bg-[#4CAF50] !hover:bg-[#45a049] text-white"
              >
                {`Claim 🎉 ${toEther(userStatus[0])} HASH`}
              </TransactionButton>
            ) : userStatus[1] ? (
              <button disabled className="w-full py-3 rounded-lg transition btn-disabled">
                Claimed 🤝
              </button>
            ) : (
              <button disabled className="w-full py-3 rounded-lg transition btn-disabled">
                Not Eligible
              </button>
            )
          ) : (
            <button disabled className="w-full py-3 rounded-lg transition btn-disabled">
              Could not retrieve your status.
            </button>
          )
        ) : (
          <ConnectWalletButton />
        )}
      </div>
    </div>
  );
}
