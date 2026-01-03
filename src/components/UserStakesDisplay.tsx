import { useState } from 'react';
import { useSendAndConfirmTransaction, TransactionButton } from 'thirdweb/react';
import { prepareContractCall, toWei } from 'thirdweb';
import { stakingContract, hashcoinContract } from '../utils/contracts';
import { Status } from '../hooks/useStakeContract'; // Import Status

const formatRemainingTime = (remainingSeconds: bigint) => {
  if (remainingSeconds <= 0n) return 'Finished';
  const days = remainingSeconds / BigInt(86400);
  const hours = (remainingSeconds % BigInt(86400)) / BigInt(3600);
  const minutes = (remainingSeconds % BigInt(3600)) / BigInt(60);
  return `${days}d ${hours}h ${minutes}m`;
};

interface TierDisplayProps {
  tierId: number;
  tierName: string;
  stakeData: {
    amount: bigint;
    rewards: bigint;
    timeLeft: bigint;
  };
  amount: string;
  refreshBalances: () => void;
  refetchAllowance: () => void;
  isApproved: (amount: string) => boolean;
  apr: bigint; // Keep as bigint, convert to number for display
  tokenSymbol: string;
  setStatus: (status: Status) => void;
  status: Status; // Added missing status prop
  showQuestTooltip?: boolean; // New prop
}

function TierDisplay({
  tierId,
  tierName,
  stakeData,
  amount,
  refreshBalances,
  refetchAllowance,
  isApproved,
  apr,
  tokenSymbol,
  setStatus,
  showQuestTooltip,
}: TierDisplayProps) {
  const { mutateAsync: sendAndConfirm } = useSendAndConfirmTransaction();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStaking = async () => {
    if (!amount || Number(amount) <= 0) return;
    setIsProcessing(true);
    setStatus('pending');
    try {
      const amountWei = toWei(amount);
      if (!isApproved(amount)) {
        const approveTx = prepareContractCall({
          contract: hashcoinContract,
          method: 'approve',
          params: [stakingContract.address, amountWei],
        });
        await sendAndConfirm(approveTx);
        refetchAllowance();
      }

      const stakeTx = prepareContractCall({
        contract: stakingContract,
        method: 'stake',
        params: [amountWei, tierId],
      });
      await sendAndConfirm(stakeTx);
      refreshBalances();
      setStatus('success');
    } catch (err) {
      console.error('Staking error:', err);
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const isStaked = stakeData.amount > 0n;

  return (
    <div className="bg-neutral-900 rounded-lg p-4 flex flex-col justify-between w-full">
      <div>
        <h3 className="text-lg font-bold text-green-400 flex items-center">
          {apr ? (Number(apr) / 100).toFixed(2) : 0}% APR
          {showQuestTooltip && (
            <span className="ml-2 relative group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4 text-amber-700 cursor-pointer drop-shadow-lg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-max bg-neutral-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Lock 50K+ HASH to get a Stake Role
              </span>{' '}
            </span>
          )}
        </h3>
        <p className="text-sm text-neutral-400">
          Staked: {(stakeData.amount / BigInt(10 ** 18)).toString()} {tokenSymbol}
        </p>
        <p className="text-sm text-neutral-400">
          Remaining: {isStaked ? formatRemainingTime(stakeData.timeLeft) : 'N/A'}
        </p>
      </div>
      <div className="mt-4">
        {isStaked ? (
          <div className="flex flex-col gap-2 items-center">
            {stakeData.timeLeft <= 0n && stakeData.rewards <= 0n ? (
              <TransactionButton
                transaction={() =>
                  prepareContractCall({ contract: stakingContract, method: 'unstake', params: [tierId] })
                }
                onTransactionConfirmed={() => {
                  refreshBalances();
                }}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  height: '40px',
                  width: '150px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: '10px 20px',
                  border: 'none',
                  boxShadow: '0 0 15px rgba(76, 175, 80, 0.6)' /* Green glow */,
                  transition: 'box-shadow 0.3s ease-in-out',
                }}
              >
                Unstake
              </TransactionButton>
            ) : (

              <TransactionButton
                transaction={() =>
                  prepareContractCall({ contract: stakingContract, method: 'claimReward', params: [tierId] })
                }
                onTransactionConfirmed={() => refreshBalances()}
                style={{
                  background: 'linear-gradient(90deg, #007bff, #00c6ff)',
                  color: 'white',
                  height: '40px',
                  width: '150px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: '10px 20px',
                  border: 'none',
                  boxShadow: '0 0 15px rgba(0, 198, 255, 0.6)',
                  transition: 'box-shadow 0.3s ease-in-out',
                }}
                disabled={stakeData.rewards <= 0n}
              >
                {Math.floor(Number(stakeData.rewards / BigInt(10 ** 18)))} {tokenSymbol}
              </TransactionButton>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleStaking}
              disabled={isProcessing || !amount || Number(amount) <= 0}
              className="btn-claim"
            >
              {isProcessing ? 'Processing...' : tierName}
            </button>{' '}
          </div>
        )}
      </div>
    </div>
  );
}

export type UserStakes = readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

interface UserStakesDisplayProps {
  userStakes: UserStakes;
  apr3M: bigint;
  apr6M: bigint;
  apr12M: bigint;
  amount: string;
  tokenSymbol: string;
  refreshBalances: () => void;
  refetchAllowance: () => void;
  isApproved: (amount: string) => boolean;
  status: Status; // Add status
  setStatus: (status: Status) => void; // Add setStatus
}

export default function UserStakesDisplay({
  userStakes,
  apr3M,
  apr6M,
  apr12M,
  amount,
  tokenSymbol,
  refreshBalances,
  refetchAllowance,
  isApproved,
  status,
  setStatus,
}: UserStakesDisplayProps) {
  let s3 = { amount: 0n, rewards: 0n, timeLeft: 0n };
  let s6 = { amount: 0n, rewards: 0n, timeLeft: 0n };
  let s12 = { amount: 0n, rewards: 0n, timeLeft: 0n };

  if (userStakes) {
    s3 = {
      amount: BigInt(userStakes[0] || 0n),
      rewards: BigInt(userStakes[1] || 0n),
      timeLeft: BigInt(userStakes[2] || 0n),
    };
    s6 = {
      amount: BigInt(userStakes[3] || 0n),
      rewards: BigInt(userStakes[4] || 0n),
      timeLeft: BigInt(userStakes[5] || 0n),
    };
    s12 = {
      amount: BigInt(userStakes[6] || 0n),
      rewards: BigInt(userStakes[7] || 0n),
      timeLeft: BigInt(userStakes[8] || 0n),
    };
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <TierDisplay
        tierId={1}
        tierName="3 Month"
        stakeData={s3}
        apr={apr3M}
        amount={amount}
        tokenSymbol={tokenSymbol}
        refreshBalances={refreshBalances}
        refetchAllowance={refetchAllowance}
        isApproved={isApproved}
        status={status}
        setStatus={setStatus}
      />
      <TierDisplay
        tierId={2}
        tierName="6 Month"
        stakeData={s6}
        apr={apr6M}
        amount={amount}
        tokenSymbol={tokenSymbol}
        refreshBalances={refreshBalances}
        refetchAllowance={refetchAllowance}
        isApproved={isApproved}
        status={status}
        setStatus={setStatus}
      />
      <TierDisplay
        tierId={3}
        tierName="12 Month"
        stakeData={s12}
        apr={apr12M}
        amount={amount}
        tokenSymbol={tokenSymbol}
        refreshBalances={refreshBalances}
        refetchAllowance={refetchAllowance}
        isApproved={isApproved}
        status={status}
        setStatus={setStatus}
        showQuestTooltip={true}
      />
    </div>
  );
}
