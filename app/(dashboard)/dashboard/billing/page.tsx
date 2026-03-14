import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: plan }, { data: usage }] = await Promise.all([
    supabase.from('profiles').select('currency_preference').eq('user_id', user.id).single(),
    supabase.from('user_plans').select('*').eq('user_id', user.id).single(),
    supabase.from('ai_usage').select('*').eq('user_id', user.id)
      .eq('month', new Date().toISOString().slice(0, 7)).single(),
  ])

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-dark">Billing & Plan</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your subscription and AI usage</p>
      </div>
      <BillingClient
        plan={plan?.plan ?? 'free'}
        proExpiresAt={plan?.pro_expires_at ?? null}
        usage={usage ?? null}
        currency={profile?.currency_preference ?? 'GHS'}
      />
    </>
  )
}
