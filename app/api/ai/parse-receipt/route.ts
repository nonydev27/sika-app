import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementUsage } from '@/lib/ai-usage'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function hashText(text: string): string {
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

const receiptCache = new Map<string, { result: unknown; ts: number }>()
const CACHE_TTL = 1000 * 60 * 60

// Fuzzy name match — normalise, split into tokens, check overlap
function namesMatch(profileName: string, receiptName: string): boolean {
  const normalise = (s: string) =>
    s.toLowerCase().replace(/[^a-z\s]/g, '').trim()
  const tokens = (s: string) => normalise(s).split(/\s+/).filter(Boolean)

  const a = tokens(profileName)
  const b = tokens(receiptName)
  if (a.length === 0 || b.length === 0) return false

  // At least one token must match exactly
  const overlap = a.filter((t) => b.includes(t))
  return overlap.length >= 1
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { text, context } = await request.json()
  if (!text?.trim()) return Response.json({ error: 'No text provided' }, { status: 400 })

  // Fetch profile name for savings name-matching
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('user_id', user.id)
    .single()
  const profileName = profile?.name ?? ''

  // Check in-memory cache
  const cacheKey = hashText(text.trim())
  const cached = receiptCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    const result = cached.result as Record<string, unknown>
    // Still apply name-match logic on cached results if savings context
    if (context === 'savings' && result.recipientName) {
      const matched = profileName ? namesMatch(profileName, String(result.recipientName)) : false
      return Response.json({ ...result, _cached: true, suggestedSavingsType: matched ? 'deposit' : 'withdrawal', nameMatched: matched, profileName })
    }
    return Response.json({ ...result, _cached: true })
  }

  const usage = await checkAndIncrementUsage(supabase, user.id, 'receipt')
  if (!usage.allowed) {
    return Response.json(
      { error: 'limit_reached', message: `You've used all ${usage.limit} free receipt parses this month. Upgrade to Pro for unlimited access.`, remaining: 0 },
      { status: 429 }
    )
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `You are a parser for Ghanaian mobile money and bank SMS receipts (MTN MoMo, Vodafone Cash, AirtelTigo Money, GCB, Ecobank, etc.).

Extract the transaction details and return ONLY valid JSON with these fields:
- amount: number (always positive)
- type: "expense" or "income" (debit/sent/paid = expense; credit/received = income)
- category: one of: "Food","Transport","Airtime/Data","Books/Stationery","Entertainment","Rent/Hostel","Groceries","Health","Miscellaneous"
- description: short label max 60 chars
- confidence: "high"|"medium"|"low"
- recipientName: string | null — the name of the person who RECEIVED the money (null if not present)
- senderName: string | null — the name of the person who SENT the money (null if not present)

If amount cannot be determined: { "error": "Could not parse amount" }

SMS: """${text.trim()}"""

Return ONLY JSON.`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(cleaned)

    receiptCache.set(cacheKey, { result: parsed, ts: Date.now() })

    // Savings context: determine deposit vs withdrawal by name match
    if (context === 'savings' && !parsed.error) {
      // If the receipt shows money was RECEIVED by someone with the user's name → deposit (money came to them)
      // If the receipt shows money was SENT to someone else → withdrawal
      const receiverMatch = parsed.recipientName && profileName
        ? namesMatch(profileName, String(parsed.recipientName))
        : false
      const senderMatch = parsed.senderName && profileName
        ? namesMatch(profileName, String(parsed.senderName))
        : false

      let suggestedSavingsType: 'deposit' | 'withdrawal'
      let nameMatched = false
      let matchReason = ''

      if (parsed.type === 'income' || receiverMatch) {
        // Money came in / user is the recipient → deposit into savings
        suggestedSavingsType = 'deposit'
        nameMatched = receiverMatch
        matchReason = receiverMatch ? `Recipient "${parsed.recipientName}" matches your name` : 'Transaction is a credit'
      } else {
        // Money went out / user sent it → withdrawal from savings
        suggestedSavingsType = 'withdrawal'
        nameMatched = senderMatch
        matchReason = senderMatch ? `Sender "${parsed.senderName}" matches your name` : 'Transaction is a debit'
      }

      return Response.json({ ...parsed, _remaining: usage.remaining, suggestedSavingsType, nameMatched, matchReason })
    }

    return Response.json({ ...parsed, _remaining: usage.remaining })
  } catch {
    return Response.json({ error: 'Failed to parse AI response', raw }, { status: 422 })
  }
}
