import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementUsage } from '@/lib/ai-usage'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Check usage quota
  const usage = await checkAndIncrementUsage(supabase, user.id, 'chat')
  if (!usage.allowed) {
    return Response.json(
      { error: 'limit_reached', message: `You've used all ${usage.limit} free chat messages this month. Upgrade to Pro for unlimited access.`, remaining: 0 },
      { status: 429 }
    )
  }

  const { message, conversationId } = await request.json()

  const [{ data: profile }, { data: budgets }, { data: transactions }, { data: conversation }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase
        .from('budgets')
        .select('*, budget_categories(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(25),
      conversationId
        ? supabase.from('ai_conversations').select('messages').eq('id', conversationId).single()
        : Promise.resolve({ data: null }),
    ])

  const currency = profile?.currency_preference === 'USD' ? 'USD ($)' : 'GHS (₵)'
  const totalSpent = (transactions ?? [])
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const systemPrompt = `You are Cedi, a friendly personal finance assistant for Ghanaian university students. You are built into CediSmart, a budget tracking app.

STUDENT PROFILE:
- Name: ${profile?.name ?? 'Student'}
- University: ${profile?.university ?? 'Unknown'}
- Programme: ${profile?.program ?? 'Unknown'}, Year ${profile?.year_of_study ?? '?'}
- Monthly income: ${currency} ${profile?.monthly_income ?? 0} from ${profile?.income_source ?? 'unknown source'}
- Living: ${profile?.living_situation ?? 'unknown'} ${profile?.has_roommates ? 'with roommates' : 'alone'}
- Transport: ${profile?.transport_mode ?? 'unknown'}
- Savings goal: ${currency} ${profile?.savings_goal ?? 0}/month
- Budget period: ${profile?.budget_period ?? 'monthly'}

CURRENT BUDGET:
${budgets?.[0] ? JSON.stringify(budgets[0], null, 2) : 'No budget set up yet'}

RECENT TRANSACTIONS (last 25):
Total spent: ${currency} ${totalSpent}
${transactions && transactions.length > 0 ? JSON.stringify(transactions, null, 2) : 'No transactions yet'}

INSTRUCTIONS:
- Respond warmly and encouragingly in a way that resonates with Ghanaian students
- Use ${currency} for all amounts — never use other currencies unless asked
- Reference real Ghanaian context: trotro, waakye, MoMo (Mobile Money), market, chop bar, etc.
- Give specific, actionable advice based on the student's actual data above
- Keep responses concise (under 200 words unless the question requires detail)
- If asked about spending patterns, reference the actual transactions above
- Celebrate good financial habits! Be motivating.
- You can suggest specific local savings strategies (e.g., cooking vs buying waakye, grouping trotro trips)
- If no budget/transactions exist, encourage them to set one up and explain how`

  const history = (conversation?.messages as { role: string; content: string }[]) ?? []
  const messages = [
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: message },
  ]

  const encoder = new TextEncoder()
  let savedConversationId = conversationId

  const readable = new ReadableStream({
    async start(controller) {
      let fullText = ''

      try {
        const stream = anthropic.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        })

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }

      // Persist conversation after streaming
      const updatedMessages = [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: fullText },
      ]

      if (savedConversationId) {
        await supabase
          .from('ai_conversations')
          .update({ messages: updatedMessages })
          .eq('id', savedConversationId)
      } else {
        const { data: newConv } = await supabase
          .from('ai_conversations')
          .insert({ user_id: user.id, messages: updatedMessages })
          .select('id')
          .single()
        savedConversationId = newConv?.id
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Conversation-Id': savedConversationId ?? '',
      'X-Usage-Remaining': String(usage.remaining),
      'X-Usage-Limit': String(usage.limit),
    },
  })
}
