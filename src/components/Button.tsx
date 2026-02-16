'use client'
import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

export default function Button({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <button className="px-6 py-3 rounded-2xl bg-white/10 text-white border border-white/20">{children}</button>

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      type="button"
      className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium hover:bg-white/20 transition-colors"
    >
      {children}
    </motion.button>
  )
}