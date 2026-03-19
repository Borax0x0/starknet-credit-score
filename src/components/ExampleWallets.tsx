'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useSpring, useTransform } from 'framer-motion';

const EXAMPLE_WALLETS = [
  {
    address: '0x04a093c37bf7b85aa9163a3f1540ef8c0e4b09b4d7a6d8a5b3c9e2f1a0b8c7d',
    score: 750,
    tier: 'Excellent',
    personality: 'Diamond Hand',
    walletAgeDays: 572,
    txCount: 5705,
  },
  {
    address: '0x07b5ed5c4a1eb7a2a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    score: 420,
    tier: 'Poor',
    personality: 'Ghost Wallet',
    walletAgeDays: 30,
    txCount: 12,
  },
  {
    address: '0x03d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    score: 650,
    tier: 'Good',
    personality: 'Token Tornado',
    walletAgeDays: 186,
    txCount: 5286,
  },
];

function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Constellation({ seed }: { seed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 150;
    canvas.height = 120;

    const rand = mulberry32(seed);
    const nodeCount = 5 + Math.floor(rand() * 4);
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: 20 + rand() * 110,
      y: 20 + rand() * 80,
      vx: (rand() - 0.5) * 0.3,
      vy: (rand() - 0.5) * 0.3,
      phase: rand() * Math.PI * 2,
      pulseSpeed: 0.5 + rand() * 1,
    }));

    const connections: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 50 && rand() > 0.4) {
          connections.push([i, j]);
        }
      }
    }

    let time = 0;
    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      connections.forEach(([i, j]) => {
        const fadePhase = Math.sin(time * 0.8 + i * 0.3 + j * 0.3) * 0.5 + 0.5;
        const opacity = 0.15 + fadePhase * 0.25;
        ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      });

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 10 || node.x > 140) node.vx *= -1;
        if (node.y < 10 || node.y > 110) node.vy *= -1;

        const pulse = Math.sin(time * node.pulseSpeed + node.phase) * 0.5 + 0.5;
        const size = 2 + pulse * 1.5;
        const opacity = 0.5 + pulse * 0.4;

        ctx.fillStyle = `rgba(124, 58, 237, ${opacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(124, 58, 237, ${opacity * 0.15})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [seed]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded-t-xl" style={{ imageRendering: 'auto' }} />;
}

function AnimatedScore({ score }: { score: number }) {
  const spring = useSpring(0, { stiffness: 60, damping: 15 });
  const display = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    spring.set(score);
  }, [score, spring]);

  return <motion.span>{display}</motion.span>;
}

function MiniCard({ wallet, index }: { wallet: typeof EXAMPLE_WALLETS[0]; index: number }) {
  const tierBorderColor: Record<string, string> = {
    'Excellent': '#EC5728',
    'Very Good': '#3b82f6',
    'Good': '#7c3aed',
    'Fair': '#eab308',
    'Poor': '#ef4444',
  };

  const tierGlow: Record<string, string> = {
    'Excellent': 'rgba(236, 87, 40, 0.15)',
    'Very Good': 'rgba(124, 58, 237, 0.15)',
    'Good': 'rgba(124, 58, 237, 0.15)',
    'Fair': 'rgba(234, 179, 8, 0.15)',
    'Poor': 'rgba(239, 68, 68, 0.15)',
  };

  const tierBgColor: Record<string, string> = {
    'Excellent': 'rgba(236, 87, 40, 0.1)',
    'Very Good': 'rgba(59, 130, 246, 0.1)',
    'Good': 'rgba(124, 58, 237, 0.1)',
    'Fair': 'rgba(234, 179, 8, 0.1)',
    'Poor': 'rgba(239, 68, 68, 0.1)',
  };

  const tierTextColor: Record<string, string> = {
    'Excellent': '#EC5728',
    'Very Good': '#3b82f6',
    'Good': '#7c3aed',
    'Fair': '#eab308',
    'Poor': '#ef4444',
  };

  const seed = cyrb128(wallet.address);
  const isMiddle = index === 1;
  const verticalOffset = isMiddle ? 0 : 12;
  const borderColor = tierBorderColor[wallet.tier] || '#7c3aed';

  return (
    <Link href={`/score/${wallet.address}`} className="group block flex-1 min-w-[220px]">
      <motion.div
        className="w-full h-[300px] md:h-[360px] rounded-xl bg-[#12121a] overflow-hidden flex flex-col transition-colors cursor-pointer relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: -verticalOffset }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
        style={{
          borderTop: `3px solid ${borderColor}`,
          boxShadow: `inset 0 8px 16px -4px ${borderColor}33, ${tierGlow[wallet.tier] || 'rgba(124, 58, 237, 0.15)'}`,
        }}
      >
        <div className="p-5 pb-0">
          <div className="flex items-baseline gap-3">
            <p className="text-4xl font-bold text-white"><AnimatedScore score={wallet.score} /></p>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: tierBgColor[wallet.tier] || 'rgba(124, 58, 237, 0.1)',
                color: tierTextColor[wallet.tier] || '#7c3aed',
              }}
            >
              {wallet.tier}
            </span>
          </div>
          <p className="text-base mt-2" style={{ color: '#a0a0b0' }}>{wallet.personality}</p>
        </div>
        <div className="flex-1 relative mt-4">
          <Constellation seed={seed} />
          <p className="absolute bottom-3 left-0 right-0 text-center font-mono text-[10px] text-white/40">
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export function ExampleWallets() {
  return (
    <div className="hidden lg:block w-full max-w-full pt-16 pr-4">
      <div className="flex flex-row items-center gap-4 min-w-0">
        {EXAMPLE_WALLETS.map((wallet, index) => (
          <MiniCard key={wallet.address} wallet={wallet} index={index} />
        ))}
      </div>
    </div>
  );
}
