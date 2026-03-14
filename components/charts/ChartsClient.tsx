'use client'

import dynamic from 'next/dynamic'

const SpendingPie = dynamic(() => import('./SpendingPie'), { ssr: false })
const MonthlyTrend = dynamic(() => import('./MonthlyTrend'), { ssr: false })
const BudgetBar = dynamic(() => import('./BudgetBar'), { ssr: false })

export { SpendingPie, MonthlyTrend, BudgetBar }
