'use client';

import { useState, useEffect } from 'react';
import { getSTRKPools, stakeSTRK, type StakingPool, type Network, createSDK } from '@/lib/staking';

interface StakePanelProps {
  walletAddress: string;
  strkBalance: string;
  network?: Network;
  onStakeSuccess?: () => void;
}

export function StakePanel({ walletAddress, strkBalance, network = 'mainnet', onStakeSuccess }: StakePanelProps) {
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
        if (poolsData.length > 0) {
          setSelectedPool(poolsData[0]);
        }
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
    } catch (err: unknown) {
      console.error('Stake failed:', err);
      const message = err instanceof Error ? err.message : 'Stake failed. Please try again.';
      setError(message);
    } finally {
      setStaking(false);
    }
  };

  const handleMax = () => {
    setAmount(balance);
  };

  if (loading) {
    return (
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 animate-pulse">
        <div className="h-7 bg-[#1e1e2e] rounded w-1/3 mb-4"></div>
        <div className="h-5 bg-[#1e1e2e] rounded w-1/2"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="text-5xl">🎉</div>
          <p className="text-green-400 font-bold text-xl">Stake Successful!</p>
          <p className="text-zinc-400">
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
              className="text-[#f97316] hover:underline block"
            >
              View Transaction →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💰</span>
          <div>
            <p className="font-bold text-xl">Stake to Boost Your Score</p>
            <p className="text-zinc-400">Earn yield while improving your credit score</p>
          </div>
        </div>
        {selectedPool && (
          <div className="text-right">
            <p className="text-green-400 font-bold text-2xl">{selectedPool.apr.toFixed(1)}%</p>
            <p className="text-zinc-500 text-sm">APY</p>
          </div>
        )}
      </div>

      {network === 'sepolia' && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-3 text-center">
          <p className="text-yellow-400 font-medium">🔶 Sepolia Testnet Mode</p>
        </div>
      )}

      <div className="bg-[#1e1e2e]/50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-zinc-400 text-lg">Your STRK Balance</span>
          <span className="font-bold text-lg">{balance} STRK</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-zinc-400 text-lg">Amount to stake</label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1e1e2e] border border-[#2a2a3e] rounded-xl px-5 py-4 text-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">STRK</span>
          </div>
          <button
            onClick={handleMax}
            className="bg-[#2a2a3e] hover:bg-[#3a3a4e] px-5 py-4 rounded-xl font-medium transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400">{error}</p>
      )}

      <button
        onClick={handleStake}
        disabled={staking || !amount}
        className="w-full bg-gradient-to-r from-[#EC5728] to-orange-600 text-white font-bold text-lg py-4 px-6 rounded-xl hover:from-[#EC5728]/90 hover:to-orange-600/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      <p className="text-zinc-500 text-sm text-center">
        Powered by Starkzap Paymaster • No gas required
      </p>
    </div>
  );
}
