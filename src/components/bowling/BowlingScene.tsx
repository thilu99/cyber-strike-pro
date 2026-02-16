'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics, useSphere, usePlane } from '@react-three/cannon'
import { Suspense, useRef } from 'react'

function Ball() {
  const [ref, api] = useSphere(() => ({ mass: 1, position: [0, 0.5, 10] }))
  
  useFrame((state) => {
    // Standard mouse follow logic
    const x = state.mouse.x * 5
    api.position.set(x, 0.5, 10)
    api.velocity.set(0, 0, -8)
  })

  return (
    <mesh ref={ref as any} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
    </mesh>
  )
}

function Lane() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] }))
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[10, 100]} />
      <meshStandardMaterial color="#050505" />
    </mesh>
  )
}

export default function BowlingScene() {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas shadows camera={{ position: [0, 5, 20], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Suspense fallback={null}>
          <Physics>
            <Ball />
            <Lane />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  )
}