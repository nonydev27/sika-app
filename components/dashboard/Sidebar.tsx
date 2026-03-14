'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, PieChart, ArrowLeftRight, TrendingUp,
  CalendarDays, PiggyBank, Sparkles, Settings, LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',              label: 'Dashboard',    icon: LayoutDashboard, tour: 'dashboard' },
  { href: '/dashboard/daily',        label: 'Daily',        icon: CalendarDays,    tour: 'daily' },
  { href: '/dashboard/budget',       label: 'Budget',       icon: PieChart,        tour: 'budget' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight,  tour: 'transactions' },
  { href: '/dashboard/savings',      label: 'Savings',      icon: PiggyBank,       tour: 'savings' },
  { href: '/dashboard/stats',        label: 'Statistics',   icon: TrendingUp,      tour: 'stats' },
  { href: '/dashboard/insights',     label: 'AI Insights',  icon: Sparkles,        tour: 'insights' },
]

const BOTTOM_NAV = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ profile }: { profile: { name?: string; university?: string } | null }) {
  const pathname = usePathname()
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  // Mobile nav: show first 5 items only (space constraint)
  const mobileNav = [...NAV.slice(0, 4), BOTTOM_NAV[0]]

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-primary-dark text-white z-40">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-lg">₵</div>
            <div>
              <p className="font-bold text-sm">Sika App</p>
              <p className="text-xs text-primary-light">Budget tracker</p>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                data-tour={item.tour}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-primary text-white' : 'text-primary-light hover:bg-white/10 hover:text-white'
                }`}>
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: settings + user */}
        <div className="px-3 pb-2 space-y-1 border-t border-white/10 pt-3">
          {BOTTOM_NAV.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-primary text-white' : 'text-primary-light hover:bg-white/10 hover:text-white'
                }`}>
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* User */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-mid flex items-center justify-center text-sm font-semibold">
              {profile?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.name ?? 'Student'}</p>
              <p className="text-xs text-primary-light truncate">{profile?.university?.split(' (')[0] ?? ''}</p>
            </div>
          </div>
          <button onClick={signOut}
            className="flex items-center gap-2 text-xs text-primary-light hover:text-white transition-colors px-1">
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-primary-dark border-t border-white/10 z-40 flex">
        {mobileNav.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                active ? 'text-primary-light' : 'text-white/50 hover:text-white'
              }`}>
              <Icon size={18} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
