import { Suspense } from 'react';
import ScoreContent from './ScoreContent';

export default function ScorePage({ params }: { params: Promise<{ address: string }> }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ScoreContent params={params} />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-zinc-400">Analyzing wallet...</p>
      </div>
    </div>
  );
}
