export const gmNameAggregatorAbi = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getDomainFeed',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'namePrice', type: 'uint256' },
          { internalType: 'bool', name: 'hasDiscount', type: 'bool' },
          { internalType: 'uint256', name: 'nameBalance', type: 'uint256' },
          { internalType: 'string', name: 'primaryName', type: 'string' },
          { internalType: 'uint256', name: 'hashBalance', type: 'uint256' },
        ],
        internalType: 'struct GmNameAggregator.DomainFeed',
        name: 'f',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getNameRewardFeed',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'canClaim', type: 'bool' },
          { internalType: 'bool', name: 'claimed', type: 'bool' },
          { internalType: 'uint256', name: 'nftBalance', type: 'uint256' },
          { internalType: 'uint256', name: 'poolBalance', type: 'uint256' },
        ],
        internalType: 'struct GmNameAggregator.NameRewardFeed',
        name: 'f',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getGmFeed',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'gmBalance', type: 'uint256' },
          { internalType: 'uint256', name: 'gmnftBalance', type: 'uint256' },
          { internalType: 'uint256', name: 'allowance', type: 'uint256' },
          { internalType: 'bool', name: 'canClaimNow', type: 'bool' },
          { internalType: 'uint256', name: 'nextAvailable', type: 'uint256' },
          { internalType: 'bool', name: 'nftHolder', type: 'bool' },
          { internalType: 'bool', name: 'staker', type: 'bool' },
          { internalType: 'uint256', name: 'userStake', type: 'uint256' },
        ],
        internalType: 'struct GmNameAggregator.GmFeed',
        name: 'f',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
