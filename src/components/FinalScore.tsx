'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function FinalScore({ scores }: { scores: { p1: number, p2: number } }) {
  const [winner, setWinner] = useState<'Player 1' | 'Player 2' | 'Draw' | null>(null)

  useEffect(() => {
    if (scores.p1 > scores.p2) setWinner('Player 1')
    else if (scores.p2 > scores.p1) setWinner('Player 2')
    else setWinner('Draw')
  }, [scores])

  return (
    <div className="text-center z-10">
      {/* Winner Announcement */}
      {winner && winner !== 'Draw' && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]">
            {winner} Wins!
          </h1>
        </motion.div>
      )}
      
      {winner === 'Draw' && (
        <motion.h1 animate={{ scale: 1.1 }} className="text-5xl font-black italic uppercase mb-8 text-blue-300">
          It's a Draw!
        </motion.h1>
      )}

      <p className="text-xl font-bold uppercase opacity-50 mb-8 tracking-widest">Final Score</p>
      
      {/* The Rest of Your Existing Score Display */}
      {/* ... keep your existing score cards here ... */}
    </div>
  )
}