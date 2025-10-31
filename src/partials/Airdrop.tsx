import { useActiveAccount } from "thirdweb/react";
import { airdropContract } from "@/utils/contracts";
import { useReadContract } from "thirdweb/react";
import {
  prepareContractCall,
  toEther,
  getContractEvents,
  prepareEvent,
} from "thirdweb";
import { TransactionButton } from "thirdweb/react";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { useState, useEffect } from "react";

interface AirdropProps {
  className?: string;
}

export default function Airdrop({ className }: AirdropProps) {
  const account = useActiveAccount();
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [claimedCount, setClaimedCount] = useState<number | null>(null);

  const { data: userStatus, isLoading: isUserStatusLoading, refetch: refetchUserStatus } =
    useReadContract({
      contract: airdropContract,
      method: "getUserStatus",
      params: [account?.address || ""],
      queryOptions: { enabled: !!account },
    });

  const { data: claimDeadline } = useReadContract({
    contract: airdropContract,
    method: "claimDeadline",
    params: [],
  });

  useEffect(() => {
    async function fetchClaimedCount() {
      const preparedEvent = prepareEvent({
        signature: "event Claimed(address indexed user, uint256 amount)",
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
          setRemainingTime("Airdrop has ended");
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
    <section className={`w-full px-4 py-8 text-white ${className ?? ""}`}>
      <div className="bg-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg border border-neutral-700 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[200px] flex flex-col items-center relative">
            <div
              className="absolute -top-2 -left-2
                         bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600
                         text-white px-3 py-1 text-xs font-bold rounded-full
                         shadow-lg z-10"
            >
              Base
            </div>

            <img
              src="/Airdrop.png"
              alt="HashCoin NFT"
              className="rounded-xl w-full h-auto"
            />

            {claimedCount !== null && (
              <span className="absolute bottom-16 left-6 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-lg">
                🪂 {claimedCount}
              </span>
            )}

            <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-500 text-gray-500 bg-transparent">
                {remainingTime}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2 relative">
              <h2 className="text-3xl font-bold text-white">Airdrop</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 h-6 text-xs font-semibold bg-black text-white border border-white rounded">
                  first
                </span>
              </div>
            </div>

            <p className="text-neutral-400">
              <b>Intermediate</b> airdrop for <br />
              Zealy, Sea, Tips, and Name <br />
              participants before the main event.
            </p>

            <p className="text-neutral-400">
              The participants'{" "}
              <a
                href="https://basescan.org/address/0x69cb90ee92d2f84dd5d77737a0295dcc8aa9dc6a#code#L5"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition"
              >
                contract
              </a>
              .
            </p>

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
                          method: "claim",
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
        </div>
      </div>
    </section>
  );
}