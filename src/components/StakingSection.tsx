import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import ConnectWalletButton from './ConnectWalletButton';
import UserStakesDisplay from './UserStakesDisplay';
import { Status } from '../hooks/useStakeContract';
import { UserStakes } from './UserStakesDisplay'; // Import UserStakes from its new location

interface StakingSectionProps {
  className?: string;
  tokenSymbol: string | undefined;
  stakeAPY: bigint | undefined;
  walletBalance: string | undefined;
  stakedBalance: string | undefined;
  userStakes: UserStakes | undefined;
  apr3M: bigint | undefined;
  apr6M: bigint | undefined;
  apr12M: bigint | undefined;
  isApproved: (amount: string) => boolean;
  status: Status;
  setStatus: (status: Status) => void;
  // Transaction functions
  stake: (amount: string, tierId: number) => Promise<void>;
  unstake: (tierId: number) => Promise<void>;
  claim: (tierId: number) => Promise<void>;
  // Granular pending states
  isStakingPending: boolean;
  isUnstakingPending: boolean;
  isClaimingRewardsPending: boolean;
}

export function StakingSection({
  className,
  tokenSymbol,
  walletBalance,
  stakedBalance,
  userStakes,
  apr3M,
  apr6M,
  apr12M,
  isApproved,
  status,
  setStatus,
  stake,
  unstake,
  claim,
  isStakingPending,
  isUnstakingPending,
  isClaimingRewardsPending,
}: StakingSectionProps) {
  const account = useActiveAccount();
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  // Removed useEffect for refreshBalances as invalidation is handled in hook

  return (
    <section className={`w-full px-4 py-8 text-white ${className ?? ''}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6 w-full">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-white flex items-center">Stake</h2>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 border border-neutral-700 rounded-md flex items-center justify-center">
                  <span className="font-bold text-sm text-neutral-400 mr-1">Hashcoin:</span>
                  <span className="text-white font-semibold text-sm mr-2">0x..445</span>
                  <button
                    className="text-gray-400 hover:text-white dark:hover:text-neutral-200 focus:outline-none"
                    onClick={() => {
                      navigator.clipboard.writeText('0xA9B631ABcc4fd0bc766d7C0C8fCbf866e2bB0445');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
                    }}
                    title="Copy contract address"
                  >
                    {copied ? (
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2.286a1 1 0 01.714 1.714L17 10m0 0l-3.143 3.143a1 1 0 01-1.714-.714L14 10m0 0H8"
                        ></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 space-y-2 border border-neutral-700">
              <p className="text-sm text-neutral-400">
                Wallet balance:{' '}
                <span className="text-white font-semibold">
                  {walletBalance || '0'} {tokenSymbol || ''}
                </span>
              </p>
              <p className="text-sm text-neutral-400">
                Staked balance:{' '}
                <span className="text-white font-semibold">
                  {stakedBalance || '0'} {tokenSymbol || ''}
                </span>
              </p>
            </div>

            <div className="w-full mb-4">
              <div className="flex items-center bg-black/30 border border-neutral-700 rounded-lg p-1">
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Balance: ${walletBalance || '0'} ${tokenSymbol || ''}`}
                  className="flex-grow p-2 bg-transparent outline-none text-white text-lg w-full no-spin-buttons"
                />
                <button
                  onClick={() => setAmount(walletBalance)}
                  className="bg-neutral-700 text-white font-bold py-2 px-4 rounded-md"
                >
                  MAX
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={amount && walletBalance ? Math.floor((Number(amount) / Number(walletBalance)) * 100) : 0}
                onChange={(e) => {
                  const percentage = Number(e.target.value);
                  const maxAmount = Number(walletBalance);
                  setAmount(String(Math.floor((maxAmount * percentage) / 100)));
                }}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer mt-2"
              />
            </div>

            {!account ? (
              <ConnectWalletButton />
            ) : userStakes && apr3M !== undefined && apr6M !== undefined && apr12M !== undefined ? (
              <UserStakesDisplay
                userStakes={userStakes}
                apr3M={apr3M}
                apr6M={apr6M}
                apr12M={apr12M}
                amount={amount}
                tokenSymbol={tokenSymbol}
                isApproved={isApproved}
                status={status}
                setStatus={setStatus}
                stake={stake}
                unstake={unstake}
                claim={claim}
                isStakingPending={isStakingPending}
                isUnstakingPending={isUnstakingPending}
                isClaimingRewardsPending={isClaimingRewardsPending}
              />
            ) : (
              <p className="text-center text-neutral-400">Loading staking data...</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}