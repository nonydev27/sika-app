import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import BackgroundAnalysis from '@/components/dashboard/BackgroundAnalysis'
import AppTour from '@/components/dashboard/AppTour'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { count: txCount }, { data: cached }] = await Promise.all([
    supabase.from('profiles').select('name, university, onboarding_completed').eq('user_id', user.id).single(),
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('ai_insights_cache').select('cached_at').eq('user_id', user.id).single(),
  ])

  const hasEnoughData = (txCount ?? 0) >= 5
  const cacheAgeHours = cached
    ? (Date.now() - new Date(cached.cached_at).getTime()) / 3_600_000
    : Infinity
  const shouldRunBackground = hasEnoughData && cacheAgeHours > 6

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar profile={profile} />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      </main>
      {shouldRunBackground && <BackgroundAnalysis />}
      <AppTour autoStart={!!profile?.onboarding_completed} />
    </div>
  )
}
