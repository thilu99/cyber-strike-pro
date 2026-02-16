'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function CircularTimer({ isActive, duration, onTimeUp }: { isActive: boolean, duration: number, onTimeUp: () => void }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive) setTimeLeft(duration)
  }, [isActive, duration])

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive])

  // THE SAFE EXIT: Use a separate effect to trigger the parent state change
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      onTimeUp()
    }
  }, [timeLeft, isActive, onTimeUp])

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg height="80" width="80" className="transform -rotate-90">
        <circle stroke="white" strokeOpacity="0.1" fill="transparent" strokeWidth="4" r="36" cx="40" cy="40" />
        <motion.circle
          stroke={timeLeft <= 10 ? "#ef4444" : "#3b82f6"}
          fill="transparent" strokeWidth="4" strokeDasharray={226}
          animate={{ strokeDashoffset: 226 - (timeLeft / duration) * 226 }}
          transition={{ duration: 1, ease: "linear" }}
          r="36" cx="40" cy="40"
        />
      </svg>
      <span className="absolute text-xl font-black">{timeLeft}</span>
    </div>
  )
}