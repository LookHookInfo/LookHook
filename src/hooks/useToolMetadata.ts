import { useQuery } from '@tanstack/react-query';
import { miningPublicClient } from '../lib/viem/client';
import { contractTools } from '../utils/contracts';
import { contractToolsAbi } from '../utils/contractToolsAbi';

interface ToolMetadata {
  id: number;
  name: string;
  description: string;
  image: string;
}

const TOOL_DEFAULTS: ToolMetadata[] = [
  { id: 0, name: 'GPU', description: 'Speed: 0.042/h', image: '/assets/tools/0.png' },
  { id: 1, name: 'ASIC', description: 'Speed: 0.42/h', image: '/assets/tools/1.png' },
  { id: 2, name: 'FARM', description: 'Speed: 2.42/h', image: '/assets/tools/2.png' },
  { id: 3, name: 'RIG', description: 'Speed: 0.335/h', image: '/assets/tools/3.png' },
  { id: 4, name: 'RACK', description: 'Speed: 5.05/h', image: '/assets/tools/4.png' },
  { id: 5, name: 'CONTAINER', description: 'Speed: 24.2/h', image: '/assets/tools/5.png' },
];

function resolveIpfsUrl(uri: string): string {
  return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
}

export function useToolMetadata() {
  const { data, isLoading } = useQuery({
    queryKey: ['toolMetadata'],
    queryFn: async (): Promise<ToolMetadata[]> => {
      const count = (await miningPublicClient.readContract({
        address: contractTools.address as `0x${string}`,
        abi: contractToolsAbi,
        functionName: 'nextTokenIdToMint',
        args: [],
      })) as bigint;

      if (count === 0n) return TOOL_DEFAULTS;

      const numTools = Math.min(Number(count), 6);

      const multicallContracts = Array.from({ length: numTools }, (_, i) => ({
        address: contractTools.address as `0x${string}`,
        abi: contractToolsAbi,
        functionName: 'uri',
        args: [BigInt(i)],
      }));

      const results = await miningPublicClient.multicall({
        contracts: multicallContracts as any,
      });

      const metadata = await Promise.all(
        results.map(async (result, i) => {
          if (result.status === 'success') {
            try {
              const uri = result.result as string;
              const response = await fetch(resolveIpfsUrl(uri));
              const json = await response.json();
              return {
                id: i,
                name: json.name || TOOL_DEFAULTS[i].name,
                description: json.description || TOOL_DEFAULTS[i].description,
                image: `/assets/tools/${i}.png`,
              } as ToolMetadata;
            } catch {
              return TOOL_DEFAULTS[i];
            }
          }
          return TOOL_DEFAULTS[i];
        })
      );

      for (let i = metadata.length; i < 6; i++) {
        metadata.push(TOOL_DEFAULTS[i]);
      }

      return metadata;
    },
    staleTime: 600_000,
  });

  return { toolMetadata: data ?? TOOL_DEFAULTS, isLoading };
}
