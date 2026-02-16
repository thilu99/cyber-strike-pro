'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics, useSphere, usePlane } from '@react-three/cannon'
import { useRef, useEffect } from 'react'

function Ball() {
  // mass: 1 makes it reactive to physics
  const [ref, api] = useSphere(() => ({ 
    mass: 1, 
    position: [0, 0.5, 10],
    args: [0.5] 
  }))
  
  const targetX = useRef(0)

  useEffect(() => {
    const handleMove = (e: any) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      // Normalize position to -4 to 4 (lane width)
      targetX.current = (clientX / window.innerWidth) * 8 - 4
      
      // Prevents the phone from scrolling while you play
      if (e.touches) e.preventDefault() 
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove, { passive: false })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
    }
  }, [])

  useFrame(() => {
    // api.position.set is the "Teleport" method. 
    // api.velocity.set is the "Physics" method. We use position for tight steering.
    api.position.set(targetX.current, 0.5, 10)
    // Add a slight forward velocity to simulate the roll
    api.velocity.set(0, 0, -8)
  })

  return (
    <mesh ref={ref as any} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.5} />
    </mesh>
  )
}

function Floor() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] }))
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[10, 100]} />
      <meshStandardMaterial color="#111" />
    </mesh>
  )
}

export default function BowlingScene() {
  return (
    <div className="h-screen w-full bg-black touch-none">
      <Canvas shadows camera={{ position: [0, 4, 15], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} castShadow />
        <Physics gravity={[0, -9.81, 0]}>
          <Ball />
          <Floor />
        </Physics>
      </Canvas>
    </div>
  )
}