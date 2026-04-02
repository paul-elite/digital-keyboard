'use client';

import { useState, useEffect, useCallback } from 'react';
import DigitalKeyboard, { TypingStats } from '@/components/DigitalKeyboard';

const PHRASES = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice makes perfect when learning to type.",
  "Typing fast is a great skill to have."
];

export default function Home() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [stats, setStats] = useState<TypingStats | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle' && e.code === 'Space') {
        e.preventDefault();
        setGameState('playing');
        setPhraseIndex(Math.floor(Math.random() * PHRASES.length));
        setStats(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleComplete = useCallback((finalStats: TypingStats) => {
    setStats(finalStats);
    setGameState('completed');
  }, []);

  const handlePlayAgain = () => {
    setGameState('idle');
  };

  const currentPhrase = PHRASES[phraseIndex];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#E1EDFA' }}>
      {/* Header Area */}
      <div className="w-full max-w-4xl mb-12 text-center text-gray-800">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Typing Master</h1>

        {gameState === 'idle' && (
          <div className="mt-8">
            <p className="text-xl text-black font-medium">
              click on spacebar{' '}
              <span className="inline-block px-3 py-1 bg-gray-100 border border-gray-300 rounded text-gray-500 font-mono text-sm mx-1 align-middle">
                ␣
              </span>{' '}
              to get started
            </p>
          </div>
        )}

        {gameState === 'completed' && stats && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto mt-4">
            <h2 className="text-2xl font-bold mb-4 text-green-500">Great Job!</h2>
            <div className="flex justify-center gap-8 text-lg">
              <div>
                <span className="text-gray-400">WPM:</span>
                <span className="ml-2 font-bold">{
                  Math.round((stats.correctKeystrokes / 5) / ((Date.now() - (stats.startTime || Date.now())) / 60000)) || 0
                }</span>
              </div>
              <div>
                <span className="text-gray-400">Accuracy:</span>
                <span className="ml-2 font-bold">
                  {Math.round((stats.correctKeystrokes / Math.max(1, stats.totalKeystrokes)) * 100)}%
                </span>
              </div>
            </div>
            <button 
              onClick={handlePlayAgain}
              className="mt-6 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Keyboard */}
      <div className="w-full max-w-5xl relative">
        <DigitalKeyboard
          targetText={gameState === 'playing' ? currentPhrase : undefined}
          onComplete={handleComplete}
          showActiveKeys={true}
        />
      </div>
    </main>
  );
}
