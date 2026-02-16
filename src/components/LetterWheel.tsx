'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

export default function LetterWheel({ letters, onWordSubmit }: { letters: string[], onWordSubmit: (word: string) => void }) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const isDragging = useRef(false)

  // FORCE: Calculate coordinates ONLY when letters change
  const coords = useMemo(() => {
    return letters.map((_, i) => {
      const angle = (i * 360 / letters.length - 90) * (Math.PI / 180)
      return { x: Math.cos(angle) * 95 + 128, y: Math.sin(angle) * 95 + 128 }
    })
  }, [letters])

  // RESET: Wipe selection if the letters array changes
  useEffect(() => {
    setSelectedIndices([])
    isDragging.current = false
  }, [letters])

  const handleEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    const word = selectedIndices.map(i => letters[i]).join('').toUpperCase()
    if (word.length >= 3) onWordSubmit(word)
    setSelectedIndices([])
  }

  return (
    <div 
      className="relative w-64 h-64 touch-none select-none z-[60]"
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchEnd={handleEnd}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <motion.polyline
          // Keying the polyline ensures it doesn't "jump" between puzzles
          key={letters.join('')}
          points={selectedIndices.map(i => `${coords[i].x},${coords[i].y}`).join(' ')}
          fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>

      {coords.map((coord, i) => (
        <div
          // KEY IS CRITICAL: If the letter changes, the div must be destroyed
          key={`${letters[i]}-${i}`} 
          onMouseDown={(e) => { e.preventDefault(); isDragging.current = true; setSelectedIndices([i]); }}
          onMouseEnter={() => { if (isDragging.current && !selectedIndices.includes(i)) setSelectedIndices(prev => [...prev, i]); }}
          onTouchStart={(e) => { e.preventDefault(); isDragging.current = true; setSelectedIndices([i]); }}
          className={`absolute w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-black transition-all cursor-pointer ${
            selectedIndices.includes(i) ? 'bg-blue-500 border-white scale-125 z-30 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/10 border-white/20 text-white z-20'
          } backdrop-blur-xl`}
          style={{ left: coord.x - 32, top: coord.y - 32 }}
        >
          {letters[i]}
        </div>
      ))}
    </div>
  )
}