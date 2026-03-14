'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSavingsAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('savings_accounts').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    target_amount: Number(formData.get('target_amount') ?? 0),
    current_amount: 0,
    color: formData.get('color') as string ?? '#4988C4',
    icon: formData.get('icon') as string ?? 'piggy-bank',
  })
  revalidatePath('/dashboard/savings')
}

export async function deleteSavingsAccount(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('savings_accounts').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/dashboard/savings')
}

export async function addSavingsTransaction(accountId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const amount = Number(formData.get('amount'))
  const type = formData.get('type') as 'deposit' | 'withdrawal'
  const description = (formData.get('description') as string) || null
  const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0]

  // Insert transaction
  await supabase.from('savings_transactions').insert({
    account_id: accountId,
    user_id: user.id,
    amount,
    type,
    description,
    date,
  })

  // Update account balance
  const { data: account } = await supabase
    .from('savings_accounts')
    .select('current_amount')
    .eq('id', accountId)
    .single()

  const current = Number(account?.current_amount ?? 0)
  const newAmount = type === 'deposit' ? current + amount : Math.max(0, current - amount)

  await supabase
    .from('savings_accounts')
    .update({ current_amount: newAmount })
    .eq('id', accountId)

  revalidatePath('/dashboard/savings')
  revalidatePath('/dashboard')
}

export async function deleteSavingsTransaction(txId: string, accountId: string, amount: number, type: 'deposit' | 'withdrawal') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('savings_transactions').delete().eq('id', txId).eq('user_id', user.id)

  // Reverse the balance change
  const { data: account } = await supabase
    .from('savings_accounts')
    .select('current_amount')
    .eq('id', accountId)
    .single()

  const current = Number(account?.current_amount ?? 0)
  const newAmount = type === 'deposit' ? Math.max(0, current - amount) : current + amount

  await supabase.from('savings_accounts').update({ current_amount: newAmount }).eq('id', accountId)
  revalidatePath('/dashboard/savings')
  revalidatePath('/dashboard')
}
