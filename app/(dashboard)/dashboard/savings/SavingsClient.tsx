'use client'

import { useState, useTransition } from 'react'
import { formatCurrency, getCategoryColor } from '@/lib/utils'
import { createSavingsAccount, deleteSavingsAccount, addSavingsTransaction, deleteSavingsTransaction } from './actions'
import { Plus, X, Trash2, ScanText, Loader2, CheckCircle2, AlertCircle, PiggyBank, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'

interface SavingsTx {
  id: string
  amount: number
  type: 'deposit' | 'withdrawal'
  description: string | null
  date: string
}

interface Account {
  id: string
  name: string
  target_amount: number
  current_amount: number
  color: string
  savings_transactions: SavingsTx[]
}

interface Props {
  accounts: Account[]
  currency: string
  savingsGoal: number
}

const ACCOUNT_COLORS = ['#4988C4', '#FF6B6B', '#4ECDC4', '#96CEB4', '#DDA0DD', '#F0E68C', '#98D8C8']

export default function SavingsClient({ accounts, currency, savingsGoal }: Props) {
  const [showNewAccount, setShowNewAccount] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newColor, setNewColor] = useState(ACCOUNT_COLORS[0])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Per-account add transaction state
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit')
  const [txAmount, setTxAmount] = useState('')
  const [txDesc, setTxDesc] = useState('')
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0])

  // Receipt paste state (per account)
  const [receiptMode, setReceiptMode] = useState(false)
  const [receiptText, setReceiptText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [parsed, setParsed] = useState<{
    amount: number
    type: string
    description: string
    confidence: string
    suggestedSavingsType?: 'deposit' | 'withdrawal'
    nameMatched?: boolean
    matchReason?: string
  } | null>(null)

  const totalSaved = accounts.reduce((s, a) => s + a.current_amount, 0)
  const totalTarget = accounts.reduce((s, a) => s + a.target_amount, 0)

  const resetTxForm = () => {
    setAddingTo(null)
    setTxAmount('')
    setTxDesc('')
    setTxDate(new Date().toISOString().split('T')[0])
    setTxType('deposit')
    setReceiptMode(false)
    setReceiptText('')
    setParsed(null)
    setParseError('')
  }

  const handleCreateAccount = () => {
    if (!newName.trim()) return
    const fd = new FormData()
    fd.append('name', newName)
    fd.append('target_amount', newTarget || '0')
    fd.append('color', newColor)
    startTransition(async () => {
      await createSavingsAccount(fd)
      setNewName('')
      setNewTarget('')
      setShowNewAccount(false)
    })
  }

  const handleAddTx = (accountId: string) => {
    if (!txAmount) return
    const fd = new FormData()
    fd.append('amount', txAmount)
    fd.append('type', txType)
    fd.append('description', txDesc)
    fd.append('date', txDate)
    startTransition(async () => {
      await addSavingsTransaction(accountId, fd)
      resetTxForm()
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
        body: JSON.stringify({ text: receiptText, context: 'savings' }),
      })
      const data = await res.json()
      if (data.error) { setParseError(data.error) }
      else {
        setParsed(data)
        setTxAmount(String(data.amount))
        setTxDesc(data.description)
        // Use AI name-match suggestion if available, else fall back to income/expense
        const suggested = data.suggestedSavingsType ?? (data.type === 'income' ? 'deposit' : 'withdrawal')
        setTxType(suggested)
      }
    } catch { setParseError('Network error — try again.') }
    finally { setParsing(false) }
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" data-tour="savings-summary">
        <div className="bg-primary-dark rounded-2xl p-5">
          <p className="text-xs text-primary-light mb-1">Total Saved</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalSaved, currency)}</p>
          <p className="text-xs text-primary-light mt-1">across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total Target</p>
          <p className="text-xl font-bold text-primary-dark">{formatCurrency(totalTarget, currency)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(0)}% reached` : 'No target set'}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-400 mb-1">Monthly Goal</p>
          <p className="text-xl font-bold text-primary-dark">{formatCurrency(savingsGoal, currency)}</p>
          <p className="text-xs text-gray-400 mt-1">from your profile</p>
        </div>
      </div>

      {/* New account button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowNewAccount(!showNewAccount)}
          data-tour="savings-new-btn"
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary-mid transition-colors"
        >
          {showNewAccount ? <X size={14} /> : <Plus size={14} />}
          {showNewAccount ? 'Cancel' : 'New Account'}
        </button>
      </div>

      {/* New account form */}
      {showNewAccount && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-primary/20">
          <h3 className="font-semibold text-primary-dark mb-4">Create Savings Account</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Emergency Fund" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target amount (optional)</label>
              <input type="number" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="500" className="input-field" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Colour</label>
            <div className="flex gap-2">
              {ACCOUNT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button onClick={handleCreateAccount} disabled={isPending || !newName.trim()} className="btn-primary">
            {isPending ? 'Creating…' : 'Create Account'}
          </button>
        </div>
      )}

      {/* Accounts list */}
      {accounts.length === 0 && !showNewAccount ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-400">
          <PiggyBank size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No savings accounts yet</p>
          <p className="text-sm mt-1">Create one to start tracking your savings</p>
        </div>
      ) : (
        <div className="space-y-4" data-tour="savings-accounts">
          {accounts.map((account) => {
            const pct = account.target_amount > 0 ? Math.min((account.current_amount / account.target_amount) * 100, 100) : 0
            const isExpanded = expandedId === account.id
            const isAdding = addingTo === account.id

            return (
              <div key={account.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Account header */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: account.color + '22' }}>
                      <PiggyBank size={18} style={{ color: account.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary-dark">{account.name}</p>
                      <p className="text-xs text-gray-400">
                        {account.savings_transactions.length} transaction{account.savings_transactions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right mr-2">
                      <p className="font-bold text-primary-dark">{formatCurrency(account.current_amount, currency)}</p>
                      {account.target_amount > 0 && (
                        <p className="text-xs text-gray-400">of {formatCurrency(account.target_amount, currency)}</p>
                      )}
                    </div>
                    <button onClick={() => startTransition(async () => { await deleteSavingsAccount(account.id) })}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Progress bar */}
                  {account.target_amount > 0 && (
                    <div className="mb-3">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: account.color }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% of goal</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setAddingTo(isAdding ? null : account.id); setReceiptMode(false); setParsed(null) }}
                      className="flex items-center gap-1.5 border border-primary text-primary text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <ScanText size={12} /> Paste Receipt
                    </button>
                    <button
                      onClick={() => { setAddingTo(isAdding ? null : account.id); setReceiptMode(false); setParsed(null) }}
                      className="flex items-center gap-1.5 bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary-mid transition-colors"
                    >
                      <Plus size={12} /> Add
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : account.id)}
                      className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      History {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Add transaction form */}
                {isAdding && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-3">
                    {/* Receipt paste toggle */}
                    <div className="flex gap-2 mb-1">
                      <button onClick={() => setReceiptMode(false)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${!receiptMode ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                        Manual
                      </button>
                      <button onClick={() => setReceiptMode(true)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${receiptMode ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                        Paste Receipt
                      </button>
                    </div>

                    {receiptMode && !parsed ? (
                      <>
                        <div className="flex items-start gap-2 text-xs text-primary-mid bg-primary-light/30 rounded-lg px-3 py-2">
                          <ScanText size={12} className="mt-0.5 flex-shrink-0" />
                          <span>Paste your MoMo or bank SMS to auto-fill the amount.</span>
                        </div>
                        <textarea value={receiptText} onChange={(e) => setReceiptText(e.target.value)}
                          placeholder="Paste SMS receipt here…" rows={3}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                        {parseError && (
                          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                            <AlertCircle size={12} />{parseError}
                          </div>
                        )}
                        <button onClick={handleParseReceipt} disabled={!receiptText.trim() || parsing}
                          className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                          {parsing ? <><Loader2 size={13} className="animate-spin" />Analysing…</> : <><ScanText size={13} />Extract Details</>}
                        </button>
                      </>
                    ) : (
                      <>
                        {parsed && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg px-3 py-2">
                              <CheckCircle2 size={12} /> Details extracted — review below
                              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${parsed.confidence === 'high' ? 'bg-green-100 text-green-700' : parsed.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                                {parsed.confidence}
                              </span>
                            </div>
                            {/* Name-match explanation */}
                            {parsed.matchReason && (
                              <div className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
                                parsed.suggestedSavingsType === 'deposit'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-orange-50 text-orange-700'
                              }`}>
                                <span className="mt-0.5 flex-shrink-0">
                                  {parsed.suggestedSavingsType === 'deposit' ? '↓' : '↑'}
                                </span>
                                <span>
                                  <span className="font-semibold capitalize">{parsed.suggestedSavingsType}</span> suggested — {parsed.matchReason}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Type toggle */}
                        <div className="flex rounded-xl overflow-hidden border border-gray-200">
                          {(['deposit', 'withdrawal'] as const).map((t) => (
                            <button key={t} type="button" onClick={() => setTxType(t)}
                              className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${txType === t ? 'bg-primary text-white' : 'bg-white text-gray-500'}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" step="0.01" placeholder="Amount" value={txAmount}
                            onChange={(e) => setTxAmount(e.target.value)} className="input-field" />
                          <input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="input-field" />
                        </div>
                        <input type="text" placeholder="Description (optional)" value={txDesc}
                          onChange={(e) => setTxDesc(e.target.value)} className="input-field" />
                        <div className="flex gap-2">
                          {parsed && (
                            <button onClick={() => { setParsed(null); setReceiptText('') }}
                              className="flex-1 py-2 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
                              Re-paste
                            </button>
                          )}
                          <button onClick={() => handleAddTx(account.id)} disabled={isPending || !txAmount}
                            className="flex-1 btn-primary text-sm disabled:opacity-50">
                            {isPending ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Transaction history */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {account.savings_transactions.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-6">No transactions yet</p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {[...account.savings_transactions].sort((a, b) => b.date.localeCompare(a.date)).map((tx) => (
                          <div key={tx.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{tx.description || tx.type}</p>
                              <p className="text-xs text-gray-400">{format(new Date(tx.date), 'MMM d, yyyy')}</p>
                            </div>
                            <p className={`text-sm font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                              {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                            </p>
                            <button
                              onClick={() => startTransition(async () => { await deleteSavingsTransaction(tx.id, account.id, tx.amount, tx.type) })}
                              className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
