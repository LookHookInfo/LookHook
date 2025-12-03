import { getContract } from 'thirdweb';
import { chain } from '../lib/thirdweb/chain';
import { client } from '../lib/thirdweb/client';
import erc20Abi from './erc20';
import stakingAbi from './stakingAbi';
import GMAbi from './GMAbi';
import CoffeeQuestAbi from './buyMeACoffeeAbi';
import { nameContractAbi } from './nameContractAbi';
import namebadgeAbi from './namebadgeAbi';

export const airdropContract = getContract({
  client,
  chain: chain,
  address: '0x69cb90ee92d2f84dd5d77737a0295dcc8aa9dc6a',
  abi: [
    { inputs: [], name: 'autoRescue', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [], name: 'claim', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    {
      inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
      name: 'fund',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }],
      name: 'AutoRescue',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'user', type: 'address' },
        { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'Claimed',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'from', type: 'address' },
        { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'Funded',
      type: 'event',
    },
    {
      inputs: [
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'rescue',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'to', type: 'address' },
        { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'Rescue',
      type: 'event',
    },
    {
      inputs: [],
      name: 'CLAIM_DURATION',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'claimable',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'claimDeadline',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getContractBalance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'getUserStatus',
      outputs: [
        { internalType: 'uint256', name: 'allocation', type: 'uint256' },
        { internalType: 'bool', name: 'claimed', type: 'bool' },
        { internalType: 'bool', name: 'canClaim', type: 'bool' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'hasClaimed',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'isExpired',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'timeRemaining',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'token',
      outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
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
  abi: [
    {
      inputs: [],
      name: 'getRewardTokenBalance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    { inputs: [], name: 'stake', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [], name: 'withdraw', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [], name: 'claimRewards', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  ] as const,
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
  abi: [
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'getUserStatus',
      outputs: [
        { internalType: 'uint256', name: 'earnedHASH', type: 'uint256' },
        { internalType: 'bool', name: 'dolphinAvailable', type: 'bool' },
        { internalType: 'bool', name: 'sharkAvailable', type: 'bool' },
        { internalType: 'bool', name: 'whaleAvailable', type: 'bool' },
        { internalType: 'bool', name: 'hasDolphinNFT', type: 'bool' },
        { internalType: 'bool', name: 'hasSharkNFT', type: 'bool' },
        { internalType: 'bool', name: 'hasWhaleNFT', type: 'bool' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    { inputs: [], name: 'mintDolphin', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [], name: 'mintShark', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [], name: 'mintWhale', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  ] as const,
});

export const gmContract = getContract({
  client,
  chain: chain,
  address: '0x1e2390B4021B64B05Bc7AfF53E0122eb648DdC19',
  abi: GMAbi,
});
