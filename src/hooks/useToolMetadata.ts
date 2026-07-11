import { useQuery } from '@tanstack/react-query';
import { miningPublicClient } from '../lib/viem/client';
import { contractTools } from '../utils/contracts';
import { contractToolsAbi } from '../utils/contractToolsAbi';

export interface ToolMetadata {
  id: number;
  name: string;
  description: string;
  image: string;
}

const PLACEHOLDER: ToolMetadata[] = [
  { id: 0, name: 'Tool #0', description: '', image: '' },
  { id: 1, name: 'Tool #1', description: '', image: '' },
  { id: 2, name: 'Tool #2', description: '', image: '' },
  { id: 3, name: 'Tool #3', description: '', image: '' },
  { id: 4, name: 'Tool #4', description: '', image: '' },
  { id: 5, name: 'Tool #5', description: '', image: '' },
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

      if (count === 0n) return PLACEHOLDER;

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
                name: json.name || `Tool #${i}`,
                description: json.description || '',
                image: json.image || '',
              } as ToolMetadata;
            } catch {
              return PLACEHOLDER[i];
            }
          }
          return PLACEHOLDER[i];
        })
      );

      for (let i = metadata.length; i < 6; i++) {
        metadata.push(PLACEHOLDER[i]);
      }

      return metadata;
    },
    staleTime: 600_000,
  });

  return { toolMetadata: data ?? PLACEHOLDER, isLoading };
}
