import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SavingsClient from './SavingsClient'

export default async function SavingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: accounts }, { data: profile }] = await Promise.all([
    supabase
      .from('savings_accounts')
      .select('*, savings_transactions(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    supabase.from('profiles').select('currency_preference, savings_goal').eq('user_id', user.id).single(),
  ])

  const currency = profile?.currency_preference ?? 'GHS'
  const savingsGoal = Number(profile?.savings_goal ?? 0)

  const normalised = (accounts ?? []).map((a) => ({
    ...a,
    current_amount: Number(a.current_amount),
    target_amount: Number(a.target_amount),
    savings_transactions: (a.savings_transactions ?? []).map((t: { amount: number | string; [key: string]: unknown }) => ({
      ...t,
      amount: Number(t.amount),
    })),
  }))

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-dark">Savings</h1>
        <p className="text-gray-500 text-sm mt-1">Track your savings goals and deposits</p>
      </div>
      <SavingsClient accounts={normalised} currency={currency} savingsGoal={savingsGoal} />
    </>
  )
}
