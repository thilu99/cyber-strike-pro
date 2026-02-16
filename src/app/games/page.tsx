'use client'

import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import LetterWheel from '../../components/LetterWheel'
import CircularTimer from '../../components/CircularTimer'
import WordPreview from '../../components/WordPreview'
import RoundOverlay from '../../components/RoundOverlay'
import FinalScore from '../../components/FinalScore'

const PUZZLE_BANK = [
  { letters: ['A', 'C', 'R', 'E'], words: ['ACE', 'ARC', 'ARE', 'CAR', 'ERA', 'CARE', 'RACE', 'ACRE'] },
  { letters: ['O', 'A', 'T', 'S'], words: ['ART', 'OAT', 'SAT', 'TAO', 'OATS', 'STAR', 'TARS', 'ARTS', 'SOAR'] }
]

export default function ZenWordBattle() {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE')
  const [round, setRound] = useState(1)
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [scores, setScores] = useState({ p1: 0, p2: 0 })
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [showOverlay, setShowOverlay] = useState(true)

  const currentLevel = useMemo(() => {
    const idx = (round - 1) * 2 + (currentPlayer - 1)
    return PUZZLE_BANK[idx % PUZZLE_BANK.length]
  }, [round, currentPlayer])

  const allPossibleWords = useMemo(() => currentLevel.words.map(w => w.toUpperCase()), [currentLevel])

  const handleTurnEnd = useCallback(() => {
    setGameState('IDLE')
    setFoundWords([])
    if (currentPlayer === 2) {
      if (round === 4) setGameState('FINISHED')
      else { setRound(r => r + 1); setCurrentPlayer(1); setShowOverlay(true); }
    } else {
      setCurrentPlayer(2); setShowOverlay(true);
    }
  }, [currentPlayer, round])

  const handleWordSubmit = (word: string) => {
    const submitted = word.toUpperCase()
    if (allPossibleWords.includes(submitted) && !foundWords.includes(submitted)) {
      const nextFound = [...foundWords, submitted]
      setFoundWords(nextFound)
      setScores(prev => ({ ...prev, [currentPlayer === 1 ? 'p1' : 'p2']: prev[currentPlayer === 1 ? 'p1' : 'p2'] + submitted.length }))

      // THE INSTANT TIMER FREEZE
      if (nextFound.length === allPossibleWords.length) {
        setGameState('IDLE') // This freezes the CircularTimer
        setTimeout(() => handleTurnEnd(), 1000)
      }
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-8 bg-black overflow-hidden select-none">
      <div className="w-full max-w-md flex justify-between items-center">
        <div className={`p-4 rounded-3xl border ${currentPlayer === 1 ? 'border-blue-400' : 'opacity-40'}`}>
          <p className="text-3xl font-black text-white">{scores.p1}</p>
        </div>

        <CircularTimer isActive={gameState === 'PLAYING'} duration={60} onTimeUp={handleTurnEnd} />

        <div className={`p-4 rounded-3xl border text-right ${currentPlayer === 2 ? 'border-purple-400' : 'opacity-40'}`}>
          <p className="text-3xl font-black text-white">{scores.p2}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <WordPreview words={foundWords} targetWords={allPossibleWords} />
        <LetterWheel letters={currentLevel.letters} onWordSubmit={handleWordSubmit} />
      </div>

      <AnimatePresence>
        {showOverlay && <RoundOverlay player={currentPlayer} round={round} onStart={() => { setShowOverlay(false); setGameState('PLAYING'); }} />}
        {gameState === 'FINISHED' && <FinalScore scores={scores} />}
      </AnimatePresence>
    </main>
  )
}