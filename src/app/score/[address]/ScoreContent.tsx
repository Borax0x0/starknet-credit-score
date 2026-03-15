'use client';

import { useState, useEffect } from 'react';
import { useWalletAnalysis } from '@/lib/useWalletAnalysis';
import { WalletDNA } from '@/components/WalletDNA';

interface Props {
  params: Promise<{ address: string }>;
}

export default function ScoreContent({ params }: Props) {
  const [address, setAddress] = useState('');

  useEffect(() => {
    params.then((p) => setAddress(p.address));
  }, [params]);

  const { metrics, score, tier, personality, loading, error } = useWalletAnalysis(address);

  // Loading messages that cycle every second
  const loadingMessages = [
    'Scanning the chain...',
    'Judging your financial decisions...',
    'Consulting the blockchain gods...',
    'Almost there...',
  ];

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setFade(false); // trigger fade out
      setTimeout(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
        setFade(true); // trigger fade in
      }, 300); // wait for fade-out before switching text
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center">
        <style>{`
          @keyframes loadingFade {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .loading-fade-in {
            animation: loadingFade 0.3s ease-out forwards;
          }
          .loading-fade-out {
            opacity: 0;
            transform: translateY(-6px);
            transition: opacity 0.3s ease-in, transform 0.3s ease-in;
          }
        `}</style>
        <div className="text-center space-y-6">
          <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p
            className={`text-lg text-zinc-300 font-medium min-h-[2em] ${fade ? 'loading-fade-in' : 'loading-fade-out'}`}
            key={loadingMsgIndex}
          >
            {loadingMessages[loadingMsgIndex]}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <a href="/" className="text-amber-400 hover:underline">Go back</a>
        </div>
      </div>
    );
  }

  const formatBalance = (balance: string, decimals: number = 18) => {
    const raw = BigInt(balance);
    const divisor = BigInt(10 ** decimals);
    const whole = raw / divisor;
    const fraction = raw % divisor;
    const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
    return `${whole}.${fractionStr}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <a href="/" className="text-zinc-400 hover:text-white transition-colors">
            ← Back
          </a>
          <a
            href={`/card/${address}`}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
          >
            View Card →
          </a>
        </div>

        <div className="text-center space-y-4">
          <p className="text-zinc-400 text-sm">Wallet Address</p>
          <p className="font-mono text-lg">{address.slice(0, 10)}...{address.slice(-8)}</p>
        </div>

        {metrics && (
          <div className="flex justify-center mb-8">
            <WalletDNA address={address} metrics={metrics} size={320} />
          </div>
        )}

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 text-center space-y-6">
          <div className="space-y-2">
            <p className="text-zinc-400">Credit Score</p>
            <p className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {score}
            </p>
            <p className="text-xl font-medium text-zinc-300">{tier}</p>
          </div>

          {personality && (
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <p className="text-zinc-400 text-sm">Personality Type</p>
              <p className="text-2xl font-semibold text-amber-400">{personality.type}</p>
              <p className="text-zinc-400">{personality.description}</p>
            </div>
          )}
        </div>

        {metrics && (
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Wallet Age" value={`${metrics.walletAgeDays} days`} />
            <MetricCard label="Transactions" value={metrics.txCount.toString()} />
            <MetricCard label="Unique Tokens" value={metrics.uniqueTokens.toString()} />
            <MetricCard label="Days Inactive" value={metrics.daysSinceLastTx !== null ? metrics.daysSinceLastTx.toString() : 'Unknown'} />
            <MetricCard label="STRK Balance" value={formatBalance(metrics.strkBalance)} />
            <MetricCard label="USDC Balance" value={formatBalance(metrics.usdcBalance, 6)} />
          </div>
        )}

        <div className="flex gap-4">
          <a
            href={`/card/${address}`}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold py-4 px-6 rounded-xl text-center hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            Share Card
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `My Starknet wallet is a ${personality?.type || 'mystery'} with a credit score of ${score} 👀 What's yours? https://starknet-creditscore.vercel.app #Starknet #StarkzapChallenge`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all border border-zinc-700"
          >
            Share on 𝕏
          </a>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4">
      <p className="text-zinc-500 text-sm">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
