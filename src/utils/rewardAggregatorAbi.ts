export const rewardAggregatorAbi = [
	{
		"inputs": [],
		"name": "AMBA_NFT",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllContractBalances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "xBalance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "gramBalance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tubeBalance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalBalance",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getAmbaStatus",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "hasAmba",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "hasTube",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "hasGram",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "hasX",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "canMint",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "totalSupply",
						"type": "uint256"
					}
				],
				"internalType": "struct RewardAggregator.AmbaStatus",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getRolesStatus",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "hasNFT",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "alreadyClaimed",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "canClaim",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "rewardAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "contractBalance",
						"type": "uint256"
					}
				],
				"internalType": "struct RewardAggregator.RoleStatus[3]",
				"name": "",
				"type": "tuple[3]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getTotalClaimableReward",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "total",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserStatus",
		"outputs": [
			{
				"components": [
					{
						"components": [
							{
								"internalType": "bool",
								"name": "hasNFT",
								"type": "bool"
							},
							{
								"internalType": "bool",
								"name": "alreadyClaimed",
								"type": "bool"
							},
							{
								"internalType": "bool",
								"name": "canClaim",
								"type": "bool"
							},
							{
								"internalType": "uint256",
								"name": "rewardAmount",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "contractBalance",
								"type": "uint256"
							}
						],
						"internalType": "struct RewardAggregator.RoleStatus",
						"name": "x",
						"type": "tuple"
					},
					{
						"components": [
							{
								"internalType": "bool",
								"name": "hasNFT",
								"type": "bool"
							},
							{
								"internalType": "bool",
								"name": "alreadyClaimed",
								"type": "bool"
							},
							{
								"internalType": "bool",
								"name": "canClaim",
								"type": "bool"
							},
							{
								"internalType": "uint256",
								"name": "rewardAmount",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "contractBalance",
								"type": "uint256"
							}
						],
						"internalType": "struct RewardAggregator.RoleStatus",
						"name": "gram",
						"type": "tuple"
					},
					{
						"components": [
							{
								"internalType": "bool",
								"name": "hasNFT",
								"type": "bool"
							},
							{
								"internalType": "bool",
								"name": "alreadyClaimed",
								"type": "bool"
							},
							{
								"internalType": "bool",
								"name": "canClaim",
								"type": "bool"
							},
							{
								"internalType": "uint256",
								"name": "rewardAmount",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "contractBalance",
								"type": "uint256"
							}
						],
						"internalType": "struct RewardAggregator.RoleStatus",
						"name": "tube",
						"type": "tuple"
					},
					{
						"components": [
							{
								"internalType": "bool",
								"name": "hasAmba",
								"type": "bool"
							},
							{
								"internalType": "bool",
								"name": "hasTube",
								"type": "bool"
							},
							{
								"internalType": "bool",
								"name": "hasGram",
								"type": "bool"
							},
							{
								"internalType": "bool",
								"name": "hasX",
								"type": "bool"
							},
							{
								"internalType": "bool",
								"name": "canMint",
								"type": "bool"
							},
							{
								"internalType": "uint256",
								"name": "totalSupply",
								"type": "uint256"
							}
						],
						"internalType": "struct RewardAggregator.AmbaStatus",
						"name": "amba",
						"type": "tuple"
					},
					{
						"internalType": "uint256",
						"name": "totalClaimable",
						"type": "uint256"
					}
				],
				"internalType": "struct RewardAggregator.UserStatus",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "hasAnyClaimable",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "HASH_TOKEN",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "NFT_GRAM",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "NFT_TUBE",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "NFT_X",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REWARD_GRAM",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REWARD_TUBE",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REWARD_X",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;
