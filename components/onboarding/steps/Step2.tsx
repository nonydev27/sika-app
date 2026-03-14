'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { INCOME_SOURCES, CURRENCY_OPTIONS } from '@/lib/constants'

const schema = z.object({
  monthly_income: z.coerce.number().min(1, 'Enter your monthly income'),
  income_source: z.string().min(1, 'Select income source'),
  currency_preference: z.enum(['GHS', 'USD']),
})

export type Step2Data = z.infer<typeof schema>

export default function Step2({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<Step2Data>
  onNext: (d: Step2Data) => void
  onBack: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { currency_preference: 'GHS', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred currency</label>
        <div className="grid grid-cols-2 gap-3">
          {CURRENCY_OPTIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 border rounded-xl px-4 py-3 cursor-pointer hover:border-primary transition-colors">
              <input {...register('currency_preference')} type="radio" value={c.value} className="accent-primary" />
              <span className="text-sm">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly income / allowance</label>
        <input {...register('monthly_income')} type="number" placeholder="500" className="input-field" />
        {errors.monthly_income && <p className="error-text">{errors.monthly_income.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Main source of income</label>
        <div className="grid grid-cols-2 gap-3">
          {INCOME_SOURCES.map((s) => (
            <label key={s.value} className="flex items-center gap-2 border rounded-xl px-4 py-3 cursor-pointer hover:border-primary transition-colors">
              <input {...register('income_source')} type="radio" value={s.value} className="accent-primary" />
              <span className="text-sm">{s.label}</span>
            </label>
          ))}
        </div>
        {errors.income_source && <p className="error-text">{errors.income_source.message}</p>}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">Back</button>
        <button type="submit" className="btn-primary flex-1">Next</button>
      </div>
    </form>
  )
}
