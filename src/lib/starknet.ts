import { RpcProvider, num } from "starknet";
import { StarkZap } from "starkzap";

export interface WalletMetrics {
  walletAgeDays: number;
  txCount: number;
  uniqueTokens: number;
  strkBalance: string;
  usdcBalance: string;
  lastActivityDate: Date;
  hasSTRK: boolean;
  hasUSDC: boolean;
  firstTxDate: Date | null;
  daysSinceLastTx: number | null;
  isRetry?: boolean;
}

const STARKSCAN_API_URL = "https://api.starkscan.co/api/v0";

const TOKEN_ADDRESSES = {
  STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  USDC_BRIDGED: "0x053c91253bc968ea04923acd23c8f5f8dbd2e6e38f11f7164d18c30350bc3d49",
  USDC_NATIVE: "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb",
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  USDT: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
  WBTC: "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
};

const MAINNET_RPC =
  process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet.drpc.org";
const SEPOLIA_RPC =
  process.env.NEXT_PUBLIC_STARKNET_TESTNET ||
  "https://starknet-sepolia.drpc.org";

function getProvider(network: string = "mainnet") {
  const rpcUrl = network === "sepolia" ? SEPOLIA_RPC : MAINNET_RPC;
  return new RpcProvider({ nodeUrl: rpcUrl });
}

async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string,
  network: "mainnet" | "sepolia" = "mainnet",
): Promise<bigint> {
  try {
    const sdk = new StarkZap({ network });
    const balance = await (sdk as any).balanceOf(walletAddress, tokenAddress);
    if (balance) {
      return BigInt(balance.toString());
    }
  } catch {
    // StarkZap SDK throws on unsupported tokens — return 0 as fallback
  }
  return 0n;
}

// Binary searches getClassHashAt to find the first block a contract existed at.
// Converges in ~10 iterations (O(log n) over 500k block window).
async function findDeploymentBlock(
  address: string,
  latestBlockNum: number,
  network: string = "mainnet",
): Promise<number | null> {
  const rpcProvider = getProvider(network);
  let low = Math.max(0, latestBlockNum - 500000);
  let high = latestBlockNum;
  let deployedBlock: number | null = null;
  let iterations = 0;

  while (low <= high && iterations < 10) {
    iterations++;
    const mid = Math.floor((low + high) / 2);
    try {
      await rpcProvider.getClassHashAt(address, mid);
      deployedBlock = mid;
      high = mid - 1;
    } catch {
      low = mid + 1;
    }
  }
  return deployedBlock;
}

// Nonce is used as tx count — it's the account's next tx number, available via standard RPC without an API key.
export async function getWalletMetrics(
  address: string,
  network: string = "mainnet",
  rpcUrl?: string,
): Promise<WalletMetrics> {
  const now = new Date();
  const rpcProvider = rpcUrl
    ? new RpcProvider({ nodeUrl: rpcUrl })
    : getProvider(network);

  // num.toHex strips leading zeros — pad manually to the full 66-char format RPC expects
  const rawHex = num.toHex(num.toBigInt(address));
  const normalizedAddress = "0x" + rawHex.slice(2).padStart(64, "0");

  // 3 attempts with 500ms backoff — RPC nodes occasionally return stale state
  let isDeployed = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await rpcProvider.getClassHashAt(normalizedAddress);
      isDeployed = true;
      break;
    } catch {
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  // Nonce = total txs sent from this account (hex string from RPC)
  let txCount = 0;
  if (isDeployed) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const nonceRaw =
          await rpcProvider.getNonceForAddress(normalizedAddress);
        txCount = parseInt(nonceRaw as string, 16);

        if (isNaN(txCount)) {
          txCount = 0;
        }
        break;
      } catch {
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
  }

  // Token balances via StarkZap SDK — USDC includes both bridged and native variants
  const networkType = network as "mainnet" | "sepolia";
  const strkBalanceRaw = await getTokenBalance(
    TOKEN_ADDRESSES.STRK,
    normalizedAddress,
    networkType,
  );
  const usdcBridgedBalanceRaw = await getTokenBalance(
    TOKEN_ADDRESSES.USDC_BRIDGED,
    normalizedAddress,
    networkType,
  );
  const usdcNativeBalanceRaw = await getTokenBalance(
    TOKEN_ADDRESSES.USDC_NATIVE,
    normalizedAddress,
    networkType,
  );
  const ethBalanceRaw = await getTokenBalance(
    TOKEN_ADDRESSES.ETH,
    normalizedAddress,
    networkType,
  );
  const usdtBalanceRaw = await getTokenBalance(
    TOKEN_ADDRESSES.USDT,
    normalizedAddress,
    networkType,
  );
  const wbtcBalanceRaw = await getTokenBalance(
    TOKEN_ADDRESSES.WBTC,
    normalizedAddress,
    networkType,
  );

  const usdcCombinedBalanceRaw = usdcBridgedBalanceRaw + usdcNativeBalanceRaw;

  const balances = [
    strkBalanceRaw,
    usdcCombinedBalanceRaw,
    ethBalanceRaw,
    usdtBalanceRaw,
    wbtcBalanceRaw,
  ];
  const uniqueTokens = balances.filter((b) => b > 0n).length;

  const hasSTRK = strkBalanceRaw > 0n;
  const hasUSDC = usdcCombinedBalanceRaw > 0n;

  const usdcBalanceRaw = usdcCombinedBalanceRaw;

  // Wallet age: Starkscan API if key is present, binary RPC block search otherwise
  let walletAgeDays = 0;
  let daysSinceLastTx: number | null = null;
  let firstTxDate: Date | null = null;
  let lastActivityDate: Date = now;
  const trueTxCount = txCount;

  try {
    const starkscanKey = process.env.STARKSCAN_API_KEY;

    if (starkscanKey) {

      const res = await fetch(
        `${STARKSCAN_API_URL}/transactions?contract_address=${normalizedAddress}&limit=1`,
        {
          headers: {
            accept: "application/json",
            "x-api-key": starkscanKey,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        const items = data.data || [];

        if (items.length > 0) {
          const latestTx = items[0];
          lastActivityDate = new Date(latestTx.timestamp * 1000);
          daysSinceLastTx = Math.floor(
            (now.getTime() - lastActivityDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          // Fetch oldest tx to derive wallet age from first-seen timestamp
          const oldestRes = await fetch(
            `${STARKSCAN_API_URL}/transactions?contract_address=${normalizedAddress}&limit=1&sort_desc=false`,
            {
              headers: {
                accept: "application/json",
                "x-api-key": starkscanKey,
              },
            },
          );

          if (oldestRes.ok) {
            const oldestData = await oldestRes.json();
            const oldestItems = oldestData.data || [];
            if (oldestItems.length > 0) {
              const oldestTx = oldestItems[0];
              firstTxDate = new Date(oldestTx.timestamp * 1000);
              walletAgeDays = Math.floor(
                (now.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24),
              );
            }
          }
        }
      }
    } else {
      try {
        await rpcProvider.getClassHashAt(normalizedAddress, "latest");

        const latestBlock = await rpcProvider.getBlock("latest");

        const deployedBlock = await findDeploymentBlock(
          normalizedAddress,
          latestBlock.block_number,
          network,
        );

        if (deployedBlock !== null && latestBlock.block_number) {
          const deploymentBlockData = await rpcProvider.getBlock(deployedBlock);

          if (deploymentBlockData && "timestamp" in deploymentBlockData) {
            const secondsElapsed =
              latestBlock.timestamp - deploymentBlockData.timestamp;
            walletAgeDays = Math.floor(secondsElapsed / (60 * 60 * 24));
            firstTxDate = new Date(deploymentBlockData.timestamp * 1000);
          } else {
            // Some older blocks lack timestamps — estimate at ~6s per block
            const blocksElapsed = latestBlock.block_number - deployedBlock;
            const secondsElapsed = blocksElapsed * 6;
            walletAgeDays = Math.floor(secondsElapsed / (60 * 60 * 24));
            firstTxDate = new Date(now.getTime() - secondsElapsed * 1000);
          }
        }
      } catch {
        // Deployment block search failed — activity heuristics below will apply
      }

      // Without a Starkscan key, last-tx date is unknown — derive activity from tx volume
      if (isDeployed && txCount > 0) {
        if (walletAgeDays === 0) {
          walletAgeDays = Math.min(txCount * 3, 730);
        }

        if (txCount > 1000) {
          daysSinceLastTx = 0;
        } else if (hasSTRK || hasUSDC || uniqueTokens > 1) {
          daysSinceLastTx = Math.min(Math.floor(txCount / 50), 30);
        } else {
          daysSinceLastTx = Math.min(Math.floor(txCount / 10), 90);
        }
        lastActivityDate = new Date(
          now.getTime() - daysSinceLastTx * 24 * 60 * 60 * 1000,
        );
      }
    }
  } catch (error) {
    console.error("Failed to fetch from Starkscan:", error);
  }

  return {
    walletAgeDays,
    txCount: trueTxCount,
    uniqueTokens,
    strkBalance: strkBalanceRaw.toString(),
    usdcBalance: usdcBalanceRaw.toString(),
    lastActivityDate,
    hasSTRK,
    hasUSDC,
    firstTxDate,
    daysSinceLastTx,
    isRetry: false,
  };
}

export function calculateScore(metrics: Partial<WalletMetrics>): number {
  let score = 300;

  const ageDays = metrics.walletAgeDays || 0;
  const hasRealAge = metrics.firstTxDate !== null;
  if (hasRealAge) {
    if (ageDays >= 365) score += 150;
    else if (ageDays >= 180) score += 100;
    else if (ageDays >= 90) score += 60;
    else if (ageDays >= 30) score += 30;
  }

  const txCount = metrics.txCount || 0;
  if (txCount >= 100) score += 150;
  else if (txCount >= 50) score += 100;
  else if (txCount >= 20) score += 80;
  else if (txCount >= 5) score += 40;

  const Tokens = metrics.uniqueTokens || 0;
  if (Tokens >= 5) score += 100;
  else if (Tokens >= 3) score += 60;
  else if (Tokens >= 1) score += 20;

  if (metrics.hasSTRK) score += 50;
  if (metrics.hasUSDC) score += 50;

  const daysSince = metrics.daysSinceLastTx;
  if (daysSince !== null && daysSince !== undefined) {
    if (daysSince < 7) score += 100;
    else if (daysSince < 30) score += 60;
    else if (daysSince < 90) score += 20;
  }

  return Math.min(score, 850);
}

export function getScoreTier(score: number): string {
  if (score >= 750) return "Excellent";
  if (score >= 700) return "Very Good";
  if (score >= 650) return "Good";
  if (score >= 600) return "Fair";
  return "Poor";
}

export interface ScoreBreakdownItem {
  metric: string;
  current: string;
  target: string;
  status: "good" | "weak" | "critical";
  impact: "high" | "medium" | "low";
}

export function getScoreBreakdown(
  metrics: Partial<WalletMetrics>,
): ScoreBreakdownItem[] {
  const breakdown: ScoreBreakdownItem[] = [];

  const walletAge = metrics.walletAgeDays || 0;
  const ageStatus =
    walletAge > 365 ? "good" : walletAge > 180 ? "weak" : "critical";
  const ageImpact = walletAge > 365 ? "high" : "medium";
  breakdown.push({
    metric: "Wallet Age",
    current: `${walletAge} days`,
    target: "365+ days",
    status: ageStatus,
    impact: ageImpact,
  });

  const txCount = metrics.txCount || 0;
  const txStatus = txCount > 100 ? "good" : txCount > 20 ? "weak" : "critical";
  const txImpact = "high";
  breakdown.push({
    metric: "Transaction Count",
    current: txCount.toLocaleString(),
    target: "100+ transactions",
    status: txStatus,
    impact: txImpact,
  });

  const tokens = metrics.uniqueTokens || 0;
  const tokenStatus = tokens > 5 ? "good" : tokens > 2 ? "weak" : "critical";
  const tokenImpact = "medium";
  breakdown.push({
    metric: "Token Diversity",
    current: `${tokens} tokens`,
    target: "6+ tokens",
    status: tokenStatus,
    impact: tokenImpact,
  });

  const strkStatus = metrics.hasSTRK ? "good" : "critical";
  breakdown.push({
    metric: "STRK Balance",
    current: metrics.hasSTRK ? "Yes" : "None",
    target: "Hold STRK",
    status: strkStatus,
    impact: "low",
  });

  const usdcStatus = metrics.hasUSDC ? "good" : "critical";
  breakdown.push({
    metric: "USDC Balance",
    current: metrics.hasUSDC ? "Yes" : "None",
    target: "Hold USDC",
    status: usdcStatus,
    impact: "low",
  });

  const activity = metrics.daysSinceLastTx ?? null;
  const actStatus =
    activity !== null && activity < 30
      ? "good"
      : activity !== null
        ? "weak"
        : "critical";
  breakdown.push({
    metric: "Recent Activity",
    current: activity !== null ? `${activity} days ago` : "Unknown",
    target: "<30 days",
    status: actStatus,
    impact: "high",
  });

  return breakdown.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}
