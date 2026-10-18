import { useState, useEffect } from 'react';

const HASH_DEXSCREENER_PAIR = '0x9ab05414f0a3872a78459693f3e3c9ea3f0d6e71';

export function useHashPrice() {
  const [hashPriceUsd, setHashPriceUsd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchPrice = async () => {
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/pairs/base/${HASH_DEXSCREENER_PAIR}`,
        );
        const data = await response.json();
        const pair = data.pairs?.[0];
        const price = pair?.priceUsd ? parseFloat(pair.priceUsd) : null;
        if (mounted) {
          setHashPriceUsd(price);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch HASH price:', error);
        if (mounted) {
          setHashPriceUsd(null);
          setIsLoading(false);
        }
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { hashPriceUsd, isLoading };
}