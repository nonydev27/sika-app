'use client'

import { motion } from 'framer-motion'
import { BarChart3, Receipt, LineChart, Bot, GraduationCap, Bell } from 'lucide-react'

const FEATURES = [
  {
    Icon: BarChart3,
    title: 'Smart Budget Planning',
    desc: 'Allocate your allowance across Ghana-specific categories — trotro, waakye, data bundles, and more.',
    color: 'from-primary-dark to-primary-mid',
  },
  {
    Icon: Receipt,
    title: 'Transaction Tracking',
    desc: 'Log every cedi in and out with one tap. Filter, search, and understand your spending patterns.',
    color: 'from-primary-mid to-primary',
  },
  {
    Icon: LineChart,
    title: 'Visual Statistics',
    desc: 'Beautiful charts showing where your money goes. Monthly trends, category breakdowns, and budget vs actual.',
    color: 'from-primary to-primary-light',
  },
  {
    Icon: Bot,
    title: 'Sika App AI Assistant',
    desc: 'Your personal finance coach powered by Claude AI. Knows your budget, transactions, and gives Ghana-specific advice.',
    color: 'from-primary-dark to-primary',
  },
  {
    Icon: GraduationCap,
    title: 'Semester Mode',
    desc: "Plan budgets that align with UG, KNUST, UCC and other universities' academic calendars.",
    color: 'from-primary-mid to-primary-light',
  },
  {
    Icon: Bell,
    title: 'Budget Alerts',
    desc: "Get warned when you hit 80% of a category budget. Stay in control before it's too late.",
    color: 'from-primary to-primary-dark',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary-dark mb-4 capitalize">
            Everything a Ghanaian student needs
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Sika App is built specifically for the realities of student life in Ghana — from trotro fares to MoMo transfers.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feat) => (
            <motion.div
              key={feat.title}
              variants={item}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4`}>
                <feat.Icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-primary-dark mb-2">{feat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
