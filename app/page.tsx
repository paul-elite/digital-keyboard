'use client';

import { useState, useEffect } from 'react';
import DigitalKeyboard from '@/components/DigitalKeyboard';

export default function Home() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !started) {
        e.preventDefault();
        setStarted(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started]);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* Prompt */}
      <p className="text-gray-800 text-xl mb-12 font-light tracking-wide">
        press the spacebar{' '}
        <span className="inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono text-sm mx-1">
          ␣
        </span>{' '}
        to begin
      </p>

      {/* Keyboard */}
      <div className="w-full max-w-4xl">
        <DigitalKeyboard showActiveKeys={true} />
      </div>
    </main>
  );
}
