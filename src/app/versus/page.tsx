'use client';

import { useState } from 'react';
import { useWalletAnalysis } from '@/lib/useWalletAnalysis';
import { WalletDNA } from '@/components/WalletDNA';

interface WalletData {
  score: number;
  metrics: any;
  personality: any;
}

function WalletCard({ address, onDataReady }: { address: string; onDataReady: (data: WalletData) => void }) {
  const { metrics, score, tier, personality, loading, error } = useWalletAnalysis(address);

  const formatBalance = (balance: string, decimals: number = 18) => {
    if (!balance) return '0';
    const raw = BigInt(balance);
    const divisor = BigInt(10 ** decimals);
    const whole = raw / divisor;
    const fraction = raw % divisor;
    const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
    return `${whole}.${fractionStr}`;
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 min-h-[500px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 min-h-[500px] flex items-center justify-center">
        <p className="text-red-400">Failed to load wallet</p>
      </div>
    );
  }

  if (onDataReady) {
    onDataReady({ score, metrics, personality });
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="text-center">
        <p className="text-zinc-400 text-sm">Wallet Address</p>
        <p className="font-mono text-sm">{address.slice(0, 10)}...{address.slice(-8)}</p>
      </div>

      <div className="flex justify-center">
        <WalletDNA address={address} metrics={metrics} size={200} />
      </div>

      <div className="text-center space-y-2">
        <p className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          {score}
        </p>
        <p className="text-zinc-300 font-medium">{tier}</p>
        {personality && (
          <p className="text-amber-400 font-semibold">{personality.type}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-zinc-800/50 rounded-lg p-2">
          <p className="text-zinc-500 text-xs">Age</p>
          <p className="font-semibold">{metrics.walletAgeDays} days</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2">
          <p className="text-zinc-500 text-xs">Txs</p>
          <p className="font-semibold">{metrics.txCount}</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2">
          <p className="text-zinc-500 text-xs">Tokens</p>
          <p className="font-semibold">{metrics.uniqueTokens}</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2">
          <p className="text-zinc-500 text-xs">STRK</p>
          <p className="font-semibold">{formatBalance(metrics.strkBalance)}</p>
        </div>
      </div>
    </div>
  );
}

export default function VersusPage() {
  const [walletA, setWalletA] = useState('');
  const [walletB, setWalletB] = useState('');
  const [battle, setBattle] = useState(false);
  const [roast, setRoast] = useState('');
  const [loadingRoast, setLoadingRoast] = useState(false);
  const [error, setError] = useState('');
  const [walletAData, setWalletAData] = useState<WalletData | null>(null);
  const [walletBData, setWalletBData] = useState<WalletData | null>(null);

  const validateAddress = (addr: string) => {
    return addr.startsWith('0x') && addr.length >= 64;
  };

  const handleBattle = () => {
    if (!walletA.trim() || !walletB.trim()) {
      setError('Please enter both wallet addresses');
      return;
    }
    if (!validateAddress(walletA) || !validateAddress(walletB)) {
      setError('Invalid Starknet addresses');
      return;
    }
    setError('');
    setWalletAData(null);
    setWalletBData(null);
    setRoast('');
    setBattle(true);
  };

  const fetchRoast = async () => {
    if (!walletAData || !walletBData) return;

    setLoadingRoast(true);
    try {
      const res = await fetch('/api/versus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletA: {
            personality: walletAData.personality?.type || 'Unknown',
            score: walletAData.score,
            age: walletAData.metrics.walletAgeDays,
            txs: walletAData.metrics.txCount,
            tokens: walletAData.metrics.uniqueTokens,
          },
          walletB: {
            personality: walletBData.personality?.type || 'Unknown',
            score: walletBData.score,
            age: walletBData.metrics.walletAgeDays,
            txs: walletBData.metrics.txCount,
            tokens: walletBData.metrics.uniqueTokens,
          },
        }),
      });
      const data = await res.json();
      if (data.roast) {
        setRoast(data.roast);
      }
    } catch (err) {
      console.error('Roast error:', err);
    } finally {
      setLoadingRoast(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <a href="/" className="text-zinc-400 hover:text-white transition-colors">
            ← Back
          </a>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">
            Wallet vs Wallet <span className="text-amber-500">⚔️</span>
          </h1>
          <p className="text-zinc-400">Enter two wallets and let AI decide the winner</p>
        </div>

        {!battle ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-zinc-400 text-sm">Wallet A</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={walletA}
                  onChange={(e) => setWalletA(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-zinc-400 text-sm">Wallet B</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={walletB}
                  onChange={(e) => setWalletB(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleBattle}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-4 px-6 rounded-xl text-xl hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              ⚔️ Battle
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <WalletCard address={walletA} onDataReady={setWalletAData} />
              <WalletCard address={walletB} onDataReady={setWalletBData} />
            </div>

            {roast && (
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 space-y-4">
                <p className="text-amber-400 font-semibold text-center">🏆 The Verdict</p>
                <p className="text-lg text-center leading-relaxed">{roast}</p>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(roast + ' ⚔️ https://starknet-creditscore.vercel.app/versus')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-xl text-center transition-all border border-zinc-700"
                >
                  Share Roast on 𝕏
                </a>
              </div>
            )}

            {!roast && !loadingRoast && walletAData && walletBData && (
              <div className="flex justify-center">
                <button
                  onClick={fetchRoast}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold py-3 px-6 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all"
                >
                  🔥 Get The Roast
                </button>
              </div>
            )}

            {loadingRoast && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-zinc-400">AI is cooking...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
