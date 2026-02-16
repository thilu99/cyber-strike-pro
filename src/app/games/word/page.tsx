'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef, useEffect } from 'react'

export default function WordGame() {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  // We use a Ref to prevent duplicate letters while dragging
  const currentWord = useRef<string[]>([])

  const startDragging = (letter: string) => {
    setIsDragging(true)
    currentWord.current = [letter]
    setSelectedLetters([letter])
  }

  const handlePointerEnter = (letter: string) => {
    if (isDragging && !currentWord.current.includes(letter)) {
      currentWord.current = [...currentWord.current, letter]
      setSelectedLetters([...currentWord.current])
    }
  }

  const stopDragging = () => {
    setIsDragging(false)
    // Here is where you'd eventually validate the word against a dictionary
    console.log("Word submitted:", currentWord.current.join(""))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black select-none"
         onPointerUp={stopDragging} 
         onPointerLeave={stopDragging}>
      
      <h1 className="mb-8 text-4xl font-bold text-cyan-400 tracking-tighter">CYBER WORD</h1>
      
      <div className="flex flex-wrap justify-center gap-3 max-w-md">
        {alphabet.map((letter) => (
          <div
            key={letter}
            onPointerDown={() => startDragging(letter)}
            onPointerEnter={() => handlePointerEnter(letter)}
            // Important for mobile: pointerOver allows detection while finger is down
            onPointerOver={() => handlePointerEnter(letter)}
            className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-black cursor-pointer transition-all duration-75 touch-none
              ${selectedLetters.includes(letter) 
                ? 'bg-cyan-500 border-white text-white scale-110 shadow-[0_0_20px_rgba(6,182,212,0.9)]' 
                : 'bg-gray-900 border-cyan-900 text-cyan-700'
              }`}
          >
            {letter}
          </div>
        ))}
      </div>

      <div className="mt-12 h-16 text-cyan-300 text-4xl font-mono tracking-[0.2em] border-b-2 border-cyan-900 px-6">
        {selectedLetters.join("")}
      </div>
    </div>
  )
}