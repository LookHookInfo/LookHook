export const whaleContractAbi = [
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
] as const;
