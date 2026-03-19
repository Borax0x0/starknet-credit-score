import { NextRequest, NextResponse } from "next/server";
import {
  getWalletMetrics,
  calculateScore,
  getScoreTier,
  WalletMetrics,
} from "@/lib/starknet";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_STARKNET_RPC_URL,
  "https://starknet.drpc.org",
].filter(Boolean);

const RPC_TIMEOUT = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("RPC timeout, please retry")), ms),
    ),
  ]);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const network = searchParams.get("network") || "mainnet";

  if (!address) {
    return NextResponse.json(
      { error: "Missing address parameter" },
      { status: 400 },
    );
  }

  try {
    let metrics: WalletMetrics | null = null;

    let lastRpcError: unknown = null;
    for (const rpcUrl of RPC_ENDPOINTS) {
      try {
        metrics = await withTimeout(
          getWalletMetrics(address, network, rpcUrl),
          RPC_TIMEOUT,
        );
        break; // success, stop trying more endpoints
      } catch (error) {
        lastRpcError = error;
        if (error instanceof Error && error.message === "RPC timeout, please retry") {
          return NextResponse.json(
            { error: "RPC timeout, please retry" },
            { status: 503 },
          );
        }
        // try next endpoint
      }
    }

    if (!metrics) {
      throw lastRpcError ?? new Error("All RPC endpoints failed");
    }

    if (metrics.txCount === 0 && address && address.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      try {
        const retryMetrics = await withTimeout(
          getWalletMetrics(address, network),
          RPC_TIMEOUT,
        );
        if (retryMetrics.txCount > 0) {
          metrics = retryMetrics;
          metrics.isRetry = true;
        }
      } catch {
        // Retry failed or timed out — use original metrics
      }
    }

    const score = calculateScore(metrics);
    const tier = getScoreTier(score);


    if (supabase && metrics.txCount > 0 && score >= 400) {
      const strkBalance = metrics.strkBalance
        ? (BigInt(metrics.strkBalance) / BigInt(1e18)).toString()
        : "0";
      const usdcBalance = metrics.usdcBalance
        ? (BigInt(metrics.usdcBalance) / BigInt(1e6)).toString()
        : "0";

      const { error: upsertError } = await supabase
        .from("wallet_scores")
        .upsert(
          {
            address: address.toLowerCase(),
            score,
            tier,
            personality_type: null,
            wallet_age_days: metrics.walletAgeDays || 0,
            tx_count: metrics.txCount || 0,
            strk_balance: strkBalance,
            usdc_balance: usdcBalance,
            created_at: new Date().toISOString(),
          },
          { onConflict: "address" },
        );

      if (upsertError) {
        console.error("Supabase upsert error:", upsertError.message);
      }
    }

    const noTransactions = metrics.txCount === 0;

    return NextResponse.json(
      {
        metrics: {
          ...metrics,
          lastActivityDate: metrics.lastActivityDate?.toISOString(),
          firstTxDate: metrics.firstTxDate?.toISOString() ?? null,
        },
        score,
        tier,
        noTransactions,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error("Metrics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet metrics" },
      { status: 500 },
    );
  }
}
