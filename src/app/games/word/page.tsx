'use client'
export const dynamic = 'force-dynamic';
import { useState } from 'react';

export default function WordGame() {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const handleSelect = (letter: string) => {
    setSelectedLetters(prev => prev.includes(letter) 
      ? prev.filter(l => l !== letter) 
      : [...prev, letter]
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent select-none touch-none">
      <h1 className="mb-12 text-5xl font-black text-cyan-400 tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
        CYBER WORD
      </h1>
      
      {/* Restoring your 6-column grid and neon borders */}
      <div className="grid grid-cols-6 gap-4 max-w-2xl p-8 rounded-3xl border border-cyan-900/30 bg-black/40 backdrop-blur-sm">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onPointerDown={() => handleSelect(letter)}
            className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-150
              ${selectedLetters.includes(letter) 
                ? 'bg-cyan-500 border-cyan-300 text-white shadow-[0_0_25px_rgba(6,182,212,1)] scale-110' 
                : 'bg-gray-900/50 border-cyan-900/50 text-cyan-700 hover:border-cyan-400 hover:text-cyan-300'
              }`}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="mt-12 text-cyan-200 text-3xl font-mono tracking-widest min-h-[3rem] border-b-2 border-cyan-900/50 px-8">
        {selectedLetters.join("")}
      </div>
    </div>
  );
}