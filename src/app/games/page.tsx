'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'

export default function WordGame() {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  const handleSelect = (letter: string) => {
    // Using functional updates to ensure state is always fresh
    setSelectedLetters(prev => prev.includes(letter) 
      ? prev.filter(l => l !== letter) 
      : [...prev, letter]
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
      <h1 className="mb-8 text-4xl font-bold text-cyan-400">ZEN WORD</h1>
      
      <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
        {alphabet.map((letter) => (
          <button
            key={letter}
            // onPointerDown is the "Gold Standard" for cross-device support
            onPointerDown={() => handleSelect(letter)}
            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all
              ${selectedLetters.includes(letter) 
                ? 'bg-cyan-500 border-white text-white shadow-[0_0_15px_rgba(6,182,212,0.8)]' 
                : 'bg-transparent border-cyan-900 text-cyan-900 hover:border-cyan-400'
              }`}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="mt-8 text-white text-2xl tracking-widest font-mono">
        {selectedLetters.join(" ")}
      </div>
    </div>
  )
}