import { useStakeContract } from '../hooks/useStakeContract';
import { StakingSection } from '../components/StakingSection';
import { UserStakes } from '../components/UserStakesDisplay';

export default function Features() {
  const {
    tokenSymbol,
    stakeAPY,
    walletBalance,
    stakedBalance,
    userStakes,
    apr3M,
    apr6M,
    apr12M,
    refreshBalances,
    isApproved,
    refetchAllowance,
    poolInfo,
    status, // Get status
    setStatus, // Get setStatus
    isPoolInfoLoading,
  } = useStakeContract();

  return (
    <div className="max-w-[85rem] px-4 py-4 sm:px-6 lg:px-8 lg:py-6 mx-auto">
      <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
        <div className="mt-5 sm:mt-10 lg:mt-0 lg:col-span-4">
          <div className="space-y-6 sm:space-y-8 relative">
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2
                     bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                     text-white px-3 py-1 text-xs font-bold rounded-full
                     shadow-lg"
            >
              Base
            </div>

            <div className="space-y-2 md:space-y-4">
              <h2 className="font-bold text-3xl lg:text-4xl text-gray-300 dark:text-neutral-200">
                <img
                  src="https://bafybeidlh52vnf2cfuvskmhdrixojelnavpyv2q34qmlz5bfutr2mjgvey.ipfs.dweb.link/"
                  alt="Stake"
                  className="rounded-xl w-16 h-16 inline-block mr-2 align-middle"
                />
                Lock Staking
              </h2>
              <p className="text-gray-400 dark:text-neutral-500">
                A Web3 solution for secure token locking wit Simple logic, transparent terms, and zero complexity — all
                on-chain and fully under your control.
              </p>
              <div className="flex justify-center items-center space-x-4 mt-4 gleam-effect">
                <a
                  href="https://app.galxe.com/quest/bAFdwDecXS6NRWsbYqVAgh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white font-bold relative z-10"
                >
                  Galxe
                </a>
                <a
                  href="https://quest.intract.io/project/mining-hash/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white font-bold relative z-10"
                >
                  Intract
                </a>
                <a
                  href="https://guild.xyz/hashcoin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white font-bold relative z-10"
                >
                  Guild
                </a>
              </div>
            </div>
            {isPoolInfoLoading ? (
              <div className="bg-black/30 rounded-xl p-4 space-y-3 border border-neutral-700 animate-pulse">
                <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
              </div>
            ) : (
              poolInfo && (
                <div className="bg-black/30 rounded-xl p-4 space-y-2 border border-neutral-700">
                  <p className="text-sm text-neutral-400">
                    Total rewards in pool:{' '}
                    <span className="text-white font-semibold">
                      {(poolInfo[1] / 10n ** 18n).toString()} {tokenSymbol || ''}
                    </span>
                  </p>
                  <p className="text-sm text-neutral-400">
                    Total staked by users:{' '}
                    <span className="text-white font-semibold">
                      {(poolInfo[0] / 10n ** 18n).toString()} {tokenSymbol || ''}
                    </span>
                  </p>
                </div>
              )
            )}
            <ul className="space-y-2 sm:space-y-4">
              {[
                {
                  text: (
                    <>
                      <span className="font-bold">Fixed</span> Lock Periods
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      On-Chain <span className="font-bold">Transparency</span>
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      <span className="font-bold">Simple</span> & Secure
                    </>
                  ),
                },
              ].map((item, index) => (
                <li className="flex gap-x-3" key={index}>
                  <span className="mt-0.5 size-6 flex justify-center items-center rounded-lg border border-gray-200 text-white dark:border-neutral-700">
                    <svg
                      className="size-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                    </svg>
                  </span>
                  <div className="grow">
                    <span className="text-sm sm:text-base text-gray-300 dark:text-neutral-500">{item.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <StakingSection
          className="lg:col-span-8"
          tokenSymbol={tokenSymbol}
          stakeAPY={stakeAPY}
          walletBalance={walletBalance}
          stakedBalance={stakedBalance}
          userStakes={userStakes as UserStakes | undefined}
          apr3M={apr3M}
          apr6M={apr6M}
          apr12M={apr12M}
          refreshBalances={refreshBalances}
          isApproved={isApproved}
          refetchAllowance={refetchAllowance}
          status={status}
          setStatus={setStatus}
        />
      </div>
    </div>
  );
}
