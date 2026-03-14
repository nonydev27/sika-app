'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-primary-dark/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white">₵</div>
          <span className="font-bold text-white text-lg">Sika App</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-primary-light">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-primary-light hover:text-white text-sm transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-primary hover:bg-primary-mid text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  )
}
