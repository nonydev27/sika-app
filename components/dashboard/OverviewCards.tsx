import { formatCurrency } from '@/lib/utils'
import { Wallet, TrendingDown, Target, PiggyBank } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  totalBudget: number
  totalSpent: number
  currency: string
  savingsGoal: number
  netSavings: number
  transactionCount: number
  hasBudget: boolean
  usingProfileIncome: boolean
  periodStart: string
  periodEnd: string
  tourAttr?: string
}

export default function OverviewCards({
  totalBudget, totalSpent, currency, savingsGoal, netSavings,
  hasBudget, usingProfileIncome, periodStart, periodEnd, tourAttr,
}: Props) {
  const remaining = totalBudget - totalSpent
  const spentPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0
  const savingsPct = savingsGoal > 0 ? Math.min((netSavings / savingsGoal) * 100, 100) : 0

  const periodLabel = (() => {
    try {
      return `${format(new Date(periodStart), 'MMM d')} – ${format(new Date(periodEnd), 'MMM d')}`
    } catch { return 'This period' }
  })()

  const cards = [
    {
      label: hasBudget ? 'Total Budget' : 'Monthly Income',
      value: formatCurrency(totalBudget, currency),
      sub: hasBudget ? periodLabel : 'From profile',
      Icon: Wallet,
      color: 'bg-primary-dark',
      textColor: 'text-white',
      subColor: 'text-primary-light',
      iconColor: 'text-primary-light',
      bar: null,
    },
    {
      label: 'Total Spent',
      value: formatCurrency(totalSpent, currency),
      sub: totalBudget > 0 ? `${spentPct.toFixed(0)}% of ${hasBudget ? 'budget' : 'income'}` : periodLabel,
      Icon: TrendingDown,
      color: 'bg-primary-mid',
      textColor: 'text-white',
      subColor: 'text-primary-light',
      iconColor: 'text-primary-light',
      bar: totalBudget > 0 ? { pct: spentPct, danger: spentPct >= 100, warn: spentPct >= 80 } : null,
    },
    {
      label: 'Remaining',
      value: formatCurrency(Math.abs(remaining), currency),
      sub: remaining < 0 ? 'Over budget' : 'Left to spend',
      Icon: Target,
      color: remaining < 0 ? 'bg-red-500' : 'bg-primary',
      textColor: 'text-white',
      subColor: 'text-white/70',
      iconColor: 'text-white/70',
      bar: null,
    },
    {
      label: 'Savings Progress',
      value: formatCurrency(netSavings, currency),
      sub: savingsGoal > 0
        ? `${savingsPct.toFixed(0)}% of ${formatCurrency(savingsGoal, currency)} goal${usingProfileIncome ? ' · est.' : ''}`
        : usingProfileIncome ? 'Based on monthly income' : 'No goal set',
      Icon: PiggyBank,
      color: 'bg-white',
      textColor: 'text-primary-dark',
      subColor: 'text-gray-400',
      iconColor: 'text-gray-300',
      bar: savingsGoal > 0 ? { pct: savingsPct, danger: false, warn: false } : null,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-tour={tourAttr}>
      {cards.map((card) => (
        <div key={card.label} className={`${card.color} rounded-2xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-medium ${card.subColor}`}>{card.label}</p>
            <card.Icon size={16} className={card.iconColor} />
          </div>
          <p className={`text-xl font-bold ${card.textColor} leading-tight`}>{card.value}</p>
          <p className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</p>
          {card.bar && (
            <div className="mt-2 w-full bg-white/20 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  card.bar.danger ? 'bg-red-300' : card.bar.warn ? 'bg-yellow-300' : 'bg-white/60'
                }`}
                style={{ width: `${card.bar.pct}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
