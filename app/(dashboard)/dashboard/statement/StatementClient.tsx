'use client'

import { useState } from 'react'
import { FileText, Download, Eye, FileSpreadsheet } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

interface Props {
  currency: string
  name: string
  firstDate: string
}

const PRESETS = [
  { label: 'This month', getRange: () => ({ from: startOfMonth(new Date()).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }) },
  { label: 'Last month', getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)).toISOString().split('T')[0], to: endOfMonth(subMonths(new Date(), 1)).toISOString().split('T')[0] }) },
  { label: 'Last 3 months', getRange: () => ({ from: startOfMonth(subMonths(new Date(), 2)).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }) },
  { label: 'Last 6 months', getRange: () => ({ from: startOfMonth(subMonths(new Date(), 5)).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }) },
  { label: 'This semester', getRange: () => {
    const now = new Date()
    const month = now.getMonth()
    // Rough semester split: Jan–May (first), Aug–Dec (second)
    const semStart = month >= 7 ? new Date(now.getFullYear(), 7, 1) : new Date(now.getFullYear(), 0, 1)
    return { from: semStart.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
  }},
  { label: 'All time', getRange: () => ({ from: '', to: '' }) },
]

export default function StatementClient({ currency, name, firstDate }: Props) {
  const [from, setFrom] = useState(startOfMonth(new Date()).toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])
  const [activePreset, setActivePreset] = useState('This month')

  const buildUrl = (type: 'html' | 'csv') => {
    const params = new URLSearchParams({ type, from, to })
    return `/api/statement?${params}`
  }

  const handlePreset = (preset: typeof PRESETS[0]) => {
    const range = preset.getRange()
    setFrom(range.from)
    setTo(range.to)
    setActivePreset(preset.label)
  }

  const handlePreview = () => {
    window.open(buildUrl('html'), '_blank')
  }

  const handlePrint = () => {
    const url = buildUrl('html') + '&print=1'
    window.open(url, '_blank')
  }

  const handleCSV = () => {
    const a = document.createElement('a')
    a.href = buildUrl('csv')
    a.download = `sikaapp-statement-${from || 'all'}-${to || 'now'}.csv`
    a.click()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Period selector */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-primary-dark mb-4">Select Period</h2>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-5">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => handlePreset(p)}
              className={`text-sm px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activePreset === p.label
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={from} min={firstDate} max={to || undefined}
              onChange={(e) => { setFrom(e.target.value); setActivePreset('Custom') }}
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={to} min={from || undefined}
              onChange={(e) => { setTo(e.target.value); setActivePreset('Custom') }}
              className="input-field" />
          </div>
        </div>

        {from && to && (
          <p className="text-xs text-gray-400 mt-3">
            {format(new Date(from), 'MMMM d, yyyy')} – {format(new Date(to), 'MMMM d, yyyy')}
          </p>
        )}
      </div>

      {/* Export options */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-primary-dark mb-4">Export Options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={handlePreview}
            className="flex flex-col items-center gap-2 border-2 border-gray-100 hover:border-primary rounded-2xl p-5 transition-colors group">
            <Eye size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-gray-700">Preview</span>
            <span className="text-xs text-gray-400 text-center">View in browser</span>
          </button>

          <button onClick={handlePrint}
            className="flex flex-col items-center gap-2 border-2 border-gray-100 hover:border-primary rounded-2xl p-5 transition-colors group">
            <FileText size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-gray-700">Save as PDF</span>
            <span className="text-xs text-gray-400 text-center">Print → Save as PDF</span>
          </button>

          <button onClick={handleCSV}
            className="flex flex-col items-center gap-2 border-2 border-gray-100 hover:border-primary rounded-2xl p-5 transition-colors group">
            <FileSpreadsheet size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-gray-700">Download CSV</span>
            <span className="text-xs text-gray-400 text-center">Open in Excel / Sheets</span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-primary-light/20 rounded-2xl p-5 flex items-start gap-3">
        <Download size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-primary-dark">About your statement</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            The statement includes all transactions in the selected period, a category breakdown, and your profile details.
            To save as PDF, use your browser&apos;s print dialog and choose &quot;Save as PDF&quot; as the destination.
          </p>
        </div>
      </div>
    </div>
  )
}
