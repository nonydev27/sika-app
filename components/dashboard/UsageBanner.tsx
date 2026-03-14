'use client'

import { useEffect, useState } from 'react'
import { Sparkles, MessageCircle, Receipt, X, Zap } from 'lucide-react'
import Link from 'next/link'

interface UsageStat {
  used: number
  limit: number
  remaining: number
  isPro: boolean
  allowed: boolean
}

interface UsageData {
  chat: UsageStat
  insights: UsageStat
  receipt: UsageStat
  isPro: boolean
}

function UsageBar({ used, limit, label, icon: Icon }: {
  used: number
  limit: number
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}) {
  const pct = Math.min((used / limit) * 100, 100)
  const isLow = pct >= 80
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Icon size={13} className={isLow ? 'text-yellow-500' : 'text-primary-light'} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-primary-light truncate">{label}</span>
          <span className={`text-xs font-medium ml-2 flex-shrink-0 ${isLow ? 'text-yellow-400' : 'text-white/70'}`}>
            {used}/{limit}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-500 ${isLow ? 'bg-yellow-400' : 'bg-primary-light'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function UsageBanner() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/usage')
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {})
  }, [])

  if (!usage || usage.isPro || dismissed) return null

  // Only show if any usage is >= 50%
  const anySignificant =
    usage.chat.used / usage.chat.limit >= 0.5 ||
    usage.insights.used / usage.insights.limit >= 0.5 ||
    usage.receipt.used / usage.receipt.limit >= 0.5

  if (!anySignificant) return null

  const anyLow =
    usage.chat.remaining <= 5 ||
    usage.insights.remaining <= 1 ||
    usage.receipt.remaining <= 10

  return (
    <div className={`rounded-2xl shadow-sm p-4 mb-6 ${anyLow ? 'bg-primary-dark border border-yellow-500/30' : 'bg-primary-dark'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary-light" />
          <p className="text-sm font-semibold text-white">
            {anyLow ? 'Running low on AI credits' : 'AI Usage this month'}
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2.5 mb-4">
        <UsageBar used={usage.chat.used} limit={usage.chat.limit} label="AI Chat" icon={MessageCircle} />
        <UsageBar used={usage.insights.used} limit={usage.insights.limit} label="AI Insights" icon={Sparkles} />
        <UsageBar used={usage.receipt.used} limit={usage.receipt.limit} label="Receipt Parsing" icon={Receipt} />
      </div>

      {anyLow && (
        <Link
          href="/dashboard/settings#upgrade"
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-mid text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
        >
          <Zap size={12} /> Upgrade to Pro — ₵5/month
        </Link>
      )}
    </div>
  )
}
