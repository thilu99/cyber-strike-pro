'use client'
export const dynamic = 'force-dynamic';
import Link from 'next/link'
import { motion } from 'framer-motion'
import BioluminescentSea from '@/components/BioluminescentSea'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Reuse your cool sea background */}
      <BioluminescentSea />

      <div className="z-10 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            Game Central
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">
            Multiplayer Arcade V1.0
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Link to the Word Game */}
          <Link href="/games/word">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-cyan-500/10 transition-all cursor-pointer group"
            >
              <h2 className="text-2xl font-black uppercase italic group-hover:text-cyan-400">Zen Word Battle</h2>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">Multiplayer Puzzles</p>
            </motion.div>
          </Link>

          {/* Link to the Bowling Game */}
          <Link href="/games/bowling">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-purple-500/10 transition-all cursor-pointer group"
            >
              <h2 className="text-2xl font-black uppercase italic group-hover:text-purple-400">Cyber Bowling</h2>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">3D Physics Simulation</p>
            </motion.div>
          </Link>
        </div>
      </div>
    </main>
  )
}