'use client';

import { useState, useEffect } from 'react';
import DigitalKeyboard from '@/components/DigitalKeyboard';

export default function Home() {
  const [typedText, setTypedText] = useState('');
  const [lastCode, setLastCode] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setLastCode(e.code);

      if (e.key === 'Backspace') {
        setTypedText(prev => prev.slice(0, -1));
      } else if (e.key.length === 1) {
        setTypedText(prev => prev + e.key);
      } else if (e.key === 'Enter') {
        setTypedText(prev => prev + '\n');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* Typed text display */}
      <div className="w-full max-w-4xl mb-8">
        <div className="min-h-[80px] p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg text-gray-800 whitespace-pre-wrap">
          {typedText || <span className="text-gray-400">Start typing...</span>}
          <span className="inline-block w-0.5 h-5 bg-blue-500 ml-0.5 animate-pulse align-middle" />
        </div>
        <p className="mt-2 text-sm text-gray-400 font-mono">Last key code: {lastCode || 'none'}</p>
      </div>

      {/* Keyboard */}
      <div className="w-full max-w-4xl">
        <DigitalKeyboard showActiveKeys={true} />
      </div>
    </main>
  );
}
