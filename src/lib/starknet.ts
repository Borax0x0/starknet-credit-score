import { RpcProvider, num } from 'starknet';

export interface WalletMetrics {
  walletAgeDays: number;
  txCount: number;
  uniqueTokens: number;
  strkBalance: string;
  usdcBalance: string;
  lastActivityDate: Date;
  hasSTRK: boolean;
  hasUSDC: boolean;
  firstTxDate: Date;
  daysSinceLastTx: number;
}

// Token contract addresses on Starknet mainnet
const STRK_ADDRESS = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
const USDC_ADDRESS = '0x053c91253bc968ea04923acd23c8f5f8dbd2e6e38f11f7164d18c30350bc3d49';

// Starknet mainnet RPC (ZAN public endpoint)
const provider = new RpcProvider({ nodeUrl: 'https://api.zan.top/public/starknet-mainnet/rpc/v0_7' });

/**
 * Fetch a token balance using provider.callContract.
 * Uses the string entrypoint name (starknet.js handles selector hashing internally).
 */
async function getTokenBalance(tokenAddress: string, walletAddress: string): Promise<bigint> {
  try {
    // starknet.js callContract accepts entrypoint as a string name
    const result = await provider.callContract({
      contractAddress: tokenAddress,
      entrypoint: 'balanceOf',
      calldata: [walletAddress],
    });

    // balanceOf returns a Uint256 (low, high) — combine them
    if (result && result.length >= 2) {
      const low = BigInt(result[0]);
      const high = BigInt(result[1]);
      return low + (high << 128n);
    } else if (result && result.length === 1) {
      return BigInt(result[0]);
    }
    return 0n;
  } catch {
    // Try snake_case "balance_of" as fallback (older contracts)
    try {
      const result = await provider.callContract({
        contractAddress: tokenAddress,
        entrypoint: 'balance_of',
        calldata: [walletAddress],
      });

      if (result && result.length >= 2) {
        const low = BigInt(result[0]);
        const high = BigInt(result[1]);
        return low + (high << 128n);
      } else if (result && result.length === 1) {
        return BigInt(result[0]);
      }
    } catch (fallbackErr) {
      console.log(`Error fetching balance for ${tokenAddress}:`, fallbackErr);
    }
    return 0n;
  }
}

/**
 * Fetch wallet metrics from Starknet mainnet using starknet.js RpcProvider.
 * Uses nonce as a tx count proxy (standard RPC, no API key needed).
 */
export async function getWalletMetrics(address: string): Promise<WalletMetrics> {
  const now = new Date();

  // Normalize address with padding
  const normalizedAddress = num.toHex(num.toBigInt(address));

  // 1. Check if the account is deployed (has a class hash)
  let isDeployed = false;
  try {
    await provider.getClassHashAt(normalizedAddress);
    isDeployed = true;
  } catch {
    // Account not deployed — fresh/empty wallet
  }

  // 2. Get nonce (= number of transactions sent from this account)
  let txCount = 0;
  if (isDeployed) {
    try {
      const nonce = await provider.getNonceForAddress(normalizedAddress);
      txCount = Number(BigInt(nonce));
    } catch (e) {
      console.log('Error fetching nonce:', e);
    }
  }

  // 3. Get token balances using proper callContract
  const strkBalanceRaw = await getTokenBalance(STRK_ADDRESS, normalizedAddress);
  const usdcBalanceRaw = await getTokenBalance(USDC_ADDRESS, normalizedAddress);

  const hasSTRK = strkBalanceRaw > 0n;
  const hasUSDC = usdcBalanceRaw > 0n;

  let uniqueTokens = 0;
  if (hasSTRK) uniqueTokens++;
  if (hasUSDC) uniqueTokens++;

  // 4. Estimate wallet age and last activity
  // Without a tx indexer, we use heuristics based on nonce and token holdings.
  // For a more accurate approach, you'd use Voyager/Starkscan API.
  let walletAgeDays = 0;
  let daysSinceLastTx = 999;
  let firstTxDate = now;
  let lastActivityDate = now;

  if (isDeployed && txCount > 0) {
    // Rough heuristic: estimate ~1 tx per 3 days on average
    walletAgeDays = Math.min(txCount * 3, 730); // cap at 2 years
    firstTxDate = new Date(now.getTime() - walletAgeDays * 24 * 60 * 60 * 1000);

    // If wallet has tokens, assume somewhat recent activity
    if (hasSTRK || hasUSDC) {
      daysSinceLastTx = Math.min(txCount > 50 ? 7 : 30, 90);
    } else {
      daysSinceLastTx = Math.min(txCount > 10 ? 60 : 180, 365);
    }
    lastActivityDate = new Date(now.getTime() - daysSinceLastTx * 24 * 60 * 60 * 1000);
  }

  return {
    walletAgeDays,
    txCount,
    uniqueTokens,
    strkBalance: strkBalanceRaw.toString(),
    usdcBalance: usdcBalanceRaw.toString(),
    lastActivityDate,
    hasSTRK,
    hasUSDC,
    firstTxDate,
    daysSinceLastTx,
  };
}

export function calculateScore(metrics: Partial<WalletMetrics>): number {
  let score = 300;

  if (metrics.walletAgeDays && metrics.walletAgeDays > 365) score += 150;
  else if (metrics.walletAgeDays && metrics.walletAgeDays > 180) score += 100;

  if (metrics.txCount && metrics.txCount > 100) score += 150;
  else if (metrics.txCount && metrics.txCount > 20) score += 80;

  if (metrics.uniqueTokens && metrics.uniqueTokens > 5) score += 100;

  if (metrics.hasSTRK) score += 50;
  if (metrics.hasUSDC) score += 50;

  if (metrics.daysSinceLastTx !== undefined && metrics.daysSinceLastTx < 30) score += 100;

  return Math.min(score, 850);
}

export function getScoreTier(score: number): string {
  if (score >= 750) return 'Excellent';
  if (score >= 700) return 'Very Good';
  if (score >= 650) return 'Good';
  if (score >= 600) return 'Fair';
  return 'Poor';
}
