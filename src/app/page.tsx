'use client';

import { useState } from 'react';
import { TrendingUp, Wallet, Fingerprint } from 'lucide-react';
import { ExampleWallets } from '@/components/ExampleWallets';
import { motion } from 'framer-motion';

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
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
    try {
      const { StarkZap } = await import('starkzap');
      const sdk = new StarkZap({ network: 'mainnet' });
      const wallet = await sdk.connectCartridge();
      const walletAddress = wallet.address.toString();
      window.location.href = `/score/${walletAddress}`;
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const features = [
    { 
      icon: <TrendingUp className="w-7 h-7" />, 
      title: 'On-chain Activity', 
      desc: 'Analysis of transaction frequency, volume, and smart contract interactions over time to verify human behavior.',
      weight: 'Weight: 40%'
    },
    { 
      icon: <Wallet className="w-7 h-7" />, 
      title: 'DeFi Reputation', 
      desc: 'Evaluation of liquidity provision, lending history, and yield farming stability across major Starknet protocols.',
      weight: 'Weight: 35%'
    },
    { 
      icon: <Fingerprint className="w-7 h-7" />, 
      title: 'Social Identity', 
      desc: 'Verification of cross-chain identities, DAO participation, and community governance impact within the ecosystem.',
      weight: 'Weight: 25%'
    },
  ];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      <header className="flex items-center justify-between border-b border-primary/20 px-6 md:px-20 py-4 backdrop-blur-md sticky top-0 z-50 bg-[#0a0a0f]/50">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
              <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">Starknet <span className="text-primary">Score</span></h2>
        </div>
        <div className="hidden md:flex flex-1 justify-end gap-10 items-center">
          <nav className="flex items-center gap-8">
            <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Explorer</a>
            <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Features</a>
            <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">API</a>
            <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">About</a>
          </nav>
          <button 
            onClick={handleConnectWallet}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all border border-[#EC5728]/30"
          >
            Connect Wallet
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative px-6 md:px-20 pb-8 lg:pb-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]"></div>
          </div>
          <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EC5728]/10 border border-[#EC5728]/20 text-[#EC5728] text-xs font-bold uppercase tracking-widest w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC5728] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EC5728]"></span>
                </span>
                Starknet Mainnet Live
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight" style={{ color: '#ffffff' }}>
                  Your wallet has a <span className="text-primary">reputation</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-xl">
                  Unlock your on-chain potential. Analyze your Starknet credit health, DeFi reputation, and social identity with our advanced scoring engine.
                </p>
              </div>
              <div className="relative max-w-xl group">
                <motion.div 
                  className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-focus-within:opacity-60"
                  animate={{ opacity: [0.25, 0.6, 0.25] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative flex items-center bg-[#12121a] rounded-xl border border-primary/30 p-2 shadow-2xl group-focus-within:border-primary/60">
                  <Wallet className="ml-4 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter Starknet address (0x...)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    autoComplete="off"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-3 placeholder:text-slate-500 text-sm md:text-base outline-none"
                    style={{ background: 'transparent', WebkitBoxShadow: 'none', boxShadow: 'none' }}
                  />
                  <motion.button 
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="bg-[#EC5728] hover:bg-[#EC5728]/90 text-white px-6 md:px-8 py-3 rounded-lg font-bold text-sm md:text-base transition-all flex items-center gap-2 shadow-lg shadow-[#EC5728]/20 relative overflow-hidden"
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileTap={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="relative z-10">
                      {loading ? 'Analyzing...' : 'Analyze'}
                    </span>
                    <TrendingUp className="w-4 h-4 relative z-10" />
                  </motion.button>
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>
            </div>
            <div className="relative hidden lg:flex items-center justify-center">
              <ExampleWallets />
            </div>
          </div>
        </section>

        <section className="px-6 md:px-20 pt-8">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-16">
            <div className="flex flex-col gap-4 text-center items-center">
              <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight">Core Reputation Metrics</h2>
              <p className="text-slate-400 text-lg max-w-2xl">Our algorithm processes thousands of data points across the Starknet ecosystem to determine your credibility.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="flex flex-col gap-6 rounded-2xl border border-primary/10 bg-[#12121a] p-8 glow-purple transition-all duration-300">
                  <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-white text-xl font-bold">{feature.title}</h3>
                    <p className="text-slate-400 text-base leading-relaxed">{feature.desc}</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-white/5">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{feature.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 md:px-20 py-24 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-[50%] h-full bg-primary/5 blur-[150px] rotate-12"></div>
          </div>
          <div className="max-w-[1000px] mx-auto bg-gradient-to-br from-primary/20 to-accent/5 rounded-[2.5rem] p-12 md:p-20 text-center border border-white/10 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 size-40 bg-accent/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col items-center gap-8">
              <h2 className="text-white text-4xl md:text-5xl font-bold tracking-tight">Ready to see where you stand?</h2>
              <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed">Analyze your Starknet credit health, DeFi reputation, and social identity with our advanced scoring engine.</p>
              <button 
                onClick={handleAnalyze}
                className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-primary/20"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/10 px-6 md:px-20 py-12">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="size-6 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-white text-lg font-bold">Starknet Credit</h2>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              The trust layer for Starknet. Building transparent credit scoring and reputation systems for the decentralized web.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs">Resources</h4>
            <nav className="flex flex-col gap-2">
              <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">Documentation</a>
              <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">Integrations</a>
              <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">Developer Portal</a>
              <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">Whitepaper</a>
            </nav>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs">Platform</h4>
            <nav className="flex flex-col gap-2">
              <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">Leaderboard</a>
              <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">API Keys</a>
              <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">Governance</a>
              <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">Status</a>
            </nav>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">© 2026 Starknet Credit Score. <span className="text-[#EC5728]">Built on Starknet</span>.</p>
          <div className="flex gap-6">
            <a className="text-slate-400 hover:text-primary text-xs transition-colors" href="#">Privacy Policy</a>
            <a className="text-slate-400 hover:text-primary text-xs transition-colors" href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
