'use client'

import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics, useSphere, useBox, useCylinder } from '@react-three/cannon'
import { OrbitControls, PerspectiveCamera, Environment, Stars } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameAudio } from '@/hooks/useGameAudio'

// --- CONSTANTS ---
const BALL_TYPES = [
  { name: 'Classic Blue', color: '#2563eb', emissive: '#1d4ed8' },
  { name: 'Neon Strike', color: '#22d3ee', emissive: '#0891b2' },
  { name: 'Magma', color: '#ef4444', emissive: '#b91c1c' },
  { name: 'Void', color: '#1e293b', emissive: '#475569' }
]

const PIN_POSITIONS: [number, number, number][] = [
  [0, 1, -15], [-0.6, 1, -16.5], [0.6, 1, -16.5], [-1.2, 1, -18], [0, 1, -18], 
  [1.2, 1, -18], [-1.8, 1, -19.5], [-0.6, 1, -19.5], [0.6, 1, -19.5], [1.8, 1, -19.5]
]

// --- 3D COMPONENTS ---

function Floor() {
  const [ref] = useBox(() => ({ 
    args: [12, 5, 65], position: [0, -2.5, 0], type: 'Static',
    material: { friction: 0.1, restitution: 0.1 } 
  }))
  return (
    <mesh ref={ref as any} receiveShadow>
      <boxGeometry args={[12, 5, 65]} />
      <meshStandardMaterial color="#fbbf24" roughness={0.15} />
    </mesh>
  )
}

function Pin({ position, onFall }: { position: [number, number, number], onFall: () => void }) {
  const [ref, api] = useCylinder(() => ({
    mass: 0.85, position: [position[0], 1.2, position[2]],
    args: [0.35, 0.4, 1.8, 16], material: { friction: 0.2, restitution: 0.4 },
    linearDamping: 0.5, angularDamping: 0.5
  }))
  const fallen = useRef(false)
  useEffect(() => {
    return api.rotation.subscribe(([x, y, z]) => {
      if ((Math.abs(x) > 0.75 || Math.abs(z) > 0.75) && !fallen.current) {
        fallen.current = true; onFall();
      }
    })
  }, [api, onFall])
  return (
    <group ref={ref as any}>
      <mesh castShadow><cylinderGeometry args={[0.12, 0.4, 1.8, 20]} /><meshStandardMaterial color="white" /></mesh>
      <mesh position={[0, 0.85, 0]} castShadow><sphereGeometry args={[0.22, 20, 20]} /><meshStandardMaterial color="white" /></mesh>
      <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.14, 0.14, 0.15, 20]} /><meshStandardMaterial color="#ef4444" /></mesh>
    </group>
  )
}

function Ball({ power, isCharging, onLaunch, type, resetKey }: { power: number; isCharging: boolean; onLaunch: () => void, type: any, resetKey: number }) {
  const [ref, api] = useSphere(() => ({ 
    mass: 12, position: [0, 1.5, 18], args: [0.6], material: { friction: 0.1, restitution: 0.2 },
    allowSleep: false
  }))
  
  const hasThrown = useRef(false)
  const mouseX = useRef(0)

  useEffect(() => {
    // Changed to pointermove for cross-device support
    const handleMove = (e: PointerEvent) => { 
        mouseX.current = (e.clientX / window.innerWidth) * 2 - 1 
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  useEffect(() => {
    hasThrown.current = false
    api.velocity.set(0, 0, 0); api.angularVelocity.set(0, 0, 0); api.position.set(0, 1.5, 18); api.wakeUp()
  }, [resetKey, api])

  useFrame(() => {
    if (hasThrown.current) {
      api.applyForce([mouseX.current * 35, 0, 0], [0, 0, 0])
    }
  })

  useEffect(() => {
    if (!isCharging && power > 0 && !hasThrown.current) {
      hasThrown.current = true; api.wakeUp();
      api.applyImpulse([0, 0, -320 - (power * 4)], [0, 0, 0]);
      onLaunch();
    }
  }, [isCharging, power, api, onLaunch])

  return (
    <mesh ref={ref as any} castShadow>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial color={type.color} emissive={power > 80 ? "#ffffff" : type.emissive} emissiveIntensity={isCharging ? power / 12 : 0.4} />
    </mesh>
  )
}

// --- MAIN GAME SCENE ---

export default function BowlingScene() {
  const { playSound, isMuted, toggleMute } = useGameAudio()
  const [ballType, setBallType] = useState(BALL_TYPES[0])
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [currentFrame, setCurrentFrame] = useState(1)
  const [currentThrow, setCurrentThrow] = useState(1)
  const [p1Scores, setP1Scores] = useState<any[]>(Array(5).fill([null, null]))
  const [p2Scores, setP2Scores] = useState<any[]>(Array(5).fill([null, null]))
  const [power, setPower] = useState(0)
  const [isCharging, setIsCharging] = useState(false)
  const [resetCount, setResetCount] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const fallenThisThrow = useRef<number[]>([])
  const [standingPins, setStandingPins] = useState<number[]>(Array.from({ length: 10 }, (_, i) => i))

  const calcTotal = (scores: any[]) => scores.flat().reduce((a, b) => a + (typeof b === 'number' ? b : (b === 'X' || b === '/' ? 10 : 0)), 0)
  const countAchieve = (scores: any[], char: string) => scores.flat().filter(s => s === char).length

  const advanceTurn = useCallback(() => {
    const fallenCount = fallenThisThrow.current.length
    const isStrike = currentThrow === 1 && fallenCount === 10
    const isSpare = currentThrow === 2 && (10 - standingPins.length + fallenCount) >= 10
    
    const update = (prev: any[]) => {
      const next = [...prev]; const frameData = [...next[currentFrame - 1]]
      frameData[currentThrow - 1] = isStrike ? 'X' : (isSpare ? '/' : fallenCount)
      next[currentFrame - 1] = frameData; return next
    }

    if (currentPlayer === 1) setP1Scores(update)
    else setP2Scores(update)

    if (isStrike || currentThrow === 2) {
      setTimeout(() => setShowSummary(true), 1200)
      if (currentPlayer === 2 && currentFrame === 5) {
        setTimeout(() => { setShowSummary(false); setIsGameOver(true); playSound('win'); }, 4000)
      } else {
        setTimeout(() => {
          setShowSummary(false)
          if (currentPlayer === 2) setCurrentFrame(f => f + 1)
          setCurrentPlayer(p => p === 1 ? 2 : 1)
          setCurrentThrow(1); setStandingPins(Array.from({ length: 10 }, (_, i) => i))
          setStatusMsg(isStrike ? 'STRIKE!' : isSpare ? 'SPARE!' : 'NEXT TURN')
        }, 3500)
      }
    } else {
      const stillStanding = standingPins.filter(id => !fallenThisThrow.current.includes(id))
      setStandingPins(stillStanding); setCurrentThrow(2); setStatusMsg('THROW 2')
    }

    setTimeout(() => {
      fallenThisThrow.current = []; setPower(0); setIsCharging(false); 
      setResetCount(c => c + 1); setStatusMsg('')
    }, 3000)
  }, [currentThrow, currentFrame, currentPlayer, standingPins, playSound, p1Scores, p2Scores])

  useEffect(() => {
    let interval: any
    if (isCharging) {
      interval = setInterval(() => { setPower(p => (p < 100 ? p + 8 : p)); playSound('click'); }, 75)
    }
    return () => clearInterval(interval)
  }, [isCharging, playSound])

  return (
    <div className="w-full h-screen bg-black relative select-none overflow-hidden" 
         style={{ touchAction: 'none' }} // Stops mobile scroll from breaking the game
         onPointerDown={() => { if(!isGameOver && !showSummary) setIsCharging(true); }} 
         onPointerUp={() => setIsCharging(false)}>
      
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 9, 38]} fov={35} />
        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.2} />
        <Stars radius={100} depth={50} count={3000} factor={4} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        <Environment preset="night" />

        <Suspense fallback={null}>
          <Physics gravity={[0, -22, 0]} key={resetCount}> 
            <Floor />
            <Ball key={`ball-${resetCount}`} resetKey={resetCount} type={ballType} power={power} isCharging={isCharging} onLaunch={() => { playSound('roll'); setTimeout(advanceTurn, 4500); }} />
            {isCharging && (
               <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                 <planeGeometry args={[0.2, 40]} />
                 <meshStandardMaterial color="#22d3ee" transparent opacity={0.4} emissive="#22d3ee" emissiveIntensity={2} />
               </mesh>
            )}
            {standingPins.map((idx) => (
              <Pin key={`${resetCount}-${idx}`} position={PIN_POSITIONS[idx]} onFall={() => { 
                if (!fallenThisThrow.current.includes(idx)) { fallenThisThrow.current.push(idx); playSound('strike'); }
              }} />
            ))}
          </Physics>
        </Suspense>
      </Canvas>

      {/* FIXED KEYS HUD OVERLAY */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
        <div className="w-full flex justify-between items-start max-w-5xl">
            <ScoreRow label="P1" active={currentPlayer === 1} frames={p1Scores} color="cyan" />
            <button onClick={() => window.location.reload()} className="pointer-events-auto px-5 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/50 hover:bg-white/10 hover:text-white uppercase tracking-widest transition-all shadow-xl">Reset Game</button>
            <ScoreRow label="P2" active={currentPlayer === 2} frames={p2Scores} color="purple" />
        </div>

        <AnimatePresence>
            {statusMsg && (
                <motion.div 
                    key="status-msg-overlay"
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0 }} 
                    className="bg-white/10 backdrop-blur-md px-12 py-4 rounded-3xl border border-white/20"
                >
                    <p className="text-5xl font-black italic text-yellow-400 uppercase drop-shadow-[0_0_15px_#facc24]">{statusMsg}</p>
                </motion.div>
            )}
            {showSummary && !isGameOver && (
                <motion.div 
                    key="frame-summary-overlay"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    className="bg-slate-900/95 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-4"
                >
                    <div className="flex gap-12 items-center">
                        <div className="text-center"><p className="text-cyan-400 text-[10px] font-bold uppercase">P1</p><p className="text-4xl font-black text-white">{calcTotal(p1Scores)}</p></div>
                        <div className="h-10 w-[1px] bg-white/10" />
                        <div className="text-center"><p className="text-purple-400 text-[10px] font-bold uppercase">P2</p><p className="text-4xl font-black text-white">{calcTotal(p2Scores)}</p></div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="w-full max-w-sm space-y-4 mb-4">
          <div className="flex justify-between items-center mb-1">
            <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="pointer-events-auto p-3 bg-white/5 border border-white/10 rounded-2xl text-xl hover:bg-white/10">{isMuted ? '🔇' : '🔊'}</button>
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Frame {currentFrame} / 5</p>
          </div>
          <div className="w-full h-4 bg-white/5 rounded-xl overflow-hidden border border-white/10 p-1 shadow-inner">
            <motion.div animate={{ width: `${power}%` }} className={`h-full rounded-lg ${power > 80 ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-blue-500 shadow-[0_0_15px_#3b82f6]'}`} />
          </div>
        </div>
      </div>

      {/* GAME OVER ACHIEVEMENT BOARD */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            key="game-over-board"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center"
          >
              <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="max-w-4xl w-full">
                  <h2 className="text-6xl font-black italic text-white mb-2 tracking-tighter uppercase">Tournament Over</h2>
                  <div className="grid grid-cols-2 gap-8 mb-16">
                      <div className="bg-white/5 border border-cyan-500/30 p-8 rounded-3xl flex flex-col items-center">
                          <p className="text-cyan-400 font-black text-xs uppercase mb-4 tracking-widest">Player 1</p>
                          <p className="text-8xl font-black text-white mb-6">{calcTotal(p1Scores)}</p>
                          <div className="flex gap-4">
                            <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/10">
                              <p className="text-[8px] font-black uppercase tracking-widest text-cyan-400 mb-1">Strikes</p>
                              <p className="text-xl font-black text-white">{countAchieve(p1Scores, 'X')}</p>
                            </div>
                            <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/10">
                              <p className="text-[8px] font-black uppercase tracking-widest text-cyan-400 mb-1">Spares</p>
                              <p className="text-xl font-black text-white">{countAchieve(p1Scores, '/')}</p>
                            </div>
                          </div>
                      </div>
                      <div className="bg-white/5 border border-purple-500/30 p-8 rounded-3xl flex flex-col items-center">
                          <p className="text-purple-400 font-black text-xs uppercase mb-4 tracking-widest">Player 2</p>
                          <p className="text-8xl font-black text-white mb-6">{calcTotal(p2Scores)}</p>
                          <div className="flex gap-4">
                            <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/10">
                              <p className="text-[8px] font-black uppercase tracking-widest text-purple-400 mb-1">Strikes</p>
                              <p className="text-xl font-black text-white">{countAchieve(p2Scores, 'X')}</p>
                            </div>
                            <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/10">
                              <p className="text-[8px] font-black uppercase tracking-widest text-purple-400 mb-1">Spares</p>
                              <p className="text-xl font-black text-white">{countAchieve(p2Scores, '/')}</p>
                            </div>
                          </div>
                      </div>
                  </div>
                  <button onClick={() => window.location.reload()} className="pointer-events-auto px-16 py-5 bg-white text-black font-black uppercase rounded-2xl hover:bg-yellow-400 transition-all shadow-xl">Rematch</button>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScoreRow({ label, active, frames, color }: { label: string, active: boolean, frames: any[], color: string }) {
    return (
        <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${active ? 'opacity-100 scale-110' : 'opacity-25'}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`}>{label}</p>
            <div className={`flex gap-1.5 bg-white/5 p-1.5 rounded-2xl border ${active ? 'border-white/20 shadow-2xl' : 'border-white/5'}`}>
                {frames.map((f, i) => (
                    <div key={i} className="flex flex-col border border-white/5 rounded-lg overflow-hidden w-12 bg-black/40">
                        <div className="flex border-b border-white/5 h-7">
                            <div className="w-1/2 flex items-center justify-center text-[11px] border-r border-white/5 font-black text-white/80">{f[0]}</div>
                            <div className="w-1/2 flex items-center justify-center text-[11px] font-black text-white/80">{f[1]}</div>
                        </div>
                        <div className="text-[8px] font-bold text-center py-1 text-white/20">{i + 1}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}