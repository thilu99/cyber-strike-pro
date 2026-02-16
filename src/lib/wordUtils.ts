// src/lib/wordUtils.ts

export function canFormWord(word: string, wheelLetters: string[]): boolean {
    // We create a copy of the available letters
    const inventory = [...wheelLetters];
    
    for (const char of word.toUpperCase()) {
      const index = inventory.indexOf(char);
      if (index === -1) {
        // Character not found in our current inventory
        return false;
      }
      // Remove the letter so it can't be used twice (unless there's another one on the wheel)
      inventory.splice(index, 1);
    }
    return true;
  }