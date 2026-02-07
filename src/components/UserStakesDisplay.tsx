import { Status } from '../hooks/useStakeContract';

// Moved type definitions here from src/types/staking.ts
export type UserStakes = readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

export interface UserStakeTierData {
  amount: bigint;
  rewards: bigint;
  timeLeft: bigint;
}

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
  stakeData: UserStakeTierData;
  amount: string;
  apr: bigint | undefined;
  tokenSymbol: string | undefined;
  status: Status;
  setStatus: (status: Status) => void;
  showQuestTooltip?: boolean;
  // Granular pending states
  stake: (amount: string, tierId: number) => Promise<void>;
  unstake: (tierId: number) => Promise<void>;
  claim: (tierId: number) => Promise<void>;
  isStakingPending: (tierId: number) => boolean;
  isUnstakingPending: (tierId: number) => boolean;
  isClaimingRewardsPending: (tierId: number) => boolean;
}

function TierDisplay({
  tierId,
  tierName,
  stakeData,
  amount,
  apr,
  tokenSymbol,
  showQuestTooltip,
  stake,
  unstake,
  claim,
  isStakingPending, // Now a function
  isUnstakingPending, // Now a function
  isClaimingRewardsPending, // Now a function
}: TierDisplayProps) {
  const isStaked = stakeData.amount > 0n;
  const isStakeButtonDisabled = isStakingPending(tierId) || !amount || Number(amount) <= 0;

  const getButtonText = (pendingFn: (tierId: number) => boolean, defaultText: string) => {
    return pendingFn(tierId) ? 'Processing...' : defaultText;
  };

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
              <button onClick={() => unstake(tierId)} disabled={isUnstakingPending(tierId)} className="btn-claim">
                {getButtonText(isUnstakingPending, 'Unstake')}
              </button>
            ) : (
              <button
                onClick={() => claim(tierId)}
                disabled={isClaimingRewardsPending(tierId) || stakeData.rewards <= 0n}
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
              >
                {getButtonText(
                  isClaimingRewardsPending,
                  `${Math.floor(Number(stakeData.rewards / BigInt(10 ** 18)))} ${tokenSymbol}`,
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <button onClick={() => stake(amount, tierId)} disabled={isStakeButtonDisabled} className="btn-claim">
              {getButtonText(isStakingPending, tierName)}
            </button>{' '}
          </div>
        )}
      </div>
    </div>
  );
}

interface UserStakesDisplayProps {
  userStakes: UserStakes | undefined;
  apr3M: bigint | undefined;
  apr6M: bigint | undefined;
  apr12M: bigint | undefined;
  amount: string;
  tokenSymbol: string | undefined;
  status: Status;
  setStatus: (status: Status) => void;
  // Granular pending states and transaction functions
  stake: (amount: string, tierId: number) => Promise<void>;
  unstake: (tierId: number) => Promise<void>;
  claim: (tierId: number) => Promise<void>;
  isStakingPending: (tierId: number) => boolean;
  isUnstakingPending: (tierId: number) => boolean;
  isClaimingRewardsPending: (tierId: number) => boolean;
}

export default function UserStakesDisplay({
  userStakes,
  apr3M,
  apr6M,
  apr12M,
  amount,
  tokenSymbol,
  status,
  setStatus,
  stake,
  unstake,
  claim,
  isStakingPending, // Granular pending state lookup function
  isUnstakingPending, // Granular pending state lookup function
  isClaimingRewardsPending, // Granular pending state lookup function
}: UserStakesDisplayProps) {
  let s3: UserStakeTierData = { amount: 0n, rewards: 0n, timeLeft: 0n };
  let s6: UserStakeTierData = { amount: 0n, rewards: 0n, timeLeft: 0n };
  let s12: UserStakeTierData = { amount: 0n, rewards: 0n, timeLeft: 0n };

  if (userStakes) {
    s3 = {
      amount: userStakes[0],
      rewards: userStakes[1],
      timeLeft: userStakes[2],
    };
    s6 = {
      amount: userStakes[3],
      rewards: userStakes[4],
      timeLeft: userStakes[5],
    };
    s12 = {
      amount: userStakes[6],
      rewards: userStakes[7],
      timeLeft: userStakes[8],
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
        status={status}
        setStatus={setStatus}
        stake={stake}
        unstake={unstake}
        claim={claim}
        isStakingPending={isStakingPending}
        isUnstakingPending={isUnstakingPending}
        isClaimingRewardsPending={isClaimingRewardsPending}
      />
      <TierDisplay
        tierId={2}
        tierName="6 Month"
        stakeData={s6}
        apr={apr6M}
        amount={amount}
        tokenSymbol={tokenSymbol}
        status={status}
        setStatus={setStatus}
        stake={stake}
        unstake={unstake}
        claim={claim}
        isStakingPending={isStakingPending}
        isUnstakingPending={isUnstakingPending}
        isClaimingRewardsPending={isClaimingRewardsPending}
      />
      <TierDisplay
        tierId={3}
        tierName="12 Month"
        stakeData={s12}
        apr={apr12M}
        amount={amount}
        tokenSymbol={tokenSymbol}
        status={status}
        setStatus={setStatus}
        showQuestTooltip={true}
        stake={stake}
        unstake={unstake}
        claim={claim}
        isStakingPending={isStakingPending}
        isUnstakingPending={isUnstakingPending}
        isClaimingRewardsPending={isClaimingRewardsPending}
      />
    </div>
  );
}
