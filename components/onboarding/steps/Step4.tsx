'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GHANA_CATEGORIES } from '@/lib/constants'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { getCategoryColor } from '@/lib/utils'

const schema = z.object({
  top_categories: z.array(z.string()).min(1, 'Pick at least one category'),
  savings_goal: z.coerce.number().min(0, 'Enter a savings goal (can be 0)'),
  biggest_challenge: z.string().min(1, 'Select your biggest challenge'),
})

export type Step4Data = z.infer<typeof schema>

const CHALLENGES = [
  'Sticking to a budget',
  'Unexpected expenses',
  'Sending money home',
  'Data/airtime spending',
  'Food costs',
  'Transport costs',
  'Social pressure (outings)',
]

export default function Step4({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<Step4Data>
  onNext: (d: Step4Data) => void
  onBack: () => void
}) {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<Step4Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { top_categories: [], savings_goal: 0, ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Where do you spend most? <span className="text-gray-400">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Controller
            control={control}
            name="top_categories"
            render={({ field }) => (
              <>
                {GHANA_CATEGORIES.map((cat) => {
                  const checked = field.value.includes(cat.name)
                  const color = getCategoryColor(cat.name)
                  return (
                    <label
                      key={cat.name}
                      className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer transition-colors ${
                        checked ? 'border-primary bg-primary-light/30' : 'hover:border-primary'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, cat.name])
                          } else {
                            field.onChange(field.value.filter((v: string) => v !== cat.name))
                          }
                        }}
                        className="accent-primary"
                      />
                      <CategoryIcon category={cat.name} size={14} style={{ color }} />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  )
                })}
              </>
            )}
          />
        </div>
        {errors.top_categories && <p className="error-text">{errors.top_categories.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Biggest financial challenge</label>
        <select {...register('biggest_challenge')} className="input-field">
          <option value="">Select one</option>
          {CHALLENGES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.biggest_challenge && <p className="error-text">{errors.biggest_challenge.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly savings goal (GHS)</label>
        <input {...register('savings_goal')} type="number" placeholder="100" className="input-field" />
        {errors.savings_goal && <p className="error-text">{errors.savings_goal.message}</p>}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">Back</button>
        <button type="submit" className="btn-primary flex-1">Next</button>
      </div>
    </form>
  )
}
