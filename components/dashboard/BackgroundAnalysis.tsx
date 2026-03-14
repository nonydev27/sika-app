'use client'

import { useEffect } from 'react'

// Invisible component — fires background AI analysis on mount, no UI.
export default function BackgroundAnalysis() {
  useEffect(() => {
    // Fire and forget — we don't await or handle errors visibly
    fetch('/api/ai/background-analysis', { method: 'POST' }).catch(() => {})
  }, [])

  return null
}
