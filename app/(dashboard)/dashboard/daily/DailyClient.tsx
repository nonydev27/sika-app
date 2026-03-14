'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { formatCurrency, getCategoryColor } from '@/lib/utils'
import { GHANA_CATEGORIES } from '@/lib/constants'
import { addDailyTransaction, deleteDailyTransaction } from './actions'
import { Plus, X, Trash2, ScanText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import CategoryIcon from '@/components/ui/CategoryIcon'

interface Transaction {
  id: string
  category: string
  amount: number
  description: string | null
  date: string
  type: string
}

interface Props {
  todayTx: Transaction[]
  yesterdaySpent: number
  dailyBudget: number
  currency: string
  todaySpent: number
  todayIncome: number
}

type ParsedReceipt = {
  amount: number
  type: 'expense' | 'income'
  category: string
  description: string
  confidence: 'high' | 'medium' | 'low'
}

type FormMode = 'manual' | 'receipt'

export default function DailyClient({ todayTx, yesterdaySpent, dailyBudget, currency, todaySpent, todayIncome }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('manual')

  // Manual form state
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  // Receipt paste state
  const [receiptText, setReceiptText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null)
  const [parseError, setParseError] = useState('')

  const [isPending, startTransition] = useTransition()

  const remaining = dailyBudget - todaySpent
  const pct = dailyBudget > 0 ? Math.min((todaySpent / dailyBudget) * 100, 100) : 0
  const vsYesterday = yesterdaySpent > 0 ? ((todaySpent - yesterdaySpent) / yesterdaySpent) * 100 : null

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setCategory('')
    setType('expense')
    setReceiptText('')
    setParsed(null)
    setParseError('')
    setFormMode('manual')
    setShowForm(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !amount) return
    const fd = new FormData()
    fd.append('category', category)
    fd.append('amount', amount)
    fd.append('description', description)
    fd.append('type', type)
    startTransition(async () => {
      await addDailyTransaction(fd)
      resetForm()
    })
  }

  const handleParseReceipt = async () => {
    if (!receiptText.trim()) return
    setParsing(true)
    setParseError('')
    setParsed(null)
    try {
      const res = await fetch('/api/ai/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: receiptText }),
      })
      const data = await res.json()
      if (data.error) {
        setParseError(data.error)
      } else {
        setParsed(data)
        // Pre-fill manual form fields so user can edit before confirming
        setType(data.type)
        setCategory(data.category)
        setAmount(String(data.amount))
        setDescription(data.description)
      }
    } catch {
      setParseError('Network error — please try again.')
    } finally {
      setParsing(false)
    }
  }

  const handleConfirmParsed = () => {
    if (!category || !amount) return
    const fd = new FormData()
    fd.append('category', category)
    fd.append('amount', amount)
    fd.append('description', description)
    fd.append('type', type)
    startTransition(async () => {
      await addDailyTransaction(fd)
      resetForm()
    })
  }

  const confidenceColors = {
    high: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-red-500 bg-red-50',
  }

  return (
    <div className="space-y-6">
      {/* Daily summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tour="daily-summary-cards">
        <div className="bg-primary-dark rounded-2xl p-5 col-span-2 lg:col-span-1">
          <p className="text-xs text-primary-light mb-1">Daily Budget</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(dailyBudget, currency)}</p>
          <p className="text-xs text-primary-light mt-1">per day</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Spent Today</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(todaySpent, currency)}</p>
          {vsYesterday !== null && (
            <p className={`text-xs mt-1 ${vsYesterday > 0 ? 'text-red-400' : 'text-green-500'}`}>
              {vsYesterday > 0 ? '+' : ''}{vsYesterday.toFixed(0)}% vs yesterday
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Remaining</p>
          <p className={`text-xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-primary-dark'}`}>
            {formatCurrency(remaining, currency)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% used</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Income Today</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(todayIncome, currency)}</p>
          <p className="text-xs text-gray-400 mt-1">received</p>
        </div>
      </div>

      {/* Daily progress bar */}
      <div className="bg-white rounded-2xl shadow-sm p-6" data-tour="daily-progress">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-primary-dark">Today&apos;s Progress</h3>
            <p className="text-xs text-gray-400">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
            pct >= 100 ? 'bg-red-50 text-red-600' :
            pct >= 80  ? 'bg-yellow-50 text-yellow-600' :
                         'bg-green-50 text-green-600'
          }`}>
            {pct.toFixed(0)}% used
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-primary'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{formatCurrency(0, currency)}</span>
          <span>{formatCurrency(dailyBudget, currency)}</span>
        </div>
      </div>

      {/* Transactions panel */}
      <div className="bg-white rounded-2xl shadow-sm p-6" data-tour="daily-transactions-panel">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-primary-dark">Today&apos;s Transactions</h3>
          {!showForm && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setFormMode('receipt'); setShowForm(true) }}
                data-tour="daily-paste-receipt"
                className="flex items-center gap-1.5 border border-primary text-primary text-sm font-medium px-3 py-2 rounded-xl hover:bg-primary/5 transition-colors"
              >
                <ScanText size={14} />
                Paste Receipt
              </button>
              <button
                onClick={() => { setFormMode('manual'); setShowForm(true) }}
                data-tour="daily-add-btn"
                className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-primary-mid transition-colors"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          )}
          {showForm && (
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── RECEIPT PASTE FORM ── */}
        {showForm && formMode === 'receipt' && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            {!parsed ? (
              <>
                <div className="flex items-start gap-2 text-xs text-primary-mid bg-primary-light/30 rounded-lg px-3 py-2">
                  <ScanText size={13} className="mt-0.5 flex-shrink-0" />
                  <span>Paste your MTN MoMo, Vodafone Cash, AirtelTigo, or bank SMS below and Cedi AI will extract the details.</span>
                </div>
                <textarea
                  value={receiptText}
                  onChange={(e) => setReceiptText(e.target.value)}
                  placeholder={`e.g. "You have sent GHS 25.00 to 0244123456 John Mensah. Fee: GHS 0.00. Balance: GHS 120.50. Ref: 1234567890"`}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none placeholder:text-gray-400"
                />
                {parseError && (
                  <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                    <AlertCircle size={13} />
                    {parseError}
                  </div>
                )}
                <button
                  onClick={handleParseReceipt}
                  disabled={!receiptText.trim() || parsing}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {parsing ? (
                    <><Loader2 size={14} className="animate-spin" /> Analysing…</>
                  ) : (
                    <><ScanText size={14} /> Extract Details</>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Parsed result — editable before confirming */}
                <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <CheckCircle2 size={13} />
                  Details extracted — review and confirm below
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${confidenceColors[parsed.confidence]}`}>
                    {parsed.confidence} confidence
                  </span>
                </div>

                {/* Type toggle */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  {(['expense', 'income'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${
                        type === t ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Category</option>
                    {GHANA_CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                    {type === 'income' && <option value="Allowance">Allowance / Income</option>}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setParsed(null); setReceiptText('') }}
                    className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Re-paste
                  </button>
                  <button
                    onClick={handleConfirmParsed}
                    disabled={isPending || !category || !amount}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {isPending ? 'Saving…' : 'Confirm & Save'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── MANUAL FORM ── */}
        {showForm && formMode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${
                    type === t ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="input-field"
              >
                <option value="">Category</option>
                {GHANA_CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
                {type === 'income' && <option value="Allowance">Allowance / Income</option>}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />

            <button type="submit" disabled={isPending} className="btn-primary w-full">
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </form>
        )}

        {/* Transaction list */}
        {todayTx.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No transactions today yet</p>
            <p className="text-xs mt-1">Tap Add or paste a receipt to log one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTx.map((tx) => {
              const color = getCategoryColor(tx.category)
              return (
                <div key={tx.id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color + '22' }}
                  >
                    <CategoryIcon category={tx.category} size={15} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {tx.description || tx.category}
                    </p>
                    <p className="text-xs text-gray-400">{tx.category}</p>
                  </div>
                  <p className={`text-sm font-semibold flex-shrink-0 ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount), currency)}
                  </p>
                  <button
                    onClick={() => startTransition(() => deleteDailyTransaction(tx.id))}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                    aria-label="Delete transaction"
                  >
                    <Trash2 size={13} />
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
