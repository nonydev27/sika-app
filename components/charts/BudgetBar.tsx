'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CURRENCY_SYMBOL } from '@/lib/constants'

interface Props {
  data: { category: string; allocated: number; spent: number }[]
  currency: string
}

export default function BudgetBar({ data, currency }: Props) {
  const sym = CURRENCY_SYMBOL[currency] ?? currency

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p className="text-sm">Set up a budget to see comparisons</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="category" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${sym}${v}`} />
        <Tooltip
          formatter={(value, name) => [`${sym}${Number(value ?? 0).toFixed(0)}`, String(name)]}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        />
        <Legend iconType="circle" iconSize={8} />
        <Bar dataKey="allocated" name="Budget" fill="#BDE8F5" radius={[4, 4, 0, 0]} />
        <Bar dataKey="spent" name="Spent" fill="#4988C4" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
