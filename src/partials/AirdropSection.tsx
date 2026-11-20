import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { Spinner } from '@/components/Spinner';
import SocksClaimedModal from '@/components/SocksClaimedModal';
import { useHolidayAirdrops } from '@/hooks/useHolidayAirdrops';

const CANDY_TWEET_URL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
  'Take on the role of a hash mining farm that can be used to produce candy cane.\n\n' +
    '1) Mining strategy https://hashcoin.farm\n' +
    '2) Get the NFT https://lookhook.info/airdrop\n\n' +
    '#hashcoin',
)}`;

function ContractLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="ml-1.5 inline-flex shrink-0 align-middle text-gray-500 transition-colors hover:text-red-300"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18v4.5M18 6l-7.5 7.5" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"
        />
      </svg>
    </a>
  );
}

function formatCountdown(deadline: bigint, now: number) {
  if (deadline === 0n) return '—';
  const left = Number(deadline) - now;
  if (left <= 0) return 'Ended';
  const days = Math.floor(left / 86400);
  const hours = Math.floor((left % 86400) / 3600);
  const minutes = Math.floor((left % 3600) / 60);
  const seconds = left % 60;
  return `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function AirdropSection() {
  const {
    hasFarmNft,
    hasMinted,
    socksBalance,
    unclaimedSocks,
    rewardPerSock,
    candyDeadline,
    socksDeadline,
    totalSocks,
    claimedIds,
    ownedIds,
    isLoading,
    isError,
    isConnected,
    pending,
    claimError,
    claimCandy,
    claimSocks,
  } = useHolidayAirdrops();

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [socksModalOpen, setSocksModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const candyLeft = Number(candyDeadline) - now;
  const socksLeft = Number(socksDeadline) - now;
  const reward = Number(formatUnits(rewardPerSock * BigInt(unclaimedSocks), 18)).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  });
  const busy = pending !== null;

  const candyLabel =
    pending === 'candy' ? (
      <Spinner className="h-4 w-4 text-red-200" />
    ) : !isConnected ? (
      'Connect wallet'
    ) : isLoading ? (
      'Loading'
    ) : isError ? (
      'Unavailable'
    ) : hasMinted ? (
      'Minted'
    ) : !hasFarmNft ? (
      'Need Farm NFT'
    ) : candyLeft <= 0 ? (
      'Ended'
    ) : (
      'Claim NFT'
    );

  const socksLabel =
    pending === 'socks' ? (
      <Spinner className="h-4 w-4 text-red-200" />
    ) : !isConnected ? (
      'Connect wallet'
    ) : isLoading ? (
      'Loading'
    ) : isError ? (
      'Unavailable'
    ) : socksBalance === 0n ? (
      'No socks'
    ) : unclaimedSocks === 0 ? (
      'All claimed'
    ) : socksLeft <= 0 ? (
      'Ended'
    ) : (
      'Claim HASH'
    );

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />

        <div className="relative z-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2">
              <img
                src="/assets/candy%20cane.webp"
                alt="Candy Cane"
                className="h-10 w-10 object-contain drub-bounce-animation"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Candy Cane Airdrop 4</h2>
                <span className="rounded border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-400">
                  {candyDeadline === 0n
                    ? isLoading
                      ? 'Loading'
                      : 'Upcoming'
                    : candyLeft > 0
                      ? 'Live'
                      : 'Ended'}
                </span>
              </div>
              <p className="text-xs text-gray-400">Holiday Rewards for Our Entire Community</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Claim window</div>
              <div className="font-mono text-sm text-red-300">{formatCountdown(candyDeadline, now)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
              <img src="/assets/candy%20cane.webp" alt="" className="h-9 w-9 shrink-0 object-contain" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center text-sm font-semibold text-white">
                  Candy Cane 2027 NFT
                  <ContractLink
                    href="https://basescan.org/address/0xb364bE6aBCF7B2Bab04c98274d00791dE3DEF327#code"
                    label="View Candy Cane contract on Basescan"
                  />
                </div>
                <div className="truncate text-[11px] text-gray-500">
                  {isLoading
                    ? 'Checking eligibility…'
                    : hasMinted
                      ? 'Already minted'
                      : hasFarmNft
                        ? 'Farm NFT holder · 1 per wallet'
                        : 'Farm NFT required'}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={CANDY_TWEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share Candy Cane on X"
                  title="Share on X"
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 text-[10px] font-bold uppercase tracking-wider text-sky-200 transition-colors hover:bg-sky-500/20"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Tweet
                </a>
                <button
                  type="button"
                  onClick={claimCandy}
                  disabled={!isConnected || isLoading || isError || hasMinted || !hasFarmNft || candyLeft <= 0 || busy}
                  className="flex h-9 min-w-[116px] shrink-0 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/15 px-3 text-[10px] font-bold uppercase tracking-wider text-red-200 transition-colors hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {candyLabel}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
              <img src="/assets/Drop.webp" alt="" className="h-9 w-9 shrink-0 object-contain" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center text-sm font-semibold text-white">
                  <button
                    type="button"
                    title="View activated IDs"
                    onClick={() => setSocksModalOpen(true)}
                    className="transition-colors hover:text-red-300"
                  >
                    Socks Christmas Reward
                  </button>
                  <ContractLink
                    href="https://basescan.org/address/0xC9C79168b895cf373CE1461C558b930E7C819B44#code"
                    label="View Socks reward contract on Basescan"
                  />
                </div>
                <div className="truncate text-[11px] text-gray-500">
                  {isLoading
                    ? 'Checking socks…'
                    : isError
                      ? 'Failed to load reward data'
                      : `${Number(socksBalance)} socks · ${unclaimedSocks} to claim · ${reward} HASH · ${formatCountdown(socksDeadline, now)}`}
                </div>
              </div>
              <button
                type="button"
                onClick={claimSocks}
                disabled={!isConnected || isLoading || isError || socksBalance === 0n || unclaimedSocks === 0 || socksLeft <= 0 || busy}
                className="flex h-9 min-w-[116px] shrink-0 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/15 px-3 text-[10px] font-bold uppercase tracking-wider text-red-200 transition-colors hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {socksLabel}
              </button>
            </div>
            {claimError && (
              <p className="text-[11px] text-red-400">{claimError}</p>
            )}
          </div>
        </div>
      </div>

      <SocksClaimedModal
        open={socksModalOpen}
        total={totalSocks}
        claimedIds={claimedIds}
        ownedIds={ownedIds}
        isLoading={isLoading}
        onClose={() => setSocksModalOpen(false)}
      />
    </div>
  );
}
