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
    refetch: () => void;
    noTransactions: boolean;
}

export function useWalletAnalysis(address: string, network: string = 'mainnet'): WalletAnalysis {
    const [metrics, setMetrics] = useState<WalletMetrics | null>(null);
    const [score, setScore] = useState(0);
    const [tier, setTier] = useState('');
    const [personality, setPersonality] = useState<Personality | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addressKey, setAddressKey] = useState(0);
    const [noTransactions, setNoTransactions] = useState(false);

    const analyze = async () => {
        setLoading(true);
        setError('');
        setNoTransactions(false);

        try {
            const metricsRes = await fetch(`/api/metrics?address=${encodeURIComponent(address)}&network=${network}`);
            const metricsData = await metricsRes.json();

            if (metricsData.error) {
                throw new Error(metricsData.error);
            }

            const data: WalletMetrics = {
                ...metricsData.metrics,
                lastActivityDate: new Date(metricsData.metrics.lastActivityDate),
                firstTxDate: metricsData.metrics.firstTxDate ? new Date(metricsData.metrics.firstTxDate) : null,
            };

            setMetrics(data);
            setScore(metricsData.score);
            setTier(metricsData.tier);
            setNoTransactions(metricsData.noTransactions || false);

            try {
                const res = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address: address,
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

    useEffect(() => {
        if (!address) return;
        analyze();
    }, [address, network, addressKey]);

    const refetch = () => {
        setAddressKey(prev => prev + 1);
    };

    return { metrics, score, tier, personality, loading, error, refetch, noTransactions };
}
