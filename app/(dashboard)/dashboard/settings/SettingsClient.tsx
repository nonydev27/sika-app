'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from './actions'
import { UNIVERSITIES, INCOME_SOURCES, TRANSPORT_MODES, CURRENCY_OPTIONS, BUDGET_PERIODS } from '@/lib/constants'
import { CheckCircle2, FileText, CreditCard, Map } from 'lucide-react'
import Link from 'next/link'
import { TOUR_STORAGE_KEY, TOUR_RESTART_KEY } from '@/components/dashboard/AppTour'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SettingsClient({ profile }: { profile: any }) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [tourRestarted, setTourRestarted] = useState(false)

  const handleRestartTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY)
    localStorage.setItem(TOUR_RESTART_KEY, 'true')
    setTourRestarted(true)
    // Navigate to dashboard where the tour will auto-start
    window.location.href = '/dashboard'
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setSaved(false)
    setError('')
    startTransition(async () => {
      const result = await updateProfile(fd)
      if (result?.error) setError(result.error)
      else setSaved(true)
    })
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {/* Personal */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-primary-dark mb-5">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input name="name" defaultValue={profile?.name ?? ''} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input name="age" type="number" defaultValue={profile?.age ?? ''} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
            <select name="university" defaultValue={profile?.university ?? ''} className="input-field">
              <option value="">Select university</option>
              {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
            <input name="program" defaultValue={profile?.program ?? ''} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year of study</label>
            <select name="year_of_study" defaultValue={profile?.year_of_study ?? ''} className="input-field">
              {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Finances */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-primary-dark mb-5">Income & Finances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly income / allowance</label>
            <input name="monthly_income" type="number" step="0.01" defaultValue={profile?.monthly_income ?? ''} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly savings goal</label>
            <input name="savings_goal" type="number" step="0.01" defaultValue={profile?.savings_goal ?? ''} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Income source</label>
            <select name="income_source" defaultValue={profile?.income_source ?? ''} className="input-field">
              <option value="">Select source</option>
              {INCOME_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select name="currency_preference" defaultValue={profile?.currency_preference ?? 'GHS'} className="input-field">
              {CURRENCY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default budget period</label>
            <select name="budget_period" defaultValue={profile?.budget_period ?? 'monthly'} className="input-field">
              {BUDGET_PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Living */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-primary-dark mb-5">Living & Transport</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Living situation</label>
            <div className="grid grid-cols-2 gap-2">
              {(['on-campus', 'off-campus'] as const).map((v) => (
                <label key={v} className="flex items-center gap-2 border rounded-xl px-3 py-2.5 cursor-pointer hover:border-primary transition-colors text-sm">
                  <input type="radio" name="living_situation" value={v} defaultChecked={profile?.living_situation === v} className="accent-primary" />
                  <span className="capitalize">{v.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transport mode</label>
            <select name="transport_mode" defaultValue={profile?.transport_mode ?? ''} className="input-field">
              <option value="">Select mode</option>
              {TRANSPORT_MODES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="hidden" name="has_roommates" value="false" />
              <input type="checkbox" name="has_roommates" value="true"
                defaultChecked={profile?.has_roommates ?? false}
                onChange={(e) => {
                  const hidden = e.currentTarget.form?.querySelector('input[name="has_roommates"][type="hidden"]') as HTMLInputElement
                  if (hidden) hidden.disabled = e.currentTarget.checked
                }}
                className="w-5 h-5 accent-primary rounded" />
              <span className="text-sm font-medium text-gray-700">I share accommodation with roommates</span>
            </label>
          </div>
        </div>
      </div>

      {/* Save */}
      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
          <CheckCircle2 size={16} /> Settings saved successfully
        </div>
      )}
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? 'Saving…' : 'Save Changes'}
      </button>
    </form>

    {/* Statement export — outside the profile form */}
    <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-primary-dark">Transaction Statement</h2>
          <p className="text-sm text-gray-500 mt-0.5">Export your transaction history as PDF or CSV</p>
        </div>
        <Link href="/dashboard/statement"
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary-mid transition-colors">
          <FileText size={14} /> Export
        </Link>
      </div>
    </div>

    {/* App Tour */}
    <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mt-6 border border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Map size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-primary-dark">App Tour</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {tourRestarted ? 'Tour will start on the dashboard' : 'Replay the guided walkthrough of CediSmart'}
            </p>
          </div>
        </div>
        <button
          onClick={handleRestartTour}
          disabled={tourRestarted}
          className="flex items-center gap-2 bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Map size={14} />
          {tourRestarted ? 'Redirecting…' : 'Restart Tour'}
        </button>
      </div>
    </div>
    </>
  )
}
