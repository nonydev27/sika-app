import { SupabaseClient } from '@supabase/supabase-js'

export const FREE_LIMITS = {
  chat: 30,       // messages/month
  insights: 5,    // full analyses/month
  receipt: 50,    // receipt parses/month (generous — cheap calls)
} as const

export type UsageType = keyof typeof FREE_LIMITS

export interface UsageStatus {
  allowed: boolean
  used: number
  limit: number
  remaining: number
  isPro: boolean
}

export async function checkAndIncrementUsage(
  supabase: SupabaseClient,
  userId: string,
  type: UsageType
): Promise<UsageStatus> {
  const month = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  // Get plan
  const { data: planRow } = await supabase
    .from('user_plans')
    .select('plan, pro_expires_at')
    .eq('user_id', userId)
    .single()

  const isPro =
    planRow?.plan === 'pro' &&
    (!planRow.pro_expires_at || new Date(planRow.pro_expires_at) > new Date())

  // Pro users: always allowed, no increment needed for limits
  if (isPro) {
    // Still track usage for analytics
    await supabase.rpc('increment_ai_usage', { p_user_id: userId, p_month: month, p_type: type })
    return { allowed: true, used: 0, limit: Infinity, remaining: Infinity, isPro: true }
  }

  // Get or create usage row
  const { data: usage } = await supabase
    .from('ai_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .single()

  const col = `${type}_count` as 'chat_count' | 'insights_count' | 'receipt_count'
  const used = usage?.[col] ?? 0
  const limit = FREE_LIMITS[type]

  if (used >= limit) {
    return { allowed: false, used, limit, remaining: 0, isPro: false }
  }

  // Increment
  if (usage) {
    await supabase
      .from('ai_usage')
      .update({ [col]: used + 1 })
      .eq('user_id', userId)
      .eq('month', month)
  } else {
    await supabase.from('ai_usage').insert({
      user_id: userId,
      month,
      [`${type}_count`]: 1,
    })
  }

  return { allowed: true, used: used + 1, limit, remaining: limit - used - 1, isPro: false }
}

export async function getUsageStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<{ chat: UsageStatus; insights: UsageStatus; receipt: UsageStatus; isPro: boolean }> {
  const month = new Date().toISOString().slice(0, 7)

  const [{ data: planRow }, { data: usage }] = await Promise.all([
    supabase.from('user_plans').select('plan, pro_expires_at').eq('user_id', userId).single(),
    supabase.from('ai_usage').select('*').eq('user_id', userId).eq('month', month).single(),
  ])

  const isPro =
    planRow?.plan === 'pro' &&
    (!planRow.pro_expires_at || new Date(planRow.pro_expires_at) > new Date())

  const make = (type: UsageType): UsageStatus => {
    const col = `${type}_count` as 'chat_count' | 'insights_count' | 'receipt_count'
    const used = usage?.[col] ?? 0
    const limit = FREE_LIMITS[type]
    return isPro
      ? { allowed: true, used, limit: Infinity, remaining: Infinity, isPro: true }
      : { allowed: used < limit, used, limit, remaining: Math.max(0, limit - used), isPro: false }
  }

  return { chat: make('chat'), insights: make('insights'), receipt: make('receipt'), isPro }
}
