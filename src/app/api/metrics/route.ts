import { NextRequest, NextResponse } from 'next/server';
import { getWalletMetrics, calculateScore, getScoreTier } from '@/lib/starknet';

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
