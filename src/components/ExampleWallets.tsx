'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface CreditScoreCardProps {
  score?: number;
  tier?: string;
  personalityType?: string;
  walletAddress?: string;
  href?: string;
}

const GenerativeArtCanvas = ({ tier }: { tier: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const numParticles = 50;

    const tierColors: Record<string, string> = {
      'Excellent': '#f59e0b',
      'Very Good': '#7c3aed',
      'Good': '#0891b2',
      'Fair': '#EC5728',
      'Poor': '#ef4444',
    };

    const color = tierColors[tier] || tierColors['Good'];
    const canvasWidth = 400;
    const canvasHeight = 300;

    class Particle {
      x: number;
      y: number;
      speed: number;
      angle: number;
      size: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.speed = Math.random() * 0.3 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
          this.x = Math.random() * canvasWidth;
          this.y = Math.random() * canvasHeight;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      particles.forEach((particle, i) => {
        particle.update();
        particle.draw(ctx);

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x;
          const dy = particles[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `${color}${Math.floor((1 - distance / 80) * 0.2 * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    init();
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [tier]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

const CreditScoreCard: React.FC<CreditScoreCardProps> = ({
  score = 750,
  tier = 'excellent',
  personalityType = 'Diamond Hand',
  walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  href,
}) => {
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

  const card = (
    <div className="relative w-full h-[300px] md:h-[360px] bg-[#0d0d14] rounded-2xl overflow-hidden shadow-2xl">
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

      <div className="relative z-10 h-full flex flex-col p-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-baseline gap-3">
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">{score}</h1>
            <span
              className="px-2 py-1 text-xs font-semibold rounded-md inline-block"
              style={{
                backgroundColor: `${borderColor}20`,
                color: borderColor,
                border: `1px solid ${borderColor}40`,
              }}
            >
              {tierLabel}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-400 text-sm font-medium">{personalityType}</p>
        </div>

        <div className="flex-1 relative rounded-xl overflow-hidden bg-black/20 border border-white/5">
          <GenerativeArtCanvas tier={tier} />

          <div
            className="absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: borderColor }}
          ></div>
          <div
            className="absolute bottom-8 left-8 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: borderColor, animationDelay: '0.5s' }}
          ></div>
          <div
            className="absolute top-1/2 right-12 w-1 h-1 rounded-full animate-pulse"
            style={{ backgroundColor: borderColor, animationDelay: '1s' }}
          ></div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-mono tracking-wider truncate" style={{ color: borderColor }}>
            {walletAddress}
          </p>
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

  if (href) {
    return (
      <Link href={href} className="block flex-1 min-w-[220px]">
        {card}
      </Link>
    );
  }

  return <div className="flex-1 min-w-[220px]">{card}</div>;
};

export function ExampleWallets() {
  return (
    <div className="hidden lg:block w-full max-w-full pt-16 pr-4">
      <div className="flex flex-row items-center gap-4 min-w-0">
        <CreditScoreCard
          score={750}
          tier="Excellent"
          personalityType="Diamond Hand"
          walletAddress="0x04a0...8c7d"
          href="/score/0x04a093c37bf7b85aa9163a3f1540ef8c0e4b09b4d7a6d8a5b3c9e2f1a0b8c7d"
        />
        <CreditScoreCard
          score={420}
          tier="Poor"
          personalityType="Ghost Wallet"
          walletAddress="0x07b5...7e8f"
          href="/score/0x07b5ed5c4a1eb7a2a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f"
        />
        <CreditScoreCard
          score={650}
          tier="Good"
          personalityType="Token Tornado"
          walletAddress="0x03d4...c3d4"
          href="/score/0x03d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4"
        />
      </div>
    </div>
  );
}
