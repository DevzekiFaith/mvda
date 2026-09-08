import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-100 via-emerald-50 to-eucalyptus-100 relative overflow-hidden">
      {/* Floating decorative spheres */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 opacity-60 blur-sm"></div>
      <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 opacity-40 blur-sm"></div>
      <div className="absolute bottom-40 left-40 w-20 h-20 rounded-full bg-gradient-to-br from-stone-300 to-stone-400 opacity-50 blur-sm"></div>
      <div className="absolute top-60 right-60 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-400 opacity-30 blur-sm"></div>

      {/* Header with glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="bg-white/70 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/40 shadow-lg">
              <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Mindvest</h1>
              <span className="ml-2 text-xs font-medium text-stone-500 uppercase tracking-widest">Diagnostic OS</span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="bg-white/70 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/40 shadow-lg text-stone-900 font-medium hover:bg-white/90 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-emerald-700/90 backdrop-blur-xl px-6 py-3 rounded-2xl border border-emerald-600/50 shadow-lg text-white font-medium hover:bg-emerald-800 transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Central glassmorphism panel */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl p-12 md:p-16 max-w-4xl mx-auto mb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-widest mb-4">Framework v1.0</p>
                <h2 className="text-5xl md:text-6xl font-bold text-stone-900 tracking-tight leading-tight mb-6">
                  Diagnose.<br/>Design.<br/>Connect.<br/>Execute.
                </h2>
                <p className="text-stone-600 text-lg leading-relaxed mb-8">
                  A structured diagnostic framework for identifying business constraints, designing interventions, and tracking measurable outcomes.
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/login"
                    className="bg-emerald-700 text-white px-8 py-4 rounded-2xl font-medium hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-white/50 backdrop-blur-xl border border-stone-200 text-stone-900 px-8 py-4 rounded-2xl font-medium hover:bg-white/70 transition-all"
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative">
                  {/* Abstract architectural representation */}
                  <div className="w-full h-64 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl opacity-60"></div>
                  <div className="absolute top-8 right-8 w-32 h-32 bg-white/60 backdrop-blur-xl rounded-full border border-white/40"></div>
                  <div className="absolute bottom-4 left-4 w-24 h-24 bg-stone-200/60 backdrop-blur-xl rounded-2xl border border-white/40"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature cards with glassmorphism */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg p-8 hover:bg-white/70 transition-all">
              <div className="w-12 h-12 bg-emerald-100/60 backdrop-blur-xl rounded-xl flex items-center justify-center mb-6">
                <div className="w-6 h-6 bg-emerald-700 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-3 tracking-tight">10-Domain Assessment</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Comprehensive evaluation across business foundation, market, offer, positioning, marketing, sales, operations, finance, people, and strategy.
              </p>
              <div className="mt-6 pt-6 border-t border-stone-200/50">
                <span className="text-xs text-stone-500 uppercase tracking-widest">01</span>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg p-8 hover:bg-white/70 transition-all">
              <div className="w-12 h-12 bg-emerald-100/60 backdrop-blur-xl rounded-xl flex items-center justify-center mb-6">
                <div className="w-6 h-6 bg-emerald-700 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-3 tracking-tight">Constraint Engine</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Evidence-based constraint identification using severity, impact, evidence, dependency, and controllability scoring.
              </p>
              <div className="mt-6 pt-6 border-t border-stone-200/50">
                <span className="text-xs text-stone-500 uppercase tracking-widest">02</span>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg p-8 hover:bg-white/70 transition-all">
              <div className="w-12 h-12 bg-emerald-100/60 backdrop-blur-xl rounded-xl flex items-center justify-center mb-6">
                <div className="w-6 h-6 bg-emerald-700 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-3 tracking-tight">Outcome Tracking</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Baseline recording with 30/60/90 day reviews to measure the impact of interventions over time.
              </p>
              <div className="mt-6 pt-6 border-t border-stone-200/50">
                <span className="text-xs text-stone-500 uppercase tracking-widest">03</span>
              </div>
            </div>
          </div>

          {/* Stats panel */}
          <div className="bg-stone-900/80 backdrop-blur-2xl rounded-2xl border border-stone-700/50 shadow-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">10</div>
                <div className="text-xs text-stone-400 uppercase tracking-widest">Diagnostic Domains</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">60+</div>
                <div className="text-xs text-stone-400 uppercase tracking-widest">Questions</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">5</div>
                <div className="text-xs text-stone-400 uppercase tracking-widest">Constraint Factors</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with glassmorphism */}
      <footer className="relative z-10 bg-stone-900/90 backdrop-blur-2xl border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4 tracking-tight">Mindvest</h4>
              <p className="text-stone-400 text-sm">Diagnostic OS</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 tracking-tight text-xs uppercase tracking-widest">Platform</h4>
              <ul className="space-y-2 text-stone-400 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/businesses" className="hover:text-white transition-colors">Businesses</Link></li>
                <li><Link href="/diagnoses" className="hover:text-white transition-colors">Diagnoses</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 tracking-tight text-xs uppercase tracking-widest">Framework</h4>
              <ul className="space-y-2 text-stone-400 text-sm">
                <li><span className="hover:text-white transition-colors cursor-pointer">Documentation</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">API Reference</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Changelog</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 tracking-tight text-xs uppercase tracking-widest">Legal</h4>
              <ul className="space-y-2 text-stone-400 text-sm">
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 text-center">
            <p className="text-stone-500 text-xs uppercase tracking-widest">&copy; 2024 Mindvest Global Resources. Internal use only.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
