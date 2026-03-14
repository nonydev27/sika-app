'use client'

import { motion } from 'framer-motion'

interface SikaAppLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function SikaAppLogo({ size = 'md', showText = true, className = '' }: SikaAppLogoProps) {
  const sizes = {
    sm: { container: 28, icon: 18, text: 'text-sm' },
    md: { container: 36, icon: 22, text: 'text-base' },
    lg: { container: 48, icon: 28, text: 'text-lg' },
  }

  const s = sizes[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="relative flex items-center justify-center"
        style={{ width: s.container, height: s.container }}
      >
        {/* Animated ring */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #0F2854 0%, #1C4D8D 50%, #4988C4 100%)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Inner glow */}
        <motion.div
          className="absolute inset-[3px] rounded-lg"
          style={{
            background: 'linear-gradient(180deg, #1C4D8D 0%, #0F2854 100%)',
          }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Gold coin accent - "Sika" means gold in Twi */}
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: '60%',
            height: '60%',
            background: 'linear-gradient(135deg, #F5B041 0%, #D4AC0D 50%, #B7950B 100%)',
            boxShadow: '0 2px 8px rgba(212, 172, 13, 0.5)',
          }}
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <span 
            className="font-bold"
            style={{
              color: '#0F2854',
              fontSize: s.icon,
              lineHeight: 1,
            }}
          >
            ₵
          </span>
        </motion.div>
        
        {/* Sparkle effects */}
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full bg-white"
          style={{ top: '5%', right: '15%' }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.div
          className="absolute w-1 h-1 rounded-full bg-primary-light"
          style={{ bottom: '10%', left: '10%' }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-white leading-tight ${s.text}`}>
            Sika App
          </span>
        </div>
      )}
    </div>
  )
}
