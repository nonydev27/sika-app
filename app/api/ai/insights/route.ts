import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementUsage } from '@/lib/ai-usage'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const CACHE_TTL_HOURS = 24

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { force } = await request.json().catch(() => ({ force: false }))

  // Check cache first (skip if force refresh)
  if (!force) {
    const { data: cached } = await supabase
      .from('ai_insights_cache')
      .select('data, cached_at')
      .eq('user_id', user.id)
      .single()

    if (cached) {
      const ageHours = (Date.now() - new Date(cached.cached_at).getTime()) / 3_600_000
      if (ageHours < CACHE_TTL_HOURS) {
        return Response.json({ ...cached.data, _cached: true, _cachedAt: cached.cached_at })
      }
    }
  }

  // Check usage quota (only counts against limit when actually calling AI)
  const usage = await checkAndIncrementUsage(supabase, user.id, 'insights')
  if (!usage.allowed) {
    return Response.json(
      { error: 'limit_reached', message: `You've used all ${usage.limit} free insight analyses this month. Upgrade to Pro for unlimited access.`, remaining: 0 },
      { status: 429 }
    )
  }

  const [{ data: profile }, { data: budgets }, { data: transactions }, { data: savings }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('budgets').select('*, budget_categories(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('savings_accounts').select('*, savings_transactions(*)').eq('user_id', user.id),
    ])

  const currency = profile?.currency_preference === 'USD' ? 'USD ($)' : 'GHS (₵)'
  const allTx = (transactions ?? []).map((t) => ({ ...t, amount: Number(t.amount) }))

  const totalSpent = allTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalIncome = allTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)

  const byCategory = allTx.filter((t) => t.type === 'expense').reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount; return acc
  }, {})

  const byDow = allTx.filter((t) => t.type === 'expense').reduce<Record<string, number>>((acc, t) => {
    const dow = new Date(t.date).toLocaleDateString('en-GH', { weekday: 'long' })
    acc[dow] = (acc[dow] ?? 0) + t.amount; return acc
  }, {})

  const monthlyTrend = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (3 - i))
    const month = d.toISOString().slice(0, 7)
    const monthTx = allTx.filter((t) => t.date.startsWith(month))
    return {
      month,
      spent: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    }
  })

  const prompt = `You are Cedi, a financial analyst AI for Ghanaian university students. Analyse this student's complete financial data and return a JSON object with deep insights.

STUDENT PROFILE: ${JSON.stringify(profile)}
TRANSACTIONS (${allTx.length} records): Total spent: ${currency} ${totalSpent.toFixed(2)}, Total income: ${currency} ${totalIncome.toFixed(2)}
By category: ${JSON.stringify(byCategory)}
By day of week: ${JSON.stringify(byDow)}
Monthly trend: ${JSON.stringify(monthlyTrend)}
Recent 30 transactions: ${JSON.stringify(allTx.slice(0, 30))}
BUDGETS: ${JSON.stringify(budgets)}
SAVINGS ACCOUNTS: ${JSON.stringify(savings)}

Return ONLY valid JSON:
{
  "healthScore": <0-100>,
  "healthLabel": <"Excellent"|"Good"|"Fair"|"Needs Work">,
  "healthSummary": <string>,
  "patterns": [{ "type": <"warning"|"info"|"success">, "title": <string>, "detail": <string> }],
  "recommendations": [{ "priority": <"high"|"medium"|"low">, "title": <string>, "detail": <string>, "saving": <number|null> }],
  "savingsTiming": { "bestDays": <string[]>, "worstDays": <string[]>, "advice": <string> },
  "topRisk": <string>,
  "quickWins": [<string>, <string>, <string>]
}
Use Ghanaian context. Return ONLY JSON.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(cleaned)

    // Cache the result
    await supabase.from('ai_insights_cache').upsert(
      { user_id: user.id, data: parsed, cached_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

    return Response.json({ ...parsed, _cached: false, _remaining: usage.remaining })
  } catch {
    return Response.json({ error: 'Parse failed', raw }, { status: 422 })
  }
}
