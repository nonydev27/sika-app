'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getCategoryColor } from '@/lib/utils'
import { CURRENCY_SYMBOL } from '@/lib/constants'

interface Props {
  data: { category: string; amount: number }[]
  currency: string
}

export default function SpendingPie({ data, currency }: Props) {
  const sym = CURRENCY_SYMBOL[currency] ?? currency

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p className="text-sm">No expense data</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={90}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.category} fill={getCategoryColor(entry.category)} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${sym}${Number(value ?? 0).toFixed(2)}`, '']}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        />
        <Legend iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  )
}
