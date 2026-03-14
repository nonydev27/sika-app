'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('profiles').update({
    name: formData.get('name') as string,
    age: Number(formData.get('age')) || null,
    university: formData.get('university') as string,
    program: formData.get('program') as string,
    year_of_study: Number(formData.get('year_of_study')) || null,
    monthly_income: Number(formData.get('monthly_income')) || null,
    income_source: formData.get('income_source') as string,
    currency_preference: formData.get('currency_preference') as string,
    living_situation: formData.get('living_situation') as string,
    has_roommates: formData.get('has_roommates') === 'true',
    transport_mode: formData.get('transport_mode') as string,
    savings_goal: Number(formData.get('savings_goal')) || null,
    budget_period: formData.get('budget_period') as string,
  }).eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true }
}
