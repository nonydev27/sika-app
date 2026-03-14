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

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-dark mb-4">Get started in minutes</h2>
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
                desc: 'Log transactions, view statistics, and chat with Cedi AI for personalized money tips.',
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
            Join thousands of Ghanaian students already budgeting smarter with CediSmart.
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
          <span className="font-bold text-white">CediSmart</span>
        </div>
        <p className="text-primary-light text-sm">
          Budget Smart, Study Hard. Made for Ghanaian students.
        </p>
      </footer>
    </div>
  )
}
