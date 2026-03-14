'use client'

import { useState } from 'react'
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb, Calendar, Zap, RefreshCw, Lock } from 'lucide-react'
import Link from 'next/link'

interface Pattern {
  type: 'warning' | 'info' | 'success'
  title: string
  detail: string
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  title: string
  detail: string
  saving: number | null
}

interface SavingsTiming {
  bestDays: string[]
  worstDays: string[]
  advice: string
}

interface Insights {
  healthScore: number
  healthLabel: string
  healthSummary: string
  patterns: Pattern[]
  recommendations: Recommendation[]
  savingsTiming: SavingsTiming
  topRisk: string
  quickWins: string[]
  _cachedAt?: string
  _cached?: boolean
}

const patternIcon = { warning: AlertTriangle, info: Lightbulb, success: CheckCircle2 }
const patternColors = {
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
}
const patternIconColors = { warning: 'text-yellow-500', info: 'text-blue-500', success: 'text-green-500' }

const priorityColors = {
  high: 'bg-red-50 text-red-600 border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-green-50 text-green-700 border-green-200',
}

function HealthRing({ score, label }: { score: number; label: string }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#4988C4' : score >= 30 ? '#f59e0b' : '#dc2626'

  return (
    <div className="flex flex-col items-center">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 64 64)" style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="64" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0F2854">{score}</text>
        <text x="64" y="76" textAnchor="middle" fontSize="10" fill="#888">/100</text>
      </svg>
      <p className="text-sm font-semibold mt-1" style={{ color }}>{label}</p>
    </div>
  )
}

export default function InsightsClient({ currency }: { currency: string; name: string }) {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limitReached, setLimitReached] = useState(false)

  const sym = currency === 'USD' ? '$' : '₵'

  const fetchInsights = async (force = false) => {
    setLoading(true)
    setError('')
    setLimitReached(false)
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })

      if (res.status === 429) {
        setLimitReached(true)
        setLoading(false)
        return
      }

      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setInsights(data)
    } catch {
      setError('Could not generate insights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (limitReached) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-yellow-500" />
        </div>
        <h2 className="text-lg font-semibold text-primary-dark mb-2">Monthly limit reached</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          You&apos;ve used your 5 free AI insights this month. Upgrade to Pro for unlimited analyses.
        </p>
        <Link href="/dashboard/settings#upgrade" className="btn-primary inline-flex items-center gap-2">
          <Zap size={15} /> Upgrade to Pro — {sym}5/month
        </Link>
      </div>
    )
  }

  if (!insights && !loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={28} className="text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-primary-dark mb-2">Ready to analyse your finances</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          Cedi AI will study all your transactions, spending patterns, and savings to give you personalised recommendations.
        </p>
        <button onClick={() => fetchInsights(false)} className="btn-primary inline-flex items-center gap-2">
          <Zap size={15} /> Generate Insights
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm font-medium text-primary-dark">Analysing your financial data…</p>
        <p className="text-xs text-gray-400 mt-1">This takes a few seconds</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <AlertTriangle size={32} className="text-yellow-500 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button onClick={() => fetchInsights(false)} className="btn-primary inline-flex items-center gap-2">
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    )
  }

  if (!insights) return null

  const cacheAge = insights._cachedAt
    ? Math.round((Date.now() - new Date(insights._cachedAt).getTime()) / 1000 / 60 / 60)
    : null

  return (
    <div className="space-y-6">
      {/* Refresh button + cache info */}
      <div className="flex items-center justify-between">
        {insights._cached && cacheAge !== null && (
          <p className="text-xs text-gray-400">
            Cached {cacheAge < 1 ? 'just now' : `${cacheAge}h ago`}
            {' · '}
            <button onClick={() => fetchInsights(true)} className="text-primary hover:underline">
              Force refresh
            </button>
          </p>
        )}
        {!insights.fromCache && <span />}
        <button onClick={() => fetchInsights(false)} disabled={loading}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary-mid transition-colors ml-auto">
          <RefreshCw size={13} /> Refresh Analysis
        </button>
      </div>

      {/* Health score + summary */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <HealthRing score={insights.healthScore} label={insights.healthLabel} />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-primary-dark mb-1">Financial Health Score</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{insights.healthSummary}</p>
            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
              <p className="text-xs font-semibold text-red-700 mb-0.5">Top Risk</p>
              <p className="text-xs text-red-600">{insights.topRisk}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick wins */}
      <div className="bg-primary-dark rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-primary-light" />
          <h2 className="font-semibold text-white">Quick Wins for Today</h2>
        </div>
        <div className="space-y-2">
          {insights.quickWins.map((win, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3">
              <span className="w-5 h-5 rounded-full bg-primary-light/30 text-primary-light text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-sm text-white/90">{win}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spending patterns */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-primary-dark mb-4">Spending Patterns Detected</h2>
        <div className="space-y-3">
          {insights.patterns.map((p, i) => {
            const Icon = patternIcon[p.type]
            return (
              <div key={i} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${patternColors[p.type]}`}>
                <Icon size={15} className={`mt-0.5 flex-shrink-0 ${patternIconColors[p.type]}`} />
                <div>
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="text-xs mt-0.5 opacity-80">{p.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-primary-dark mb-4">Recommendations</h2>
        <div className="space-y-3">
          {insights.recommendations.map((r, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-sm font-semibold text-primary-dark">{r.title}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.saving != null && r.saving > 0 && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                      Save ~{sym}{r.saving}/mo
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${priorityColors[r.priority]}`}>
                    {r.priority}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{r.detail}
</p>
            </div>
          ))}
        </div>
      </div>

      {/* Savings timing */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-primary" />
          <h2 className="font-semibold text-primary-dark">Best Times to Save</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-700 mb-2">Save on these days</p>
            <div className="flex flex-wrap gap-1.5">
              {insights.savingsTiming.bestDays.map((d) => (
                <span key={d} className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">{d}</span>
              ))}
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-red-700 mb-2">Don&apos;t stress on these days</p>
            <div className="flex flex-wrap gap-1.5">
              {insights.savingsTiming.worstDays.map((d) => (
                <span key={d} className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">{d}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed bg-primary-light/20 rounded-xl px-4 py-3">
          {insights.savingsTiming.advice}
        </p>
      </div>
    </div>
  )
}
