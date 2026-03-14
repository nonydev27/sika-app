import Navbar from '@/components/landing/Navbar'
import Features from '@/components/landing/Features'
import HeroClient from '@/components/landing/HeroClient'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroClient />
      <Features />

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-primary-dark mb-4 capitalize">Simple, student-friendly pricing</h2>
            <p className="text-gray-500">Start free. Upgrade only if you need more AI power.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Free</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-primary-dark">₵0</span>
                  <span className="text-gray-400 mb-2">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Everything you need to get started</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  'Unlimited budget tracking',
                  'Unlimited transactions',
                  'Daily spending tracker',
                  'Savings accounts',
                  'Transaction statements',
                  '30 AI chat messages/month',
                  '5 AI insights analyses/month',
                  '50 receipt parses/month',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center bg-gray-100 hover:bg-gray-200 text-primary-dark font-semibold py-3 rounded-xl transition-colors text-sm">
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-primary-dark rounded-2xl shadow-xl p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-primary-light uppercase tracking-wide mb-2">Pro</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-white">₵5</span>
                  <span className="text-primary-light mb-2">/month</span>
                </div>
                <p className="text-sm text-primary-light mt-2">Less than a waakye — unlimited AI</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  'Everything in Free',
                  'Unlimited AI chat',
                  'Unlimited AI insights',
                  'Unlimited receipt parsing',
                  'Priority AI responses',
                  'Advanced spending patterns',
                  'Semester-end reports',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                    <span className="w-5 h-5 rounded-full bg-primary-light/30 text-primary-light flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center bg-primary hover:bg-primary-mid text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Start Pro — ₵5/month
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Pro upgrade available inside the app via MoMo or card. Cancel anytime.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-dark mb-4 capitalize">Get started in minutes</h2>
            <p className="text-gray-500">No complicated setup. Just sign up and start tracking.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create your profile',
                desc: 'Tell us about your university, income, and spending habits in a quick 5-step setup.',
              },
              {
                step: '02',
                title: 'Set your budget',
                desc: 'Allocate your monthly allowance across categories like food, transport, data, and more.',
              },
              {
                step: '03',
                title: 'Track & improve',
                desc: 'Log transactions, view statistics, and chat with Sika App AI for personalized money tips.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-dark text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-primary-dark mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-gradient-to-br from-primary-dark to-primary-mid">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-primary-light mb-8">
            Join thousands of Ghanaian students already budgeting smarter with Sika App.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-primary-dark font-bold px-10 py-4 rounded-2xl hover:bg-primary-light transition-colors shadow-xl"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-primary-dark text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
            ₵
          </div>
          <span className="font-bold text-white">Sika App</span>
        </div>
        <p className="text-primary-light text-sm">
          Track Your Money, Achieve Your Goals. Made for Ghanaian students.
        </p>
      </footer>
    </div>
  )
}

//This is the end of this code
