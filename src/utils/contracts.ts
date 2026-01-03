import { getContract } from 'thirdweb';
import { chain } from '../lib/thirdweb/chain';
import { client } from '../lib/thirdweb/client';
import erc20Abi from './erc20';
import stakingAbi from './stakingAbi';
import GMAbi from './GMAbi';
import CoffeeQuestAbi from './buyMeACoffeeAbi';
import { nameContractAbi } from './nameContractAbi';
import namebadgeAbi from './namebadgeAbi';
import { airdropAbi } from './airdropAbi';
import { gmnftAbi } from './gmnftAbi';
import { airdropWinterGiftAbi } from './airdropWinterGiftAbi';
import { contractStakingAbi } from './contractStakingAbi';
import { earlyBirdAbi } from './earlyBirdAbi';


export const airdropWinterGiftContract = getContract({
  client,
  chain: chain,
  address: '0x66987ceEf1c8843315846c013ca38cDFAE813B95',
  abi: airdropWinterGiftAbi,
});


export const airdropContract = getContract({
  client,
  chain: chain,
  address: '0x69cb90ee92d2f84dd5d77737a0295dcc8aa9dc6a',
  abi: airdropAbi,
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

export const hashcoinContract = getContract({
  client,
  chain: chain,
  address: '0xA9B631ABcc4fd0bc766d7C0C8fCbf866e2bB0445',
  abi: erc20Abi,
});

export const nftCollectionContract = getContract({
  client,
  chain: chain,
  address: '0x30ccb676de89af3da144dde2cff647152e5c2770',
});

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

export const stakingContract = getContract({
  client,
  chain: chain,
  address: '0xFd69e0dfa9a12c43B563a1903092bEFB5E71Db0e',
  abi: stakingAbi,
});

export const contractTools = getContract({
  client,
  chain: chain,
  address: '0x13CE10a3e09FA8000BA8A13fCbe8813f476584e7',
});

export const contractStaking = getContract({
  client,
  chain: chain,
  address: '0xBBc4f75874930EB4d8075FCB3f48af2535A8E848',
  abi: contractStakingAbi,
});

export const usdcContract = getContract({
  client,
  chain: chain,
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  abi: erc20Abi,
});

export const whaleContract = getContract({
  client,
  chain: chain,
  address: '0x7aa5fc50D0E4A400545E34055134C89F2b310080',
  abi: whaleContractAbi,
});

import { stakeNftAbi } from './stakeNftAbi';
import { whaleContractAbi } from './whaleContractAbi';

export const stakeNftContract = getContract({
  client,
  chain: chain,
  address: '0x22d015f90111d2b3174af23b2a607e467243b763',
  abi: stakeNftAbi,
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

