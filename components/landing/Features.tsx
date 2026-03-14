'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { BarChart3, Receipt, LineChart, Bot, GraduationCap, Bell } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'
import imageUrl from '@/app/assets/screenshot.png'

const LEFT_FEATURES = [
  {
    Icon: BarChart3,
    title: 'Smart Budget Planning',
    desc: 'Allocate across Ghana-specific categories — trotro, waakye, data bundles.',
    gradient: 'from-[#0F2854] to-[#1C4D8D]',
  },
  {
    Icon: Receipt,
    title: 'Receipt Parsing',
    desc: 'Paste any MoMo SMS and Cedi AI logs the transaction instantly.',
    gradient: 'from-[#1C4D8D] to-[#4988C4]',
  },
  {
    Icon: LineChart,
    title: 'Visual Statistics',
    desc: 'Monthly trends, category breakdowns and budget vs actual.',
    gradient: 'from-[#4988C4] to-[#BDE8F5]',
  },
]

const RIGHT_FEATURES = [
  {
    Icon: Bot,
    title: 'Sika App AI Assistant',
    desc: 'Claude-powered coach with real Ghana-specific money advice.',
    gradient: 'from-[#0F2854] to-[#4988C4]',
  },
  {
    Icon: GraduationCap,
    title: 'Semester Mode',
    desc: 'Budgets aligned with UG, KNUST, UCC academic calendars.',
    gradient: 'from-[#1C4D8D] to-[#BDE8F5]',
  },
  {
    Icon: Bell,
    title: 'Budget Alerts',
    desc: "Warned at 80% of any category before it's too late.",
    gradient: 'from-[#4988C4] to-[#0F2854]',
  },
]

function FeatureCard({
  feat,
  index,
  side,
}: {
  feat: (typeof LEFT_FEATURES)[0]
  index: number
  side: 'left' | 'right'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.04, transition: { duration: 0.18 } }}
      className="relative cursor-default"
      style={{ transform: 'translateZ(52px)' }}
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.93)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(15,40,84,0.16), 0 1px 0 rgba(255,255,255,0.9) inset',
          border: '1px solid rgba(255,255,255,0.75)',
        }}
      >
        <div className={`h-1 w-full bg-gradient-to-r ${feat.gradient}`} />
        <div className="p-4">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-3 shadow-sm`}>
            <feat.Icon size={15} className="text-white" />
          </div>
          <p className="text-[12px] font-bold text-primary-dark mb-1 leading-snug">{feat.title}</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">{feat.desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Features() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const rotateX = useTransform(scrollYProgress, [0, 0.38, 0.7, 1], [24, 0, 0, -5])
  const scale   = useTransform(scrollYProgress, [0, 0.38], [0.8, 1])
  const y       = useTransform(scrollYProgress, [0, 0.38], [90, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.15], [0, 1])

  return (
    <section id="features" className="py-28 bg-gray-50 overflow-visible">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <span className="inline-block text-xs font-bold tracking-widest text-primary uppercase mb-4 px-4 py-1.5 rounded-full bg-primary/10">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-dark mb-5 leading-tight">
              Everything a Ghanaian<br className="hidden md:block" /> student needs
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-base leading-relaxed">
              Built for the realities of student life in Ghana — from trotro fares to MoMo transfers.
            </p>
          </motion.div>
        </div>

        {/* ── DESKTOP: 3D showcase ── */}
        <motion.div
          ref={ref}
          style={{
            rotateX,
            scale,
            y,
            opacity,
            transformPerspective: 1600,
            transformStyle: 'preserve-3d',
          }}
          className="relative hidden lg:flex items-center gap-6"
        >
          {/* Glow */}
          <div className="absolute inset-x-[18%] inset-y-[5%] -z-10 pointer-events-none">
            <div className="absolute inset-0 blur-[90px] opacity-45 rounded-full bg-primary" />
            <div className="absolute inset-[15%] blur-[60px] opacity-35 rounded-full bg-primary-mid" />
          </div>

          {/* Left cards column */}
          <div className="flex flex-col gap-4 w-[210px] flex-shrink-0" style={{ transformStyle: 'preserve-3d' }}>
            {LEFT_FEATURES.map((feat, i) => (
              <FeatureCard key={feat.title} feat={feat} index={i} side="left" />
            ))}
          </div>

          {/* Screenshot */}
          <div className="flex-1 min-w-0" style={{ transformStyle: 'preserve-3d' }}>
            <div
              className="rounded-[20px] overflow-hidden"
              style={{
                boxShadow: '0 60px 160px -20px rgba(15,40,84,0.65), 0 0 0 1px rgba(255,255,255,0.08) inset',
                background: '#0F2854',
              }}
            >
              {/* Chrome bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10" style={{ background: '#0a1e3d' }}>
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <div className="flex-1 mx-4 rounded-lg h-6 flex items-center px-3 gap-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="w-2 h-2 rounded-full border border-white/20 flex-shrink-0" />
                  <span className="text-white/35 text-[11px] font-medium">app.sika-app.com/dashboard</span>
                </div>
              </div>

              //git cganhe
              <Image
                src={imageUrl}
                alt="CediSmart dashboard"
                width={1400}
                height={900}
                className="w-full h-auto block"
                priority
                unoptimized
              />
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{ boxShadow: 'inset 0 0 60px rgba(15,40,84,0.2)' }} />
            </div>
          </div>

          {/* Right cards column */}
          <div className="flex flex-col gap-4 w-[210px] flex-shrink-0" style={{ transformStyle: 'preserve-3d' }}>
            {RIGHT_FEATURES.map((feat, i) => (
              <FeatureCard key={feat.title} feat={feat} index={i} side="right" />
            ))}
          </div>
        </motion.div>

        {/* ── MOBILE / TABLET: stacked layout ── */}
        <div className="lg:hidden space-y-8">
          {/* Screenshot — no 3D, just a clean card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute inset-x-[5%] inset-y-[5%] -z-10 blur-[60px] opacity-40 rounded-full bg-primary pointer-events-none" />
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 30px 80px -10px rgba(15,40,84,0.5)',
                background: '#0F2854',
              }}
            >
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10" style={{ background: '#0a1e3d' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <div className="flex-1 mx-3 rounded-md h-5 flex items-center px-2.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <span className="text-white/35 text-[10px]">app.sika-app.com/dashboard</span>
                </div>
              </div>
              <Image
                src={imageUrl}
                alt="CediSmart dashboard"
                width={1400}
                height={900}
                className="w-full h-auto block"
                priority
                unoptimized
              />
            </div>
          </motion.div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...LEFT_FEATURES, ...RIGHT_FEATURES].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100"
              >
                <div className={`h-1 w-full bg-gradient-to-r ${feat.gradient}`} />
                <div className="p-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                    <feat.Icon size={17} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-primary-dark mb-1">{feat.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
