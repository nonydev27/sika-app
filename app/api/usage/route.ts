import { createClient } from '@/lib/supabase/server'
import { getUsageStatus } from '@/lib/ai-usage'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const usage = await getUsageStatus(supabase, user.id)
  return Response.json(usage)
}
