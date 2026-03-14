export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="scale-150">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-dark via-primary-mid to-primary flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5B041] via-[#D4AC0D] to-[#B7950B] flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-primary-dark">₵</span>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Sika App</h1>
          <p className="text-primary-light text-sm mt-1">Track your money. Achieve your goals.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
