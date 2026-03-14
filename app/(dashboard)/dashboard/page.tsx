import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OverviewCards from '@/components/dashboard/OverviewCards'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import BudgetProgress from '@/components/dashboard/BudgetProgress'
import ChatWidget from '@/components/ai/ChatWidget'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getDaysInMonth } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [
    { data: profile },
    { data: budgets },
    { data: transactions },
    { data: todayTx },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase
      .from('budgets')
      .select('*, budget_categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10),
    supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .eq('date', today),
  ])

  const activeBudget = budgets?.[0] ?? null
  const currency = profile?.currency_preference ?? 'GHS'
  const categories = activeBudget?.budget_categories ?? []

  const totalBudget = Number(activeBudget?.total_amount ?? 0)
  const totalSpent = (transactions ?? [])
    .filter((t) => t.type === 'expense')
    .reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0)

  // Daily budget calculation
  const totalBudgetAmt = Number(activeBudget?.total_amount ?? 0)
  let dailyBudget = 0
  if (activeBudget) {
    if (activeBudget.period_type === 'weekly') dailyBudget = totalBudgetAmt / 7
    else if (activeBudget.period_type === 'semester') dailyBudget = totalBudgetAmt / 120
    else dailyBudget = totalBudgetAmt / getDaysInMonth(new Date())
  }
  const todaySpent = (todayTx ?? [])
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)
  const dailyPct = dailyBudget > 0 ? Math.min((todaySpent / dailyBudget) * 100, 100) : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-dark">
          {greeting}, {profile?.name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {activeBudget
            ? `Tracking your ${activeBudget.period_type} budget`
            : 'Set up your budget to get started'}
        </p>
      </div>

      <OverviewCards
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        currency={currency}
        savingsGoal={profile?.savings_goal ?? 0}
        transactionCount={(transactions ?? []).length}
      />

      {/* Today's daily tracker banner */}
      <Link href="/dashboard/daily" className="block mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CalendarDays size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-semibold text-primary-dark">Today&apos;s Spending</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                dailyPct >= 100 ? 'bg-red-50 text-red-600' :
                dailyPct >= 80  ? 'bg-yellow-50 text-yellow-600' :
                                   'bg-green-50 text-green-600'
              }`}>
                {formatCurrency(todaySpent, currency)} spent
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  dailyPct >= 100 ? 'bg-red-500' : dailyPct >= 80 ? 'bg-yellow-400' : 'bg-primary'
                }`}
                style={{ width: `${dailyPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {dailyBudget > 0
                ? `${formatCurrency(Math.max(0, dailyBudget - todaySpent), currency)} remaining of ${formatCurrency(dailyBudget, currency)} daily budget`
                : 'Set up a budget to track daily spending'}
            </p>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={transactions ?? []} currency={currency} />
        <BudgetProgress
          categories={categories}
          transactions={transactions ?? []}
          currency={currency}
        />
      </div>

      <ChatWidget />
    </>
  )
}
