'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  address: string;
  score: number;
  tier: string;
  personality_type: string | null;
  wallet_age_days: number;
  tx_count: number;
  created_at: string;
}

const tierColors: Record<string, string> = {
  'Excellent': 'text-green-400',
  'Very Good': 'text-blue-400',
  'Good': 'text-blue-400',
  'Fair': 'text-yellow-400',
  'Poor': 'text-red-400',
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      <header className="flex items-center justify-between border-b border-primary/20 px-4 md:px-20 py-4 backdrop-blur-md sticky top-0 z-50 bg-[#0a0a0f]/80">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
              <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">Starknet <span className="text-primary">Credit</span></h2>
        </Link>
        <Link href="/" className="text-primary hover:text-primary/80 text-sm font-medium">
          ← Back
        </Link>
      </header>

      <main className="flex-1 px-4 md:px-20 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Leaderboard</h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 mt-4">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 bg-[#12121a] rounded-2xl border border-primary/10">
              <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No scores yet</p>
              <p className="text-slate-500 text-sm mt-2">Be the first to analyze your wallet!</p>
              <Link 
                href="/" 
                className="inline-block mt-4 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Get Your Score
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    href={`/score/${entry.address}`}
                    className="flex items-center gap-4 p-4 bg-[#12121a] rounded-xl border border-primary/10 hover:border-primary/30 transition-all group"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-slate-400/20 text-slate-300' :
                      index === 2 ? 'bg-orange-600/20 text-orange-400' :
                      'bg-primary/10 text-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-slate-300 truncate">
                        {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                      </p>
                      {entry.personality_type && (
                        <p className="text-xs text-primary">{entry.personality_type}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: entry.score >= 750 ? '#22c55e' : entry.score >= 650 ? '#3b82f6' : entry.score >= 550 ? '#eab308' : '#ef4444' }}>
                        {entry.score}
                      </p>
                      <p className={`text-xs font-medium ${tierColors[entry.tier] || 'text-slate-400'}`}>
                        {entry.tier}
                      </p>
                    </div>

                    <TrendingUp className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-primary/10 px-4 md:px-20 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-slate-500 text-xs">© 2026 Starknet Credit Score. <span className="text-[#EC5728]">Built on Starknet</span>.</p>
        </div>
      </footer>
    </div>
  );
}
