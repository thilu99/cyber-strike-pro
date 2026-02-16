import wordsData from './words_dictionary.json';

/**
 * Object.keys(wordsData) gets all the words from the JSON.
 * .map(w => w.toUpperCase()) makes sure they match your game's input.
 * new Set(...) makes looking up a word instant (O(1) speed).
 */
export const VALID_WORDS = new Set(
  Object.keys(wordsData).map(word => word.toUpperCase())
);