'use client';

import { useEffect, useRef } from 'react';
import { WalletMetrics } from '@/lib/starknet';

interface WalletDNAProps {
    address: string;
    metrics: Partial<WalletMetrics> | null;
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

export function WalletDNA({ address, metrics, size = 400 }: WalletDNAProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !metrics || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const drawSize = Math.min(containerWidth, containerHeight);

        canvas.width = drawSize;
        canvas.height = drawSize;

        const width = drawSize;
        const height = drawSize;
        const cx = width / 2;
        const cy = height / 2;

        ctx.clearRect(0, 0, width, height);

        const seed = cyrb128(address);
        const rand = mulberry32(seed);

        const age = metrics.walletAgeDays || 0;
        let baseHue = rand() * 360;
        if (age < 100) baseHue = 200 + rand() * 60;
        else if (age > 365) baseHue = 20 + rand() * 40;
        else baseHue = 100 + rand() * 80;

        const txs = metrics.txCount || 0;
        const minBranches = 3;
        const branches = Math.min(minBranches + Math.floor(txs / 10), 24);

        const tokens = metrics.uniqueTokens || 1;
        let symmetry = tokens;
        if (symmetry > 8) symmetry = 8;

        const strkVal = parseFloat(metrics.strkBalance || '0') / 1e18;
        const usdcVal = parseFloat(metrics.usdcBalance || '0') / 1e6;
        const totalEstVal = strkVal * 0.5 + usdcVal;
        const minRadius = 10;
        const centerRadius = Math.min(minRadius + Math.sqrt(totalEstVal) * 2, size * 0.2);

        const daysInactive = metrics.daysSinceLastTx ?? 999;
        let opacity = 1.0 - Math.min(daysInactive, 365) / 365;
        opacity = Math.max(0.3, opacity);

        ctx.globalAlpha = opacity;

        const branchLength = (size / 2) * 0.8;

        for (let s = 0; s < symmetry; s++) {
            const symOffset = (Math.PI * 2 * s) / symmetry;

            for (let i = 0; i < branches; i++) {
                const angle = (Math.PI * 2 * i) / branches + symOffset + (rand() * 0.2 - 0.1);
                const length = branchLength * (0.5 + rand() * 0.5);
                const hue = (baseHue + rand() * 40 - 20) % 360;
                const widthVar = 2 + rand() * 4;

                ctx.beginPath();
                ctx.moveTo(cx, cy);

                const cpX = cx + Math.cos(angle + 0.5) * (length * 0.5);
                const cpY = cy + Math.sin(angle + 0.5) * (length * 0.5);
                const endX = cx + Math.cos(angle) * length;
                const endY = cy + Math.sin(angle) * length;

                ctx.quadraticCurveTo(cpX, cpY, endX, endY);

                ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${opacity})`;
                ctx.lineWidth = widthVar;
                ctx.lineCap = 'round';
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(endX, endY, widthVar * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${(hue + 30) % 360}, 90%, 70%, ${opacity + 0.2})`;
                ctx.fill();
            }
        }

        ctx.beginPath();
        ctx.arc(cx, cy, centerRadius, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerRadius);
        gradient.addColorStop(0, `hsla(${baseHue}, 100%, 80%, ${opacity + 0.3})`);
        gradient.addColorStop(1, `hsla(${baseHue}, 80%, 40%, ${opacity})`);

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, centerRadius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
        ctx.fill();

    }, [address, metrics, size]);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && metrics && containerRef.current) {
                const event = new Event('resize');
                canvasRef.current.dispatchEvent(event);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [metrics]);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center">
            <canvas
                ref={canvasRef}
                className="block max-w-full max-h-full"
            />
        </div>
    );
}
