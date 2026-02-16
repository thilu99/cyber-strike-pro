'use client'
import { useState, useRef, useEffect } from 'react'

// RESTORED PUZZLE BANK
const PUZZLE_BANK = [
  { letters: ['D', 'O', 'P', 'E'], word: 'DOPE' },
  { letters: ['C', 'L', 'O', 'U', 'D'], word: 'CLOUD' },
  { letters: ['L', 'I', 'N', 'U', 'X'], word: 'LINUX' },
  { letters: ['S', 'E', 'C', 'U', 'R', 'E'], word: 'SECURE' }
]

export default function WordGame() {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(0)
  
  const currentPuzzle = PUZZLE_BANK[currentLevel]
  const radius = 130 

  const handleMouseDown = (letter: string) => {
    setIsDragging(true)
    setSelectedLetters([letter])
  }

  const handleMouseEnter = (letter: string) => {
    if (isDragging && !selectedLetters.includes(letter)) {
      setSelectedLetters(prev => [...prev, letter])
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (selectedLetters.join('') === currentPuzzle.word) {
      alert("Word Found! Next Level...")
      setCurrentLevel((prev) => (prev + 1) % PUZZLE_BANK.length)
    }
    setSelectedLetters([])
  }

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-transparent select-none"
      onMouseUp={handleMouseUp}
    >
      <h1 className="mb-20 text-6xl font-black text-cyan-400 tracking-tighter drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
        CYBER WORD
      </h1>

      <div className="relative w-80 h-80 flex items-center justify-center">
        <div className="absolute w-full h-full border-4 border-cyan-900/30 rounded-full shadow-[inset_0_0_60px_rgba(6,182,212,0.15)]" />
        
        {currentPuzzle.letters.map((letter, i) => {
          const angle = (i / currentPuzzle.letters.length) * 2 * Math.PI - Math.PI / 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          return (
            <div
              key={i}
              onMouseDown={() => handleMouseDown(letter)}
              onMouseEnter={() => handleMouseEnter(letter)}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className={`absolute w-16 h-16 rounded-full border-2 flex items-center justify-center text-3xl font-black cursor-pointer transition-all duration-75
                ${selectedLetters.includes(letter) 
                  ? 'bg-cyan-500 border-white text-white shadow-[0_0_40px_rgba(6,182,212,1)] scale-125' 
                  : 'bg-black border-cyan-500 text-cyan-400 hover:border-cyan-300'}`}
            >
              {letter}
            </div>
          )
        })}
      </div>

      <div className="mt-24 h-12 text-5xl font-mono text-cyan-300 tracking-[0.4em] uppercase font-bold drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
        {selectedLetters.join("")}
      </div>
    </div>
  )
}