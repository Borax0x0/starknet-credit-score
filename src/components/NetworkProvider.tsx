'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Network } from '@/lib/staking';

interface NetworkContextType {
  network: Network;
  setNetwork: (n: Network) => void;
}

const NetworkContext = createContext<NetworkContextType>({
  network: 'mainnet',
  setNetwork: () => {},
});

export function useNetwork() {
  return useContext(NetworkContext);
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<Network>('mainnet');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('starknet-network') as Network;
    if (saved === 'mainnet' || saved === 'sepolia') {
      setNetworkState(saved);
    }
  }, []);

  const setNetwork = (n: Network) => {
    setNetworkState(n);
    localStorage.setItem('starknet-network', n);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}
