'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

export default function LetterWheel({ letters, onWordSubmit }: { letters: string[], onWordSubmit: (word: string) => void }) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const isDragging = useRef(false)

  const coords = useMemo(() => {
    return letters.map((_, i) => {
      const angle = (i * 360 / letters.length - 90) * (Math.PI / 180)
      return { x: Math.cos(angle) * 95 + 128, y: Math.sin(angle) * 95 + 128 }
    })
  }, [letters])

  useEffect(() => {
    setSelectedIndices([])
    isDragging.current = false
  }, [letters])

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return
    
    const element = document.elementFromPoint(clientX, clientY)
    if (!element) return

    // FIX: Check current element OR its parent for the index (in case we hit the letter text)
    const indexAttr = element.getAttribute('data-index') || element.parentElement?.getAttribute('data-index')
    
    // TypeScript Fix: Ensure indexAttr is a string before calling parseInt
    if (typeof indexAttr === 'string') {
      const i = parseInt(indexAttr, 10)
      setSelectedIndices(prev => {
        if (!prev.includes(i)) return [...prev, i]
        return prev
      })
    }
  }

  const handleEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    const word = selectedIndices.map(i => letters[i]).join('').toUpperCase()
    if (word.length >= 3) onWordSubmit(word)
    setSelectedIndices([])
  }

  return (
    <div 
      className="relative w-64 h-64 select-none z-[60]"
      style={{ touchAction: 'none' }} 
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        // Prevents any browser-level dragging/scrolling while playing
        if (e.cancelable) e.preventDefault() 
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }}
      onTouchEnd={handleEnd}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <motion.polyline
          key={letters.join('')}
          points={selectedIndices.map(i => `${coords[i].x},${coords[i].y}`).join(' ')}
          fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>

      {coords.map((coord, i) => (
        <div
          key={`${letters[i]}-${i}`} 
          data-index={i} 
          onMouseDown={(e) => { e.preventDefault(); isDragging.current = true; setSelectedIndices([i]); }}
          onTouchStart={(e) => { 
            isDragging.current = true; 
            setSelectedIndices([i]); 
          }}
          className={`absolute w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-black transition-all cursor-pointer ${
            selectedIndices.includes(i) ? 'bg-blue-500 border-white scale-125 z-30 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/10 border-white/20 text-white z-20'
          } backdrop-blur-xl`}
          style={{ left: coord.x - 32, top: coord.y - 32 }}
        >
          {/* pointer-events-none ensures the touch always registers on the div with the index */}
          <span className="pointer-events-none">{letters[i]}</span>
        </div>
      ))}
    </div>
  )
}