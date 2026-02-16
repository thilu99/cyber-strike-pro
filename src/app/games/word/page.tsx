'use client'
export const dynamic = 'force-dynamic';
import { useState, useRef } from 'react';

export default function WordGame() {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const letters = ['C', 'L', 'O', 'U', 'D']; // Example letters
  const radius = 120; // Size of the wheel

  const handlePointerDown = (letter: string) => {
    setIsDragging(true);
    setSelectedLetters([letter]);
  };

  const handlePointerEnter = (letter: string) => {
    if (isDragging && !selectedLetters.includes(letter)) {
      setSelectedLetters((prev) => [...prev, letter]);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    // Logic to check if word is valid goes here
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-transparent select-none"
      onPointerUp={handlePointerUp}
    >
      <h1 className="mb-16 text-5xl font-black text-cyan-400 tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
        CYBER WORD
      </h1>

      {/* The Letter Wheel */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        <div className="absolute w-full h-full border-4 border-cyan-900/20 rounded-full" />
        {letters.map((letter, i) => {
          const angle = (i / letters.length) * 2 * Math.PI;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={i}
              onPointerDown={() => handlePointerDown(letter)}
              onPointerEnter={() => handlePointerEnter(letter)}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className={`absolute w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-bold transition-all
                ${selectedLetters.includes(letter) 
                  ? 'bg-cyan-500 border-white text-white shadow-[0_0_30px_rgba(6,182,212,1)] scale-110' 
                  : 'bg-black border-cyan-500 text-cyan-400 hover:border-white'}`}
            >
              {letter}
            </div>
          );
        })}
      </div>

      <div className="mt-20 text-4xl font-mono text-cyan-300 tracking-[0.5em] uppercase">
        {selectedLetters.join("")}
      </div>
    </div>
  );
}