'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TRANSPORT_MODES } from '@/lib/constants'

const schema = z.object({
  living_situation: z.enum(['on-campus', 'off-campus']),
  has_roommates: z.boolean(),
  transport_mode: z.string().min(1, 'Select transport mode'),
})

export type Step3Data = z.infer<typeof schema>

export default function Step3({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<Step3Data>
  onNext: (d: Step3Data) => void
  onBack: () => void
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(schema),
    defaultValues: { living_situation: 'on-campus', has_roommates: false, ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Where do you live?</label>
        <div className="grid grid-cols-2 gap-3">
          {(['on-campus', 'off-campus'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 border rounded-xl px-4 py-3 cursor-pointer hover:border-primary transition-colors">
              <input {...register('living_situation')} type="radio" value={v} className="accent-primary" />
              <span className="text-sm capitalize">{v.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input {...register('has_roommates')} type="checkbox" className="w-5 h-5 accent-primary rounded" />
          <span className="text-sm font-medium text-gray-700">I share accommodation with roommates</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How do you usually commute?</label>
        <div className="grid grid-cols-2 gap-3">
          {TRANSPORT_MODES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 border rounded-xl px-4 py-3 cursor-pointer hover:border-primary transition-colors">
              <input {...register('transport_mode')} type="radio" value={t.value} className="accent-primary" />
              <span className="text-sm">{t.label}</span>
            </label>
          ))}
        </div>
        {errors.transport_mode && <p className="error-text">{errors.transport_mode.message}</p>}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">Back</button>
        <button type="submit" className="btn-primary flex-1">Next</button>
      </div>
    </form>
  )
}
