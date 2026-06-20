export interface TwitterConfig {
  text: string;
  url?: string;      // Optional single primary URL for the X intent parameter
  urls?: string[];    // List of URLs to be formatted inside the tweet content
  hashtags: string[];
}

// ==========================================
// CONFIGURATION FOR TWITTER SHARE BUTTONS
// You can customize texts, hashtags, and links here.
// To add multiple links, place them in the 'urls' list.
// ==========================================
export const twitterShareConfig: Record<'faucet' | 'airdrop', TwitterConfig> = {
  faucet: {
    text: "Claimed my daily 20 $HASH tokens from the HashCoin Farm Faucet! Get yours now! 🚰💎",
    urls: [
      "https://x.com/HashCoinFarm/status/2068289384466481318",
      "https://lookhook.info"
    ],
    hashtags: ["HashCoin", "BaseNetwork", "Web3", "Faucet", "Crypto"],
  },
  airdrop: {
    text: "Checked my eligibility for the HashCoin Farm Community Airdrop 3! Go check your allocations! 🎁🚀",
    urls: [
      "https://x.com/HashCoinFarm/status/2068292149565591797",
      "https://lookhook.info/airdrop"
    ],
    hashtags: ["HashCoin", "Airdrop", "BaseNetwork", "Crypto", "Web3"],
  }
};

/**
 * Builds the intent link to share on X (Twitter)
 * Embeds URLs array as lines in the tweet text body.
 */
export function getTwitterShareUrl(type: 'faucet' | 'airdrop'): string {
  const config = twitterShareConfig[type];
  
  // 1. Build the full tweet text including additional links with line breaks
  let fullText = config.text;
  if (config.urls && config.urls.length > 0) {
    fullText += "\n\n" + config.urls.join("\n");
  }
  
  const textParam = encodeURIComponent(fullText);
  const hashtagsParam = encodeURIComponent(config.hashtags.join(','));
  
  // 2. Build X share URL
  let shareUrl = `https://x.com/intent/tweet?text=${textParam}`;
  
  // Optional primary URL parameter (if provided)
  if (config.url) {
    shareUrl += `&url=${encodeURIComponent(config.url)}`;
  }
  
  if (hashtagsParam) {
    shareUrl += `&hashtags=${hashtagsParam}`;
  }
  
  return shareUrl;
}
