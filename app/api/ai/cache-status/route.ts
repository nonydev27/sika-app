import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: cached } = await supabase
    .from('ai_insights_cache')
    .select('cached_at')
    .eq('user_id', user.id)
    .single()

  if (!cached) return Response.json({ hasFreshCache: false, cachedAt: null })

  const ageHours = (Date.now() - new Date(cached.cached_at).getTime()) / 3_600_000
  return Response.json({
    hasFreshCache: ageHours < 24,
    isVeryFresh: ageHours < 6,
    cachedAt: cached.cached_at,
    ageHours: Math.round(ageHours),
  })
}
