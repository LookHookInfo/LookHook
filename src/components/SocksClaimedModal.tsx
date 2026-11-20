import { useEffect, useMemo } from 'react';
import { Spinner } from '@/components/Spinner';

interface SocksClaimedModalProps {
  open: boolean;
  total: number;
  claimedIds: bigint[];
  ownedIds: bigint[];
  isLoading?: boolean;
  onClose: () => void;
}

export default function SocksClaimedModal({
  open,
  total,
  claimedIds,
  ownedIds,
  isLoading,
  onClose,
}: SocksClaimedModalProps) {
  const claimedSet = useMemo(() => new Set(claimedIds.map((id) => id.toString())), [claimedIds]);
  const ownedSet = useMemo(() => new Set(ownedIds.map((id) => id.toString())), [ownedIds]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 p-4">
          <div>
            <h3 className="text-lg font-bold text-white">Socks Christmas Reward</h3>
            <p className="text-xs text-gray-500">
              Activated IDs · {claimedIds.length} / {total}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg border border-neutral-800 p-1.5 text-gray-400 transition-colors hover:text-white"
          >
            <img src="/image.svg" alt="" className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-5 w-5 text-red-300" />
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap gap-4 text-[10px] text-gray-500">
                <span>
                  <i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-500/60" />
                  Activated
                </span>
                <span>
                  <i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-500" />
                  Yours
                </span>
                <span>
                  <i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-neutral-700" />
                  Available
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12">
                {Array.from({ length: total }, (_, index) => BigInt(index + 1)).map((id) => {
                  const key = id.toString();
                  const isClaimed = claimedSet.has(key);
                  const isMine = ownedSet.has(key);
                  return (
                    <div
                      key={key}
                      title={`#${key}${isClaimed ? ' · activated' : ''}${isMine ? ' · yours' : ''}`}
                      className={`flex h-7 items-center justify-center rounded text-[10px] font-mono ${
                        isClaimed
                          ? isMine
                            ? 'bg-red-500/20 text-red-200 ring-1 ring-blue-400/60'
                            : 'bg-red-500/15 text-red-300'
                          : isMine
                            ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/50'
                            : 'bg-neutral-900 text-gray-600'
                      }`}
                    >
                      {key}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
