'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UNIVERSITIES } from '@/lib/constants'

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  age: z.coerce.number().min(16).max(45),
  university: z.string().min(1, 'Select your university'),
  program: z.string().min(2, 'Enter your program'),
  year_of_study: z.coerce.number().min(1).max(8),
})

export type Step1Data = z.infer<typeof schema>

export default function Step1({ defaultValues, onNext }: { defaultValues: Partial<Step1Data>; onNext: (d: Step1Data) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
        <input {...register('name')} placeholder="Kwame Mensah" className="input-field" />
        {errors.name && <p className="error-text">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
        <input {...register('age')} type="number" placeholder="20" className="input-field" />
        {errors.age && <p className="error-text">{errors.age.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
        <select {...register('university')} className="input-field">
          <option value="">Select your university</option>
          {UNIVERSITIES.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        {errors.university && <p className="error-text">{errors.university.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Programme / Course</label>
        <input {...register('program')} placeholder="BSc Computer Science" className="input-field" />
        {errors.program && <p className="error-text">{errors.program.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Year of study</label>
        <select {...register('year_of_study')} className="input-field">
          {[1, 2, 3, 4, 5, 6].map((y) => (
            <option key={y} value={y}>Year {y}</option>
          ))}
        </select>
        {errors.year_of_study && <p className="error-text">{errors.year_of_study.message}</p>}
      </div>

      <button type="submit" className="btn-primary w-full">Next</button>
    </form>
  )
}
