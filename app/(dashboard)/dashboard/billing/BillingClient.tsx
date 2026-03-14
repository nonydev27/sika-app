'use client'

import { useState } from 'react'
import { Zap, CheckCircle2, MessageCircle, TrendingUp, ScanText, X, Loader2, Phone, CreditCard } from 'lucide-react'
import Link from 'next/link'

interface Usage {
  chat_count: number
  insights_count: number
  receipt_count: number
}

interface Props {
  plan: string
  proExpiresAt: string | null
  usage: Usage | null
  currency: string
}

const FREE_LIMITS = { chat: 20, insights: 5, receipt: 10 }
const sym = (c: string) => c === 'USD' ? '$' : '₵'

function UsageMeter({ label, used, limit, icon: Icon }: { label: string; used: number; limit: number; icon: React.ElementType }) {
  const pct = Math.min((used / limit) * 100, 100)
  const danger = pct >= 90
  const warn = pct >= 70
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon size={14} className="text-primary" />
          </div>
          <p className="text-sm font-semibold text-primary-dark">{label}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${danger ? 'bg-red-50 text-red-600' : warn ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
          {used}/{limit}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${danger ? 'bg-red-500' : warn ? 'bg-yellow-400' : 'bg-primary'}`}
          style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1.5">{Math.max(0, limit - used)} remaining this month</p>
    </div>
  )
}

type ModalStep = 'choose' | 'momo' | 'card' | 'processing' | 'success'

export default function BillingClient({ plan, proExpiresAt, usage, currency }: Props) {
  const [modal, setModal] = useState(false)
  const [step, setStep] = useState<ModalStep>('choose')
  const [momoNetwork, setMomoNetwork] = useState('mtn')
  const [momoNumber, setMomoNumber] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const isPro = plan === 'pro'
  const s = sym(currency)

  const chatUsed     = usage?.chat_count     ?? 0
  const insightsUsed = usage?.insights_count ?? 0
  const receiptUsed  = usage?.receipt_count  ?? 0

  const openModal = () => { setStep('choose'); setModal(true) }
  const closeModal = () => setModal(false)

  const handlePay = () => {
    setStep('processing')
    setTimeout(() => setStep('success'), 2200)
  }

  const proFeatures = [
    'Unlimited AI chat messages',
    'Unlimited AI insights & analysis',
    'Unlimited receipt parsing',
    'Priority background analysis',
    'Export statements (PDF & CSV)',
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Current plan card */}
      <div className={`rounded-2xl p-6 ${isPro ? 'bg-primary-dark text-white' : 'bg-white shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isPro ? 'text-primary-light' : 'text-gray-400'}`}>Current Plan</p>
            <h2 className={`text-2xl font-bold ${isPro ? 'text-white' : 'text-primary-dark'}`}>
              {isPro ? 'Pro' : 'Free'}
            </h2>
            {isPro && proExpiresAt && (
              <p className="text-xs text-primary-light mt-0.5">
                Renews {new Date(proExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPro ? 'bg-white/10' : 'bg-primary/10'}`}>
            <Zap size={22} className={isPro ? 'text-primary-light' : 'text-primary'} />
          </div>
        </div>
        {!isPro && (
          <button onClick={openModal} className="btn-primary w-full flex items-center justify-center gap-2">
            <Zap size={15} /> Upgrade to Pro — {s}5/month
          </button>
        )}
        {isPro && (
          <div className="flex items-center gap-2 text-sm text-primary-light">
            <CheckCircle2 size={15} /> All features unlocked
          </div>
        )}
      </div>

      {/* Usage meters — only shown on free plan */}
      {!isPro && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">This Month&apos;s Usage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UsageMeter label="AI Chat"     used={chatUsed}     limit={FREE_LIMITS.chat}     icon={MessageCircle} />
            <UsageMeter label="Insights"    used={insightsUsed} limit={FREE_LIMITS.insights} icon={TrendingUp} />
            <UsageMeter label="Receipts"    used={receiptUsed}  limit={FREE_LIMITS.receipt}  icon={ScanText} />
          </div>
        </>
      )}

      {/* Plan comparison */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3 border-b border-gray-100">
          <span>Feature</span><span className="text-center">Free</span><span className="text-center">Pro</span>
        </div>
        {[
          ['AI Chat',          '20/mo',       'Unlimited'],
          ['AI Insights',      '5/mo',        'Unlimited'],
          ['Receipt Parsing',  '10/mo',       'Unlimited'],
          ['Background AI',    '—',           '✓'],
          ['Statement Export', '✓',           '✓'],
          ['Price',            'Free',        `${s}5/mo`],
        ].map(([feat, free, pro]) => (
          <div key={feat} className="grid grid-cols-3 px-6 py-3.5 border-b border-gray-50 text-sm last:border-0">
            <span className="text-gray-700 font-medium">{feat}</span>
            <span className="text-center text-gray-400">{free}</span>
            <span className="text-center text-primary font-semibold">{pro}</span>
          </div>
        ))}
      </div>

      {!isPro && (
        <button onClick={openModal} className="btn-primary w-full flex items-center justify-center gap-2">
          <Zap size={15} /> Get Pro — {s}5/month
        </button>
      )}

      {/* Payment modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            {step !== 'success' && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <p className="font-bold text-primary-dark">Upgrade to Pro</p>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
            )}

            {/* Choose method */}
            {step === 'choose' && (
              <div className="p-6 space-y-3">
                <p className="text-sm text-gray-500 mb-4">Choose a payment method for <span className="font-semibold text-primary-dark">{s}5/month</span></p>
                <button onClick={() => setStep('momo')}
                  className="w-full flex items-center gap-3 border-2 border-gray-100 hover:border-primary rounded-xl px-4 py-3.5 transition-colors text-left">
                  <Phone size={18} className="text-yellow-500 flex-shrink-0" />
                  <div><p className="text-sm font-semibold text-primary-dark">Mobile Money</p><p className="text-xs text-gray-400">MTN, Vodafone, AirtelTigo</p></div>
                </button>
                <button onClick={() => setStep('card')}
                  className="w-full flex items-center gap-3 border-2 border-gray-100 hover:border-primary rounded-xl px-4 py-3.5 transition-colors text-left">
                  <CreditCard size={18} className="text-primary flex-shrink-0" />
                  <div><p className="text-sm font-semibold text-primary-dark">Debit / Credit Card</p><p className="text-xs text-gray-400">Visa, Mastercard</p></div>
                </button>
              </div>
            )}

            {/* MoMo */}
            {step === 'momo' && (
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  {[['mtn','MTN'],['vodafone','Vodafone'],['airteltigo','AirtelTigo']].map(([v,l]) => (
                    <button key={v} onClick={() => setMomoNetwork(v)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${momoNetwork === v ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-500'}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
                  <input value={momoNumber} onChange={e => setMomoNumber(e.target.value)}
                    placeholder="024 000 0000" className="input-field" />
                </div>
                <p className="text-xs text-gray-400">You will receive a prompt on your phone to approve {s}5.</p>
                <button onClick={handlePay} disabled={!momoNumber.trim()} className="btn-primary w-full disabled:opacity-50">
                  Send Payment Prompt
                </button>
                <button onClick={() => setStep('choose')} className="w-full text-xs text-gray-400 hover:text-gray-600 text-center">← Back</button>
              </div>
            )}

            {/* Card */}
            {step === 'card' && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card number</label>
                  <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="123" className="input-field" />
                  </div>
                </div>
                <button onClick={handlePay} disabled={!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()} className="btn-primary w-full disabled:opacity-50">
                  Pay {s}5
                </button>
                <button onClick={() => setStep('choose')} className="w-full text-xs text-gray-400 hover:text-gray-600 text-center">← Back</button>
              </div>
            )}

            {/* Processing */}
            {step === 'processing' && (
              <div className="p-10 flex flex-col items-center gap-4">
                <Loader2 size={36} className="animate-spin text-primary" />
                <p className="font-semibold text-primary-dark">Processing payment…</p>
                <p className="text-xs text-gray-400 text-center">Please wait, do not close this window</p>
              </div>
            )}

            {/* Success */}
            {step === 'success' && (
              <div className="p-10 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-primary-dark text-lg">You&apos;re on Pro!</p>
                  <p className="text-sm text-gray-500 mt-1">All limits removed. Enjoy unlimited AI features.</p>
                </div>
                {proFeatures.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600 w-full">
                    <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" /> {f}
                  </div>
                ))}
                <Link href="/dashboard" onClick={closeModal} className="btn-primary w-full text-center mt-2">
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
