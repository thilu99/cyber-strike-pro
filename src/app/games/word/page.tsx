'use client'
export const dynamic = 'force-dynamic';
import { useState, useRef } from 'react';

export default function WordGame() {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // These are the letters for your level
  const letters = ['D', 'E', 'V', 'O', 'P', 'S']; 
  const radius = 130; 

  const handlePointerDown = (letter: string) => {
    setIsDragging(true);
    setSelectedLetters([letter]);
  };

  const handlePointerEnter = (letter: string) => {
    if (isDragging && !selectedLetters.includes(letter)) {
      setSelectedLetters((prev) => [...prev, letter]);
    }
  };

  const handleStop = () => setIsDragging(false);

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-transparent select-none touch-none"
      onPointerUp={handleStop}
    >
      <h1 className="mb-20 text-6xl font-black text-cyan-400 tracking-tighter drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">
        CYBER WORD
      </h1>

      {/* The Letter Wheel UI */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        <div className="absolute w-full h-full border-[6px] border-cyan-900/30 rounded-full shadow-[inset_0_0_50px_rgba(6,182,212,0.1)]" />
        
        {letters.map((letter, i) => {
          const angle = (i / letters.length) * 2 * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={i}
              onPointerDown={() => handlePointerDown(letter)}
              onPointerEnter={() => handlePointerEnter(letter)}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className={`absolute w-16 h-16 rounded-full border-2 flex items-center justify-center text-3xl font-black transition-all duration-75 cursor-pointer
                ${selectedLetters.includes(letter) 
                  ? 'bg-cyan-500 border-white text-white shadow-[0_0_40px_rgba(6,182,212,1)] scale-125' 
                  : 'bg-black border-cyan-500 text-cyan-500 hover:border-cyan-300'}`}
            >
              {letter}
            </div>
          );
        })}
      </div>

      <div className="mt-24 h-12 text-5xl font-mono text-cyan-300 tracking-[0.4em] uppercase font-bold">
        {selectedLetters.join("")}
      </div>
    </div>
  );
}