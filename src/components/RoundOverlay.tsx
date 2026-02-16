'use client'
import { motion } from 'framer-motion'

interface RoundOverlayProps {
  player: number
  round: number
  onStart: () => void
}

export default function RoundOverlay({ player, round, onStart }: RoundOverlayProps) {
  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8">
        <div className="space-y-2">
          <p className="text-blue-500 font-bold uppercase tracking-[0.3em] text-xs">Round {round}</p>
          <h2 className="text-6xl font-black text-white italic uppercase">Player {player}</h2>
        </div>
        <button 
          onClick={onStart} 
          className="px-16 py-6 bg-white text-black font-black uppercase text-xl rounded-2xl hover:bg-blue-500 hover:text-white transition-colors"
        >
          Start Turn
        </button>
      </motion.div>
    </div>
  )
}