'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export default function BioluminescentSea() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let animationFrameId: number
    let ripples: any[] = []
    let particles: any[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const count = Math.floor((canvas.width * canvas.height) / 12000)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2 - 0.1, // Drifts upward
          alpha: Math.random() * 0.5 + 0.1,
          color: Math.random() > 0.8 ? '#4dfcff' : '#00e5ff'
        })
      }
    }

    const createRipple = (x: number, y: number) => {
      ripples.push({ x, y, r: 0, opacity: 0.5, velocity: 3.5 })
    }

    const render = () => {
      // Clear Ocean Gradient
      const grad = ctx.createRadialGradient(canvas.width/2, 0, 0, canvas.width/2, 0, canvas.height)
      grad.addColorStop(0, '#005f73'); grad.addColorStop(0.4, '#021a26'); grad.addColorStop(1, '#001219')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.y < 0) p.y = canvas.height
        ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
      })

      // Click Ripples
      ctx.lineWidth = 1.5
      ripples.forEach((ripple, i) => {
        ripple.r += ripple.velocity; ripple.opacity -= 0.007
        ctx.beginPath(); ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(77, 252, 255, ${ripple.opacity})`; ctx.stroke()
        if (ripple.opacity <= 0) ripples.splice(i, 1)
      })

      animationFrameId = requestAnimationFrame(render)
    }

    const handleMouseMove = (e: MouseEvent) => {
      // No more cursor ripples created here
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 15)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 15)
    }

    const handleClick = (e: MouseEvent) => {
      for(let i=0; i<3; i++) setTimeout(() => createRipple(e.clientX, e.clientY), i * 180)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleClick)
    resize(); render()

    return () => {
      window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleClick); cancelAnimationFrame(animationFrameId)
    }
  }, [mouseX, mouseY])

  return (
    <div className="fixed inset-0 z-0 bg-[#001219] pointer-events-none overflow-hidden">
      <motion.div style={{ x: springX, y: springY }} className="absolute inset-0 opacity-10 mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/water.png')] scale-[2]" />
      </motion.div>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
    </div>
  )
}