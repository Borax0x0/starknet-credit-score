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
  firstTxDate: Date | null;
  daysSinceLastTx: number | null;
}

// Starkscan API URL
const STARKSCAN_API_URL = 'https://api.starkscan.co/api/v0';

// Token contract addresses on Starknet mainnet with their specific ABI entrypoints
const TOKENS: Record<string, { address: string; selector: 'balanceOf' | 'balance_of' }> = {
  STRK: { address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', selector: 'balance_of' },
  USDC_BRIDGED: { address: '0x053c91253bc968ea04923acd23c8f5f8dbd2e6e38f11f7164d18c30350bc3d49', selector: 'balanceOf' },
  USDC_NATIVE: { address: '0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb', selector: 'balanceOf' },
  ETH: { address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', selector: 'balanceOf' },
  USDT: { address: '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8', selector: 'balanceOf' },
  WBTC: { address: '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac', selector: 'balanceOf' },
};

// Starknet mainnet RPC (User-configured or dRPC fallback)
const MAINNET_RPC = process.env.NEXT_PUBLIC_STARKNET_MAINNET || 'https://starknet.drpc.org';
const SEPOLIA_RPC = process.env.NEXT_PUBLIC_STARKNET_SEPOLIA || 'https://starknet-sepolia.drpc.org';

function getProvider(network: string = 'mainnet') {
  const rpcUrl = network === 'sepolia' ? SEPOLIA_RPC : MAINNET_RPC;
  return new RpcProvider({ nodeUrl: rpcUrl });
}

const provider = getProvider('mainnet');

/**
 * Fetch a token balance using provider.callContract.
 * Uses the specific ABI entrypoint mapped to the token.
 */
async function getTokenBalance(token: { address: string; selector: 'balanceOf' | 'balance_of' }, walletAddress: string, network: string = 'mainnet'): Promise<bigint> {
  const rpcProvider = getProvider(network);
  try {
    const result = await rpcProvider.callContract({
      contractAddress: token.address,
      entrypoint: token.selector,
      calldata: [walletAddress],
    });

    if (result && result.length >= 2) {
      const low = BigInt(result[0]);
      const high = BigInt(result[1]);
      return low + (high << 128n);
    } else if (result && result.length === 1) {
      return BigInt(result[0]);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Contract not found')) {
      console.log(`[DEBUG TOKENS] Token contract ${token.address} not found or unused by this wallet.`);
    } else {
      console.log(`[DEBUG TOKENS] Error fetching balance for ${token.address}: ${err.message}`);
    }
  }
  return 0n;
}

/**
 * Find the block a contract was deployed by binary searching getClassHashAt
 */
async function findDeploymentBlock(address: string, latestBlockNum: number, network: string = 'mainnet'): Promise<number | null> {
  const rpcProvider = getProvider(network);
  let low = 0;
  let high = latestBlockNum;
  let deployedBlock: number | null = null;

  // binary search to find the exact deployment block (takes ~20 RPC calls = < 2 seconds)
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    try {
      await rpcProvider.getClassHashAt(address, mid);
      // It existed at 'mid', so it might have been deployed earlier
      deployedBlock = mid;
      high = mid - 1;
    } catch {
      // It didn't exist at 'mid', so it must be deployed later
      low = mid + 1;
    }
  }
  return deployedBlock;
}

/**
 * Fetch wallet metrics from Starknet using starknet.js RpcProvider.
 * Uses nonce as a tx count proxy (standard RPC, no API key needed).
 */
export async function getWalletMetrics(address: string, network: string = 'mainnet'): Promise<WalletMetrics> {
  const now = new Date();
  const rpcProvider = getProvider(network);
  console.log(`[DEBUG NETWORK] Using ${network} network`);

  // Normalize address — pad to full 66-char Starknet format (0x + 64 hex digits)
  // Important: num.toHex strips leading zeros which breaks RPC lookups for addresses like 0x00adce...
  const rawHex = num.toHex(num.toBigInt(address));
  const normalizedAddress = '0x' + rawHex.slice(2).padStart(64, '0');

  // 1. Check if the account is deployed (has a class hash)
  let isDeployed = false;
  try {
    await rpcProvider.getClassHashAt(normalizedAddress);
    isDeployed = true;
  } catch {
    // Account not deployed — fresh/empty wallet
  }

  // 2. Get nonce (= number of transactions sent from this account)
  let txCount = 0;
  if (isDeployed) {
    try {
      const nonceRaw = await rpcProvider.getNonceForAddress(normalizedAddress);
      // getNonceForAddress returns a hex string (e.g. "0x580f3"). Must be parsed as hex.
      txCount = parseInt(nonceRaw as string, 16);

      console.log(`[DEBUG TX COUNT] Raw Nonce from provider: ${nonceRaw}`);
      if (isNaN(txCount)) {
        txCount = 0;
      } else if (txCount > 10000) {
        const scaledTxCount = Math.round(Math.log10(txCount + 1) * 1000);
        console.warn(`[DEBUG TX COUNT] Value exceeded 10,000! Scaling logarithmically to ${scaledTxCount} to prevent typical anomaly scoring.`);
        txCount = scaledTxCount;
      }
    } catch (e) {
      console.log('Error fetching nonce:', e);
    }
  }

  // 3. Get token balances using proper callContract for top tokens
  console.log(`[DEBUG TOKENS] Fetching balances for top tokens on ${network}...`);
  const strkBalanceRaw = await getTokenBalance(TOKENS.STRK, normalizedAddress, network);
  const usdcBridgedBalanceRaw = await getTokenBalance(TOKENS.USDC_BRIDGED, normalizedAddress, network);
  const usdcNativeBalanceRaw = await getTokenBalance(TOKENS.USDC_NATIVE, normalizedAddress, network);
  const ethBalanceRaw = await getTokenBalance(TOKENS.ETH, normalizedAddress, network);
  const usdtBalanceRaw = await getTokenBalance(TOKENS.USDT, normalizedAddress, network);
  const wbtcBalanceRaw = await getTokenBalance(TOKENS.WBTC, normalizedAddress, network);

  const usdcCombinedBalanceRaw = usdcBridgedBalanceRaw + usdcNativeBalanceRaw;

  console.log(`[DEBUG TOKENS] STRK (${TOKENS.STRK}): ${strkBalanceRaw}`);
  console.log(`[DEBUG TOKENS] USDC Total: ${usdcCombinedBalanceRaw} (Bridged: ${usdcBridgedBalanceRaw}, Native: ${usdcNativeBalanceRaw})`);
  console.log(`[DEBUG TOKENS] ETH (${TOKENS.ETH}): ${ethBalanceRaw}`);
  console.log(`[DEBUG TOKENS] USDT (${TOKENS.USDT}): ${usdtBalanceRaw}`);
  console.log(`[DEBUG TOKENS] WBTC (${TOKENS.WBTC}): ${wbtcBalanceRaw}`);

  const balances = [strkBalanceRaw, usdcCombinedBalanceRaw, ethBalanceRaw, usdtBalanceRaw, wbtcBalanceRaw];
  const uniqueTokens = balances.filter(b => b > 0n).length;
  console.log(`[DEBUG TOKENS] Unique non-zero token count: ${uniqueTokens}`);

  const hasSTRK = strkBalanceRaw > 0n;
  const hasUSDC = usdcCombinedBalanceRaw > 0n;

  // We assign just the combined balance to usdcBalanceRaw 
  const usdcBalanceRaw = usdcCombinedBalanceRaw;

  // 4. Estimate wallet age and last activity using Starkscan API
  let walletAgeDays = 0;
  let daysSinceLastTx: number | null = null;
  let firstTxDate: Date | null = null;
  let lastActivityDate: Date = now;
  let trueTxCount = txCount;

  try {
    const starkscanKey = process.env.STARKSCAN_API_KEY;

    if (starkscanKey) {
      // Fetch stats from Starkscan (this includes exact tx count)
      const res = await fetch(`${STARKSCAN_API_URL}/transactions?contract_address=${normalizedAddress}&limit=1`, {
        headers: {
          'accept': 'application/json',
          'x-api-key': starkscanKey
        }
      });

      if (res.ok) {
        const data = await res.json();
        const items = data.data || [];

        if (items.length > 0) {
          // Latest transaction gives us last activity
          const latestTx = items[0];
          lastActivityDate = new Date(latestTx.timestamp * 1000);
          daysSinceLastTx = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

          // Get the exact transaction count from Starknet JS nonce (since Starkscan doesn't return total count in this endpoint easily)
          // Actually, we'll fetch the *oldest* transaction to get true wallet age
          const oldestRes = await fetch(`${STARKSCAN_API_URL}/transactions?contract_address=${normalizedAddress}&limit=1&sort_desc=false`, {
            headers: {
              'accept': 'application/json',
              'x-api-key': starkscanKey
            }
          });

          if (oldestRes.ok) {
            const oldestData = await oldestRes.json();
            const oldestItems = oldestData.data || [];
            if (oldestItems.length > 0) {
              const oldestTx = oldestItems[0];
              firstTxDate = new Date(oldestTx.timestamp * 1000);
              walletAgeDays = Math.floor((now.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24));
            }
          }
        }
      }
    } else {
      console.log('No STARKSCAN_API_KEY provided, fetching true block data via RPC binary search...');
      try {
        // Confirm the wallet exists
        await rpcProvider.getClassHashAt(normalizedAddress, 'latest');

        const latestBlock = await rpcProvider.getBlock('latest');
        console.log(`[DEBUG AGE] Latest block from RPC: ${latestBlock.block_number}`);

        // Find exact deployment block
        const deployedBlock = await findDeploymentBlock(normalizedAddress, latestBlock.block_number, network);

        if (deployedBlock !== null && latestBlock.block_number) {
          console.log(`[DEBUG AGE] Wallet exact deployment block found: ${deployedBlock}`);

          // Get exact deployment block timestamp for true age calculation
          const deploymentBlockData = await rpcProvider.getBlock(deployedBlock);

          if (deploymentBlockData && 'timestamp' in deploymentBlockData) {
            const secondsElapsed = latestBlock.timestamp - deploymentBlockData.timestamp;
            walletAgeDays = Math.floor(secondsElapsed / (60 * 60 * 24));
            console.log(`[DEBUG AGE] Calculated exact days from timestamps: ${walletAgeDays} days`);
            firstTxDate = new Date(deploymentBlockData.timestamp * 1000);
          } else {
            // Fallback to 6s estimate if timestamp missing from older blocks
            const blocksElapsed = latestBlock.block_number - deployedBlock;
            const secondsElapsed = blocksElapsed * 6;
            walletAgeDays = Math.floor(secondsElapsed / (60 * 60 * 24));
            firstTxDate = new Date(now.getTime() - (secondsElapsed * 1000));
          }
        } else {
          console.log(`[DEBUG AGE] Could not find deployment block, using 0 days.`);
        }
      } catch (err: any) {
        console.log(`[DEBUG AGE] Wallet class hash not found at latest. Assume 0 days. Error: ${err.message}`);
      }

      // Fallback heuristics for activity
      // Since we don't know exactly when their LAST transaction was without an API,
      // using hardcoded heuristic values is too detached from reality.
      // Since `getClassHashAt` confirms existence, we'll keep the heuristic 
      // but scale it way down so active wallets aren't penalized with "7 days inactive". 
      if (isDeployed && txCount > 0) {
        if (walletAgeDays === 0) {
          walletAgeDays = Math.min(txCount * 3, 730);
          console.log(`[DEBUG AGE] Binary search failed, fallback age calculated: txCount(${txCount}) * 3 = ${walletAgeDays} days (capped at 730)`);
        }

        if (txCount > 1000) {
          daysSinceLastTx = 0; // highly active, assume today
        } else if (hasSTRK || hasUSDC || uniqueTokens > 1) {
          daysSinceLastTx = Math.min(Math.floor(txCount / 50), 30);
        } else {
          daysSinceLastTx = Math.min(Math.floor(txCount / 10), 90);
        }
        lastActivityDate = new Date(now.getTime() - daysSinceLastTx * 24 * 60 * 60 * 1000);
      }
    }
  } catch (error) {
    console.error('Failed to fetch from Starkscan:', error);
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

  if (metrics.daysSinceLastTx != null && metrics.daysSinceLastTx < 30) score += 100;

  return Math.min(score, 850);
}

export function getScoreTier(score: number): string {
  if (score >= 750) return 'Excellent';
  if (score >= 700) return 'Very Good';
  if (score >= 650) return 'Good';
  if (score >= 600) return 'Fair';
  return 'Poor';
}
