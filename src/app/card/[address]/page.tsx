'use client';

import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useWalletAnalysis } from '@/lib/useWalletAnalysis';

export default function CardPage({ params }: { params: Promise<{ address: string }> }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    params.then((p) => setAddress(p.address));
  }, [params]);

  const { metrics, score, tier, personality, loading, error } = useWalletAnalysis(address);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#09090b',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `starknet-score-${address.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#f87171' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#ffffff', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a href="/" style={{ color: '#a1a1aa', textDecoration: 'none' }}>← Home</a>
        <span style={{ color: '#52525b' }}>|</span>
        <a href={`/score/${address}`} style={{ color: '#a1a1aa', textDecoration: 'none' }}>← Score</a>
      </div>

      {/* Card — uses inline styles so html2canvas can parse all colors */}
      <div
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'linear-gradient(to bottom, #18181b, #000000)',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#f59e0b', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>Starknet Credit Score</p>
          <p style={{ fontFamily: 'monospace', fontSize: '14px', color: '#a1a1aa' }}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '60px', fontWeight: 'bold', color: '#ffffff', lineHeight: 1 }}>{score}</p>
          <p style={{ fontSize: '18px', color: '#a1a1aa', marginTop: '8px' }}>{tier}</p>
        </div>

        {personality && (
          <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }}>
            <p style={{ color: '#fbbf24', fontWeight: 600, fontSize: '20px', marginBottom: '8px' }}>{personality.type}</p>
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{personality.description}</p>
          </div>
        )}

        {metrics && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
            <div>
              <p style={{ color: '#71717a', fontSize: '12px' }}>Age</p>
              <p style={{ fontWeight: 500, color: '#ffffff' }}>{metrics.walletAgeDays}d</p>
            </div>
            <div>
              <p style={{ color: '#71717a', fontSize: '12px' }}>Txs</p>
              <p style={{ fontWeight: 500, color: '#ffffff' }}>{metrics.txCount}</p>
            </div>
            <div>
              <p style={{ color: '#71717a', fontSize: '12px' }}>Tokens</p>
              <p style={{ fontWeight: 500, color: '#ffffff' }}>{metrics.uniqueTokens}</p>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#52525b', fontSize: '12px' }}>starknet-creditscore.vercel.app</p>
      </div>

      <button
        onClick={handleDownload}
        style={{
          backgroundColor: '#f59e0b',
          color: '#000000',
          fontWeight: 600,
          padding: '12px 32px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Download Card
      </button>
    </div>
  );
}
