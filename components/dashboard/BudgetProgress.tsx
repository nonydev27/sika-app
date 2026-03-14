import { formatCurrency, getCategoryColor, getAlertLevel } from '@/lib/utils'
import Link from 'next/link'
import { PieChart } from 'lucide-react'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { format } from 'date-fns'

interface Category {
  id: string
  category_name: string
  allocated_amount: number
  color: string
}

interface Transaction {
  category: string
  amount: number
  type: string
  date: string
}

export default function BudgetProgress({
  categories,
  transactions,
  currency,
  budgetStart,
  budgetEnd,
  hasBudget,
}: {
  categories: Category[]
  transactions: Transaction[]
  currency: string
  budgetStart: string
  budgetEnd: string
  hasBudget: boolean
}) {
  const spentMap = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + Number(t.amount)
      return acc
    }, {})

  const alertColors = { safe: 'bg-primary', warning: 'bg-yellow-400', danger: 'bg-red-500' }

  const periodLabel = (() => {
    try {
      return `${format(new Date(budgetStart), 'MMM d')} – ${format(new Date(budgetEnd), 'MMM d, yyyy')}`
    } catch { return '' }
  })()

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-primary-dark">Budget by Category</h2>
        <Link href="/dashboard/budget" className="text-xs text-primary hover:underline">
          Manage
        </Link>
      </div>
      {hasBudget && periodLabel && (
        <p className="text-xs text-gray-400 mb-4">{periodLabel}</p>
      )}
      {!hasBudget && <div className="mb-4" />}

      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <PieChart size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">{hasBudget ? 'No categories in this budget' : 'No active budget'}</p>
          <Link href="/dashboard/budget" className="text-xs text-primary hover:underline mt-1 block">
            {hasBudget ? 'Add categories' : 'Create a budget'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const spent = spentMap[cat.category_name] ?? 0
            const allocated = Number(cat.allocated_amount)
            const pct = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0
            const alert = getAlertLevel(allocated, spent)
            const color = getCategoryColor(cat.category_name)

            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={cat.category_name} size={14} style={{ color }} />
                    <span className="text-sm font-medium text-gray-700">{cat.category_name}</span>
                    {alert === 'warning' && (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">80%</span>
                    )}
                    {alert === 'danger' && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Over</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(spent, currency)} / {formatCurrency(allocated, currency)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${alertColors[alert]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
