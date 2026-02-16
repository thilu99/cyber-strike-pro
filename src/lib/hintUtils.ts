import { VALID_WORDS } from './dictionary'
import { canFormWord } from './wordUtils'

export const getHint = (letters: string[], foundWords: string[]) => {
  // Find all words that CAN be formed but HAVEN'T been found
  const potentialWords = Array.from(VALID_WORDS).filter(
    word => canFormWord(word, letters) && !foundWords.includes(word) && word.length > 2
  )

  if (potentialWords.length === 0) return null

  // Pick a random word from the potential list
  const randomWord = potentialWords[Math.floor(Math.random() * potentialWords.length)]
  
  // Return the first letter of that word
  return randomWord[0]
}