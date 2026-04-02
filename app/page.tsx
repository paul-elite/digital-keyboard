'use client';

import { useState, useCallback } from 'react';
import DigitalKeyboard, { TypingStats } from '@/components/DigitalKeyboard';

// Sample lessons
const lessons = [
  {
    id: 'home-row',
    title: 'Home Row',
    text: 'asdf jkl; asdf jkl; asdf jkl;',
  },
  {
    id: 'common-words',
    title: 'Common Words',
    text: 'the quick brown fox jumps over the lazy dog',
  },
  {
    id: 'programming',
    title: 'Programming',
    text: 'const data = { name: "test", value: 42 };',
  },
  {
    id: 'free-type',
    title: 'Free Typing',
    text: '',
  },
];

export default function Home() {
  const [selectedLesson, setSelectedLesson] = useState(lessons[1]);
  const [customText, setCustomText] = useState('');
  const [completedStats, setCompletedStats] = useState<TypingStats | null>(null);
  const [strictMode, setStrictMode] = useState(true);
  const [key, setKey] = useState(0); // For resetting the keyboard

  const targetText = selectedLesson.id === 'free-type' ? customText : selectedLesson.text;

  const handleComplete = useCallback((stats: TypingStats) => {
    setCompletedStats(stats);
  }, []);

  const handleKeyPress = useCallback((char: string, correct: boolean, stats: TypingStats) => {
    // Could add sound effects, analytics, etc.
    console.log(`Char: "${char}", Correct: ${correct}, Position: ${stats.currentPosition}`);
  }, []);

  const calculateWPM = (stats: TypingStats) => {
    if (!stats.startTime) return 0;
    const minutes = (Date.now() - stats.startTime) / 60000;
    const words = stats.correctKeystrokes / 5;
    return Math.round(words / minutes);
  };

  const handleReset = () => {
    setCompletedStats(null);
    setKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Digital Keyboard
          </h1>
          <p className="text-gray-400">
            Interactive typing trainer with real-time feedback
          </p>
        </header>

        {/* Lesson selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => {
                  setSelectedLesson(lesson);
                  setCompletedStats(null);
                  setKey(prev => prev + 1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedLesson.id === lesson.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {lesson.title}
              </button>
            ))}
          </div>

          {/* Custom text input for free typing */}
          {selectedLesson.id === 'free-type' && (
            <div className="mb-4">
              <textarea
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setKey(prev => prev + 1);
                }}
                placeholder="Enter custom text to practice..."
                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                rows={3}
              />
            </div>
          )}

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-800 border-gray-600"
              />
              Strict Mode (must press correct key to progress)
            </label>
          </div>
        </div>

        {/* Completion modal */}
        {completedStats && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700 rounded-xl">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Lesson Complete!
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-white">
                  {calculateWPM(completedStats)}
                </div>
                <div className="text-sm text-gray-400">WPM</div>
              </div>
              <div className="bg-black/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-white">
                  {completedStats.totalKeystrokes > 0
                    ? Math.round(
                        (completedStats.correctKeystrokes / completedStats.totalKeystrokes) * 100
                      )
                    : 100}%
                </div>
                <div className="text-sm text-gray-400">Accuracy</div>
              </div>
              <div className="bg-black/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-400">
                  {completedStats.correctKeystrokes}
                </div>
                <div className="text-sm text-gray-400">Correct</div>
              </div>
              <div className="bg-black/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-red-400">
                  {completedStats.incorrectKeystrokes}
                </div>
                <div className="text-sm text-gray-400">Errors</div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Keyboard component */}
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <DigitalKeyboard
            key={key}
            targetText={targetText || undefined}
            onComplete={handleComplete}
            onKeyPress={handleKeyPress}
            strictMode={strictMode}
            showActiveKeys={true}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">How to Use</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Select a lesson or enter custom text in Free Typing mode
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              The <span className="text-blue-400">highlighted key</span> shows the next expected character
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span className="text-green-400">Green glow</span> indicates correct keypress
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span className="text-red-400">Red glow</span> indicates incorrect keypress
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-300">•</span>
              In Strict Mode, you must press the correct key to advance
            </li>
          </ul>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Press any key to see visual feedback on the keyboard</p>
        </footer>
      </div>
    </main>
  );
}
