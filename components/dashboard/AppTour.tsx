'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, usePathname } from 'next/navigation'
import { X, ChevronRight, ChevronLeft, Sparkles, Map } from 'lucide-react'

export const TOUR_STORAGE_KEY = 'sikaapp_tour_completed'
export const TOUR_RESTART_KEY = 'sikaapp_tour_restart'

interface Step {
  target: string
  title: string
  body: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  page: string
}

// 12 focused steps — one clear purpose per step, no repeats
const STEPS: Step[] = [
  {
    target: '[data-tour="overview-cards"]',
    title: 'Your Financial Overview',
    body: 'Budget, spent, remaining, and savings — all in one glance. These update in real-time as you log transactions.',
    placement: 'bottom',
    page: '/dashboard',
  },
  {
    target: '[data-tour="daily-banner"]',
    title: 'Today\'s Spending',
    body: 'Track your daily budget usage here. Green → yellow → red as you approach your limit. Tap to log a transaction instantly.',
    placement: 'top',
    page: '/dashboard',
  },
  {
    target: '[data-tour="chat-widget"]',
    title: 'Cedi AI — Your Finance Coach',
    body: 'Ask anything: "How am I spending this month?", "Tips to save on transport?", "Help me budget for exams." Available 24/7.',
    placement: 'top',
    page: '/dashboard',
  },
  {
    target: '[data-tour="daily-transactions-panel"]',
    title: 'Log Today\'s Transactions',
    body: 'Add expenses or income manually, or paste a MoMo / bank SMS and Cedi AI will extract the details automatically — no typing needed.',
    placement: 'bottom',
    page: '/dashboard/daily',
  },
  {
    target: '[data-tour="budget-new-btn"]',
    title: 'Create Your Budget',
    body: 'Set a weekly, monthly, or semester budget. Allocate amounts per category — food, transport, data, entertainment — and Sika App tracks it all.',
    placement: 'bottom',
    page: '/dashboard/budget',
  },
  {
    target: '[data-tour="tx-toolbar"]',
    title: 'Transaction History',
    body: 'Your complete financial record. Search by category or description, add past transactions, and delete mistakes. Every entry feeds your stats.',
    placement: 'bottom',
    page: '/dashboard/transactions',
  },
  {
    target: '[data-tour="savings-summary"]',
    title: 'Savings Pots',
    body: 'Create separate accounts for each goal — emergency fund, laptop, fees. Deposit, withdraw, and track progress toward each target.',
    placement: 'bottom',
    page: '/dashboard/savings',
  },
  {
    target: '[data-tour="stats-charts"]',
    title: 'Spending Charts',
    body: 'See your spending by category and a 6-month income vs expense trend. All figures match your active budget period.',
    placement: 'bottom',
    page: '/dashboard/stats',
  },
  {
    target: '[data-tour="insights-generate-btn"]',
    title: 'AI Financial Insights',
    body: 'Get a personalised health score, spending pattern warnings, and actionable recommendations. Background analysis runs automatically so results load instantly.',
    placement: 'bottom',
    page: '/dashboard/insights',
  },
]

const PAGE_LABEL: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/daily': 'Daily Tracker',
  '/dashboard/budget': 'Budget',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/savings': 'Savings',
  '/dashboard/stats': 'Statistics',
  '/dashboard/insights': 'AI Insights',
}

// Pages visited in order — used for prefetching
const TOUR_PAGES = [
  '/dashboard',
  '/dashboard/daily',
  '/dashboard/budget',
  '/dashboard/transactions',
  '/dashboard/savings',
  '/dashboard/stats',
  '/dashboard/insights',
]

interface Rect { top: number; left: number; width: number; height: number }

const PADDING = 10
const TOOLTIP_W = 320

function getPlacementStyle(rect: Rect, placement: Step['placement'], tooltipH: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  let top = 0, left = 0

  if (placement === 'right') {
    top = rect.top + rect.height / 2 - tooltipH / 2
    left = rect.left + rect.width + PADDING + 8
    if (left + TOOLTIP_W > vw - 12) left = rect.left - TOOLTIP_W - PADDING - 8
  } else if (placement === 'left') {
    top = rect.top + rect.height / 2 - tooltipH / 2
    left = rect.left - TOOLTIP_W - PADDING - 8
    if (left < 12) left = rect.left + rect.width + PADDING + 8
  } else if (placement === 'bottom') {
    top = rect.top + rect.height + PADDING + 8
    left = rect.left + rect.width / 2 - TOOLTIP_W / 2
  } else {
    top = rect.top - tooltipH - PADDING - 8
    left = rect.left + rect.width / 2 - TOOLTIP_W / 2
  }

  top = Math.max(12, Math.min(top, vh - tooltipH - 12))
  left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12))
  return { top, left }
}

function getArrowStyle(rect: Rect, placement: Step['placement'], pos: { top: number; left: number }) {
  const cx = rect.left + rect.width / 2 - pos.left - 8
  const cy = rect.top + rect.height / 2 - pos.top - 8
  if (placement === 'right')  return { left: -8,   top: cy, borderRight:  '8px solid white', borderTop: '8px solid transparent', borderBottom: '8px solid transparent' }
  if (placement === 'left')   return { right: -8,  top: cy, borderLeft:   '8px solid white', borderTop: '8px solid transparent', borderBottom: '8px solid transparent' }
  if (placement === 'bottom') return { top: -8,   left: cx, borderBottom: '8px solid white', borderLeft: '8px solid transparent', borderRight: '8px solid transparent' }
  return                             { bottom: -8, left: cx, borderTop:    '8px solid white', borderLeft: '8px solid transparent', borderRight: '8px solid transparent' }
}

export default function AppTour({ autoStart = false }: { autoStart?: boolean }) {
  const [mounted, setMounted]       = useState(false)
  const [active, setActive]         = useState(false)
  const [stepIdx, setStepIdx]       = useState(0)
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const tooltipRef   = useRef<HTMLDivElement>(null)
  const stepIdxRef   = useRef(0)
  const activeRef    = useRef(false)
  const pendingStep  = useRef<number | null>(null)
  const navigating   = useRef(false)
  const router       = useRouter()
  const pathname     = usePathname()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { stepIdxRef.current = stepIdx }, [stepIdx])
  useEffect(() => { activeRef.current = active }, [active])

  // Prefetch all tour pages as soon as the tour becomes active
  useEffect(() => {
    if (!active) return
    TOUR_PAGES.forEach((p) => router.prefetch(p))
  }, [active, router])

  const completeTour = useCallback(() => {
    activeRef.current = false
    setActive(false)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    localStorage.removeItem(TOUR_RESTART_KEY)
    document.querySelectorAll('[data-tour-highlight]').forEach((el) => el.removeAttribute('data-tour-highlight'))
  }, [])

  const showStep = useCallback((idx: number) => {
    const step = STEPS[idx]
    const el = document.querySelector(step.target)
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

    // Small delay so scroll settles before we measure
    setTimeout(() => {
      const r = el.getBoundingClientRect()
      const rect = { top: r.top, left: r.left, width: r.width, height: r.height }
      const h = tooltipRef.current?.offsetHeight ?? 180
      const pos = getPlacementStyle(rect, step.placement, h)

      setTargetRect(rect)
      setTooltipPos(pos)
      setStepIdx(idx)
      stepIdxRef.current = idx

      document.querySelectorAll('[data-tour-highlight]').forEach((e) => e.removeAttribute('data-tour-highlight'))
      el.setAttribute('data-tour-highlight', 'true')
    }, 120)
  }, [])

  const goTo = useCallback((idx: number) => {
    if (idx >= STEPS.length) { completeTour(); return }
    if (idx < 0) return

    const step = STEPS[idx]
    const onPage = step.page === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(step.page)

    if (!onPage) {
      pendingStep.current = idx
      navigating.current = true
      router.push(step.page)
      return
    }

    showStep(idx)
  }, [completeTour, showStep, pathname, router])

  // After route change, show the pending step
  useEffect(() => {
    if (!navigating.current || pendingStep.current === null) return
    navigating.current = false
    const idx = pendingStep.current
    pendingStep.current = null
    // 500ms gives Next.js time to render the new page
    setTimeout(() => showStep(idx), 500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Auto-start
  useEffect(() => {
    if (!mounted) return
    const done    = localStorage.getItem(TOUR_STORAGE_KEY)
    const restart = localStorage.getItem(TOUR_RESTART_KEY)
    if (restart === 'true' || (autoStart && !done)) {
      activeRef.current = true
      setActive(true)
      setTimeout(() => showStep(0), 800)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  // Keyboard nav — stable handler via refs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!activeRef.current) return
      if (e.key === 'ArrowRight' || e.key === 'Enter') goTo(stepIdxRef.current + 1)
      if (e.key === 'ArrowLeft')                       goTo(stepIdxRef.current - 1)
      if (e.key === 'Escape')                          completeTour()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goTo, completeTour])

  if (!mounted || !active) return null

  const step = STEPS[stepIdx]
  const arrowStyle = targetRect ? getArrowStyle(targetRect, step.placement, tooltipPos) : {}

  return createPortal(
    <>
      {/* Backdrop with cutout */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {targetRect && (
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.left - PADDING} y={targetRect.top - PADDING}
                  width={targetRect.width + PADDING * 2} height={targetRect.height + PADDING * 2}
                  rx="14" fill="black"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(15,40,84,0.65)" mask="url(#tour-mask)" />
          </svg>
        )}
        {targetRect && (
          <div
            className="absolute rounded-2xl pointer-events-none"
            style={{
              top: targetRect.top - PADDING, left: targetRect.left - PADDING,
              width: targetRect.width + PADDING * 2, height: targetRect.height + PADDING * 2,
              boxShadow: '0 0 0 3px #4988C4, 0 0 0 6px rgba(73,136,196,0.25)',
              transition: 'all 0.3s ease',
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] pointer-events-auto"
        style={{ top: tooltipPos.top, left: tooltipPos.left, width: TOOLTIP_W, transition: 'top 0.3s ease, left 0.3s ease' }}
      >
        <div className="absolute w-0 h-0" style={arrowStyle} />

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="h-1 w-full bg-gradient-to-r from-primary-dark via-primary to-primary-light" />

          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={13} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-primary/60 font-medium uppercase tracking-wide leading-none mb-0.5">
                    {PAGE_LABEL[step.page]}
                  </p>
                  <p className="font-bold text-primary-dark text-sm">{step.title}</p>
                </div>
              </div>
              <button onClick={completeTour} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5" aria-label="Skip tour">
                <X size={15} />
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-5">{step.body}</p>

            {/* Footer */}
            <div className="space-y-3">
              {/* Nav buttons row */}
              <div className="flex items-center gap-2">
                {stepIdx > 0 && (
                  <button
                    onClick={() => goTo(stepIdx - 1)}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors flex-shrink-0"
                  >
                    <ChevronLeft size={15} />
                  </button>
                )}
                <button
                  onClick={() => goTo(stepIdx + 1)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-mid text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {stepIdx === STEPS.length - 1 ? 'Finish Tour' : 'Next'}
                  {stepIdx < STEPS.length - 1 && <ChevronRight size={14} />}
                </button>
              </div>

              {/* Progress dots + skip */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`rounded-full transition-all duration-200 ${i === stepIdx ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300">{stepIdx + 1}/{STEPS.length}</span>
                  <button onClick={completeTour} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating indicator */}
      <div className="fixed bottom-24 md:bottom-8 left-4 z-[9997] pointer-events-none">
        <div className="flex items-center gap-2 bg-primary-dark/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full shadow-lg">
          <Map size={11} className="text-primary-light" />
          <span className="text-primary-light">App Tour</span>
          <span className="text-white/50">·</span>
          <span>{stepIdx + 1} of {STEPS.length}</span>
        </div>
      </div>
    </>,
    document.body
  )
}
