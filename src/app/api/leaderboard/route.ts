import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const { data, error } = await supabase
            .from('wallet_scores')
            .select('address, score, tier, personality_type, wallet_age_days, tx_count, created_at')
            .order('score', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Supabase query error:', error);
            return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
        }

        const deduped = Array.from(
            new Map((data || []).map(entry => [entry.address, entry]))
            .values()
        );

        return NextResponse.json({ leaderboard: deduped });
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
