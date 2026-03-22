'use client';

import { useEffect, useState } from 'react';
import type { WalletMetrics } from '@/lib/starknet';
import { supabase } from '@/lib/supabase';

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
    fromCache: boolean;
}

function getFallbackPersonality(metrics: { txCount: number; hasSTRK: boolean; walletAgeDays: number; uniqueTokens: number }): Personality {
    if (metrics.txCount > 100000) return { 
        type: 'Power Trader', 
        description: 'An unstoppable force on Starknet with hundreds of thousands of transactions. Speed and volume define this wallet.' 
    };
    if (metrics.txCount > 10000) return { 
        type: 'DeFi Degen', 
        description: 'Deep in the trenches of Starknet DeFi, this wallet never sleeps and never stops.' 
    };
    if (metrics.hasSTRK && metrics.walletAgeDays > 180) return { 
        type: 'Diamond Hands', 
        description: 'Holding strong through every market cycle. Patience and conviction define this wallet.' 
    };
    if (metrics.uniqueTokens > 3) return { 
        type: 'Token Collector', 
        description: 'Always diversifying, always exploring. This wallet holds a bit of everything Starknet has to offer.' 
    };
    if (metrics.walletAgeDays < 30) return { 
        type: 'Early Explorer', 
        description: 'Just getting started on Starknet but already making moves. Watch this space.' 
    };
    return { 
        type: 'Cautious Accumulator', 
        description: 'Steady and deliberate. This wallet plays the long game on Starknet.' 
    };
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
    const [fromCache, setFromCache] = useState(false);

    const analyze = async () => {
        if (!address) return;
        setLoading(true);
        setError('');
        setNoTransactions(false);
        setFromCache(false);

        try {
            if (supabase) {
                const { data: cached } = await supabase
                    .from('wallet_scores')
                    .select('*')
                    .eq('address', address.toLowerCase())
                    .maybeSingle();

                if (cached && cached.unique_tokens !== null) {
                    const cachedMetrics: WalletMetrics = {
                        walletAgeDays: cached.wallet_age_days || 0,
                        txCount: cached.tx_count || 0,
                        uniqueTokens: cached.unique_tokens || 0,
                        strkBalance: cached.strk_balance 
                            ? (BigInt(Math.round(Number(cached.strk_balance) * 1e18))).toString() 
                            : '0',
                        usdcBalance: cached.usdc_balance 
                            ? (BigInt(Math.round(Number(cached.usdc_balance) * 1e6))).toString() 
                            : '0',
                        hasSTRK: Number(cached.strk_balance) > 0,
                        hasUSDC: Number(cached.usdc_balance) > 0,
                        daysSinceLastTx: cached.days_since_last_tx ?? null,
                        lastActivityDate: new Date(),
                        firstTxDate: null,
                    };

                    setMetrics(cachedMetrics);
                    setScore(cached.score);
                    setTier(cached.tier);
                    setFromCache(true);
                    setNoTransactions(false);
                    setLoading(false);

                    if (cached.personality_type) {
                        setPersonality({ 
                            type: cached.personality_type, 
                            description: cached.personality_description || '' 
                        });
                    }

                    return;
                }
            }

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
                const timeout = new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                );

                const analyzeRequest = fetch('/api/analyze', {
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
                }).then(res => res.json());

                const personalityData = await Promise.race([analyzeRequest, timeout]);

                if (personalityData.error) {
                    setPersonality(getFallbackPersonality({
                        txCount: data.txCount,
                        hasSTRK: data.hasSTRK,
                        walletAgeDays: data.walletAgeDays,
                        uniqueTokens: data.uniqueTokens,
                    }));
                } else {
                    setPersonality(personalityData);
                }
            } catch {
                setPersonality(getFallbackPersonality({
                    txCount: data.txCount,
                    hasSTRK: data.hasSTRK,
                    walletAgeDays: data.walletAgeDays,
                    uniqueTokens: data.uniqueTokens,
                }));
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

    return { metrics, score, tier, personality, loading, error, refetch, noTransactions, fromCache };
}
