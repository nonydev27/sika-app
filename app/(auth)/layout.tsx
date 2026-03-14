export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <span className="text-3xl">₵</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Sika App</h1>
          <p className="text-primary-light text-sm mt-1">Budget smarter. Study harder.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
