"use client";

import { useState, useEffect, useRef } from "react";
import { useWalletAnalysis } from "@/lib/useWalletAnalysis";
import { getScoreBreakdown, calculateScore, getScoreTier as getScoreTierFromLib } from "@/lib/starknet";
import { WalletDNA } from "@/components/WalletDNA";
import { StakePanel } from "@/components/StakePanel";
import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  Zap,
  Calendar,
  DollarSign,
  Clock,
  BarChart2,
  Trophy,
  Lock,
} from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";

interface Props {
  params: Promise<{ address: string }>;
  searchParams?: Promise<{ network?: string }>;
}

interface CreditScoreCardProps {
  score?: number;
  tier?: string;
  personalityType?: string;
  walletAddress?: string;
  children?: React.ReactNode;
  fromCache?: boolean;
}

function CreditScoreCard({
  score = 750,
  tier = 'excellent',
  personalityType = 'Diamond Hand',
  walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  children,
  fromCache = false,
}: CreditScoreCardProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateBorder = () => {
      const now = Date.now() / 1000;
      const speed = 0.5;
      const topX = Math.sin(now * speed) * 100;
      const rightY = Math.cos(now * speed) * 100;
      const bottomX = Math.sin(now * speed + Math.PI) * 100;
      const leftY = Math.cos(now * speed + Math.PI) * 100;
      if (topRef.current) topRef.current.style.transform = `translateX(${topX}%)`;
      if (rightRef.current) rightRef.current.style.transform = `translateY(${rightY}%)`;
      if (bottomRef.current) bottomRef.current.style.transform = `translateX(${bottomX}%)`;
      if (leftRef.current) leftRef.current.style.transform = `translateY(${leftY}%)`;
      requestAnimationFrame(animateBorder);
    };
    const animationId = requestAnimationFrame(animateBorder);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const tierColors: Record<string, string> = {
    'Excellent': '#f59e0b',
    'Very Good': '#7c3aed',
    'Good': '#0891b2',
    'Fair': '#EC5728',
    'Poor': '#ef4444',
  };

  const tierLabels: Record<string, string> = {
    'Excellent': 'Excellent',
    'Very Good': 'Very Good',
    'Good': 'Good',
    'Fair': 'Fair',
    'Poor': 'Poor',
  };

  const borderColor = tierColors[tier] || tierColors['Good'];
  const tierLabel = tierLabels[tier];

  return (
    <div className="relative w-full max-w-[380px] aspect-[2/3] bg-[#0d0d14] rounded-2xl overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: borderColor }}></div>

      <div className="absolute top-0 left-0 w-full h-0.5 overflow-hidden opacity-50">
        <div
          ref={topRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `linear-gradient(to right, transparent, ${borderColor}, transparent)`,
          }}
        ></div>
      </div>

      <div className="absolute top-0 right-0 w-0.5 h-full overflow-hidden opacity-50">
        <div
          ref={rightRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `linear-gradient(to bottom, transparent, ${borderColor}, transparent)`,
          }}
        ></div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden opacity-50">
        <div
          ref={bottomRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `linear-gradient(to right, transparent, ${borderColor}, transparent)`,
          }}
        ></div>
      </div>

      <div className="absolute top-0 left-0 w-0.5 h-full overflow-hidden opacity-50">
        <div
          ref={leftRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `linear-gradient(to bottom, transparent, ${borderColor}, transparent)`,
          }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col h-full p-5 md:p-6">
        <div className="flex items-baseline gap-2 mb-1">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{score}</h1>
          <span
            className="px-2 py-0.5 text-[10px] font-semibold rounded inline-block"
            style={{
              backgroundColor: `${borderColor}20`,
              color: borderColor,
              border: `1px solid ${borderColor}40`,
            }}
          >
            {tierLabel}
          </span>
        </div>

        <p className="text-slate-400 text-xs font-medium mb-3">{personalityType}</p>

        <div className="flex-1 relative rounded-xl overflow-hidden bg-black/20 border border-white/5">
          {children}

          <div
            className="absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: borderColor }}
          ></div>
          <div
            className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: borderColor, animationDelay: '0.5s' }}
          ></div>
          <div
            className="absolute top-1/2 right-6 w-1 h-1 rounded-full animate-pulse"
            style={{ backgroundColor: borderColor, animationDelay: '1s' }}
          ></div>
        </div>

        <div className="mt-3">
          <p className="text-slate-600 text-[10px] font-mono tracking-wider truncate">
            {walletAddress}
          </p>
          {fromCache && (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium">
              ⚡ Instant load
            </span>
          )}
        </div>
      </div>

      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: borderColor }}
      ></div>
      <div
        className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: borderColor }}
      ></div>
    </div>
  );
}

export default function ScoreContent({ params, searchParams }: Props) {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState<"mainnet" | "sepolia">("mainnet");
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    params.then((p) => setAddress(p.address));
  }, [params]);

  useEffect(() => {
    if (searchParams) {
      searchParams.then((s) => {
        setNetwork(s.network === "sepolia" ? "sepolia" : "mainnet");
      });
    }
  }, [searchParams]);

  const {
    metrics,
    score,
    personality,
    loading,
    error,
    refetch,
    noTransactions,
    fromCache,
  } = useWalletAnalysis(address, network);
  const [staked, setStaked] = useState(false);
  const [showStakePanel, setShowStakePanel] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simWalletAge, setSimWalletAge] = useState(0);
  const [simTxCount, setSimTxCount] = useState(0);
  const [simUniqueTokens, setSimUniqueTokens] = useState(0);
  const [simDaysSinceLastTx, setSimDaysSinceLastTx] = useState(30);
  const [simHasSTRK, setSimHasSTRK] = useState(false);
  const [simHasUSDC, setSimHasUSDC] = useState(false);

  useEffect(() => {
    if (metrics) {
      setSimWalletAge(metrics.walletAgeDays || 0);
      setSimTxCount(Math.min(metrics.txCount || 0, 200));
      setSimUniqueTokens(metrics.uniqueTokens || 0);
      setSimDaysSinceLastTx(metrics.daysSinceLastTx ?? 30);
      setSimHasSTRK(metrics.hasSTRK || false);
      setSimHasUSDC(metrics.hasUSDC || false);
    }
  }, [metrics]);

  const loadingMessages = [
    "Scanning the chain...",
    "Judging your financial decisions...",
    "Consulting the blockchain gods...",
    "Almost there...",
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
        <motion.div
          className="fixed top-0 left-0 h-1 bg-[#EC5728] z-50"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        <style>{`
          @keyframes loadingFade {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
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
          <div className="w-16 h-16 mx-auto relative">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-primary animate-spin-slow"
            >
              <path
                d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                fill="currentColor"
              />
              <path
                d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <p
            className={`text-xl text-zinc-300 font-medium min-h-[2em] ${fade ? "loading-fade-in" : "loading-fade-out"}`}
            key={loadingMsgIndex}
          >
            {loadingMessages[loadingMsgIndex]}
          </p>
          <p className="text-zinc-500 text-sm">Analyzing wallet...</p>
        </div>
      </div>
    );
  }

  if (noTransactions) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="size-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-zinc-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              No Transactions Found
            </h2>
            <p className="text-zinc-400">
              This wallet may be new or the RPC is slow — try again.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={refetch}
              className="bg-[#EC5728] hover:bg-[#EC5728]/90 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Retry Analysis
            </button>
            <Link href="/" className="text-primary hover:underline text-lg">
              Go back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-xl">{error}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={refetch}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              Try Again
            </button>
            <Link href="/" className="text-primary hover:underline text-lg">
              Go back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getScoreTier = (): string => {
    const scoreNum = score || 0;
    if (scoreNum >= 750) return "Excellent";
    if (scoreNum >= 700) return "Very Good";
    if (scoreNum >= 650) return "Good";
    if (scoreNum >= 600) return "Fair";
    return "Poor";
  };

  const getCreditScoreTier = (): string => {
    return getScoreTier();
  };

  const getScoreGlow = (): string => {
    const scoreNum = score || 0;
    if (scoreNum >= 750) return "score-ring-green";
    if (scoreNum >= 650) return "score-ring-blue";
    if (scoreNum >= 550) return "score-ring-yellow";
    return "score-ring-red";
  };

  const tierColors: Record<string, string> = {
    'Excellent': '#f59e0b',
    'Very Good': '#7c3aed',
    'Good': '#0891b2',
    'Fair': '#EC5728',
    'Poor': '#ef4444',
  };

  const simulatedScore = calculateScore({
    walletAgeDays: simWalletAge,
    txCount: simTxCount,
    uniqueTokens: simUniqueTokens,
    daysSinceLastTx: simDaysSinceLastTx,
    hasSTRK: simHasSTRK,
    hasUSDC: simHasUSDC,
    firstTxDate: simWalletAge > 0 ? new Date(Date.now() - simWalletAge * 24 * 60 * 60 * 1000) : null,
  });

  const scoreDiff = simulatedScore - (score || 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col">
      <header className="flex items-center justify-between border-b border-primary/20 px-6 md:px-20 py-4 backdrop-blur-md sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-8 text-primary">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
                <path
                  clipRule="evenodd"
                  d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold tracking-tight">
              Starknet <span className="text-primary">Credit</span>
            </h2>
          </Link>
        </div>
        <Link
          href={`/card/${address}`}
          className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          View Card →
        </Link>
      </header>

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="relative flex flex-col md:flex-row gap-8 items-start mt-8 mb-12">
            <div
              className="absolute left-0 top-0 w-[180px] h-[600px] pointer-events-none z-0"
              style={{
                background: `radial-gradient(ellipse at left center, ${score >= 700 ? 'rgba(236, 87, 40, 0.15)' : 'rgba(124, 58, 237, 0.15)'} 0%, transparent 70%)`
              }}
            ></div>
            <div
              className="absolute right-0 top-0 w-[180px] h-[600px] pointer-events-none z-0"
              style={{
                background: `radial-gradient(ellipse at right center, ${score >= 700 ? 'rgba(236, 87, 40, 0.15)' : 'rgba(124, 58, 237, 0.15)'} 0%, transparent 70%)`
              }}
            ></div>
            <motion.div
              className="relative z-10 flex-1 max-w-[380px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CreditScoreCard
                score={score}
                tier={getCreditScoreTier()}
                personalityType={personality?.type || "Analyzing..."}
                walletAddress={address}
                fromCache={fromCache}
              >
                {metrics && (
                  <WalletDNA
                    address={address}
                    metrics={metrics}
                    score={score}
                    size={300}
                  />
                )}
              </CreditScoreCard>
            </motion.div>

            <motion.div
              className="relative z-10 flex-1 flex flex-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest border border-primary/30 inline-block mb-4 w-fit">
                On-Chain Identity
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                The{" "}
                <span className="text-gradient">
                  {personality?.type || "Mystery"}
                </span>
              </h2>
              {personality?.description && (
                <p className="text-slate-400 max-w-md mb-6">
                  {personality.description}
                </p>
              )}

              {metrics && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                    <p className="text-slate-400 text-xs">Wallet Age</p>
                    <p className="text-white font-bold">{metrics.walletAgeDays || 0} Days</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                    <p className="text-slate-400 text-xs">Transactions</p>
                    <p className="text-white font-bold">{metrics.txCount?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                    <p className="text-slate-400 text-xs">STRK Balance</p>
                    <p className="text-white font-bold">{(parseFloat(metrics.strkBalance || "0") / 1e18).toFixed(2)}</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                    <p className="text-slate-400 text-xs">Days Inactive</p>
                    <p className="text-white font-bold">{metrics.daysSinceLastTx !== null ? metrics.daysSinceLastTx : "—"}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 pb-12">
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 mb-12">
              <MetricCard
                icon={<Calendar className="w-5 h-5" />}
                label="Wallet Age"
                value={`${metrics.walletAgeDays || 0} Days`}
                delay={1.6}
              />
              <MetricCard
                icon={<Clock className="w-5 h-5" />}
                label="Transactions"
                value={metrics.txCount?.toLocaleString() || "0"}
                delay={1.7}
              />
              <MetricCard
                icon={<Wallet className="w-5 h-5" />}
                label="Unique Tokens"
                value={(metrics.uniqueTokens || 0).toString()}
                delay={1.8}
              />
              <MetricCard
                icon={<Zap className="w-5 h-5" />}
                label="Days Inactive"
                value={
                  metrics.daysSinceLastTx !== null
                    ? metrics.daysSinceLastTx.toString()
                    : "Unknown"
                }
                delay={1.9}
              />
              <MetricCard
                icon={<DollarSign className="w-5 h-5" />}
                label="STRK Balance"
                value={`${(parseFloat(metrics.strkBalance || "0") / 1e18).toFixed(2)}`}
                delay={2.0}
              />
              <MetricCard
                icon={<DollarSign className="w-5 h-5" />}
                label="USDC Balance"
                value={`${(parseFloat(metrics.usdcBalance || "0") / 1e6).toFixed(2)}`}
                delay={2.1}
              />
            </div>
          )}

          {metrics && (
            <motion.div
              className="mt-4 mb-12 bg-primary/5 border border-primary/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.4 }}
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                What&apos;s affecting your score
              </h3>
              <div className="space-y-4">
                {getScoreBreakdown(metrics).map((item, index) => (
                  <motion.div
                    key={item.metric}
                    className="flex flex-col gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.2 + index * 0.1, duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>
                          {item.status === "good"
                            ? "✅"
                            : item.status === "weak"
                              ? "⚠️"
                              : "❌"}
                        </span>
                        <span className="text-slate-300 font-medium">
                          {item.metric}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500">{item.current}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-400">{item.target}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor:
                            item.status === "good"
                              ? "#22c55e"
                              : item.status === "weak"
                                ? "#EC5728"
                                : "#ef4444",
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            item.status === "good"
                              ? "100%"
                              : item.status === "weak"
                                ? "50%"
                                : "15%",
                        }}
                        transition={{ delay: 2.3 + index * 0.1, duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-sm text-slate-300">
                  💡{" "}
                  <span className="font-bold text-white">
                    Most impactful action:{" "}
                  </span>
                  {(() => {
                    const breakdown = getScoreBreakdown(metrics);
                    const topIssue =
                      breakdown.find(
                        (i) => i.status !== "good" && i.impact === "high",
                      ) ??
                      breakdown.find(
                        (i) => i.status !== "good" && i.impact === "medium",
                      ) ??
                      breakdown.find((i) => i.status !== "good");
                    return topIssue
                      ? `Improve your ${topIssue.metric} — currently ${topIssue.current}, target is ${topIssue.target}`
                      : "Your wallet is in great shape! Keep it up.";
                  })()}
                </p>
              </div>
            </motion.div>
          )}

          {metrics && (
            <motion.div
              className="mt-4 mb-12 bg-primary/5 border border-primary/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.3, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🧪</span>
                  Score Simulator — what if?
                </h3>
                <button
                  onClick={() => setShowSimulator(!showSimulator)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    showSimulator
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                  }`}
                >
                  {showSimulator ? "Hide" : "Simulate"}
                </button>
              </div>

              {showSimulator && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-slate-300">Wallet Age</label>
                        <span className="text-sm text-primary font-medium">{simWalletAge} days</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="730"
                        step="30"
                        value={simWalletAge}
                        onChange={(e) => setSimWalletAge(parseInt(e.target.value))}
                        className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-slate-300">Transaction Count</label>
                        <span className="text-sm text-primary font-medium">{simTxCount}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={simTxCount}
                        onChange={(e) => setSimTxCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-slate-300">Unique Tokens</label>
                        <span className="text-sm text-primary font-medium">{simUniqueTokens}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="6"
                        step="1"
                        value={simUniqueTokens}
                        onChange={(e) => setSimUniqueTokens(parseInt(e.target.value))}
                        className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-slate-300">Days Since Last Tx</label>
                        <span className="text-sm text-primary font-medium">{simDaysSinceLastTx} days</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="5"
                        value={simDaysSinceLastTx}
                        onChange={(e) => setSimDaysSinceLastTx(parseInt(e.target.value))}
                        className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="text-sm text-slate-300">Has STRK</label>
                      <button
                        onClick={() => setSimHasSTRK(!simHasSTRK)}
                        className={`w-10 h-5 rounded-full transition-all ${
                          simHasSTRK ? "bg-primary" : "bg-primary/20"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            simHasSTRK ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="text-sm text-slate-300">Has USDC</label>
                      <button
                        onClick={() => setSimHasUSDC(!simHasUSDC)}
                        className={`w-10 h-5 rounded-full transition-all ${
                          simHasUSDC ? "bg-primary" : "bg-primary/20"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            simHasUSDC ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-primary/10 pt-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Simulated Score</p>
                          <div className="flex items-baseline gap-3">
                            <motion.span
                              className="text-4xl font-bold"
                              style={{ color: tierColors[getScoreTierFromLib(simulatedScore)] || tierColors["Good"] }}
                              key={simulatedScore}
                              initial={{ scale: 1.2, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                              <CountUpScore score={simulatedScore} />
                            </motion.span>
                            <span
                              className="px-2 py-0.5 text-xs font-semibold rounded"
                              style={{
                                backgroundColor: `${tierColors[getScoreTierFromLib(simulatedScore)]}20`,
                                color: tierColors[getScoreTierFromLib(simulatedScore)],
                                border: `1px solid ${tierColors[getScoreTierFromLib(simulatedScore)]}40`,
                              }}
                            >
                              {getScoreTierFromLib(simulatedScore)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div
                          className={`text-lg font-bold ${
                            scoreDiff >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {scoreDiff >= 0 ? "+" : ""}
                          {scoreDiff} points
                        </div>
                        <button
                          onClick={() => {
                            setSimWalletAge(metrics.walletAgeDays || 0);
                            setSimTxCount(Math.min(metrics.txCount || 0, 200));
                            setSimUniqueTokens(metrics.uniqueTokens || 0);
                            setSimDaysSinceLastTx(metrics.daysSinceLastTx ?? 30);
                            setSimHasSTRK(metrics.hasSTRK || false);
                            setSimHasUSDC(metrics.hasUSDC || false);
                          }}
                          className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary font-medium hover:bg-primary/20 transition-all"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {metrics && showStakePanel && !staked && (
            <div className="border-gradient-purple rounded-2xl p-8 mb-12">
              <StakePanel
                walletAddress={address}
                strkBalance={metrics.strkBalance}
                score={score}
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
                  <p className="text-slate-400 mt-2">
                    Stake your STRK tokens to unlock the &apos;Diamond
                    Hands&apos; multiplier and increase your credit rating by up
                    to 50 points.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                  {score >= 700 ? (
                    <>
                      <div className="bg-[#EC5728]/20 rounded-lg px-4 py-2 border border-[#EC5728]/30 flex justify-between items-center">
                        <span className="text-xs text-slate-300">
                          Staking Status
                        </span>
                        <span className="text-[#EC5728] font-bold">
                          Unlocked
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const { StarkZap } = await import("starkzap");
                            const sdk = new StarkZap({ network });
                            const wallet = await sdk.connectCartridge();
                            const connectedAddr = wallet.address
                              .toString()
                              .toLowerCase();
                            if (connectedAddr !== address.toLowerCase()) {
                              alert(
                                "Please connect the wallet you are viewing",
                              );
                              return;
                            }
                            setShowStakePanel(true);
                          } catch (err) {
                            console.error("Connection failed:", err);
                          }
                        }}
                        className="bg-[#EC5728] hover:bg-[#EC5728]/90 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-[#EC5728]/25"
                      >
                        Start Staking
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-purple-900/30 rounded-lg px-4 py-2 border border-purple-500/30 flex justify-between items-center">
                        <span className="text-xs text-slate-300">
                          Points Needed
                        </span>
                        <span className="text-purple-400 font-bold">
                          {700 - score}
                        </span>
                      </div>
                      <button
                        disabled
                        className="bg-zinc-700 text-zinc-400 font-bold py-3 px-8 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Score Too Low
                      </button>
                      <p className="text-xs text-zinc-500 text-center">
                        Reach 700+ to unlock staking
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {staked && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center mb-12">
              <p className="text-green-400 font-semibold text-xl">
                🎉 You staked STRK! Your score has been boosted.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <motion.div
              className="relative overflow-hidden rounded-xl"
              whileHover="hover"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <Link
                href={`/card/${address}`}
                className="block w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 px-6 rounded-xl text-center text-lg transition-all shadow-xl shadow-primary/20"
              >
                Share Card
              </Link>
            </motion.div>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `My Starknet wallet is a ${personality?.type || "mystery"} with a credit score of ${score} 👀 Check yours: https://starknet-credit-score.vercel.app/score/${address} #Starknet #StarkzapChallenge`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold py-5 px-6 rounded-xl text-center text-lg transition-all backdrop-blur-md border border-white/10"
            >
              Share on 𝕏
            </a>
            <Link
              href="/leaderboard"
              className="block w-full bg-[#12121a] hover:bg-[#1a1a24] text-white font-bold py-5 px-6 rounded-xl text-center text-lg transition-all border border-primary/20 hover:border-primary/40 flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              View Leaderboard
            </Link>
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
            <p className="text-slate-500 max-w-sm">
              The decentralized identity and credit scoring layer for the
              Starknet ecosystem. Transparent, secure, and verifiable.
            </p>
          </div>
          <div>
            <h4 className="text-slate-200 font-bold mb-4 uppercase text-xs tracking-widest">
              Protocol
            </h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li>
                <a className="hover:text-primary" href="#">
                  Methodology
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Data Sources
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Security Audit
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-200 font-bold mb-4 uppercase text-xs tracking-widest">
              Social
            </h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li>
                <a className="hover:text-primary" href="#">
                  Twitter / X
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Discord
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Telegram
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Github
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">
            © 2026 Starknet Credit Score.{" "}
            <span className="text-[#EC5728]">Built on Starknet</span>.
          </p>
          <div className="flex gap-4 text-xs text-slate-600">
            <a className="hover:text-slate-400" href="#">
              Terms of Service
            </a>
            <a className="hover:text-slate-400" href="#">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CountUpScore({ score }: { score: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    spring.set(score);
  }, [score, spring]);

  return <motion.span>{display}</motion.span>;
}

function MetricCard({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex flex-col gap-3 hover:border-primary/40 transition-colors hover:scale-[1.02] cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-100">{value}</p>
      </div>
    </motion.div>
  );
}
