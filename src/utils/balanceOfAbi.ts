export const BALANCE_OF_ABI = [
  {
    "inputs": [{"name": "_owner","type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance","type": "uint256"}],
    "stateMutability": "view", // Changed from "constant": true
    "type": "function"
  }
] as const;