import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BudgetManager from './BudgetManager'

export default async function BudgetPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: budgets }, { data: profile }] = await Promise.all([
    supabase
      .from('budgets')
      .select('*, budget_categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('currency_preference').eq('user_id', user.id).single(),
  ])

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-dark">Budget Planning</h1>
        <p className="text-gray-500 text-sm mt-1">
          Plan and allocate your funds across categories
        </p>
      </div>
      <BudgetManager
        budgets={budgets ?? []}
        currency={profile?.currency_preference ?? 'GHS'}
      />
    </>
  )
}
