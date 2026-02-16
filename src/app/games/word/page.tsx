'use client'
export const dynamic = "force-dynamic";

import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'

// 1. CUSTOM HOOKS & LIBS
import { useGameAudio } from '@/hooks/useGameAudio'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import { VALID_WORDS } from '@/lib/dictionary'
import { canFormWord } from '@/lib/wordUtils'

// 2. COMPONENTS
import BioluminescentSea from '../../../components/BioluminescentSea'
import ProfileSettings from '../../../components/ProfileSettings'
import Leaderboard from '../../../components/Leaderboard'
import LetterWheel from '../../../components/LetterWheel'
import CircularTimer from '../../../components/CircularTimer'
import RoundOverlay from '../../../components/RoundOverlay'
import FinalScore from '../../../components/FinalScore'

// 3. PUZZLES
const PUZZLE_BANK = [
  { letters: ['A', 'C', 'R', 'E'] }, { letters: ['O', 'A', 'R', 'T', 'S'] }, 
  { letters: ['P', 'L', 'A', 'T', 'E'] }, { letters: ['S', 'T', 'A', 'R', 'E'] },
  { letters: ['B', 'R', 'E', 'A', 'D'] }, { letters: ['S', 'M', 'I', 'L', 'E'] }
]

export default function ZenWordBattle() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  
  // Hooks
  const { playSound, isMuted, toggleMute } = useGameAudio()
  const { stats, refreshStats } = usePlayerStats()
  
  // Game States
  const [turnIndex, setTurnIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [phase, setPhase] = useState<'OVERLAY' | 'PLAYING' | 'FINISHED'>('OVERLAY')
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [scores, setScores] = useState({ p1: 0, p2: 0 })
  const [isWrong, setIsWrong] = useState(false)
  const [combo, setCombo] = useState(1)
  const [hintLetter, setHintLetter] = useState<string | null>(null)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])

  const puzzle = PUZZLE_BANK[turnIndex % PUZZLE_BANK.length]
  const [displayLetters, setDisplayLetters] = useState<string[]>([])
  const activePlayer = (turnIndex % 2) + 1
  const roundNum = Math.floor(turnIndex / 2) + 1

  useEffect(() => {
    const fetchProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('player_progress').select('current_level').eq('id', user.id).single()
        if (data) setTurnIndex(data.current_level)
      }
      setIsLoading(false)
    }
    fetchProgress()
  }, [supabase])

  useEffect(() => { 
    if (puzzle) {
        setDisplayLetters([...puzzle.letters])
        setHintLetter(null)
    }
  }, [puzzle])

  const handleShuffle = () => setDisplayLetters(prev => [...prev].sort(() => Math.random() - 0.5))

  const handleHint = useCallback(() => {
    const currentPlayer = activePlayer === 1 ? 'p1' : 'p2'
    if (scores[currentPlayer] < 50) return

    const remainingWords = Array.from(VALID_WORDS).filter(
      word => canFormWord(word, puzzle.letters) && !foundWords.includes(word) && word.length > 2
    )

    if (remainingWords.length > 0) {
      playSound('hint')
      setHintLetter(remainingWords[0][0])
      setScores(prev => ({ ...prev, [currentPlayer]: Math.max(0, prev[currentPlayer] - 50) }))
      setTimeout(() => setHintLetter(null), 3000)
    }
  }, [puzzle, foundWords, scores, activePlayer, playSound])

  const handleTurnEnd = useCallback(async () => {
    const nextLevel = turnIndex + 1
    if (nextLevel >= 4) {
        setPhase('FINISHED')
        playSound('win')
    } else { 
        setTurnIndex(nextLevel); 
        setPhase('OVERLAY') 
    }
    setFoundWords([]); setCombo(1)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('player_progress').select('total_score, experience_points').eq('id', user.id).single()
      const newTotal = (data?.total_score || 0) + (scores.p1 + scores.p2)
      // Bonus experience for finishing a round
      const newExp = (data?.experience_points || 0) + 25 
      
      await supabase.from('player_progress').update({ 
        current_level: nextLevel, 
        total_score: newTotal,
        experience_points: newExp 
      }).eq('id', user.id)
      refreshStats()
    }
  }, [turnIndex, scores, supabase, playSound, refreshStats])

  const handleWordSubmit = useCallback(async (word: string) => {
    if (phase !== 'PLAYING') return
    const sub = word.trim().toUpperCase()
    const isValid = sub.length > 2 && !foundWords.includes(sub) && VALID_WORDS.has(sub) && canFormWord(sub, puzzle.letters)

    if (isValid) {
      playSound('correct')
      setFoundWords(prev => [...prev, sub])
      setScores(prev => ({ ...prev, [activePlayer === 1 ? 'p1' : 'p2']: prev[activePlayer === 1 ? 'p1' : 'p2'] + (sub.length * 10 * combo) }))
      setCombo(prev => prev + 1)
      setHintLetter(null)

      // Persistence: Update lifetime stats
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('player_progress').select('total_words_found, experience_points').eq('id', user.id).single()
        await supabase.from('player_progress').update({ 
            total_words_found: (data?.total_words_found || 0) + 1,
            experience_points: (data?.experience_points || 0) + (sub.length * 2) // XP based on word length
        }).eq('id', user.id)
        refreshStats()
      }
    } else {
      playSound('wrong')
      setIsWrong(true)
      setCombo(1) 
      setTimeout(() => setIsWrong(false), 500)
    }
  }, [phase, foundWords, puzzle, activePlayer, combo, playSound, supabase, refreshStats])

  if (isLoading) return <div className="min-h-screen bg-[#001219] flex items-center justify-center"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className={`min-h-screen text-white p-8 flex flex-col items-center justify-between select-none relative overflow-hidden transition-all duration-500 ${isWrong ? 'bg-red-900/30' : 'bg-transparent'}`}>
      
      <BioluminescentSea />

      {/* 1. TOP CONTROLS */}
      <div className="absolute top-8 right-8 flex gap-3 z-50">
        <button onClick={toggleMute} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          )}
        </button>
        <button onClick={() => setShowSettings(true)} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>

      {/* 2. RANK & PROGRESS BAR */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-48 text-center z-20">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
          {stats.rank}
        </p>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(stats.experience % 500) / 5}%` }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_#06b6d4]"
          />
        </div>
      </div>

      {/* 3. HUD */}
      <div className="w-full max-w-md flex justify-between items-center z-20">
        <div className={`p-4 border rounded-xl transition-all ${activePlayer === 1 ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'opacity-20 border-white/5'}`}>
          <p className="text-[10px] font-bold uppercase opacity-50">Player 1</p>
          <p className="text-4xl font-black">{scores.p1}</p>
        </div>
        <div className="text-center">
          <p className="text-cyan-400/50 text-[10px] font-black uppercase tracking-widest">Round</p>
          <p className="text-2xl font-black text-cyan-50">{roundNum} / 4</p>
        </div>
        <div className={`p-4 border text-right rounded-xl transition-all ${activePlayer === 2 ? 'border-purple-400 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'opacity-20 border-white/5'}`}>
          <p className="text-[10px] font-bold uppercase opacity-50">Player 2</p>
          <p className="text-4xl font-black">{scores.p2}</p>
        </div>
      </div>

      {/* 4. GAMEPLAY AREA */}
      <motion.div animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}} className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <AnimatePresence mode="wait">
          {phase === 'PLAYING' && (
            <motion.div key={turnIndex} className="flex flex-col items-center space-y-12 w-full">
              <CircularTimer key={turnIndex} isActive={true} duration={30} onTimeUp={handleTurnEnd} />
              
              <div className="text-center min-h-[140px] w-full flex flex-col items-center justify-center">
                <AnimatePresence>
                    {hintLetter && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 text-cyan-400 font-black text-xl tracking-tighter uppercase italic">
                            Starts with: {hintLetter}
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex flex-wrap justify-center gap-2">
                  {foundWords.map((w) => (
                    <motion.span key={w} initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase">{w}</motion.span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <LetterWheel letters={displayLetters} onWordSubmit={handleWordSubmit} />
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-4">
                    <button onClick={handleShuffle} className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg></button>
                    
                    <button 
                        onClick={handleHint}
                        disabled={scores[activePlayer === 1 ? 'p1' : 'p2'] < 50}
                        className="px-6 py-2 rounded-full bg-cyan-600/20 border border-cyan-500/50 text-[10px] font-black uppercase italic tracking-widest hover:bg-cyan-500/30 transition-all disabled:opacity-20 disabled:grayscale"
                    >
                        Hint (50 pts)
                    </button>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'FINISHED' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 w-full max-w-md z-20">
              <FinalScore scores={scores} />
              <Leaderboard />
              <button onClick={() => window.location.reload()} className="px-8 py-3 bg-cyan-600 rounded-full font-black uppercase italic hover:bg-cyan-500 shadow-[0_0_30px_rgba(8,145,178,0.4)]">Play Again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === 'OVERLAY' && <RoundOverlay key={turnIndex} player={activePlayer} round={roundNum} onStart={() => setPhase('PLAYING')} />}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && <ProfileSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      {/* COMBO & XP PARTICLES */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
        <AnimatePresence>
          {combo > 1 && (
            <motion.div key={combo} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="text-yellow-400 font-black text-5xl italic drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">
              {combo}X
            </motion.div>
          )}
        </AnimatePresence>
        {particles.map(p => (
          <motion.div key={p.id} initial={{ x: 0, y: 0, scale: 1, opacity: 1 }} animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }} className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
        ))}
      </div>
    </main>
  )
}