import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementUsage } from '@/lib/ai-usage'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Simple hash for caching identical SMS texts
function hashText(text: string): string {
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

// In-memory cache for receipt parses (process-level, resets on redeploy — good enough)
const receiptCache = new Map<string, { result: unknown; ts: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { text } = await request.json()
  if (!text?.trim()) return Response.json({ error: 'No text provided' }, { status: 400 })

  // Check in-memory cache first (free — no AI call needed)
  const cacheKey = hashText(text.trim())
  const cached = receiptCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return Response.json({ ...cached.result as object, _cached: true })
  }

  // Check usage quota
  const usage = await checkAndIncrementUsage(supabase, user.id, 'receipt')
  if (!usage.allowed) {
    return Response.json(
      { error: 'limit_reached', message: `You've used all ${usage.limit} free receipt parses this month. Upgrade to Pro for unlimited access.`, remaining: 0 },
      { status: 429 }
    )
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `You are a parser for Ghanaian mobile money and bank SMS receipts (MTN MoMo, Vodafone Cash, AirtelTigo Money, GCB, Ecobank, etc.).

Extract the transaction details and return ONLY valid JSON:
- amount: number (always positive)
- type: "expense" or "income" (debit/sent/paid = expense; credit/received = income)
- category: one of: "Food","Transport","Airtime/Data","Books/Stationery","Entertainment","Rent/Hostel","Groceries","Health","Miscellaneous"
- description: short label max 60 chars
- confidence: "high"|"medium"|"low"

If amount cannot be determined: { "error": "Could not parse amount" }

SMS: """${text.trim()}"""

Return ONLY JSON.`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(cleaned)
    // Cache successful parses
    receiptCache.set(cacheKey, { result: parsed, ts: Date.now() })
    return Response.json({ ...parsed, _remaining: usage.remaining })
  } catch {
    return Response.json({ error: 'Failed to parse AI response', raw }, { status: 422 })
  }
}
