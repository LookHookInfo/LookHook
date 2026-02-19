import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { readContract, prepareContractCall } from 'thirdweb';
import { ogRegistryContract } from '../utils/contracts';
import { TransactionButton } from 'thirdweb/react';
import { Spinner } from './Spinner';

interface OgProfile {
  avatarUrl: string;
  twitter: string;
  debank: string;
  linkedin: string;
}

interface OgProfileModalProps {
  userAddress: string;
  onClose: () => void;
}

export function OgProfileModal({ userAddress, onClose }: OgProfileModalProps) {
  const account = useActiveAccount();
  const isOwnProfile = account?.address.toLowerCase() === userAddress.toLowerCase();
  
  const [profile, setProfile] = useState<OgProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit state
  const [editAvatar, setEditAvatar] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editDebank, setEditDebank] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await readContract({
        contract: ogRegistryContract,
        method: 'getProfile',
        params: [userAddress],
      });
      
      const p = {
        avatarUrl: data.avatarUrl || '',
        twitter: data.twitter || '',
        debank: data.debank || '',
        linkedin: data.linkedin || '',
      };
      setProfile(p);
      setEditAvatar(p.avatarUrl);
      setEditTwitter(p.twitter);
      setEditDebank(p.debank);
      setEditLinkedin(p.linkedin);
    } catch (err) {
      console.error('Failed to fetch OG profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userAddress]);

  const avatarDisplay = profile?.avatarUrl || '/assets/OG.webp';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-b border-neutral-800">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-neutral-400 hover:text-white transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 relative">
          <div className="flex justify-center -mt-12 mb-4">
            <div className="relative group">
              <img 
                src={avatarDisplay} 
                alt="Avatar" 
                className="w-24 h-24 rounded-2xl object-cover border-4 border-neutral-900 shadow-xl bg-neutral-800"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-neutral-900"></div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="w-8 h-8 text-blue-500" />
            </div>
          ) : isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Avatar URL</label>
                <input 
                  type="text" 
                  value={editAvatar} 
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">X</label>
                <input 
                  type="text" 
                  value={editTwitter} 
                  onChange={(e) => setEditTwitter(e.target.value)}
                  placeholder="@handle"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">DeBank</label>
                <input 
                  type="text" 
                  value={editDebank} 
                  onChange={(e) => setEditDebank(e.target.value)}
                  placeholder="Profile URL"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">LinkedIn</label>
                <input 
                  type="text" 
                  value={editLinkedin} 
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  placeholder="Profile URL"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 text-sm font-bold text-neutral-400 hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <TransactionButton
                  transaction={() => prepareContractCall({
                    contract: ogRegistryContract,
                    method: 'setProfile',
                    params: [editAvatar, editTwitter, editDebank, editLinkedin]
                  })}
                  className="flex-1 !bg-blue-600 !text-white !font-bold !text-sm !py-2 !rounded-lg hover:!bg-blue-500 transition-colors !border-none !h-auto !min-h-0"
                  onTransactionConfirmed={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                >
                  Save Profile
                </TransactionButton>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </h3>
              <p className="text-xs text-blue-500 font-bold tracking-widest uppercase mb-6">OG Community Team</p>

              <div className="flex justify-center gap-4 mb-8">
                {profile?.twitter && (
                  <a href={`https://x.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener" className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </a>
                )}
                {profile?.debank && (
                  <a href={profile.debank} target="_blank" rel="noopener" className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all">
                    <img src="/image.svg" className="w-5 h-5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100" alt="DeBank" />
                  </a>
                )}
                {profile?.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener" className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                )}
              </div>

              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 text-sm font-bold text-white hover:bg-neutral-700 border border-neutral-700 transition-all active:scale-95"
                >
                  Edit My Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
