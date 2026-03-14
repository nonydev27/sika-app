import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { TrendingDown, TrendingUp, Scale, Award } from 'lucide-react'
import { SpendingPie, MonthlyTrend, BudgetBar } from '@/components/charts/ChartsClient'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: transactions }, { data: budgets }, { data: profile }] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', user.id),
    supabase
      .from('budgets')
      .select('*, budget_categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase.from('profiles').select('currency_preference, savings_goal').eq('user_id', user.id).single(),
  ])

  const currency = profile?.currency_preference ?? 'GHS'
  // Ensure amounts are always numbers (Supabase numeric → can be string)
  const allTx = (transactions ?? []).map((t) => ({ ...t, amount: Number(t.amount) }))
  const activeBudget = budgets?.[0]

  // Category spending breakdown
  const categorySpending = allTx
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {})

  const pieData = Object.entries(categorySpending)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  // 6-month trend
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const start = startOfMonth(date).toISOString().split('T')[0]
    const end = endOfMonth(date).toISOString().split('T')[0]
    const monthTx = allTx.filter((t) => t.date >= start && t.date <= end)
    return {
      month: format(date, 'MMM'),
      spent: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    }
  })

  // Budget vs actual
  const budgetBarData = (activeBudget?.budget_categories ?? []).map(
    (cat: { category_name: string; allocated_amount: number }) => ({
      category: cat.category_name,
      allocated: Number(cat.allocated_amount),
      spent: categorySpending[cat.category_name] ?? 0,
    })
  )

  const totalSpent = allTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalIncome = allTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const net = totalIncome - totalSpent
  const topCategory = pieData[0]

  const summaryCards = [
    { label: 'Total Expenses', value: formatCurrency(totalSpent, currency), Icon: TrendingDown, color: 'text-red-500' },
    { label: 'Total Income', value: formatCurrency(totalIncome, currency), Icon: TrendingUp, color: 'text-green-600' },
    { label: 'Net Balance', value: formatCurrency(net, currency), Icon: Scale, color: net >= 0 ? 'text-green-600' : 'text-red-500' },
    { label: 'Top Category', value: topCategory?.category ?? '—', Icon: Award, color: 'text-primary-dark' },
  ]

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-dark">Statistics</h1>
        <p className="text-gray-500 text-sm mt-1">Your financial overview at a glance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">{card.label}</p>
              <card.Icon size={16} className="text-gray-300" />
            </div>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-primary-dark mb-4">Spending by Category</h2>
          <SpendingPie data={pieData} currency={currency} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-primary-dark mb-4">6-Month Trend</h2>
          <MonthlyTrend data={monthlyData} currency={currency} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-primary-dark mb-4">Budget vs Actual Spending</h2>
        <BudgetBar data={budgetBarData} currency={currency} />
      </div>

      {/* Category rankings */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-primary-dark mb-4">Category Rankings</h2>
        {pieData.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No expense data yet. Add transactions to see rankings.</p>
        ) : (
          <div className="space-y-3">
            {pieData.slice(0, 5).map((item, i) => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-xs font-bold text-primary-dark flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.category}</span>
                    <span className="text-gray-500">{formatCurrency(item.amount, currency)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${totalSpent > 0 ? ((item.amount / totalSpent) * 100).toFixed(0) : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-10 text-right">
                  {totalSpent > 0 ? ((item.amount / totalSpent) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
