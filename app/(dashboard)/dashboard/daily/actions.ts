'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addDailyTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('transactions').insert({
    user_id: user.id,
    category: formData.get('category') as string,
    amount: Number(formData.get('amount')),
    description: (formData.get('description') as string) || null,
    date: new Date().toISOString().split('T')[0],
    type: formData.get('type') as string,
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/daily')
  revalidatePath('/dashboard/stats')
  revalidatePath('/dashboard/transactions')
}

export async function deleteDailyTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/daily')
  revalidatePath('/dashboard/stats')
  revalidatePath('/dashboard/transactions')
}
