import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { subDays, getDaysInMonth } from 'date-fns'
import DailyClient from './DailyClient'

export default async function DailyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const yesterday = subDays(new Date(), 1).toISOString().split('T')[0]

  const [{ data: profile }, { data: budgets }, { data: allTodayTx }, { data: yesterdayTx }] =
    await Promise.all([
      supabase.from('profiles').select('currency_preference, budget_period').eq('user_id', user.id).single(),
      supabase
        .from('budgets')
        .select('total_amount, period_type, start_date, end_date')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false }),
      supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .eq('date', yesterday),
    ])

  const currency = profile?.currency_preference ?? 'GHS'
  const activeBudget = budgets?.[0]

  // Calculate daily budget from the active budget
  const totalBudget = Number(activeBudget?.total_amount ?? 0)
  let dailyBudget = 0
  if (activeBudget) {
    if (activeBudget.period_type === 'weekly') {
      dailyBudget = totalBudget / 7
    } else if (activeBudget.period_type === 'semester') {
      dailyBudget = totalBudget / 120 // ~4 months
    } else {
      dailyBudget = totalBudget / getDaysInMonth(new Date())
    }
  }

  const todayTx = (allTodayTx ?? []).map((t) => ({ ...t, amount: Number(t.amount) }))
  const todaySpent = todayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const todayIncome = todayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const yesterdaySpent = (yesterdayTx ?? [])
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-dark">Daily Tracker</h1>
        <p className="text-gray-500 text-sm mt-1">Track your spending day by day</p>
      </div>
      <DailyClient
        todayTx={todayTx}
        yesterdaySpent={yesterdaySpent}
        dailyBudget={dailyBudget}
        currency={currency}
        todaySpent={todaySpent}
        todayIncome={todayIncome}
      />
    </>
  )
}
