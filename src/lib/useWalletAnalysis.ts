'use client';

import { useEffect, useState } from 'react';
import type { WalletMetrics } from '@/lib/starknet';

interface Personality {
    type: string;
    description: string;
}

interface WalletAnalysis {
    metrics: WalletMetrics | null;
    score: number;
    tier: string;
    personality: Personality | null;
    loading: boolean;
    error: string;
}

export function useWalletAnalysis(address: string): WalletAnalysis {
    const [metrics, setMetrics] = useState<WalletMetrics | null>(null);
    const [score, setScore] = useState(0);
    const [tier, setTier] = useState('');
    const [personality, setPersonality] = useState<Personality | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!address) return;

        const analyze = async () => {
            setLoading(true);
            setError('');

            try {
                // Fetch metrics from our server-side API (avoids CORS issues with Starknet RPC)
                const metricsRes = await fetch(`/api/metrics?address=${encodeURIComponent(address)}`);
                const metricsData = await metricsRes.json();

                if (metricsData.error) {
                    throw new Error(metricsData.error);
                }

                // Deserialize dates
                const data: WalletMetrics = {
                    ...metricsData.metrics,
                    lastActivityDate: new Date(metricsData.metrics.lastActivityDate),
                    firstTxDate: new Date(metricsData.metrics.firstTxDate),
                };

                setMetrics(data);
                setScore(metricsData.score);
                setTier(metricsData.tier);

                // Fetch AI personality analysis
                try {
                    const res = await fetch('/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            metrics: {
                                walletAgeDays: data.walletAgeDays,
                                txCount: data.txCount,
                                uniqueTokens: data.uniqueTokens,
                                hasSTRK: data.hasSTRK,
                                hasUSDC: data.hasUSDC,
                                daysSinceLastTx: data.daysSinceLastTx,
                            },
                        }),
                    });
                    const personalityData = await res.json();
                    if (personalityData.error) {
                        setPersonality({ type: 'Mysterious Whale', description: 'A quiet presence on the network.' });
                    } else {
                        setPersonality(personalityData);
                    }
                } catch {
                    setPersonality({ type: 'Mysterious Whale', description: 'A quiet presence on the network.' });
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch wallet data. Please check the address.');
            } finally {
                setLoading(false);
            }
        };

        analyze();
    }, [address]);

    return { metrics, score, tier, personality, loading, error };
}
