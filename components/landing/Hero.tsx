'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, Sphere, Torus } from '@react-three/drei'
import { useRef, Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'
import Link from 'next/link'

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setMobile(mq.matches)
    const fn = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return mobile
}

function Coin({ position = [0, 0, 0] as [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.6
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position}>
        <cylinderGeometry args={[1.8, 1.8, 0.25, 64]} />
        <meshStandardMaterial
          color="#4988C4"
          metalness={0.95}
          roughness={0.05}
          emissive="#1C4D8D"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[position[0], position[1] + 0.13, position[2]]}>
        <cylinderGeometry args={[1.5, 1.5, 0.01, 64]} />
        <meshStandardMaterial color="#BDE8F5" metalness={0.8} roughness={0.1} />
      </mesh>
    </Float>
  )
}

function FloatingRing({ position = [3, 1, -1] as [number, number, number], color = '#BDE8F5' }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.4
    ref.current.rotation.y = state.clock.elapsedTime * 0.3
  })
  return (
    <Float speed={2} floatIntensity={0.5}>
      <Torus ref={ref} args={[0.6, 0.08, 16, 60]} position={position}>
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
      </Torus>
    </Float>
  )
}

function FloatingSphere({ position = [-3, -1, -1] as [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.3
  })
  return (
    <Sphere ref={ref} args={[0.4, 32, 32]} position={position}>
      <meshStandardMaterial color="#0F2854" metalness={0.7} roughness={0.3} />
    </Sphere>
  )
}

export default function Hero() {
  const mobile = useIsMobile()
  const camZ = mobile ? 13 : 7
  const coinScale = mobile ? 0.55 : 1
  const ringScale = mobile ? 0.55 : 1
  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-b from-primary-dark via-primary-mid to-primary">
      <div className="absolute inset-0">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, camZ], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffffff" />
            <pointLight position={[-8, -8, -8]} color="#BDE8F5" intensity={1.5} />
            <pointLight position={[8, 4, 4]} color="#4988C4" intensity={1} />

            <group scale={coinScale}>
              <Coin position={[0, 0, 0]} />
            </group>
            <group scale={ringScale}>
              <FloatingRing position={[3.5, 1.5, -1]} color="#BDE8F5" />
              <FloatingRing position={[-3, -1.5, -0.5]} color="#4988C4" />
              <FloatingSphere position={[-3.5, 1, -1]} />
              <FloatingSphere position={[3, -1.5, -0.5]} />
            </group>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.4}
              maxPolarAngle={Math.PI / 2 + 0.3}
              minPolarAngle={Math.PI / 2 - 0.3}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none">
        <div className="text-center max-w-2xl">
         

          <h1 className="text-7xl md:text-6xl font-bold text-white leading-tight mb-4">
            Sika App,
            <br />
            <span className="text-primary-light">Track Your Money</span>
          </h1>

          <p className="text-lg text-white/70 max-w-md mx-auto mb-10 leading-relaxed">
            Track every pesewa, plan your semester, and get AI-powered advice tailored to your student life in Ghana.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
            <Link
              href="/signup"
              className="bg-white text-primary-dark font-bold px-8 py-4 rounded-2xl hover:bg-primary-light transition-colors text-sm shadow-xl"
            >
              Get started — it&apos;s free
            </Link>
            <a
              href="#features"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors text-sm"
            >
              See how it works
            </a>
          </div>
        </div>
      </div>

    </section>
  )
}
