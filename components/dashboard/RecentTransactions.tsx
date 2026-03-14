import { formatCurrency, getCategoryColor } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import CategoryIcon from '@/components/ui/CategoryIcon'

interface Transaction {
  id: string
  category: string
  amount: number
  description: string | null
  date: string
  type: string
}

export default function RecentTransactions({
  transactions,
  currency,
}: {
  transactions: Transaction[]
  currency: string
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-primary-dark">Recent Transactions</h2>
        <Link href="/dashboard/transactions" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <CreditCard size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No transactions yet</p>
          <p className="text-xs mt-1">Add your first expense to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: getCategoryColor(tx.category) + '22' }}
              >
                <CategoryIcon
                  category={tx.category}
                  size={16}
                  className="opacity-70"
                  style={{ color: getCategoryColor(tx.category) }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {tx.description || tx.category}
                </p>
                <p className="text-xs text-gray-400">
                  {tx.category} · {format(new Date(tx.date), 'MMM d')}
                </p>
              </div>
              <p className={`text-sm font-semibold flex-shrink-0 ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
