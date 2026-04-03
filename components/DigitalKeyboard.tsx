'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { svgIndexToCode, isCorrectKey, getExpectedCode } from '@/lib/keyMap';
import { playKeySound } from '@/lib/sounds';

// Key state for visual feedback
export type KeyState = 'idle' | 'active' | 'correct' | 'incorrect' | 'next' | 'hint' | 'blue' | 'orange';

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
  /** Keys to highlight with hint state (e.g., ['Space'] for tutorial) */
  hintKeys?: string[];
  /** Callback when a hint key is pressed */
  onHintKeyPress?: (code: string) => void;
  /** Keys to highlight with orange state (e.g., ['Escape'] when playing) */
  orangeKeys?: string[];
  /** Enable key press sounds */
  soundEnabled?: boolean;
}

export default function DigitalKeyboard({
  targetText,
  onComplete,
  onKeyPress,
  strictMode = false,
  className = '',
  showActiveKeys = true,
  hintKeys = [],
  onHintKeyPress,
  orangeKeys = [],
  soundEnabled = false,
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

  // Track which positions had incorrect keystrokes (using ref for sync updates)
  const failedPositionsRef = useRef<Set<number>>(new Set());
  const [failedPositions, setFailedPositions] = useState<Set<number>>(new Set());

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

  // Check if expected character requires Shift (uppercase letter)
  const requiresShift = useMemo(() => {
    if (!expectedChar) return false;
    return expectedChar >= 'A' && expectedChar <= 'Z';
  }, [expectedChar]);

  // Reset failed positions when targetText changes
  useEffect(() => {
    failedPositionsRef.current = new Set();
    setFailedPositions(new Set());
  }, [targetText]);

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
            
            // Allow pointer cursor and click interactions
            (group as HTMLElement).style.cursor = 'pointer';
            
            group.addEventListener('mousedown', (e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code.replace('Key', '') }));
            });
            group.addEventListener('mouseup', () => {
              window.dispatchEvent(new KeyboardEvent('keyup', { code, key: code.replace('Key', '') }));
            });
            group.addEventListener('mouseleave', () => {
              window.dispatchEvent(new KeyboardEvent('keyup', { code, key: code.replace('Key', '') }));
            });

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
    group.classList.remove('key-active', 'key-correct', 'key-incorrect', 'key-next', 'key-hint', 'key-blue', 'key-orange');

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

    // Also highlight Shift key for capital letters
    if (requiresShift) {
      const shiftGroup = keyGroupsRef.current.get('ShiftLeft');
      if (shiftGroup) {
        shiftGroup.classList.add('key-next');
      }
    }
  }, [isLoaded, expectedCode, targetText, setKeyState, requiresShift]);

  // Update hint keys highlight
  useEffect(() => {
    if (!isLoaded) return;

    // Clear all hint states first
    keyGroupsRef.current.forEach((group) => {
      group.classList.remove('key-hint');
    });

    // Apply hint state to specified keys
    hintKeys.forEach((code) => {
      const group = keyGroupsRef.current.get(code);
      if (group) {
        group.classList.add('key-hint');
      }
    });
  }, [isLoaded, hintKeys]);

  // Update orange keys highlight
  useEffect(() => {
    if (!isLoaded) return;

    // Clear all orange states first
    keyGroupsRef.current.forEach((group) => {
      group.classList.remove('key-orange');
    });

    // Apply orange state to specified keys
    orangeKeys.forEach((code) => {
      const group = keyGroupsRef.current.get(code);
      if (group) {
        group.classList.add('key-orange');
      }
    });
  }, [isLoaded, orangeKeys]);

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

      // Check if this is a hint key
      if (hintKeys.includes(code)) {
        onHintKeyPress?.(code);
      }

      // Play general key press sound when not in typing mode
      if (soundEnabled && !targetText) {
        playKeySound('press');
      }

      // Typing mode logic
      if (targetText && expectedChar !== null) {
        // Check if this character requires Shift (uppercase letter)
        const charRequiresShift = expectedChar >= 'A' && expectedChar <= 'Z';

        // Ignore Shift key presses when expecting a capital letter - don't count as keystroke
        if (charRequiresShift && (code === 'ShiftLeft' || code === 'ShiftRight')) {
          return;
        }

        // Check if the key matches the expected character
        const keyMatches = isCorrectKey(code, expectedChar);

        // For uppercase letters, also verify Shift is held
        // For lowercase/other chars, just check the key
        const isCorrect = keyMatches && (!charRequiresShift || event.shiftKey);

        // Play sound feedback
        if (soundEnabled) {
          playKeySound(isCorrect ? 'correct' : 'incorrect');
        }

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

            // In non-strict mode, still advance and track failed position
            if (!strictMode) {
              const failPos = prev.currentPosition;
              failedPositionsRef.current.add(failPos);
              setFailedPositions(new Set(failedPositionsRef.current));
              newStats.currentPosition = prev.currentPosition + 1;

              // Check completion even with errors
              if (newStats.currentPosition >= targetText.length) {
                onComplete?.(newStats);
              }
            }
          }

          onKeyPress?.(expectedChar, isCorrect, newStats);

          return newStats;
        });
      }
    },
    [targetText, expectedChar, strictMode, showActiveKeys, setKeyState, onComplete, onKeyPress, hintKeys, onHintKeyPress, soundEnabled]
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
    failedPositionsRef.current = new Set();
    setFailedPositions(new Set());

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
        <div 
          className="mb-6 p-4 bg-white rounded-lg font-mono text-lg leading-relaxed"
          style={{ boxShadow: '0px 0px 0px 0.5px rgba(0, 0, 0, 0.05)' }}
        >
          {targetText.split('').map((char, i) => {
            let className = 'typing-char';
            if (i < stats.currentPosition) {
              className += failedPositions.has(i) ? ' failed' : ' typed';
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

      {/* SVG Gradient Definitions for key states */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {/* Green gradients for correct state - top to bottom */}
          <linearGradient id="correct-outer" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#6EE7A0" />
            <stop offset="100%" stopColor="#86EFAC" />
          </linearGradient>
          <linearGradient id="correct-inner" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#D1FAE5" />
            <stop offset="50%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>

          {/* Red gradients for incorrect state - top to bottom */}
          <linearGradient id="incorrect-outer" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>
          <linearGradient id="incorrect-inner" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFE4E6" />
            <stop offset="50%" stopColor="#FECDD3" />
            <stop offset="100%" stopColor="#FDA4AF" />
          </linearGradient>

          {/* Blue gradients for hint/next state - top to bottom */}
          <linearGradient id="blue-outer" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#7AD8F8" />
          </linearGradient>
          <linearGradient id="blue-inner" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>

          {/* Orange gradients for escape/cancel state - top to bottom (exact SVG colors) */}
          <linearGradient id="orange-outer" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F02D13" />
            <stop offset="100%" stopColor="#F02D13" />
          </linearGradient>
          <linearGradient id="orange-inner" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#EA4727" />
            <stop offset="50%" stopColor="#EA4727" />
            <stop offset="100%" stopColor="#EA4727" />
          </linearGradient>

          {/* Grey gradients for default key state - top to bottom */}
          <linearGradient id="grey-outer" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F5F5F5" />
            <stop offset="100%" stopColor="#E5E5E5" />
          </linearGradient>
          <linearGradient id="grey-inner" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FAFAFA" />
            <stop offset="100%" stopColor="#F0F0F0" />
          </linearGradient>
        </defs>
      </svg>

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

        /* Generic Green Correct Key Style - top-down gradients */
        .key-correct > *:nth-child(1) { fill: url(#correct-outer) !important; }
        .key-correct > *:nth-child(2) { stroke: #4ADE80 !important; }
        .key-correct > *:nth-child(3) { fill: url(#correct-inner) !important; }
        .key-correct > *:nth-child(4) { stroke: #22C55E !important; }

        /* Generic Red Incorrect Key Style - top-down gradients */
        .key-incorrect > *:nth-child(1) { fill: url(#incorrect-outer) !important; }
        .key-incorrect > *:nth-child(2) { stroke: #FB7185 !important; }
        .key-incorrect > *:nth-child(3) { fill: url(#incorrect-inner) !important; }
        .key-incorrect > *:nth-child(4) { stroke: #F43F5E !important; }

        /* Generic Blue-ish Key Style - top-down gradients (applied to next, hint, and explicit blue state) */
        .key-blue > *:nth-child(1), .key-next > *:nth-child(1), .key-hint > *:nth-child(1) { fill: url(#blue-outer) !important; }
        .key-blue > *:nth-child(2), .key-next > *:nth-child(2), .key-hint > *:nth-child(2) { stroke: #38BDF8 !important; }
        .key-blue > *:nth-child(3), .key-next > *:nth-child(3), .key-hint > *:nth-child(3) { fill: url(#blue-inner) !important; }
        .key-blue > *:nth-child(4), .key-next > *:nth-child(4), .key-hint > *:nth-child(4) { stroke: #0EA5E9 !important; }

        /* Generic Orange Key Style - top-down gradients (exact SVG escape colors) */
        .key-orange > *:nth-child(1) { fill: url(#orange-outer) !important; }
        .key-orange > *:nth-child(2) { stroke: #741717 !important; }
        .key-orange > *:nth-child(3) { fill: url(#orange-inner) !important; }
        .key-orange > *:nth-child(4) { stroke: #AB2727 !important; }
        .key-orange path { fill: white !important; }

        /* Override Escape key to be grey by default (matches other keys) */
        .key-group[data-key="Escape"]:not(.key-orange):not(.key-active) > *:nth-child(1) { fill: url(#grey-outer) !important; }
        .key-group[data-key="Escape"]:not(.key-orange):not(.key-active) > *:nth-child(2) { stroke: #DBDBDB !important; }
        .key-group[data-key="Escape"]:not(.key-orange):not(.key-active) > *:nth-child(3) { fill: url(#grey-inner) !important; }
        .key-group[data-key="Escape"]:not(.key-orange):not(.key-active) > *:nth-child(4) { stroke: #EEEEEE !important; }
        .key-group[data-key="Escape"]:not(.key-orange):not(.key-active) path { fill: #404040 !important; }

        @keyframes shake {
          0%, 100% { transform: translateX(0) scale(0.97); }
          20% { transform: translateX(-4px) scale(0.97); }
          40% { transform: translateX(4px) scale(0.97); }
          60% { transform: translateX(-3px) scale(0.97); }
          80% { transform: translateX(3px) scale(0.97); }
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
          color: #BCE5C2;
        }

        .typing-char.failed {
          color: #FEC5C9;
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
