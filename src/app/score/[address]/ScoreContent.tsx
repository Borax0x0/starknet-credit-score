'use client';

import { useState, useEffect } from 'react';
import { useWalletAnalysis } from '@/lib/useWalletAnalysis';
import { WalletDNA } from '@/components/WalletDNA';
import { StakePanel } from '@/components/StakePanel';
import Link from 'next/link';
import { TrendingUp, Wallet, Fingerprint, Zap, Calendar, DollarSign, BadgeCheck, Clock, BarChart2 } from 'lucide-react';

interface Props {
  params: Promise<{ address: string }>;
  searchParams?: Promise<{ network?: string }>;
}

export default function ScoreContent({ params, searchParams }: Props) {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<'mainnet' | 'sepolia'>('mainnet');

  useEffect(() => {
    params.then((p) => setAddress(p.address));
  }, [params]);

  useEffect(() => {
    if (searchParams) {
      searchParams.then((s) => {
        setNetwork(s.network === 'sepolia' ? 'sepolia' : 'mainnet');
      });
    }
  }, [searchParams]);

  const { metrics, score, personality, loading, error } = useWalletAnalysis(address, network);
  const [staked, setStaked] = useState(false);
  const [showStakePanel, setShowStakePanel] = useState(false);

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
      setFade(false);
      setTimeout(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
        setFade(true);
      }, 300);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
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
          <div className="w-16 h-16 mx-auto animate-spin-slow">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-primary">
              <path d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor"/>
              <path d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor"/>
            </svg>
          </div>
          <p
            className={`text-xl text-zinc-300 font-medium min-h-[2em] ${fade ? 'loading-fade-in' : 'loading-fade-out'}`}
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
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-xl">{error}</p>
          <Link href="/" className="text-primary hover:underline text-lg">Go back</Link>
        </div>
      </div>
    );
  }

  const getScoreTier = (): string => {
    const scoreNum = score || 0;
    if (scoreNum >= 750) return 'Excellent';
    if (scoreNum >= 700) return 'Very Good';
    if (scoreNum >= 600) return 'Good';
    if (scoreNum >= 500) return 'Fair';
    return 'Poor';
  };

  const getScoreGlow = (): string => {
    const scoreNum = score || 0;
    if (scoreNum >= 750) return 'score-ring-green';
    if (scoreNum >= 650) return 'score-ring-blue';
    if (scoreNum >= 550) return 'score-ring-yellow';
    return 'score-ring-red';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col">
      <header className="flex items-center justify-between border-b border-primary/20 px-6 md:px-20 py-4 backdrop-blur-md sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
              <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">Starknet <span className="text-primary">Credit</span></h2>
        </div>
        <Link
          href={`/card/${address}`}
          className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          View Card →
        </Link>
      </header>

      <main className="flex-grow">
        <div className="relative w-full h-[300px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-blue-600/10 to-orange-500/10"></div>
          <div className="absolute inset-0 dna-canvas-glow">
            {metrics && (
              <WalletDNA address={address} metrics={metrics} score={score} size={800} />
            )}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <div className="text-center mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest border border-primary/30">On-Chain Identity</span>
            </div>
            <p className="text-slate-400 text-sm font-mono">{address.slice(0, 10)}...{address.slice(-8)}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto -mt-32 relative z-10 px-4 pb-12">
          <div className="flex flex-col items-center">
            <div className={`relative size-64 md:size-80 flex items-center justify-center rounded-full bg-[#0a0a0f] border-4 border-primary/40 ${getScoreGlow()}`}>
              <div className="absolute inset-2 border-2 border-dashed border-primary/20 rounded-full"></div>
              <div className="text-center">
                <h1 className="text-7xl md:text-8xl font-bold tracking-tighter" style={{ color: '#EC5728' }}>{score}</h1>
                <p className="font-bold uppercase tracking-[0.2em] text-sm mt-2" style={{ color: score >= 750 ? '#EC5728' : '#7c3aed' }}>{getScoreTier()}</p>
              </div>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-primary/10" cx="50" cy="50" fill="transparent" r="48" stroke="currentColor" strokeWidth="4"></circle>
                <circle className="text-primary" cx="50" cy="50" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301" strokeDashoffset={301 - Math.round(301 * (score / 850))} strokeWidth="4"></circle>
              </svg>
            </div>

            <div className="mt-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                The <span className="text-gradient">{personality?.type || 'Mystery'}</span>
              </h2>
              <p className="text-slate-400 max-w-md mx-auto">{personality?.description || 'Analyzing wallet personality...'}</p>
            </div>
          </div>

          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-16 mb-12">
              <MetricCard icon={<Calendar className="w-5 h-5" />} label="Wallet Age" value={`${metrics.walletAgeDays || 0} Days`} />
              <MetricCard icon={<Clock className="w-5 h-5" />} label="Transactions" value={metrics.txCount?.toLocaleString() || '0'} />
              <MetricCard icon={<Wallet className="w-5 h-5" />} label="Unique Tokens" value={(metrics.uniqueTokens || 0).toString()} />
              <MetricCard icon={<Zap className="w-5 h-5" />} label="Days Inactive" value={metrics.daysSinceLastTx !== null ? metrics.daysSinceLastTx.toString() : 'Unknown'} />
              <MetricCard icon={<DollarSign className="w-5 h-5" />} label="STRK Balance" value={`${(parseFloat(metrics.strkBalance || '0') / 1e18).toFixed(2)}`} />
              <MetricCard icon={<DollarSign className="w-5 h-5" />} label="USDC Balance" value={`${(parseFloat(metrics.usdcBalance || '0') / 1e6).toFixed(2)}`} />
            </div>
          )}

          {metrics && showStakePanel && !staked && (
            <div className="border-gradient-purple rounded-2xl p-8 mb-12">
              <StakePanel 
                walletAddress={address}
                strkBalance={metrics.strkBalance}
                network={network}
                onStakeSuccess={() => setStaked(true)} 
              />
            </div>
          )}

          {metrics && !staked && !showStakePanel && (
            <div className="border-gradient-purple rounded-2xl p-8 mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-6 h-6 text-primary" />
                    Boost Your Score
                  </h3>
                  <p className="text-slate-400 mt-2">Stake your STRK tokens to unlock the &apos;Diamond Hands&apos; multiplier and increase your credit rating by up to 50 points.</p>
                </div>
                <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                  <div className="bg-primary/20 rounded-lg px-4 py-2 border border-primary/30 flex justify-between items-center">
                    <span className="text-xs text-slate-300">Current Multiplier</span>
                    <span className="text-primary font-bold">1.0x</span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const { StarkZap } = await import('starkzap');
                        const sdk = new StarkZap({ network });
                        const wallet = await sdk.connectCartridge();
                        const connectedAddr = wallet.address.toString().toLowerCase();
                        if (connectedAddr !== address.toLowerCase()) {
                          alert('Please connect the wallet you are viewing');
                          return;
                        }
                        setShowStakePanel(true);
                      } catch (err) {
                        console.error('Connection failed:', err);
                      }
                    }}
                    className="bg-[#EC5728] hover:bg-[#EC5728]/90 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-[#EC5728]/25"
                  >
                    Start Staking
                  </button>
                </div>
              </div>
            </div>
          )}

          {staked && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center mb-12">
              <p className="text-green-400 font-semibold text-xl">🎉 You staked STRK! Your score has been boosted.</p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href={`/card/${address}`}
              className="block w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 px-6 rounded-xl text-center text-lg transition-all shadow-xl shadow-primary/20"
            >
              Share Card
            </Link>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `My Starknet wallet is a ${personality?.type || 'mystery'} with a credit score of ${score} 👀 What's yours? https://starknet-creditscore.vercel.app #Starknet #StarkzapChallenge`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold py-5 px-6 rounded-xl text-center text-lg transition-all backdrop-blur-md border border-white/10"
            >
              Share on 𝕏
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-[#0a0a0f] border-t border-primary/10 py-12 px-6 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 text-slate-100 font-bold text-xl mb-4">
              <div className="size-6 bg-primary rounded-sm"></div>
              Starknet Credit
            </div>
            <p className="text-slate-500 max-w-sm">The decentralized identity and credit scoring layer for the Starknet ecosystem. Transparent, secure, and verifiable.</p>
          </div>
          <div>
            <h4 className="text-slate-200 font-bold mb-4 uppercase text-xs tracking-widest">Protocol</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li><a className="hover:text-primary" href="#">Methodology</a></li>
              <li><a className="hover:text-primary" href="#">Data Sources</a></li>
              <li><a className="hover:text-primary" href="#">Security Audit</a></li>
              <li><a className="hover:text-primary" href="#">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-200 font-bold mb-4 uppercase text-xs tracking-widest">Social</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li><a className="hover:text-primary" href="#">Twitter / X</a></li>
              <li><a className="hover:text-primary" href="#">Discord</a></li>
              <li><a className="hover:text-primary" href="#">Telegram</a></li>
              <li><a className="hover:text-primary" href="#">Github</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">© 2026 Starknet Credit Score. <span className="text-[#EC5728]">Built on Starknet</span>.</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <a className="hover:text-slate-400" href="#">Terms of Service</a>
            <a className="hover:text-slate-400" href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex flex-col gap-3 hover:border-primary/40 transition-colors">
      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-100">{value}</p>
      </div>
    </div>
  );
}
