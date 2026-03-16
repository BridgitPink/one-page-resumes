import type { BoldWordsState } from "./storage";

/**
 * Build a unique identifier for a word in the resume
 * Format: {section}_{entryIndex}_{bulletIndex}_{wordIndex}
 */
export function buildWordId(
  section: string,
  entryIndex: number,
  bulletIndex: number,
  wordIndex: number
): string {
  return `${section}_${entryIndex}_${bulletIndex}_${wordIndex}`;
}

/**
 * Check if a specific word is bold
 */
export function isBoldWord(
  section: string,
  entryIndex: number,
  bulletIndex: number,
  wordIndex: number,
  boldState: BoldWordsState
): boolean {
  const wordId = buildWordId(section, entryIndex, bulletIndex, wordIndex);
  return boldState[wordId] === true;
}

/**
 * Toggle bold state for a word
 * Returns a new BoldWordsState with the toggle applied
 */
export function toggleBoldWord(
  section: string,
  entryIndex: number,
  bulletIndex: number,
  wordIndex: number,
  boldState: BoldWordsState
): BoldWordsState {
  const wordId = buildWordId(section, entryIndex, bulletIndex, wordIndex);
  const newState = { ...boldState };

  if (newState[wordId]) {
    delete newState[wordId];
  } else {
    newState[wordId] = true;
  }

  return newState;
}

/**
 * Split a bullet text into words, preserving punctuation attachment
 * Returns array of { text, index } for tracking
 */
export function splitBulletIntoWords(
  text: string
): Array<{ text: string; index: number }> {
  if (!text) return [];

  // Split on whitespace but keep punctuation attached
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  return words.map((text, index) => ({
    text,
    index,
  }));
}

/**
 * Join words back into a string
 */
export function joinWordsToText(words: Array<{ text: string; index: number }>): string {
  return words.map((w) => w.text).join(" ");
}

/**
 * Clear all bold words
 */
export function clearAllBoldWords(): BoldWordsState {
  return {};
}
