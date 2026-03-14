import { CURRENCY_SYMBOL, GHANA_CATEGORIES } from './constants'

export function formatCurrency(amount: number, currency = 'GHS'): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? currency
  return `${symbol}${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function getCategoryColor(categoryName: string): string {
  const cat = GHANA_CATEGORIES.find((c) => c.name === categoryName)
  return cat?.color ?? '#8884d8'
}

export function getSpentByCategory(
  transactions: { category: string; amount: number; type: string }[]
): Record<string, number> {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {})
}

export function getBudgetProgress(allocated: number, spent: number): number {
  if (allocated === 0) return 0
  return Math.min((spent / allocated) * 100, 100)
}

export function getAlertLevel(allocated: number, spent: number): 'safe' | 'warning' | 'danger' {
  const pct = allocated > 0 ? spent / allocated : 0
  if (pct >= 1) return 'danger'
  if (pct >= 0.8) return 'warning'
  return 'safe'
}
