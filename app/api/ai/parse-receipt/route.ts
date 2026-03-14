import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { text } = await request.json()
  if (!text?.trim()) return Response.json({ error: 'No text provided' }, { status: 400 })

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are a parser for Ghanaian mobile money and bank SMS receipts (MTN MoMo, Vodafone Cash, AirtelTigo Money, GCB, Ecobank, etc.).

Extract the transaction details from this message and return ONLY valid JSON with these fields:
- amount: number (the transaction amount, always positive)
- type: "expense" or "income" (debit/payment/sent/paid = expense; credit/received/deposited = income)
- category: one of exactly these values: "Food", "Transport", "Airtime/Data", "Books/Stationery", "Entertainment", "Rent/Hostel", "Groceries", "Health", "Miscellaneous"
  - Airtime/data top-up → "Airtime/Data"
  - Payment to merchant/shop → "Miscellaneous" unless context is clear
  - Transfer sent → "Miscellaneous"
  - Transfer received → "Miscellaneous"
- description: short human-readable label (e.g. "MoMo payment to Kofi", "MTN airtime top-up", "GCB transfer received") — max 60 chars
- confidence: "high" | "medium" | "low"

If you cannot determine the amount, return { "error": "Could not parse amount" }.

SMS message:
"""
${text.trim()}
"""

Return ONLY the JSON object, no explanation.`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(cleaned)
    return Response.json(parsed)
  } catch {
    return Response.json({ error: 'Failed to parse AI response', raw }, { status: 422 })
  }
}
