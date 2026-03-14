'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { BUDGET_PERIODS } from '@/lib/constants'
import { CheckCircle } from 'lucide-react'

const schema = z.object({
  budget_period: z.enum(['weekly', 'monthly', 'semester']),
  alerts_enabled: z.boolean(),
})

export type Step5Data = z.infer<typeof schema>

export default function Step5({
  defaultValues,
  onComplete,
  onBack,
  loading,
}: {
  defaultValues: Partial<Step5Data>
  onComplete: (d: Step5Data) => void
  onBack: () => void
  loading: boolean
}) {
  const { register, handleSubmit } = useForm<Step5Data>({
    defaultValues: { budget_period: 'monthly', alerts_enabled: true, ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onComplete)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred budget period</label>
        <div className="grid grid-cols-3 gap-3">
          {BUDGET_PERIODS.map((p) => (
            <label key={p.value} className="flex flex-col items-center gap-1 border rounded-xl px-3 py-4 cursor-pointer hover:border-primary transition-colors text-center">
              <input {...register('budget_period')} type="radio" value={p.value} className="accent-primary mb-1" />
              <span className="text-sm font-medium">{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-primary-light/30 border border-primary-light rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input {...register('alerts_enabled')} type="checkbox" className="w-5 h-5 accent-primary rounded mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-800">Enable budget alerts</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Get notified when you&apos;re approaching 80% of a category budget
            </p>
          </div>
        </label>
      </div>

      <div className="bg-primary-dark/5 rounded-xl p-5 flex items-center gap-4">
        <CheckCircle size={32} className="text-primary flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-800">You&apos;re all set!</p>
          <p className="text-xs text-gray-500 mt-0.5">
            We&apos;ll personalise your dashboard based on your answers
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">Back</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Setting up…' : 'Go to Dashboard'}
        </button>
      </div>
    </form>
  )
}
