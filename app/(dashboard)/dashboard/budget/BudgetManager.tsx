'use client'

import { useState, useTransition } from 'react'
import { GHANA_CATEGORIES, BUDGET_PERIODS } from '@/lib/constants'
import { formatCurrency, getCategoryColor } from '@/lib/utils'
import { createBudget, deleteBudget } from './actions'
import { format } from 'date-fns'
import { PieChart, X } from 'lucide-react'
import CategoryIcon from '@/components/ui/CategoryIcon'

interface Budget {
  id: string
  name: string
  period_type: string
  start_date: string
  end_date: string
  total_amount: number
  budget_categories: { id: string; category_name: string; allocated_amount: number; color: string }[]
}

export default function BudgetManager({
  budgets,
  currency,
}: {
  budgets: Budget[]
  currency: string
}) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [name, setName] = useState('')
  const [period, setPeriod] = useState('monthly')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [allocations, setAllocations] = useState<Record<string, number>>({})

  const totalAllocated = Object.values(allocations).reduce((s, v) => s + (v || 0), 0)

  const handleCreate = () => {
    const categories = Object.entries(allocations)
      .filter(([, v]) => v > 0)
      .map(([name, amount]) => ({
        category_name: name,
        allocated_amount: amount,
        color: getCategoryColor(name),
      }))

    startTransition(async () => {
      await createBudget({
        name: name || `${period.charAt(0).toUpperCase() + period.slice(1)} Budget`,
        period_type: period,
        start_date: startDate,
        end_date: endDate || startDate,
        total_amount: totalAllocated,
        categories,
      })
      setShowForm(false)
      setAllocations({})
      setName('')
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this budget?')) {
      startTransition(() => deleteBudget(id))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div />
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Budget'}
        </button>
      </div>

      {/* Budget creation form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-primary/20">
          <h3 className="font-semibold text-primary-dark mb-5">Create Budget</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. March Budget"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-field">
                {BUDGET_PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Category allocations */}
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Allocate per category</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {GHANA_CATEGORIES.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3 border rounded-xl px-4 py-2">
                <CategoryIcon category={cat.name} size={15} style={{ color: getCategoryColor(cat.name) }} />
                <span className="text-sm flex-1">{cat.name}</span>
                <input
                  type="number"
                  placeholder="0"
                  value={allocations[cat.name] ?? ''}
                  onChange={(e) =>
                    setAllocations((prev) => ({ ...prev, [cat.name]: Number(e.target.value) }))
                  }
                  className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Total: <span className="font-bold text-primary-dark">{formatCurrency(totalAllocated, currency)}</span>
            </p>
            <button
              onClick={handleCreate}
              disabled={isPending || totalAllocated === 0}
              className="btn-primary"
            >
              {isPending ? 'Creating…' : 'Create Budget'}
            </button>
          </div>
        </div>
      )}

      {/* Existing budgets */}
      {budgets.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-400">
          <PieChart size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No budgets yet</p>
          <p className="text-sm mt-1">Create your first budget to start tracking</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-primary-dark">{budget.name}</h3>
                  <p className="text-xs text-gray-400 capitalize">
                    {budget.period_type} · {format(new Date(budget.start_date), 'MMM d')} – {format(new Date(budget.end_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-primary-dark">{formatCurrency(budget.total_amount, currency)}</p>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {budget.budget_categories.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {budget.budget_categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="rounded-xl px-3 py-2 text-xs"
                      style={{ backgroundColor: cat.color + '18', borderLeft: `3px solid ${cat.color}` }}
                    >
                      <p className="font-medium text-gray-700">{cat.category_name}</p>
                      <p className="text-gray-500">{formatCurrency(cat.allocated_amount, currency)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
