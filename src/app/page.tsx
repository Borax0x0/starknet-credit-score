'use client';

import { useState } from 'react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = () => {
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    if (!address.startsWith('0x') || address.length < 64) {
      setError('Invalid Starknet address');
      return;
    }
    setError('');
    setLoading(true);
    window.location.href = `/score/${address}`;
  };

  const handleConnectWallet = async () => {
    setError('');
    setConnecting(true);
    try {
      const { StarkZap } = await import('starkzap');
      const sdk = new StarkZap({ network: 'mainnet' });
      const wallet = await sdk.connectCartridge();
      const walletAddress = wallet.address.toString();
      window.location.href = `/score/${walletAddress}`;
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet. Please try again.');
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Starknet Credit Score
          </h1>
          <p className="text-xl text-zinc-400">
            Your wallet has a reputation. Find out what it says.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <input
            type="text"
            placeholder="Paste any Starknet wallet address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold py-3 px-6 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Loading...' : 'Analyze Wallet'}
          </button>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-zinc-700"></div>
            <span className="text-zinc-500 text-sm">or</span>
            <div className="flex-1 h-px bg-zinc-700"></div>
          </div>

          <button
            onClick={handleConnectWallet}
            disabled={connecting}
            className="w-full bg-zinc-800 border border-zinc-700 text-white font-semibold py-3 px-6 rounded-xl hover:bg-zinc-700 hover:border-zinc-600 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {connecting ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
                Connect Wallet
              </>
            )}
          </button>
        </div>

        <p className="text-zinc-500 text-sm">
          Powered by Starkzap SDK • AI-powered personality analysis
        </p>
      </div>
    </div>
  );
}
