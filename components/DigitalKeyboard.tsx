'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { svgIndexToCode, isCorrectKey, getExpectedCode } from '@/lib/keyMap';

// Key state for visual feedback
export type KeyState = 'idle' | 'active' | 'correct' | 'incorrect' | 'next';

export interface TypingStats {
  totalKeystrokes: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  startTime: number | null;
  currentPosition: number;
}

export interface DigitalKeyboardProps {
  /** Target text for typing mode. If provided, enables controlled typing */
  targetText?: string;
  /** Callback when typing is complete */
  onComplete?: (stats: TypingStats) => void;
  /** Callback on each key press with stats */
  onKeyPress?: (key: string, correct: boolean, stats: TypingStats) => void;
  /** Whether to lock progression on incorrect key (typing tutor mode) */
  strictMode?: boolean;
  /** Custom class name for the container */
  className?: string;
  /** Show key states even without target text */
  showActiveKeys?: boolean;
}

export default function DigitalKeyboard({
  targetText,
  onComplete,
  onKeyPress,
  strictMode = true,
  className = '',
  showActiveKeys = true,
}: DigitalKeyboardProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const keyGroupsRef = useRef<Map<string, SVGGElement>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState<TypingStats>({
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    incorrectKeystrokes: 0,
    startTime: null,
    currentPosition: 0,
  });

  // Active keys set for visual feedback
  const activeKeysRef = useRef<Set<string>>(new Set());

  // Current expected character
  const expectedChar = useMemo(() => {
    if (!targetText) return null;
    return targetText[stats.currentPosition] || null;
  }, [targetText, stats.currentPosition]);

  // Expected key code
  const expectedCode = useMemo(() => {
    if (!expectedChar) return null;
    return getExpectedCode(expectedChar) || null;
  }, [expectedChar]);

  // Load and process SVG
  useEffect(() => {
    async function loadSVG() {
      if (!svgContainerRef.current) return;

      try {
        const response = await fetch('/keyboard.svg');
        const svgText = await response.text();

        // Parse SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');

        if (!svgElement) return;

        // Make SVG responsive
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', 'auto');
        svgElement.style.maxWidth = '100%';

        // Find all key groups (nested g elements with filters inside the keyboard frame)
        // The first g[filter] is the keyboard frame, keys are g[filter] elements inside it
        const keyGroups = svgElement.querySelectorAll(':scope > g[filter] > g[filter]');

        keyGroups.forEach((group, index) => {
          const code = svgIndexToCode[index];

          if (code) {
            // Add data-key attribute
            group.setAttribute('data-key', code);
            group.setAttribute('data-index', index.toString());

            // Add transition class
            group.classList.add('key-group');

            // Store reference
            keyGroupsRef.current.set(code, group as SVGGElement);
          }
        });

        // Clear and append
        svgContainerRef.current.innerHTML = '';
        svgContainerRef.current.appendChild(svgElement);

        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load keyboard SVG:', error);
      }
    }

    loadSVG();
  }, []);

  // Update visual state for a key
  const setKeyState = useCallback((code: string, state: KeyState) => {
    const group = keyGroupsRef.current.get(code);
    if (!group) return;

    // Remove all state classes
    group.classList.remove('key-active', 'key-correct', 'key-incorrect', 'key-next');

    // Add new state class
    if (state !== 'idle') {
      group.classList.add(`key-${state}`);
    }
  }, []);

  // Update next key highlight
  useEffect(() => {
    if (!isLoaded || !targetText) return;

    // Clear previous next highlight
    keyGroupsRef.current.forEach((group) => {
      group.classList.remove('key-next');
    });

    // Highlight next expected key
    if (expectedCode) {
      setKeyState(expectedCode, 'next');
    }
  }, [isLoaded, expectedCode, targetText, setKeyState]);

  // Handle keydown
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { code } = event;

      // Prevent default for typing mode
      if (targetText) {
        event.preventDefault();
      }

      // Already pressed, ignore repeat
      if (activeKeysRef.current.has(code)) return;

      activeKeysRef.current.add(code);

      // Visual feedback for active state
      if (showActiveKeys) {
        setKeyState(code, 'active');
      }

      // Typing mode logic
      if (targetText && expectedChar !== null) {
        const isCorrect = isCorrectKey(code, expectedChar);

        setStats((prev) => {
          const newStats = {
            ...prev,
            totalKeystrokes: prev.totalKeystrokes + 1,
            startTime: prev.startTime ?? Date.now(),
          };

          if (isCorrect) {
            newStats.correctKeystrokes = prev.correctKeystrokes + 1;
            newStats.currentPosition = prev.currentPosition + 1;

            // Show correct feedback
            setKeyState(code, 'correct');

            // Check completion
            if (newStats.currentPosition >= targetText.length) {
              onComplete?.(newStats);
            }
          } else {
            newStats.incorrectKeystrokes = prev.incorrectKeystrokes + 1;

            // Show incorrect feedback
            setKeyState(code, 'incorrect');

            // In non-strict mode, still advance
            if (!strictMode) {
              newStats.currentPosition = prev.currentPosition + 1;
            }
          }

          onKeyPress?.(expectedChar, isCorrect, newStats);

          return newStats;
        });
      }
    },
    [targetText, expectedChar, strictMode, showActiveKeys, setKeyState, onComplete, onKeyPress]
  );

  // Handle keyup
  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const { code } = event;

      activeKeysRef.current.delete(code);

      // Reset to idle or next state
      if (code === expectedCode) {
        setKeyState(code, 'next');
      } else {
        setKeyState(code, 'idle');
      }
    },
    [expectedCode, setKeyState]
  );

  // Global key listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Reset function
  const reset = useCallback(() => {
    setStats({
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      incorrectKeystrokes: 0,
      startTime: null,
      currentPosition: 0,
    });

    // Clear all key states
    keyGroupsRef.current.forEach((group) => {
      group.classList.remove('key-active', 'key-correct', 'key-incorrect', 'key-next');
    });
  }, []);

  // Calculate WPM
  const wpm = useMemo(() => {
    if (!stats.startTime || stats.correctKeystrokes === 0) return 0;
    const minutes = (Date.now() - stats.startTime) / 60000;
    const words = stats.correctKeystrokes / 5; // Standard: 5 chars = 1 word
    return Math.round(words / minutes);
  }, [stats.startTime, stats.correctKeystrokes]);

  // Calculate accuracy
  const accuracy = useMemo(() => {
    if (stats.totalKeystrokes === 0) return 100;
    return Math.round((stats.correctKeystrokes / stats.totalKeystrokes) * 100);
  }, [stats.totalKeystrokes, stats.correctKeystrokes]);

  return (
    <div className={`digital-keyboard ${className}`}>
      {/* Stats display */}
      {targetText && (
        <div className="mb-4 flex gap-6 text-sm">
          <div className="stat">
            <span className="text-gray-500">WPM:</span>
            <span className="ml-2 font-mono font-bold">{wpm}</span>
          </div>
          <div className="stat">
            <span className="text-gray-500">Accuracy:</span>
            <span className="ml-2 font-mono font-bold">{accuracy}%</span>
          </div>
          <div className="stat">
            <span className="text-gray-500">Progress:</span>
            <span className="ml-2 font-mono font-bold">
              {stats.currentPosition}/{targetText.length}
            </span>
          </div>
          <button
            onClick={reset}
            className="ml-auto text-blue-500 hover:text-blue-600 text-sm"
          >
            Reset
          </button>
        </div>
      )}

      {/* Target text display */}
      {targetText && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-lg leading-relaxed">
          {targetText.split('').map((char, i) => {
            let className = 'typing-char';
            if (i < stats.currentPosition) {
              className += ' typed';
            } else if (i === stats.currentPosition) {
              className += ' current';
            }
            return (
              <span key={i} className={className}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      )}

      {/* SVG Keyboard container */}
      <div
        ref={svgContainerRef}
        className="keyboard-svg-container"
        aria-label="Digital keyboard"
        role="img"
      />

      {/* Inline styles for SVG manipulation */}
      <style jsx global>{`
        .keyboard-svg-container svg {
          display: block;
          width: 100%;
          height: auto;
        }

        .key-group {
          transition:
            transform 0.08s cubic-bezier(0.34, 1.8, 0.64, 1),
            filter 0.08s cubic-bezier(0.34, 1.8, 0.64, 1);
          transform-origin: center;
          cursor: pointer;
          transform-box: fill-box;
        }

        .key-group:hover {
          filter: brightness(0.98);
        }

        /* Active/Pressed state - dark with white text */
        .key-active {
          transform: scale(0.95) translateY(2px);
          filter:
            invert(1)
            hue-rotate(180deg)
            saturate(0)
            brightness(0.35)
            contrast(2) !important;
          transition:
            transform 0.03s cubic-bezier(0.2, 0, 0.4, 1),
            filter 0.03s cubic-bezier(0.2, 0, 0.4, 1);
        }

        /* Make text paths white in pressed state */
        .key-active path[fill="#404040"],
        .key-active path[fill="white"] {
          filter: brightness(3) !important;
        }

        /* Correct state - green tint */
        .key-correct {
          transform: scale(0.97) translateY(1px);
          filter:
            brightness(0.95)
            saturate(1.2)
            drop-shadow(0 0 12px rgba(34, 197, 94, 0.7)) !important;
        }

        /* Incorrect state - red shake */
        .key-incorrect {
          filter:
            brightness(1.05)
            saturate(1.3)
            drop-shadow(0 0 12px rgba(239, 68, 68, 0.8)) !important;
          animation: shake 0.15s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        /* Next expected key - subtle blue highlight */
        .key-next {
          filter:
            brightness(1.02)
            drop-shadow(0 0 8px rgba(99, 179, 237, 0.5)) !important;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0) scale(0.97); }
          20% { transform: translateX(-4px) scale(0.97); }
          40% { transform: translateX(4px) scale(0.97); }
          60% { transform: translateX(-3px) scale(0.97); }
          80% { transform: translateX(3px) scale(0.97); }
        }

        @keyframes pulse {
          0%, 100% {
            filter: brightness(1.02) drop-shadow(0 0 8px rgba(99, 179, 237, 0.5));
          }
          50% {
            filter: brightness(1.05) drop-shadow(0 0 14px rgba(99, 179, 237, 0.7));
          }
        }

        /* Key release animation - fast springy bounce back */
        .key-group:not(.key-active):not(.key-correct):not(.key-incorrect) {
          transition:
            transform 0.12s cubic-bezier(0.34, 2.2, 0.64, 1),
            filter 0.12s cubic-bezier(0.34, 2.2, 0.64, 1);
        }

        /* Typing text styles */
        .typing-char {
          transition: color 0.1s, background-color 0.1s;
        }

        .typing-char.typed {
          color: #22c55e;
        }

        .typing-char.current {
          background-color: rgba(59, 130, 246, 0.3);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}

// Export stats type and reset function hook
export function useKeyboardStats() {
  const [stats, setStats] = useState<TypingStats>({
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    incorrectKeystrokes: 0,
    startTime: null,
    currentPosition: 0,
  });

  const reset = useCallback(() => {
    setStats({
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      incorrectKeystrokes: 0,
      startTime: null,
      currentPosition: 0,
    });
  }, []);

  return { stats, setStats, reset };
}
