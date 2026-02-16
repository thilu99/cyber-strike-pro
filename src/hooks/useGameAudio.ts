'use client'

import { useCallback, useState } from 'react'

export const useGameAudio = () => {
  const [isMuted, setIsMuted] = useState(false)
  const toggleMute = () => setIsMuted(prev => !prev)

  const playSound = useCallback((type: 'correct' | 'wrong' | 'click' | 'win' | 'hint' | 'roll' | 'strike') => {
    if (isMuted) return 

    const audioPath = {
      correct: '/sounds/correct.mp3',
      wrong: '/sounds/wrong.mp3',
      click: '/sounds/click.mp3',
      win: '/sounds/win2.mp3', // Updated to win2
      hint: '/sounds/hint.mp3',
      roll: '/sounds/roll.mp3',
      strike: '/sounds/strike.mp3' 
    }[type]

    const sound = new Audio(audioPath)
    sound.volume = type === 'roll' ? 0.2 : 0.5
    sound.play().catch(() => {})
  }, [isMuted])

  return { playSound, isMuted, toggleMute }
}