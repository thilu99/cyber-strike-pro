'use client'
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useSphere, usePlane } from '@react-three/cannon';
import { useRef, useEffect, Suspense } from 'react';

function Ball() {
  const [ref, api] = useSphere(() => ({ mass: 1, position: [0, 0.5, 10] }));
  const targetX = useRef(0);

  useEffect(() => {
    const handleMove = (e: any) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      targetX.current = (clientX / window.innerWidth) * 10 - 5;
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  useFrame(() => {
    api.position.set(targetX.current, 0.5, 10);
    api.velocity.set(0, 0, -5);
  });

  return (
    <mesh ref={ref as any} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function BowlingScene() {
  return (
    <div className="h-screen w-full bg-black touch-none">
      <Canvas shadows camera={{ position: [0, 5, 20], fov: 45 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <Suspense fallback={null}>
          <Physics>
            <Ball />
            {/* Putting the floor/lane back into the world */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 100]} />
              <meshStandardMaterial color="#0a0a0a" />
            </mesh>
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}