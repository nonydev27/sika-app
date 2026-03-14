'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { formatCurrency, getCategoryColor } from '@/lib/utils'
import { GHANA_CATEGORIES } from '@/lib/constants'
import { addTransaction, deleteTransaction } from './actions'
import { CreditCard, X } from 'lucide-react'
import CategoryIcon from '@/components/ui/CategoryIcon'

const schema = z.object({
  type: z.enum(['expense', 'income']),
  category: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  description: z.string().optional(),
  date: z.string().min(1),
})

type FormData = z.infer<typeof schema>

interface Transaction {
  id: string
  category: string
  amount: number
  description: string | null
  date: string
  type: string
}

export default function TransactionList({
  initialTransactions,
  currency,
}: {
  initialTransactions: Transaction[]
  currency: string
}) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const txType = watch('type')

  const onSubmit = (data: FormData) => {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? '')))
    startTransition(async () => {
      await addTransaction(fd)
      reset()
      setShowForm(false)
    })
  }

  const handleDelete = (id: string) => {
    startTransition(() => deleteTransaction(id))
  }

  const filtered = initialTransactions.filter(
    (t) =>
      !filter ||
      t.category.toLowerCase().includes(filter.toLowerCase()) ||
      (t.description ?? '').toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-3 mb-6 flex-wrap" data-tour="tx-toolbar">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search transactions…"
          className="input-field max-w-xs"
          data-tour="tx-search"
        />
        <button onClick={() => setShowForm(!showForm)} className="btn-primary ml-auto" data-tour="tx-add-btn">
          {showForm ? 'Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-primary/20">
          <h3 className="font-semibold text-primary-dark mb-4">New Transaction</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select {...register('type')} className="input-field">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select {...register('category')} className="input-field">
                <option value="">Select category</option>
                {GHANA_CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
                {txType === 'income' && <option value="Allowance">Allowance / Income</option>}
              </select>
              {errors.category && <p className="error-text">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({currency === 'GHS' ? '₵' : '$'})
              </label>
              <input {...register('amount')} type="number" step="0.01" placeholder="0.00" className="input-field" />
              {errors.amount && <p className="error-text">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input {...register('date')} type="date" className="input-field" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <input {...register('description')} placeholder="e.g. Waakye from Accra mall" className="input-field" />
            </div>

            <div className="sm:col-span-2">
              <button type="submit" disabled={isPending} className="btn-primary">
                {isPending ? 'Saving…' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" data-tour="tx-list">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CreditCard size={36} className="mx-auto mb-3 opacity-30" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((tx) => {
              const color = getCategoryColor(tx.category)
              return (
                <div key={tx.id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color + '22' }}
                  >
                    <CategoryIcon category={tx.category} size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {tx.description || tx.category}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tx.category} · {format(new Date(tx.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold flex-shrink-0 ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </p>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="text-gray-300 hover:text-red-400 ml-2 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
