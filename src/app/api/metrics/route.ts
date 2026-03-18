import { NextRequest, NextResponse } from 'next/server';
import { getWalletMetrics, calculateScore, getScoreTier, WalletMetrics } from '@/lib/starknet';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const RPC_TIMEOUT = 10000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('RPC timeout, please retry')), ms)
    ),
  ]);
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const network = searchParams.get('network') || 'mainnet';

    if (!address) {
        return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
    }

    try {
        let metrics: WalletMetrics;
        
        try {
            metrics = await withTimeout(getWalletMetrics(address, network), RPC_TIMEOUT);
        } catch (timeoutError) {
            if (timeoutError instanceof Error && timeoutError.message === 'RPC timeout, please retry') {
                return NextResponse.json(
                    { error: 'RPC timeout, please retry' },
                    { status: 503 }
                );
            }
            throw timeoutError;
        }

        if (metrics.txCount === 0 && address && address.length > 0) {
            console.log('[DEBUG] txCount is 0, waiting 1200ms and retrying...');
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            try {
                const retryMetrics = await withTimeout(getWalletMetrics(address, network), RPC_TIMEOUT);
                if (retryMetrics.txCount > 0) {
                    metrics = retryMetrics;
                    metrics.isRetry = true;
                    console.log(`[DEBUG] Retry successful, txCount: ${metrics.txCount}`);
                }
            } catch (retryError) {
                console.log('[DEBUG] Retry failed or timed out, using original metrics');
            }
        }

        const score = calculateScore(metrics);
        const tier = getScoreTier(score);

        if (supabase) {
            const strkBalance = metrics.strkBalance ? (BigInt(metrics.strkBalance) / BigInt(1e18)).toString() : '0';
            const usdcBalance = metrics.usdcBalance ? (BigInt(metrics.usdcBalance) / BigInt(1e6)).toString() : '0';
            
            const { error: insertError } = await supabase
                .from('wallet_scores')
                .insert({
                    address: address.toLowerCase(),
                    score,
                    tier,
                    personality_type: null,
                    wallet_age_days: metrics.walletAgeDays || 0,
                    tx_count: metrics.txCount || 0,
                    strk_balance: strkBalance,
                    usdc_balance: usdcBalance,
                    created_at: new Date().toISOString(),
                });

            if (insertError) {
                console.error('Supabase insert error:', insertError.message);
            }
        }

        const noTransactions = metrics.txCount === 0;

        return NextResponse.json({
            metrics: {
                ...metrics,
                lastActivityDate: metrics.lastActivityDate?.toISOString(),
                firstTxDate: metrics.firstTxDate?.toISOString() ?? null,
            },
            score,
            tier,
            noTransactions,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error('Metrics fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet metrics' },
            { status: 500 }
        );
    }
}
