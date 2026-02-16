'use client'
import { useState, useEffect } from 'react'

export default function WordGame() {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const letters = ['C', 'L', 'O', 'U', 'D'] 
  const radius = 120 

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
    console.log("Word Created:", selectedLetters.join(""))
  }

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-black select-none"
      onMouseUp={handleMouseUp}
    >
      <h1 className="mb-20 text-6xl font-black text-cyan-400 tracking-widest drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
        CYBER WORD
      </h1>

      <div className="relative w-80 h-80 flex items-center justify-center">
        <div className="absolute w-full h-full border-4 border-cyan-900/30 rounded-full" />
        
        {letters.map((letter, i) => {
          const angle = (i / letters.length) * 2 * Math.PI - Math.PI / 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          return (
            <div
              key={i}
              onMouseDown={() => handleMouseDown(letter)}
              onMouseEnter={() => handleMouseEnter(letter)}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className={`absolute w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-bold cursor-pointer transition-all
                ${selectedLetters.includes(letter) 
                  ? 'bg-cyan-500 border-white text-white shadow-[0_0_30px_rgba(6,182,212,1)] scale-110' 
                  : 'bg-black border-cyan-500 text-cyan-400'}`}
            >
              {letter}
            </div>
          )
        })}
      </div>

      <div className="mt-20 text-4xl font-mono text-cyan-300 tracking-[0.4em] min-h-[1.5em]">
        {selectedLetters.join("") || "TRACING..."}
      </div>
    </div>
  )
}