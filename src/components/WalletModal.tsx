'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WALLETS = [
  {
    id: 'cartridge',
    name: 'Cartridge Controller',
    description: 'Gasless transactions for gaming',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
        <circle cx="16" cy="16" r="14" fill="#7C3AED" />
        <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" fill="white" />
      </svg>
    ),
    installUrl: 'https://cartridge.gg/',
  },
  {
    id: 'argent',
    name: 'Argent X',
    description: 'Security-focused Starknet wallet',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
        <circle cx="16" cy="16" r="14" fill="#EAB308" />
        <path d="M16 6L24 10V22L16 26L8 22V10L16 6Z" fill="white" />
        <circle cx="16" cy="16" r="4" fill="#EAB308" />
      </svg>
    ),
    installUrl: 'https://www.argent.xyz/argent-x/',
  },
  {
    id: 'braavos',
    name: 'Braavos',
    description: 'Powerful Starknet wallet',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
        <circle cx="16" cy="16" r="14" fill="#F97316" />
        <path d="M16 8C16 8 10 12 10 18C10 22 12.5 24 16 24C19.5 24 22 22 22 18C22 12 16 8 16 8Z" fill="white" />
      </svg>
    ),
    installUrl: 'https://braavos.app/',
  },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletId: string, address: string) => void;
}

declare global {
  interface Window {
    starknet?: {
      isConnected?: () => Promise<boolean>;
      enable?: () => Promise<string[]>;
      selectedAddress?: string;
    };
  }
}

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    console.log('Connecting wallet:', walletId);
    setConnecting(walletId);
    setError(null);

    try {
      if (walletId === 'cartridge') {
        const { StarkZap } = await import('starkzap');
        const sdk = new StarkZap({ network: 'mainnet' });
        const wallet = await sdk.connectCartridge();
        const walletAddress = wallet.address.toString();
        console.log('Cartridge connected, address:', walletAddress);
        onClose();
        onConnect(walletId, walletAddress);
        return;
      }

      const starknet = (window as any).starknet;
      
      if (!starknet?.enable) {
        const wallet = WALLETS.find(w => w.id === walletId);
        if (wallet) {
          window.open(wallet.installUrl, '_blank');
          setError(`${wallet.name} not installed. Redirecting to install...`);
        } else {
          setError('Wallet not found. Please install a Starknet wallet.');
        }
        setConnecting(null);
        return;
      }

      const accounts = await starknet.enable();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No account found. Please create an account in your wallet.');
      }

      onConnect(walletId, accounts[0]);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setConnecting(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#12121a] border border-primary/20 rounded-2xl p-6 z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {WALLETS.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={connecting !== null}
                  className="w-full flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-xl hover:border-primary/40 transition-all disabled:opacity-50"
                >
                  <div className="flex-shrink-0">{wallet.icon}</div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-white">{wallet.name}</p>
                    <p className="text-xs text-zinc-400">{wallet.description}</p>
                  </div>
                  {connecting === wallet.id && (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-zinc-500 text-center">
              By connecting, you agree to our Terms of Service
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
