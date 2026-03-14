import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatementClient from './StatementClient'

export default async function StatementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('currency_preference, name, university, budget_period')
    .eq('user_id', user.id)
    .single()

  // Get earliest transaction date for date range defaults
  const { data: earliest } = await supabase
    .from('transactions')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: true })
    .limit(1)
    .single()

  const firstDate = earliest?.date ?? new Date().toISOString().split('T')[0]

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-dark">Statement Export</h1>
        <p className="text-gray-500 text-sm mt-1">Generate and download your transaction history</p>
      </div>
      <StatementClient
        currency={profile?.currency_preference ?? 'GHS'}
        name={profile?.name ?? ''}
        firstDate={firstDate}
      />
    </>
  )
}
