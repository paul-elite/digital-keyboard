/**
 * Keyboard mapping system
 * Maps KeyboardEvent.code to SVG key identifiers and display labels
 */

export interface KeyMapping {
  code: string;           // KeyboardEvent.code (e.g., "KeyA", "Space")
  key: string;            // KeyboardEvent.key for character output
  label: string;          // Display label on keyboard
  row: number;            // Row index (0-4)
  position: number;       // Position in row
  width?: number;         // Key width multiplier (default: 1)
  type: 'letter' | 'number' | 'modifier' | 'special' | 'function';
}

// Standard QWERTY keyboard layout
export const keyboardLayout: KeyMapping[] = [
  // Row 0 - Function keys
  { code: 'Escape', key: 'Escape', label: 'Esc', row: 0, position: 0, width: 1.75, type: 'special' },
  { code: 'F1', key: 'F1', label: 'F1', row: 0, position: 1, type: 'function' },
  { code: 'F2', key: 'F2', label: 'F2', row: 0, position: 2, type: 'function' },
  { code: 'F3', key: 'F3', label: 'F3', row: 0, position: 3, type: 'function' },
  { code: 'F4', key: 'F4', label: 'F4', row: 0, position: 4, type: 'function' },
  { code: 'F5', key: 'F5', label: 'F5', row: 0, position: 5, type: 'function' },
  { code: 'F6', key: 'F6', label: 'F6', row: 0, position: 6, type: 'function' },
  { code: 'F7', key: 'F7', label: 'F7', row: 0, position: 7, type: 'function' },
  { code: 'F8', key: 'F8', label: 'F8', row: 0, position: 8, type: 'function' },
  { code: 'F9', key: 'F9', label: 'F9', row: 0, position: 9, type: 'function' },
  { code: 'F10', key: 'F10', label: 'F10', row: 0, position: 10, type: 'function' },
  { code: 'F11', key: 'F11', label: 'F11', row: 0, position: 11, type: 'function' },
  { code: 'F12', key: 'F12', label: 'F12', row: 0, position: 12, type: 'function' },

  // Row 1 - Number row
  { code: 'Backquote', key: '`', label: '`', row: 1, position: 0, type: 'special' },
  { code: 'Digit1', key: '1', label: '1', row: 1, position: 1, type: 'number' },
  { code: 'Digit2', key: '2', label: '2', row: 1, position: 2, type: 'number' },
  { code: 'Digit3', key: '3', label: '3', row: 1, position: 3, type: 'number' },
  { code: 'Digit4', key: '4', label: '4', row: 1, position: 4, type: 'number' },
  { code: 'Digit5', key: '5', label: '5', row: 1, position: 5, type: 'number' },
  { code: 'Digit6', key: '6', label: '6', row: 1, position: 6, type: 'number' },
  { code: 'Digit7', key: '7', label: '7', row: 1, position: 7, type: 'number' },
  { code: 'Digit8', key: '8', label: '8', row: 1, position: 8, type: 'number' },
  { code: 'Digit9', key: '9', label: '9', row: 1, position: 9, type: 'number' },
  { code: 'Digit0', key: '0', label: '0', row: 1, position: 10, type: 'number' },
  { code: 'Minus', key: '-', label: '-', row: 1, position: 11, type: 'special' },
  { code: 'Equal', key: '=', label: '=', row: 1, position: 12, type: 'special' },
  { code: 'Backspace', key: 'Backspace', label: '⌫', row: 1, position: 13, width: 2, type: 'special' },

  // Row 2 - QWERTY row
  { code: 'Tab', key: 'Tab', label: 'Tab', row: 2, position: 0, width: 1.5, type: 'special' },
  { code: 'KeyQ', key: 'q', label: 'Q', row: 2, position: 1, type: 'letter' },
  { code: 'KeyW', key: 'w', label: 'W', row: 2, position: 2, type: 'letter' },
  { code: 'KeyE', key: 'e', label: 'E', row: 2, position: 3, type: 'letter' },
  { code: 'KeyR', key: 'r', label: 'R', row: 2, position: 4, type: 'letter' },
  { code: 'KeyT', key: 't', label: 'T', row: 2, position: 5, type: 'letter' },
  { code: 'KeyY', key: 'y', label: 'Y', row: 2, position: 6, type: 'letter' },
  { code: 'KeyU', key: 'u', label: 'U', row: 2, position: 7, type: 'letter' },
  { code: 'KeyI', key: 'i', label: 'I', row: 2, position: 8, type: 'letter' },
  { code: 'KeyO', key: 'o', label: 'O', row: 2, position: 9, type: 'letter' },
  { code: 'KeyP', key: 'p', label: 'P', row: 2, position: 10, type: 'letter' },
  { code: 'BracketLeft', key: '[', label: '[', row: 2, position: 11, type: 'special' },
  { code: 'BracketRight', key: ']', label: ']', row: 2, position: 12, type: 'special' },
  { code: 'Backslash', key: '\\', label: '\\', row: 2, position: 13, width: 1.5, type: 'special' },

  // Row 3 - ASDF row
  { code: 'CapsLock', key: 'CapsLock', label: 'Caps', row: 3, position: 0, width: 1.75, type: 'modifier' },
  { code: 'KeyA', key: 'a', label: 'A', row: 3, position: 1, type: 'letter' },
  { code: 'KeyS', key: 's', label: 'S', row: 3, position: 2, type: 'letter' },
  { code: 'KeyD', key: 'd', label: 'D', row: 3, position: 3, type: 'letter' },
  { code: 'KeyF', key: 'f', label: 'F', row: 3, position: 4, type: 'letter' },
  { code: 'KeyG', key: 'g', label: 'G', row: 3, position: 5, type: 'letter' },
  { code: 'KeyH', key: 'h', label: 'H', row: 3, position: 6, type: 'letter' },
  { code: 'KeyJ', key: 'j', label: 'J', row: 3, position: 7, type: 'letter' },
  { code: 'KeyK', key: 'k', label: 'K', row: 3, position: 8, type: 'letter' },
  { code: 'KeyL', key: 'l', label: 'L', row: 3, position: 9, type: 'letter' },
  { code: 'Semicolon', key: ';', label: ';', row: 3, position: 10, type: 'special' },
  { code: 'Quote', key: "'", label: "'", row: 3, position: 11, type: 'special' },
  { code: 'Enter', key: 'Enter', label: 'Enter', row: 3, position: 12, width: 2.25, type: 'special' },

  // Row 4 - ZXCV row
  { code: 'ShiftLeft', key: 'Shift', label: 'Shift', row: 4, position: 0, width: 2.25, type: 'modifier' },
  { code: 'KeyZ', key: 'z', label: 'Z', row: 4, position: 1, type: 'letter' },
  { code: 'KeyX', key: 'x', label: 'X', row: 4, position: 2, type: 'letter' },
  { code: 'KeyC', key: 'c', label: 'C', row: 4, position: 3, type: 'letter' },
  { code: 'KeyV', key: 'v', label: 'V', row: 4, position: 4, type: 'letter' },
  { code: 'KeyB', key: 'b', label: 'B', row: 4, position: 5, type: 'letter' },
  { code: 'KeyN', key: 'n', label: 'N', row: 4, position: 6, type: 'letter' },
  { code: 'KeyM', key: 'm', label: 'M', row: 4, position: 7, type: 'letter' },
  { code: 'Comma', key: ',', label: ',', row: 4, position: 8, type: 'special' },
  { code: 'Period', key: '.', label: '.', row: 4, position: 9, type: 'special' },
  { code: 'Slash', key: '/', label: '/', row: 4, position: 10, type: 'special' },
  { code: 'ShiftRight', key: 'Shift', label: 'Shift', row: 4, position: 11, width: 2.75, type: 'modifier' },

  // Row 5 - Bottom row
  { code: 'ControlLeft', key: 'Control', label: 'Ctrl', row: 5, position: 0, width: 1.25, type: 'modifier' },
  { code: 'MetaLeft', key: 'Meta', label: '⌘', row: 5, position: 1, width: 1.25, type: 'modifier' },
  { code: 'AltLeft', key: 'Alt', label: 'Alt', row: 5, position: 2, width: 1.25, type: 'modifier' },
  { code: 'Space', key: ' ', label: 'Space', row: 5, position: 3, width: 6.25, type: 'special' },
  { code: 'AltRight', key: 'Alt', label: 'Alt', row: 5, position: 4, width: 1.25, type: 'modifier' },
  { code: 'MetaRight', key: 'Meta', label: '⌘', row: 5, position: 5, width: 1.25, type: 'modifier' },
  { code: 'ContextMenu', key: 'ContextMenu', label: 'Menu', row: 5, position: 6, width: 1.25, type: 'special' },
  { code: 'ControlRight', key: 'Control', label: 'Ctrl', row: 5, position: 7, width: 1.25, type: 'modifier' },
];

// Create lookup maps for fast access
export const codeToKeyMap = new Map<string, KeyMapping>(
  keyboardLayout.map(k => [k.code, k])
);

export const keyToCodeMap = new Map<string, string>(
  keyboardLayout
    .filter(k => k.type === 'letter' || k.type === 'number')
    .map(k => [k.key.toLowerCase(), k.code])
);

// Get expected key code for a character
export function getExpectedCode(char: string): string | undefined {
  const lowerChar = char.toLowerCase();

  // Direct mapping for letters and numbers
  if (keyToCodeMap.has(lowerChar)) {
    return keyToCodeMap.get(lowerChar);
  }

  // Special character mappings
  const specialMappings: Record<string, string> = {
    ' ': 'Space',
    '\n': 'Enter',
    '\t': 'Tab',
    '.': 'Period',
    ',': 'Comma',
    '/': 'Slash',
    '\\': 'Backslash',
    ';': 'Semicolon',
    "'": 'Quote',
    '[': 'BracketLeft',
    ']': 'BracketRight',
    '-': 'Minus',
    '=': 'Equal',
    '`': 'Backquote',
  };

  return specialMappings[char];
}

// Check if a code matches an expected character
export function isCorrectKey(code: string, expectedChar: string): boolean {
  const expectedCode = getExpectedCode(expectedChar);
  return code === expectedCode;
}

// SVG key index mapping (based on visual position in the SVG)
// This maps the SVG group index to the key code
export const svgIndexToCode: Record<number, string> = {
  // Row 0 - Function keys (indices 0-13)
  0: 'Escape',
  1: 'F1',
  2: 'F2',
  3: 'F3',
  4: 'F4',
  5: 'F5',
  6: 'F6',
  7: 'F7',
  8: 'F8',
  9: 'F9',
  10: 'F10',
  11: 'F11',
  12: 'F12',
  13: 'Delete', // Or could be power/eject

  // Row 1 - Number row (indices 14-27)
  14: 'Backquote',
  15: 'Digit1',
  16: 'Digit2',
  17: 'Digit3',
  18: 'Digit4',
  19: 'Digit5',
  20: 'Digit6',
  21: 'Digit7',
  22: 'Digit8',
  23: 'Digit9',
  24: 'Digit0',
  25: 'Minus',
  26: 'Equal',
  27: 'Backspace',

  // Row 2 - QWERTY row (indices 28-41)
  28: 'Tab',
  29: 'KeyQ',
  30: 'KeyW',
  31: 'KeyE',
  32: 'KeyR',
  33: 'KeyT',
  34: 'KeyY',
  35: 'KeyU',
  36: 'KeyI',
  37: 'KeyO',
  38: 'KeyP',
  39: 'BracketLeft',
  40: 'BracketRight',
  41: 'Backslash',

  // Row 3 - ASDF row (indices 42-54)
  42: 'CapsLock',
  43: 'KeyA',
  44: 'KeyS',
  45: 'KeyD',
  46: 'KeyF',
  47: 'KeyG',
  48: 'KeyH',
  49: 'KeyJ',
  50: 'KeyK',
  51: 'KeyL',
  52: 'Semicolon',
  53: 'Quote',
  54: 'Enter',

  // Row 4 - ZXCV row (indices 55-66)
  55: 'ShiftLeft',
  56: 'KeyZ',
  57: 'KeyX',
  58: 'KeyC',
  59: 'KeyV',
  60: 'KeyB',
  61: 'KeyN',
  62: 'KeyM',
  63: 'Comma',
  64: 'Period',
  65: 'Slash',
  66: 'ShiftRight',

  // Row 5 - Bottom row (indices 67-78)
  67: 'Fn', // Function key
  68: 'ControlLeft',
  69: 'AltLeft',
  70: 'MetaLeft',
  71: 'Space',
  72: 'MetaRight',
  73: 'AltRight',
  74: 'ArrowLeft',
  75: 'ArrowUp',
  76: 'ArrowDown',
  77: 'ArrowRight',
  78: 'ControlRight',
};

// Reverse mapping
export const codeToSvgIndex = new Map<string, number>(
  Object.entries(svgIndexToCode).map(([idx, code]) => [code, parseInt(idx)])
);
