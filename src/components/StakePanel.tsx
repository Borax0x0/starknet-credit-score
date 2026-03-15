'use client';

import { useState, useEffect } from 'react';
import { getSTRKPools, stakeSTRK, getSTRKBalance, type StakingPool, type Network, createSDK } from '@/lib/staking';

interface StakePanelProps {
  walletAddress: string;
  strkBalance: string;
  network?: Network;
  onStakeSuccess?: () => void;
}

export function StakePanel({ walletAddress, strkBalance, network = 'mainnet', onStakeSuccess }: StakePanelProps) {
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [balance, setBalance] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [staking, setStaking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const poolsData = await getSTRKPools(network);
        setPools(poolsData);
        if (poolsData.length > 0) {
          setSelectedPool(poolsData[0]);
        }

        // Use passed balance from metrics instead of fetching separately
        setBalance(strkBalance);
      } catch (err) {
        console.error('Failed to fetch staking data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [walletAddress, network, strkBalance]);

  const handleStake = async () => {
    if (!amount || !selectedPool) {
      setError('Please enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(balance);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > balanceNum) {
      setError('Insufficient STRK balance');
      return;
    }

    setError('');
    setStaking(true);

    try {
      const sdk = createSDK(network);
      const wallet = await sdk.connectCartridge();

      const result = await stakeSTRK(wallet, selectedPool.poolAddress, amount, network);
      setTxHash(result.txHash);
      setSuccess(true);
      onStakeSuccess?.();
    } catch (err: any) {
      console.error('Stake failed:', err);
      setError(err.message || 'Stake failed. Please try again.');
    } finally {
      setStaking(false);
    }
  };

  const handleMax = () => {
    setAmount(balance);
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <p className="text-green-400 font-semibold text-lg">Stake Successful!</p>
          <p className="text-zinc-400 text-sm">
            {network === 'sepolia' ? 'Testnet' : 'Your'} STRK is now earning yield
          </p>
          {txHash && (
            <a
              href={network === 'sepolia' 
                ? `https://sepolia.starkscan.co/tx/${txHash}`
                : `https://starkscan.co/tx/${txHash}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 text-sm hover:underline block"
            >
              View Transaction →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <div>
            <p className="font-semibold">Stake to Boost Your Score</p>
            <p className="text-zinc-400 text-sm">Earn yield while improving your credit score</p>
          </div>
        </div>
        {selectedPool && (
          <div className="text-right">
            <p className="text-green-400 font-bold text-xl">{selectedPool.apr.toFixed(1)}%</p>
            <p className="text-zinc-500 text-xs">APY</p>
          </div>
        )}
      </div>

      {network === 'sepolia' && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2 text-center">
          <p className="text-yellow-400 text-sm font-medium">🔶 Sepolia Testnet Mode</p>
        </div>
      )}

      <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Your STRK Balance</span>
          <span className="font-semibold">{balance} STRK</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-zinc-400 text-sm">Amount to stake</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">STRK</span>
          </div>
          <button
            onClick={handleMax}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        onClick={handleStake}
        disabled={staking || !amount}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold py-3 px-6 rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {staking ? (
          <>
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            Staking...
          </>
        ) : (
          <>
            ⚡ Stake Now (Gasless)
          </>
        )}
      </button>

      <p className="text-zinc-500 text-xs text-center">
        Powered by Starkzap Paymaster • No gas required
      </p>
    </div>
  );
}
