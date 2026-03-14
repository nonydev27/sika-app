import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

function fmt(amount: number, currency: string) {
  const sym = currency === 'USD' ? '$' : '₵'
  return `${sym}${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const fileType = searchParams.get('type') ?? 'html' // 'html' | 'csv'
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''

  const [{ data: profile }, { data: transactions }, { data: budgets }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', from || '2000-01-01')
      .lte('date', to || new Date().toISOString().split('T')[0])
      .order('date', { ascending: true }),
    supabase.from('budgets').select('*, budget_categories(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
  ])

  const currency = profile?.currency_preference ?? 'GHS'
  const tx = (transactions ?? []).map((t) => ({ ...t, amount: Number(t.amount) }))
  const totalSpent = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalIncome = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const net = totalIncome - totalSpent

  const byCategory = tx
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {})

  if (fileType === 'csv') {
    const rows = [
      ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency'],
      ...tx.map((t) => [
        t.date,
        t.type,
        t.category,
        t.description ?? '',
        t.amount.toFixed(2),
        currency,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="sikaapp-statement-${from}-${to}.csv"`,
      },
    })
  }

  // HTML statement
  const periodLabel = from && to
    ? `${format(new Date(from), 'MMMM d, yyyy')} – ${format(new Date(to), 'MMMM d, yyyy')}`
    : 'All Time'

  const categoryRows = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `
      <tr>
        <td>${cat}</td>
        <td class="amount expense">${fmt(amt, currency)}</td>
        <td class="pct">${totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(1) : 0}%</td>
      </tr>`).join('')

  const txRows = tx.map((t) => `
    <tr>
      <td>${format(new Date(t.date), 'MMM d, yyyy')}</td>
      <td><span class="badge ${t.type}">${t.type}</span></td>
      <td>${t.category}</td>
      <td>${t.description ?? '—'}</td>
      <td class="amount ${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? '+' : '-'}${fmt(t.amount, currency)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Sika App Statement</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; font-size: 13px; }
  .page { max-width: 860px; margin: 0 auto; padding: 40px 32px; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #0F2854; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-icon { width: 44px; height: 44px; background: #0F2854; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold; }
  .brand-name { font-size: 20px; font-weight: 700; color: #0F2854; }
  .brand-sub { font-size: 11px; color: #4988C4; }
  .header-right { text-align: right; }
  .header-right h2 { font-size: 16px; font-weight: 700; color: #0F2854; }
  .header-right p { font-size: 11px; color: #666; margin-top: 2px; }

  /* Profile */
  .profile-box { background: #f0f7ff; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
  .profile-box .row { display: flex; gap: 6px; font-size: 12px; }
  .profile-box .label { color: #666; min-width: 100px; }
  .profile-box .val { font-weight: 600; color: #0F2854; }

  /* Summary cards */
  .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
  .card { border-radius: 12px; padding: 16px; }
  .card.dark { background: #0F2854; color: white; }
  .card.mid { background: #1C4D8D; color: white; }
  .card.light { background: #fff; border: 1px solid #e5e7eb; }
  .card .card-label { font-size: 10px; opacity: 0.75; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .card .card-value { font-size: 20px; font-weight: 700; }
  .card.light .card-label { color: #888; }
  .card.light .card-value { color: #0F2854; }
  .net-positive { color: #16a34a; }
  .net-negative { color: #dc2626; }

  /* Tables */
  h3 { font-size: 13px; font-weight: 700; color: #0F2854; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  th { background: #0F2854; color: white; padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; }
  td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #fafafa; }
  .amount { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
  .income { color: #16a34a; }
  .expense { color: #dc2626; }
  .pct { text-align: right; color: #888; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: capitalize; }
  .badge.income { background: #dcfce7; color: #16a34a; }
  .badge.expense { background: #fee2e2; color: #dc2626; }

  /* Footer */
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-icon">₵</div>
      <div>
        <div class="brand-name">Sika App</div>
        <div class="brand-sub">Student Budget Tracker</div>
      </div>
    </div>
    <div class="header-right">
      <h2>Transaction Statement</h2>
      <p>${periodLabel}</p>
      <p>Generated: ${format(new Date(), 'MMMM d, yyyy')}</p>
    </div>
  </div>

  <!-- Profile -->
  <div class="profile-box">
    <div class="row"><span class="label">Name</span><span class="val">${profile?.name ?? '—'}</span></div>
    <div class="row"><span class="label">University</span><span class="val">${profile?.university?.split(' (')[0] ?? '—'}</span></div>
    <div class="row"><span class="label">Programme</span><span class="val">${profile?.program ?? '—'}, Year ${profile?.year_of_study ?? '—'}</span></div>
    <div class="row"><span class="label">Currency</span><span class="val">${currency}</span></div>
  </div>

  <!-- Summary -->
  <div class="summary">
    <div class="card dark">
      <div class="card-label">Total Income</div>
      <div class="card-value">${fmt(totalIncome, currency)}</div>
    </div>
    <div class="card mid">
      <div class="card-label">Total Expenses</div>
      <div class="card-value">${fmt(totalSpent, currency)}</div>
    </div>
    <div class="card light">
      <div class="card-label">Net Balance</div>
      <div class="card-value ${net >= 0 ? 'net-positive' : 'net-negative'}">${fmt(Math.abs(net), currency)} ${net >= 0 ? '▲' : '▼'}</div>
    </div>
  </div>

  <!-- Category breakdown -->
  <h3>Spending by Category</h3>
  <table>
    <thead><tr><th>Category</th><th style="text-align:right">Amount</th><th style="text-align:right">% of Total</th></tr></thead>
    <tbody>${categoryRows || '<tr><td colspan="3" style="text-align:center;color:#aaa">No expense data</td></tr>'}</tbody>
  </table>

  <!-- All transactions -->
  <h3>All Transactions (${tx.length})</h3>
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${txRows || '<tr><td colspan="5" style="text-align:center;color:#aaa">No transactions</td></tr>'}</tbody>
  </table>

  <div class="footer">
    <span>Sika App — Confidential Financial Statement</span>
    <span>${profile?.name ?? ''} · ${periodLabel}</span>
  </div>

</div>

<script>
  // Auto-trigger print dialog when opened directly
  if (window.location.search.includes('print=1')) window.print()
</script>
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
