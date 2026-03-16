'use client';

import { useEffect, useRef } from 'react';
import { WalletMetrics } from '@/lib/starknet';

interface WalletDNAProps {
    address: string;
    metrics: Partial<WalletMetrics> | null;
    score?: number;
    size?: number;
}

function cyrb128(str: string) {
    let h1 = 1779033703,
        h2 = 3144134277,
        h3 = 1013904242,
        h4 = 2773480762;
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

function getTierColor(tier: string | undefined): { r: number; g: number; b: number } {
    switch (tier) {
        case 'Excellent':
            return { r: 34, g: 197, b: 94 };
        case 'Very Good':
            return { r: 59, g: 130, b: 246 };
        case 'Good':
            return { r: 59, g: 130, b: 246 };
        case 'Fair':
            return { r: 234, g: 179, b: 8 };
        case 'Poor':
            return { r: 239, g: 68, b: 68 };
        default:
            return { r: 124, g: 58, b: 237 };
    }
}

function getTierFromScore(score: number | undefined): string {
    if (!score) return 'Poor';
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Very Good';
    if (score >= 600) return 'Good';
    if (score >= 500) return 'Fair';
    return 'Poor';
}

export function WalletDNA({ address, metrics, score, size = 400 }: WalletDNAProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !metrics || !container) return;

        console.log('WalletDNA rendering:', { address: address.slice(0, 8) + '...', txCount: metrics.txCount, uniqueTokens: metrics.uniqueTokens, score });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        canvas.width = containerWidth;
        canvas.height = containerHeight;

        const width = containerWidth;
        const height = containerHeight;

        const seed = cyrb128(address);
        const rand = mulberry32(seed);

        const txCount = metrics.txCount || 0;
        const dotCount = Math.min(5 + Math.floor(txCount / 10), 25);

        const uniqueTokens = metrics.uniqueTokens || 1;
        const connectionDensity = Math.min(uniqueTokens * 2, 15);

        const walletAge = metrics.walletAgeDays || 0;
        const baseDotSize = 2 + Math.min(walletAge / 100, 4);

        const daysInactive = metrics.daysSinceLastTx ?? 999;
        const baseOpacity = Math.max(0.3, 1 - Math.min(daysInactive, 365) / 365);

        const scoreValue = score || 0;
        const tier = getTierFromScore(scoreValue);
        const tierColor = getTierColor(tier);

        const nodes = Array.from({ length: dotCount }, () => ({
            x: 50 + rand() * (width - 100),
            y: 50 + rand() * (height - 100),
            baseX: 0,
            baseY: 0,
            vx: (rand() - 0.5) * 0.3,
            vy: (rand() - 0.5) * 0.3,
            phase: rand() * Math.PI * 2,
            pulseSpeed: 0.5 + rand() * 1
        }));

        nodes.forEach(node => {
            node.baseX = node.x;
            node.baseY = node.y;
        });

        const connections: Array<[number, number]> = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < Math.min(width, height) * 0.35 && rand() < connectionDensity / 20) {
                    connections.push([i, j]);
                }
            }
        }

        nodes.forEach(node => {
            node.baseX = node.x;
            node.baseY = node.y;
        });

        let time = 0;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            time += 0.02;

            connections.forEach(([i, j]) => {
                const fadePhase = Math.sin(time * 0.8 + i * 0.1 + j * 0.1) * 0.5 + 0.5;
                const opacity = 0.1 + fadePhase * 0.3;
                
                ctx.strokeStyle = `rgba(${tierColor.r}, ${tierColor.g}, ${tierColor.b}, ${opacity * baseOpacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            });

            nodes.forEach((node) => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 30 || node.x > width - 30) node.vx *= -1;
                if (node.y < 30 || node.y > height - 30) node.vy *= -1;

                const pulse = Math.sin(time * node.pulseSpeed + node.phase) * 0.5 + 0.5;
                const dotSize = baseDotSize + pulse * 2;
                const opacity = (0.6 + pulse * 0.4) * baseOpacity;

                ctx.fillStyle = `rgba(${tierColor.r}, ${tierColor.g}, ${tierColor.b}, ${opacity})`;
                ctx.beginPath();
                ctx.arc(node.x, node.y, dotSize, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `rgba(${tierColor.r}, ${tierColor.g}, ${tierColor.b}, ${opacity * 0.2})`;
                ctx.beginPath();
                ctx.arc(node.x, node.y, dotSize * 3, 0, Math.PI * 2);
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [address, metrics, score, size]);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center">
            <canvas
                ref={canvasRef}
                className="block max-w-full max-h-full"
            />
        </div>
    );
}
