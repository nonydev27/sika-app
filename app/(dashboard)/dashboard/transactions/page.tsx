import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TransactionList from './TransactionList'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: transactions }, { data: profile }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false }),
    supabase.from('profiles').select('currency_preference').eq('user_id', user.id).single(),
  ])

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-dark">Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">
          {transactions?.length ?? 0} transactions recorded
        </p>
      </div>
      <TransactionList
        initialTransactions={transactions ?? []}
        currency={profile?.currency_preference ?? 'GHS'}
      />
    </>
  )
}
