'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics, useSphere, useBox } from '@react-three/cannon'
import { Suspense, useRef, useEffect } from 'react'
import * as THREE from 'three'

function Ball() {
  const [ref, api] = useSphere(() => ({ mass: 1, position: [0, 0.5, 10] }))
  const mouseX = useRef(0)

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      // Handles both mouse and touch input coordinates
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX
      mouseX.current = (x / window.innerWidth) * 2 - 1
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove, { passive: false })
    
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
    }
  }, [])

  useFrame(() => {
    // Smoothly follow the pointer position
    api.position.set(mouseX.current * 3, 0.5, 10)
    api.velocity.set(0, 0, -5) // Constant forward speed
  })

  return (
    <mesh ref={ref as any}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={0.5} />
    </mesh>
  )
}

// Floor and Pins would follow here... (keeping it brief for the fix)

export default function BowlingScene() {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas camera={{ position: [0, 5, 15], fov: 50 }}>
        <color attach="background" args={['#000']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Physics>
            <Ball />
            {/* Add your Floor and Pin components here */}
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  )
}