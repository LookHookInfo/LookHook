import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const ALCHEMY_GM_RPC_URL = import.meta.env.VITE_ALCHEMY_GM_RPC_URL;
const ALCHEMY_MINING_RPC_URL = import.meta.env.VITE_ALCHEMY_MINING_RPC_URL;
const ALCHEMY_TIPS_RPC_URL = import.meta.env.VITE_ALCHEMY_TIPS_RPC_URL;
const ALCHEMY_OG_RPC_URL = import.meta.env.VITE_ALCHEMY_OG_RPC_URL;
const ALCHEMY_X_RPC_URL = import.meta.env.VITE_ALCHEMY_X_RPC_URL;
const ALCHEMY_NAME_RPC_URL = import.meta.env.VITE_ALCHEMY_NAME_RPC_URL;

if (!ALCHEMY_GM_RPC_URL) {
  throw new Error('Missing VITE_ALCHEMY_GM_RPC_URL environment variable');
}

if (!ALCHEMY_MINING_RPC_URL) {
  throw new Error('Missing VITE_ALCHEMY_MINING_RPC_URL environment variable');
}

if (!ALCHEMY_TIPS_RPC_URL) {
  throw new Error('Missing VITE_ALCHEMY_TIPS_RPC_URL environment variable');
}

if (!ALCHEMY_OG_RPC_URL) {
  throw new Error('Missing VITE_ALCHEMY_OG_RPC_URL environment variable');
}

if (!ALCHEMY_X_RPC_URL) {
  throw new Error('Missing VITE_ALCHEMY_X_RPC_URL environment variable');
}

if (!ALCHEMY_NAME_RPC_URL) {
  throw new Error('Missing VITE_ALCHEMY_NAME_RPC_URL environment variable');
}

// Клиент для GM фич
export const publicClient = createPublicClient({
  chain: base,
  transport: http(ALCHEMY_GM_RPC_URL),
  batch: {
    multicall: true,
  },
});

// Клиент для Mining (Staking & Tools)
export const miningPublicClient = createPublicClient({
  chain: base,
  transport: http(ALCHEMY_MINING_RPC_URL),
  batch: {
    multicall: true,
  },
});

// Клиент для Tips (BuyMeACoffee)
export const tipsPublicClient = createPublicClient({
  chain: base,
  transport: http(ALCHEMY_TIPS_RPC_URL),
  batch: {
    multicall: true,
  },
});

// Клиент для OG (Mining Badge & Registry)
export const ogPublicClient = createPublicClient({
  chain: base,
  transport: http(ALCHEMY_OG_RPC_URL),
  batch: {
    multicall: true,
  },
});

// Клиент для X (Drub, Welcome, XRole)
export const xPublicClient = createPublicClient({
  chain: base,
  transport: http(ALCHEMY_X_RPC_URL),
  batch: {
    multicall: true,
  },
});

// Клиент для Names & Rewards (NameContract, NameReward, HeliReward)
export const namePublicClient = createPublicClient({
  chain: base,
  transport: http(ALCHEMY_NAME_RPC_URL),
  batch: {
    multicall: true,
  },
});
