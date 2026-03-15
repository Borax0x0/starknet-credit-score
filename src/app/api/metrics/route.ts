import { NextRequest, NextResponse } from 'next/server';
import { getWalletMetrics, calculateScore, getScoreTier } from '@/lib/starknet';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
    }

    try {
        const metrics = await getWalletMetrics(address);
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
        });
    } catch (error) {
        console.error('Metrics fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet metrics' },
            { status: 500 }
        );
    }
}
