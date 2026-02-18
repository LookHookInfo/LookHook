import { useQuery } from '@tanstack/react-query';
import { getContractEvents, readContract, prepareEvent } from 'thirdweb';
import { nameContract, ogMiningBadgeContract } from '../utils/contracts';

// 4 hours in milliseconds
const FOUR_HOURS = 4 * 60 * 60 * 1000;

// --- Helper Component for Individual Member ---
const OgMemberCard = ({ address }: { address: string }) => {
  // Fetch primary name from contract
  const { data: primaryName, isLoading: isNameLoading } = useQuery({
    queryKey: ['primaryName', address],
    queryFn: () =>
      readContract({
        contract: nameContract,
        method: 'getPrimaryName',
        params: [address],
      }),
    staleTime: FOUR_HOURS,
  });

  // Fetch Lens Profile Picture
  const { data: lensAvatar } = useQuery({
    queryKey: ['lensAvatar', address],
    queryFn: async () => {
      try {
        const response = await fetch('https://api-v2.lens.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query DefaultProfile($request: DefaultProfileRequest!) {
                defaultProfile(request: $request) {
                  metadata {
                    picture {
                      ... on ImageSet {
                        optimized {
                          uri
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              request: { for: address },
            },
          }),
        });
        const result = await response.json();
        const uri = result?.data?.defaultProfile?.metadata?.picture?.optimized?.uri;
        
        if (uri && uri.startsWith('ipfs://')) {
          return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        return uri;
      } catch (err) {
        console.error('Lens fetch error:', err);
        return null;
      }
    },
    staleTime: FOUR_HOURS,
  });

  const displayName = primaryName || `${address.slice(0, 6)}...${address.slice(-4)}`;
  // Fallback to a clean identicon if Lens avatar is not found
  const avatarUrl = lensAvatar || `https://api.dicebear.com/9.x/identicon/svg?seed=${address}`;

  return (
    <div className="flex flex-col items-center p-2 bg-neutral-900/40 border border-neutral-800 rounded-xl hover:border-neutral-600 transition-all duration-200 group">
      <div className="relative">
        <img
          src={avatarUrl}
          alt={displayName}
          className="size-12 md:size-14 rounded-full object-cover border border-neutral-700 group-hover:border-blue-500 transition-colors bg-neutral-800 shadow-sm"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/identicon/svg?seed=${address}`;
          }}
        />
        <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-neutral-900 rounded-full"></div>
      </div>
      
      <div className="mt-1.5 text-center w-full min-w-0">
        <h4 className="font-medium text-white text-[10px] md:text-xs truncate px-1">
          {isNameLoading ? '...' : displayName}
        </h4>
      </div>

      <a
        href={`https://debank.com/profile/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 text-[9px] font-bold text-neutral-600 hover:text-blue-400 uppercase tracking-tighter transition-colors"
      >
        Profile
      </a>
    </div>
  );
};

// Define the Transfer event
const transferEvent = prepareEvent({
  signature: "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
});

export default function OgTeam() {
  const { data: holders, isLoading: isEventsLoading } = useQuery({
    queryKey: ['ogHolders'],
    queryFn: async () => {
      const events = await getContractEvents({
        contract: ogMiningBadgeContract,
        events: [transferEvent],
        fromBlock: 15000000n,
      });

      const uniqueHolders = new Set<string>();
      events.forEach(event => {
        const to = event.args.to as string;
        if (event.args.from === '0x0000000000000000000000000000000000000000') {
          uniqueHolders.add(to);
        }
      });

      return Array.from(uniqueHolders);
    },
    staleTime: FOUR_HOURS,
    refetchInterval: FOUR_HOURS,
  });

  if (isEventsLoading && !holders) return null;
  if (!holders || holders.length === 0) return null;

  return (
    <div className="max-w-[85rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-10 mx-auto border-t border-neutral-800">
      <div className="max-w-2xl mx-auto text-center mb-6">
        <h2 className="text-xl font-bold md:text-2xl text-white">
          OG Community <span className="text-blue-500">Team</span>
        </h2>
        <p className="text-xs text-neutral-500">Ecosystem guardians</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {holders.map((address) => (
          <OgMemberCard key={address} address={address} />
        ))}
      </div>
    </div>
  );
}
