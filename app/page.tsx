'use client';

import { useState, useEffect, useCallback } from 'react';
import DigitalKeyboard, { TypingStats } from '@/components/DigitalKeyboard';

const PHRASES = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice makes perfect when learning to type.",
  "Typing fast is a great skill to have."
];

interface GameSettings {
  strictMode: boolean;
  showHints: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
}

export default function Home() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    strictMode: false,
    showHints: true,
    soundEnabled: false,
    darkMode: false,
  });

  // Trigger entry animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle' && e.code === 'Space') {
        e.preventDefault();
        setGameState('playing');
        setPhraseIndex(Math.floor(Math.random() * PHRASES.length));
        setStats(null);
      } else if (gameState === 'playing' && e.code === 'Escape') {
        e.preventDefault();
        setGameState('idle');
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

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const isDark = settings.darkMode;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between p-8 pb-16 relative transition-colors duration-300"
      style={{ backgroundColor: isDark ? '#1A1A1A' : '#FCFCFD' }}
    >
      {/* Settings Button - Gear Icon */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        aria-label="Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div
          className={`absolute top-16 right-6 rounded-2xl border p-6 w-72 z-10 transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
          style={{ boxShadow: '0 0 0 0.5px rgba(0, 0, 0, 0.05)' }}
        >
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Settings</h3>

          {/* Dark Mode Toggle */}
          <div className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div>
              <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Dark Mode</p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Switch theme</p>
            </div>
            <button
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
              className={`w-12 h-7 rounded-full transition-colors ${settings.darkMode ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Strict Mode Toggle */}
          <div className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div>
              <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Strict Mode</p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Wait for correct key</p>
            </div>
            <button
              onClick={() => updateSetting('strictMode', !settings.strictMode)}
              className={`w-12 h-7 rounded-full transition-colors ${settings.strictMode ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.strictMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Show Hints Toggle */}
          <div className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div>
              <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Show Hints</p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Highlight next key</p>
            </div>
            <button
              onClick={() => updateSetting('showHints', !settings.showHints)}
              className={`w-12 h-7 rounded-full transition-colors ${settings.showHints ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.showHints ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Sound Effects</p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Key press sounds</p>
            </div>
            <button
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              className={`w-12 h-7 rounded-full transition-colors ${settings.soundEnabled ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className={`w-full max-w-4xl text-center pt-12 transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Typing Master</h1>

        {gameState === 'idle' && (
          <div className="mt-8">
            <p className={`text-xl font-medium ${isDark ? 'text-gray-200' : 'text-black'}`}>
              click on spacebar{' '}
              <span className={`inline-block px-3 py-1 rounded font-mono text-sm mx-1 align-middle ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-400' : 'bg-gray-100 border border-gray-300 text-gray-500'}`}>
                ␣
              </span>{' '}
              to get started
            </p>
          </div>
        )}

        {gameState === 'completed' && stats && (
          <div className={`p-6 rounded-2xl shadow-xl border max-w-md mx-auto mt-4 transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <h2 className="text-2xl font-bold mb-4 text-green-500">Great Job!</h2>
            <div className="flex justify-center gap-8 text-lg">
              <div>
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>WPM:</span>
                <span className="ml-2 font-bold">{
                  Math.round((stats.correctKeystrokes / 5) / ((Date.now() - (stats.startTime || Date.now())) / 60000)) || 0
                }</span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Accuracy:</span>
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

      {/* Mobile keyboard input - shows native keyboard */}
      <div className="md:hidden w-full max-w-md px-4">
        <input
          type="text"
          className={`w-full p-4 text-lg rounded-xl border text-center transition-colors duration-300 ${
            isDark
              ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
              : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
          }`}
          placeholder={gameState === 'idle' ? 'Tap to start typing...' : 'Type here...'}
          onFocus={() => {
            if (gameState === 'idle') {
              setGameState('playing');
              setPhraseIndex(Math.floor(Math.random() * PHRASES.length));
              setStats(null);
            }
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      {/* Desktop Keyboard with entry animation - hidden on mobile */}
      <div
        className="hidden md:block w-full max-w-5xl relative"
        style={{
          transform: isLoaded ? 'translateY(0)' : 'translateY(100vh)',
          transition: 'transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s',
        }}
      >
        <DigitalKeyboard
          targetText={gameState === 'playing' ? currentPhrase : undefined}
          onComplete={handleComplete}
          showActiveKeys={true}
          orangeKeys={gameState === 'playing' ? ['Escape'] : []}
          strictMode={settings.strictMode}
          hintKeys={settings.showHints && gameState === 'idle' ? ['Space'] : []}
          soundEnabled={settings.soundEnabled}
        />
      </div>
    </main>
  );
}
