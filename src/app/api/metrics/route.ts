import { NextRequest, NextResponse } from 'next/server';
import { getWalletMetrics, calculateScore, getScoreTier } from '@/lib/starknet';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const network = searchParams.get('network') || 'mainnet';

    if (!address) {
        return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
    }

    try {
        const metrics = await getWalletMetrics(address, network);
        const score = calculateScore(metrics);
        const tier = getScoreTier(score);

        // Insert into Supabase
        console.log('[DEBUG] About to check supabase client. Is null?', supabase === null);
        console.log('[DEBUG] ENV URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'NOT SET');
        console.log('[DEBUG] ENV KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'NOT SET');
        
        if (supabase) {
            console.log('[DEBUG] Supabase client initialized, attempting insert for:', address);
            
            const strkBalance = metrics.strkBalance ? (BigInt(metrics.strkBalance) / BigInt(1e18)).toString() : '0';
            const usdcBalance = metrics.usdcBalance ? (BigInt(metrics.usdcBalance) / BigInt(1e6)).toString() : '0';
            
            const { data, error: insertError } = await supabase
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
                console.error('[DEBUG] Supabase insert error:', JSON.stringify(insertError));
            } else {
                console.log('[DEBUG] Supabase insert success:', JSON.stringify(data));
            }
        } else {
            console.log('[DEBUG] Supabase client is null - credentials may be missing');
        }

        return NextResponse.json({
            metrics: {
                ...metrics,
                // Serialize dates as ISO strings if they exist
                lastActivityDate: metrics.lastActivityDate?.toISOString(),
                firstTxDate: metrics.firstTxDate?.toISOString() ?? null,
            },
            score,
            tier,
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
