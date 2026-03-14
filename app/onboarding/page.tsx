'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Step1, { type Step1Data } from '@/components/onboarding/steps/Step1'
import Step2, { type Step2Data } from '@/components/onboarding/steps/Step2'
import Step3, { type Step3Data } from '@/components/onboarding/steps/Step3'
import Step4, { type Step4Data } from '@/components/onboarding/steps/Step4'
import Step5, { type Step5Data } from '@/components/onboarding/steps/Step5'

type OnboardingData = Step1Data & Step2Data & Step3Data & Step4Data & Step5Data

const STEP_TITLES = [
  'About You',
  'Your Finances',
  'Living & Travel',
  'Spending Habits',
  'Budget Preferences',
]

const STEP_SUBTITLES = [
  'Tell us a bit about yourself',
  'Help us understand your income',
  'Where and how do you get around?',
  'What do you spend most on?',
  'How would you like to track your budget?',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<OnboardingData>>({})
  const [loading, setLoading] = useState(false)

  const update = (stepData: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...stepData }))

  const handleComplete = async (step5Data: Step5Data) => {
    setLoading(true)
    const finalData = { ...data, ...step5Data }
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('profiles').upsert(
      {
        user_id: user.id,
        name: finalData.name,
        age: finalData.age,
        university: finalData.university,
        program: finalData.program,
        year_of_study: finalData.year_of_study,
        monthly_income: finalData.monthly_income,
        income_source: finalData.income_source,
        currency_preference: finalData.currency_preference,
        living_situation: finalData.living_situation,
        has_roommates: finalData.has_roommates,
        transport_mode: finalData.transport_mode,
        savings_goal: finalData.savings_goal,
        budget_period: finalData.budget_period,
        onboarding_completed: true,
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      console.error('Onboarding save error:', error.message, error.code, error.details, error.hint)
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/dashboard')
  }

  const progress = (step / 5) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-mid to-primary flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4 font-bold text-white text-2xl">
            ₵
          </div>
          <h1 className="text-2xl font-bold text-white">CediSmart Setup</h1>
          <p className="text-primary-light text-sm mt-1">Step {step} of 5</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-1.5 mb-8">
          <div
            className="bg-primary-light h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-primary-dark">{STEP_TITLES[step - 1]}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{STEP_SUBTITLES[step - 1]}</p>
          </div>

          {step === 1 && (
            <Step1 defaultValues={data} onNext={(d) => { update(d); setStep(2) }} />
          )}
          {step === 2 && (
            <Step2 defaultValues={data} onNext={(d) => { update(d); setStep(3) }} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <Step3 defaultValues={data} onNext={(d) => { update(d); setStep(4) }} onBack={() => setStep(2)} />
          )}
          {step === 4 && (
            <Step4 defaultValues={data} onNext={(d) => { update(d); setStep(5) }} onBack={() => setStep(3)} />
          )}
          {step === 5 && (
            <Step5 defaultValues={data} onComplete={handleComplete} onBack={() => setStep(4)} loading={loading} />
          )}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'w-6 bg-white' : s < step ? 'w-1.5 bg-primary-light' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
