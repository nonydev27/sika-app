import { formatCurrency } from '@/lib/utils'
import { Wallet, TrendingDown, Target, PiggyBank } from 'lucide-react'

interface Props {
  totalBudget: number
  totalSpent: number
  currency: string
  savingsGoal: number
  transactionCount: number
}

export default function OverviewCards({ totalBudget, totalSpent, currency, savingsGoal }: Props) {
  const remaining = totalBudget - totalSpent
  const savedSoFar = Math.max(0, remaining)
  const spentPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  const cards = [
    {
      label: 'Total Budget',
      value: formatCurrency(totalBudget, currency),
      sub: 'This period',
      Icon: Wallet,
      color: 'bg-primary-dark',
      textColor: 'text-white',
      subColor: 'text-primary-light',
      iconColor: 'text-primary-light',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(totalSpent, currency),
      sub: `${spentPct.toFixed(0)}% of budget`,
      Icon: TrendingDown,
      color: 'bg-primary-mid',
      textColor: 'text-white',
      subColor: 'text-primary-light',
      iconColor: 'text-primary-light',
    },
    {
      label: 'Remaining',
      value: formatCurrency(remaining, currency),
      sub: remaining < 0 ? 'Over budget' : 'Keep it up',
      Icon: Target,
      color: remaining < 0 ? 'bg-red-500' : 'bg-primary',
      textColor: 'text-white',
      subColor: 'text-white/70',
      iconColor: 'text-white/70',
    },
    {
      label: 'Savings Progress',
      value: formatCurrency(savedSoFar, currency),
      sub: `Goal: ${formatCurrency(savingsGoal, currency)}`,
      Icon: PiggyBank,
      color: 'bg-white',
      textColor: 'text-primary-dark',
      subColor: 'text-gray-400',
      iconColor: 'text-gray-300',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className={`${card.color} rounded-2xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-medium ${card.subColor}`}>{card.label}</p>
            <card.Icon size={16} className={card.iconColor} />
          </div>
          <p className={`text-xl font-bold ${card.textColor} leading-tight`}>{card.value}</p>
          <p className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
