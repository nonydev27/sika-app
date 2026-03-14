'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { CURRENCY_SYMBOL } from '@/lib/constants'

interface Props {
  data: { month: string; spent: number; income: number }[]
  currency: string
}

export default function MonthlyTrend({ data, currency }: Props) {
  const sym = CURRENCY_SYMBOL[currency] ?? currency

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p className="text-sm">Not enough data yet</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${sym}${v}`} />
        <Tooltip
          formatter={(value, name) => [`${sym}${Number(value ?? 0).toFixed(0)}`, String(name)]}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        />
        <Line
          type="monotone"
          dataKey="spent"
          name="Spent"
          stroke="#4988C4"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#4988C4' }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#96CEB4"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#96CEB4' }}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
