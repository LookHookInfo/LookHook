import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const ALCHEMY_RPC_URL = import.meta.env.VITE_ALCHEMY_GM_RPC_URL;

if (!ALCHEMY_RPC_URL) {
  throw new Error('Missing VITE_ALCHEMY_GM_RPC_URL environment variable');
}


export const publicClient = createPublicClient({
  chain: base,
  transport: http(ALCHEMY_RPC_URL),
});
