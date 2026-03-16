'use client';

import { useRef, useEffect } from 'react';

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

export function GenerativeArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const today = new Date().toISOString().split('T')[0];
    const seed = cyrb128(today);
    const rand = mulberry32(seed);

    canvas.width = 200;
    canvas.height = 220;

    const nodeCount = 15 + Math.floor(rand() * 6);
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: 30 + rand() * 140,
      y: 30 + rand() * 160,
      vx: (rand() - 0.5) * 0.3,
      vy: (rand() - 0.5) * 0.3,
      phase: rand() * Math.PI * 2,
      pulseSpeed: 0.5 + rand() * 1
    }));

    const connections: Array<[number, number]> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 90 && rand() > 0.3) {
          connections.push([i, j]);
        }
      }
    }

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      connections.forEach(([i, j]) => {
        const fadePhase = Math.sin(time * 0.8 + i + j) * 0.5 + 0.5;
        const opacity = 0.1 + fadePhase * 0.3;
        
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

        if (node.x < 20 || node.x > 180) node.vx *= -1;
        if (node.y < 20 || node.y > 200) node.vy *= -1;

        const pulse = Math.sin(time * node.pulseSpeed + node.phase) * 0.5 + 0.5;
        const size = 3 + pulse * 2;
        const opacity = 0.6 + pulse * 0.4;

        ctx.fillStyle = `rgba(196, 181, 253, ${opacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(196, 181, 253, ${opacity * 0.2})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[220px]"
      style={{ imageRendering: 'auto' }}
    />
  );
}
