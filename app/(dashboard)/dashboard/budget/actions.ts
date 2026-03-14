'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBudget(data: {
  name: string
  period_type: string
  start_date: string
  end_date: string
  total_amount: number
  categories: { category_name: string; allocated_amount: number; color: string }[]
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: budget, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      name: data.name,
      period_type: data.period_type,
      start_date: data.start_date,
      end_date: data.end_date,
      total_amount: data.total_amount,
    })
    .select()
    .single()

  if (error || !budget) return { error: error?.message }

  if (data.categories.length > 0) {
    await supabase.from('budget_categories').insert(
      data.categories.map((c) => ({ ...c, budget_id: budget.id }))
    )
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/budget')
  return { success: true }
}

export async function deleteBudget(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/budget')
}
