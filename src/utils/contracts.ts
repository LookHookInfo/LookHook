import { getContract } from 'thirdweb';
import { chain } from '../lib/thirdweb/chain';
import { client } from '../lib/thirdweb/client';

// ABIs
import erc20Abi from './erc20';
import stakingAbi from './stakingAbi';
import GMAbi from './GMAbi';
import CoffeeQuestAbi from './buyMeACoffeeAbi';
import { nameContractAbi } from './nameContractAbi';
import { namebadgeAbi } from './namebadgeAbi';
import { gmnftAbi } from './gmnftAbi';
import { drubContractABI } from './drubContractAbi';
import { vaultDrubContractABI } from './vaultDrubContractAbi';

import { contractStakingAbi } from './contractStakingAbi';
import { earlyBirdAbi } from './earlyBirdAbi';
import { stakeNftAbi } from './stakeNftAbi';
import { whaleContractAbi } from './whaleContractAbi';
import { BALANCE_OF_ABI } from './balanceOfAbi'; // New import for generic balanceOf ABI
import { badgeStakeAbi } from './badgeStakeAbi';
import { stakeRewardClaimAbi } from './stakeRewardClaimAbi';
import { drub100BadgeAbi } from './drub100BadgeAbi';
import { drubRewardAbi } from './drubRewardAbi';

// --- CORE TOKENS ---

export const hashcoinContract = getContract({
  client,
  chain: chain,
  address: '0xA9B631ABcc4fd0bc766d7C0C8fCbf866e2bB0445',
  abi: erc20Abi,
});

export const usdcContract = getContract({
  client,
  chain: chain,
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  abi: erc20Abi,
});

export const drubContract = getContract({
  client,
  chain: chain,
  address: '0x1339c3a22ccdd7560B4Ccacd065Cd4b578BDA12d',
  abi: drubContractABI,
});

export const vaultDrubContract = getContract({
  client,
  chain: chain,
  address: '0xd2237A2f81C8Fce8d61919e2e35639897848722d',
  abi: vaultDrubContractABI,
});

export const nfpmContract = getContract({
  client,
  chain: chain,
  address: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1', // pool hash/drub
  abi: BALANCE_OF_ABI,
});



// --- STAKING & TOOLS ---

export const stakingContract = getContract({
  client,
  chain: chain,
  address: '0xFd69e0dfa9a12c43B563a1903092bEFB5E71Db0e',
  abi: stakingAbi,
});

export const contractStaking = getContract({
  client,
  chain: chain,
  address: '0xBBc4f75874930EB4d8075FCB3f48af2535A8E848',
  abi: contractStakingAbi,
});

export const stakeNftContract = getContract({
  client,
  chain: chain,
  address: '0x22d015f90111d2b3174af23b2a607e467243b763',
  abi: stakeNftAbi,
});

export const contractTools = getContract({
  client,
  chain: chain,
  address: '0x13CE10a3e09FA8000BA8A13fCbe8813f476584e7',
});


// --- AIRDROPS & QUESTS ---

export const earlyBirdContract = getContract({
  client,
  chain: chain,
  address: '0xe6DC0fe06C141329050A1B2F3e9c4A7f944450B0',
  abi: earlyBirdAbi,
});

export const buyMeACoffeeContract = getContract({
  client,
  chain: chain,
  address: '0x3e2623875aa6295628a40040326b70fcb2e9df15',
  abi: CoffeeQuestAbi,
});

export const stakeRewardClaimContract = getContract({
  client,
  chain: chain,
  address: '0x3e65390EdD46Ec98F792d0122eD4f1a105bab281',
  abi: stakeRewardClaimAbi,
});

export const drubRewardContract = getContract({
  client,
  chain: chain,
  address: '0x225ebbac1db8fdb1be4a70ae695745f214fc5424',
  abi: drubRewardAbi,
});


// --- NFT & IDENTITY ---

export const nftCollectionContract = getContract({
  client,
  chain: chain,
  address: '0x30ccb676de89af3da144dde2cff647152e5c2770',
});

export const nameContract = getContract({
  client,
  chain: chain,
  address: '0xA8e00E2ca8b183Edb7EbB6bD7EeBB90047416F95',
  abi: nameContractAbi,
});

export const namebadgeContract = getContract({
  client,
  chain: chain,
  address: '0xCe6d7DF4a3F945B35E7b4d93F8Ff6731923Fa1E8',
  abi: namebadgeAbi,
});

export const whaleContract = getContract({
  client,
  chain: chain,
  address: '0x7aa5fc50D0E4A400545E34055134C89F2b310080',
  abi: whaleContractAbi,
});

export const gmContract = getContract({
  client,
  chain: chain,
  address: '0x1e2390B4021B64B05Bc7AfF53E0122eb648DdC19',
  abi: GMAbi,
});

export const gmnftContract = getContract({
  client,
  chain: chain,
  address: '0x3B01Ad4F0aa8663174A7cE44ed9C7223791Fa16f',
  abi: gmnftAbi,
});

export const badgeStakeContract = getContract({
  client,
  chain: chain,
  address: '0x6249E34dB9858676950c05fF66eCf96Aee4b7ba5',
  abi: badgeStakeAbi,
});

export const drub100BadgeContract = getContract({
  client,
  chain: chain,
  address: '0x366f37820b98F86F7C41d2fB6DB246f85B28b18c',
  abi: drub100BadgeAbi,
});