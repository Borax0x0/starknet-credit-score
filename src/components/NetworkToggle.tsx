'use client';

import { useNetwork } from './NetworkProvider';

export function NetworkToggle() {
  const { network, setNetwork } = useNetwork();

  return (
    <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
      <button
        onClick={() => setNetwork('mainnet')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          network === 'mainnet'
            ? 'bg-amber-500 text-black'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        Mainnet
      </button>
      <button
        onClick={() => setNetwork('sepolia')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          network === 'sepolia'
            ? 'bg-amber-500 text-black'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        Sepolia
      </button>
    </div>
  );
}
