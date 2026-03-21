import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from 'thirdweb/react';
import { nameContract, ogMiningBadgeContract, ogRegistryContract } from '../utils/contracts';
import { ogPublicClient, publicClient } from '../lib/viem/client';
import { nameContractAbi } from '../utils/nameContractAbi';
import { ogRegistryAbi } from '../utils/ogRegistryAbi';
import { ogMiningBadgeAbi } from '../utils/ogMiningBadgeAbi';
import { OgProfileModal } from '../components/OgProfileModal';
import { Spinner } from '../components/Spinner';

// --- Helper Component for Individual Member Card ---
const OgMemberCard = ({ address, onClick }: { address: string; onClick: () => void }) => {
  const { data: primaryName, isLoading: isNameLoading } = useQuery({
    queryKey: ['primaryName', address],
    queryFn: () =>
      publicClient.readContract({
        address: nameContract.address as `0x${string}`,
        abi: nameContractAbi,
        functionName: 'getPrimaryName',
        args: [address as `0x${string}`],
      }),
    staleTime: Infinity,
  });

  const { data: profile } = useQuery({
    queryKey: ['ogProfile', address],
    queryFn: async () => {
      try {
        const data = await ogPublicClient.readContract({
          address: ogRegistryContract.address as `0x${string}`,
          abi: ogRegistryAbi,
          functionName: 'getProfile',
          args: [address as `0x${string}`],
        }) as any;
        return {
          avatarUrl: data.avatarUrl || '',
          twitter: data.twitter || '',
          debank: data.debank || '',
          linkedin: data.linkedin || '',
        };
      } catch (e) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const displayName = (primaryName as string) || `${address.slice(0, 6)}...${address.slice(-4)}`;
  const avatarUrl = profile?.avatarUrl || '/assets/OG.webp';

  return (
    <div 
      className="flex flex-col items-center p-3 bg-neutral-900/60 border border-neutral-800 rounded-2xl hover:border-neutral-600 transition-all duration-300 group relative"
    >
      <button onClick={onClick} className="relative mb-2 transition-transform active:scale-95">
        <img
          src={avatarUrl}
          alt={displayName}
          className="size-14 md:size-16 rounded-2xl object-cover border-2 border-neutral-800 group-hover:border-blue-500 transition-colors bg-neutral-900 shadow-md"
        />
        <div className="absolute -bottom-1 -right-1 size-4 bg-green-500 border-2 border-neutral-900 rounded-full"></div>
      </button>
      
      <div className="text-center w-full min-w-0 mb-3">
        <h4 className="font-bold text-white text-xs md:text-sm truncate px-1">
          {isNameLoading ? '...' : displayName}
        </h4>
        <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">OG Team</p>
      </div>

      <div className="flex gap-2 mt-auto">
        <SocialIcon 
          href={profile?.twitter ? `https://twitter.com/${profile.twitter.replace('@', '')}` : undefined} 
          icon={<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>}
        />
        <SocialIcon 
          href={profile?.debank} 
          icon={<img src="/image.svg" className="w-3.5 h-3.5" alt="DB" />}
        />
        <SocialIcon 
          href={profile?.linkedin} 
          icon={<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>}
        />
      </div>
    </div>
  );
};

const SocialIcon = ({ href, icon }: { href?: string; icon: React.ReactNode }) => (
  <a
    href={href || '#'}
    target={href ? "_blank" : undefined}
    rel="noopener noreferrer"
    onClick={(e) => !href && e.preventDefault()}
    className={`p-1.5 rounded-lg border border-neutral-800 transition-all ${
      href 
        ? 'text-neutral-400 hover:text-white hover:bg-neutral-800 hover:border-neutral-700' 
        : 'text-neutral-700 opacity-30 cursor-not-allowed'
    }`}
  >
    {icon}
  </a>
);

export default function OgTeam() {
  const account = useActiveAccount();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: holders, isLoading: isEventsLoading } = useQuery({
    queryKey: ['ogHoldersV3'],
    queryFn: async (): Promise<string[]> => {
      try {
        const totalSupply = (await ogPublicClient.readContract({
          address: ogMiningBadgeContract.address as `0x${string}`,
          abi: ogMiningBadgeAbi,
          functionName: 'totalSupply',
        })) as bigint;

        if (totalSupply === 0n) return [];

        const ownerPromises: Promise<string | null>[] = [];
        for (let i = 1n; i <= totalSupply; i++) {
          ownerPromises.push(
            ogPublicClient.readContract({
              address: ogMiningBadgeContract.address as `0x${string}`,
              abi: ogMiningBadgeAbi,
              functionName: 'ownerOf',
              args: [i],
            }).catch(() => null)
          );
        }

        const owners = await Promise.all(ownerPromises);
        const validOwners = owners.filter((owner): owner is string => owner !== null);
        const uniqueHolders = [...new Set(validOwners)];
        
        return uniqueHolders.reverse();
      } catch (err) {
        console.error('❌ Failed to fetch OG holders:', err);
        return [];
      }
    },
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });

  const isOgMember = account && holders && holders.some(h => h.toLowerCase() === account.address.toLowerCase());

  if (isEventsLoading) return (
    <div className="flex justify-center py-20">
      <Spinner className="w-10 h-10 text-neutral-800" />
    </div>
  );
  
  if (!holders || holders.length === 0) return null;

  return (
    <section className="w-full px-4 py-12 border-t border-neutral-800/40">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-black text-white tracking-tighter">
            OG COMMUNITY <span className="text-blue-500">TEAM</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-500/20">
              Guardians
            </span>
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
              {holders.length} Registered Members
            </span>
          </div>

          {isOgMember && (
            <button
              onClick={() => setSelectedUser(account.address)}
              className="mt-6 mx-auto group relative px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Manage My Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {holders.map((address) => (
            <OgMemberCard 
              key={address} 
              address={address} 
              onClick={() => setSelectedUser(address)}
            />
          ))}
        </div>
      </div>

      {selectedUser && (
        <OgProfileModal 
          userAddress={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </section>
  );
}
