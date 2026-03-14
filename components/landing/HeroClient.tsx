'use client'

import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('./Hero'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-gradient-to-b from-primary-dark via-primary-mid to-primary flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center text-3xl text-white font-bold">
          ₵
        </div>
        <p className="text-white font-bold text-2xl">Sika App</p>
        <p className="text-primary-light text-sm mt-2">Loading…</p>
      </div>
    </div>
  ),
})

export default function HeroClient() {
  return <Hero />
}
