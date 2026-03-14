import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InsightsClient from './InsightsClient'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('currency_preference, name')
    .eq('user_id', user.id)
    .single()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-dark">AI Insights</h1>
        <p className="text-gray-500 text-sm mt-1">
          Personalised analysis of your spending patterns and savings opportunities
        </p>
      </div>
      <InsightsClient currency={profile?.currency_preference ?? 'GHS'} name={profile?.name ?? 'Student'} />
    </>
  )
}
