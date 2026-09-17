import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { 
  ArrowRight, 
  Activity, 
  Layers, 
  Cpu, 
  TrendingUp, 
  CheckCircle, 
  Sliders, 
  Compass, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react'

export default async function Home() {
  const user = await getUser()

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f4f6] relative overflow-x-hidden selection:bg-[#ff5722] selection:text-white">
      {/* Background Ambience & Minimalist Ring Glow (Inspired by Reference Image 1) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Glowing Orange Ring Accent */}
        <div className="absolute top-24 right-1/4 w-[420px] h-[420px] rounded-full border-[18px] border-[#ff5722]/20 blur-[3px] opacity-60 animate-pulse" />
        <div className="absolute top-36 right-1/4 w-[500px] h-[500px] rounded-full bg-[#ff5722]/10 blur-[140px]" />
        
        {/* Subtle Slate Radial Glow */}
        <div className="absolute -top-40 left-10 w-[650px] h-[650px] rounded-full bg-[#161a29]/60 blur-[130px]" />
        <div className="absolute top-2/3 -left-32 w-[550px] h-[550px] rounded-full bg-[#ff5722]/5 blur-[160px]" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="fixed inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* Minimalist Top Navigation Header (Inspired by Image 1 & 2) */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-[#090a0f]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5722] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff5722] shadow-[0_0_12px_#ff5722]"></span>
              </span>
              <span className="text-lg font-bold tracking-wider text-white font-sans">
                MINDVEST<span className="text-[#ff5722]">.</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 ml-2 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                DIAGNOSTIC OS
              </span>
            </Link>

            {/* Middle Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-[0.18em] text-zinc-400">
              <a href="#domains" className="hover:text-white transition-colors">10 Domains</a>
              <a href="#architecture" className="hover:text-white transition-colors">Framework</a>
              <a href="#intelligence" className="hover:text-white transition-colors">AI Engine</a>
              <a href="#outcomes" className="hover:text-white transition-colors">Outcomes</a>
            </nav>

            {/* Action CTA buttons (Frosted pill controls) */}
            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#ff5722] hover:bg-[#ff6e3a] text-white shadow-[0_2px_15px_rgba(255,87,34,0.4)] transition-all duration-200"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#ff6a38] to-[#ff5722] hover:from-[#ff7a4d] hover:to-[#ff6433] text-white shadow-[0_4px_18px_rgba(255,87,34,0.35)] transition-all duration-200"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Section (Combining Blvck Minimalist Dark & AirPods Max Editorial Scale) */}
      <main className="relative z-10">
        <section className="pt-20 pb-28 md:pt-28 md:pb-36 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Display Typography */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722] shadow-[0_0_8px_#ff5722]" />
                <span>Enterprise Framework v1.0</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.06]">
                Diagnose.<br />
                Design.<br />
                Connect.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#ff5722]">
                  Execute.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-xl font-light leading-relaxed">
                An internal business-diagnostic operating system for Mindvest Global Resources. 
                Surgically identify primary constraints, engineer high-leverage interventions, and measure verifiable business transformations.
              </p>

              {/* Minimalist Pill CTA & Audio/Demo Trigger Bar (Inspired by Image 1) */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white shadow-[0_4px_25px_rgba(255,87,34,0.4)] hover:shadow-[0_6px_32px_rgba(255,87,34,0.55)] transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span>Launch OS Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white shadow-[0_4px_25px_rgba(255,87,34,0.4)] hover:shadow-[0_6px_32px_rgba(255,87,34,0.55)] transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span>Explore Platform</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}

                <Link
                  href="#architecture"
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.1] hover:border-white/[0.2] transition-all duration-300"
                >
                  <span>Diagnostic Engine</span>
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <ChevronRight className="h-3 w-3 text-zinc-400" />
                  </div>
                </Link>
              </div>

              {/* Stat Indicators */}
              <div className="pt-8 border-t border-white/[0.07] grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono">10</div>
                  <div className="text-[11px] font-mono tracking-wider uppercase text-zinc-500 mt-1">Diagnostic Domains</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono">GPT-4</div>
                  <div className="text-[11px] font-mono tracking-wider uppercase text-zinc-500 mt-1">Evidence AI</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#ff5722] font-mono">30/90d</div>
                  <div className="text-[11px] font-mono tracking-wider uppercase text-zinc-500 mt-1">Outcome Reviews</div>
                </div>
              </div>
            </div>

            {/* Right Column: Sleek Matte Diagnostic Mockup & Amber Ring Accent */}
            <div className="lg:col-span-5 relative">
              {/* Geometric Ring Motif from Reference Image 1 */}
              <div className="absolute -top-12 -right-8 w-64 h-64 rounded-full border-[16px] border-[#ff5722] opacity-80 pointer-events-none z-0 hidden sm:block" />

              {/* Minimalist Matte Obsidian Card */}
              <div className="relative z-10 bg-[#0e1017]/95 backdrop-blur-2xl rounded-3xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="flex items-center justify-between pb-5 border-b border-white/[0.07] mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff5722] shadow-[0_0_8px_#ff5722]" />
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-300">Live Constraint Engine</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    CALIBRATED
                  </span>
                </div>

                {/* Constraint Matrix Item */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#ff5722]/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#ff5722]">Primary Bottleneck</span>
                      <span className="text-xs font-mono text-zinc-400">Score 8.6</span>
                    </div>
                    <p className="text-sm font-semibold text-white">Sales & Conversion Friction</p>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Lead volume is healthy but proposal-to-close conversion is 4.2% below industry baseline.
                    </p>
                    <div className="mt-3 w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#ff6a38] to-[#ff5722] h-full w-[86%]" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Secondary Constraint</span>
                      <span className="text-xs font-mono text-zinc-400">Score 6.8</span>
                    </div>
                    <p className="text-sm font-semibold text-white">Operational Bottlenecks</p>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Fulfillment capacity constrained by single-founder delivery dependencies.
                    </p>
                    <div className="mt-3 w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[68%]" />
                    </div>
                  </div>

                  {/* AI Root-Cause Synthesis */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121520] to-[#0d0f16] border border-white/[0.08]">
                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium mb-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#ff5722]" />
                      <span>Synthesized Intervention</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Implement two-tier qualification protocol; decouple founder from initial discovery phase to reclaim 14 hrs/week.
                    </p>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-6 pt-4 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>FRAMEWORK MODEL 4.2</span>
                  <span className="text-zinc-400">99.4% CONFIDENCE</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: 10 Diagnostic Domains (Spacious Editorial Layout from Image 2) */}
        <section id="domains" className="py-24 border-t border-white/[0.06] bg-[#0c0e14]/50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="max-w-2xl mb-16">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
                Comprehensive Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-3 mb-4">
                Ten Architectural Domains.
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
                Every business constraint lives somewhere in the system. The Mindvest Diagnostic OS evaluates all ten interconnected vectors with rigorous quantitative benchmarks.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Business Foundation', desc: 'Core model, stage, economic logic, objectives, and foundational strategic clarity.' },
                { title: 'Market & Customer', desc: 'ICP definition, pain severity, market depth, competitive moat, and customer feedback.' },
                { title: 'Offer & Value', desc: 'Value clarity, outcome engineering, pricing architecture, differentiation, and margins.' },
                { title: 'Positioning & Brand', desc: 'Category ownership, credibility signals, perceived authority, and market recognition.' },
                { title: 'Marketing & Demand', desc: 'CAC efficiency, channel consistency, lead velocity, attribution, and ROI metrics.' },
                { title: 'Sales & Conversion', desc: 'Pipeline velocity, conversion funnel stages, deal qualification, and closing cycles.' },
                { title: 'Operations & Delivery', desc: 'Capacity constraints, cycle times, quality control, automation, and operational waste.' },
                { title: 'Financial Engine', desc: 'Gross & net margin health, cash runway, receivables, break-even velocity, and CLV.' },
                { title: 'People & Leadership', desc: 'Founder dependency, team capacity, delegation matrix, accountability, and culture.' },
                { title: 'Strategy & Execution', desc: 'Resource allocation, OKR execution discipline, KPI cadence, and pivot agility.' },
              ].map((domain, index) => (
                <div
                  key={domain.title}
                  className="group p-6 rounded-2xl bg-[#10121a]/60 hover:bg-[#141722]/90 border border-white/[0.07] hover:border-[#ff5722]/40 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono tracking-widest text-[#ff5722]">
                      0{index + 1}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#ff5722] transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-white tracking-tight mb-2">
                    {domain.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {domain.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: The Framework Flow (Image 2 style: Epiphany & Precision) */}
        <section id="architecture" className="py-24 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
                Methodology
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mt-3 mb-6">
                Sounds like an epiphany.<br />Works like engineering.
              </h2>
              <p className="text-base text-zinc-400 font-light">
                Consulting without structured diagnosis is malpractice. Mindvest turns intuition into repeatable science.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  name: 'Diagnose',
                  tag: 'Evidence-Based',
                  text: 'Collect structured empirical data, revenue metrics, and qualitative signals across the 10 domains.'
                },
                {
                  step: '02',
                  name: 'Design',
                  tag: 'Constraint Engine',
                  text: 'Rank bottlenecks by Severity × Impact × Dependency to focus exclusively on the #1 constraint.'
                },
                {
                  step: '03',
                  name: 'Connect',
                  tag: 'Surgical Actions',
                  text: 'Prescribe concrete operational blueprints, role reassignments, and pricing adjustments.'
                },
                {
                  step: '04',
                  name: 'Execute',
                  tag: 'Verifiable 90d',
                  text: 'Monitor 30, 60, and 90-day progress against baseline metrics with automated variance tracking.'
                }
              ].map((phase) => (
                <div 
                  key={phase.name} 
                  className="p-7 rounded-3xl bg-[#0e1017] border border-white/[0.08] relative overflow-hidden group hover:border-[#ff5722]/50 transition-all duration-300"
                >
                  <div className="text-3xl font-bold font-mono text-white/[0.15] group-hover:text-[#ff5722]/40 transition-colors mb-4">
                    {phase.step}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#ff5722] bg-[#ff5722]/10 px-2 py-0.5 rounded">
                    {phase.tag}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-3 mb-2">
                    {phase.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    {phase.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-24 border-t border-white/[0.06] bg-gradient-to-b from-[#090a0f] to-[#0e111a] text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#ff5722]/15 blur-[120px] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#ff5722] mb-3 inline-block">
              Immediate Deployment
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
              Ready to engineer your next business transformation?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-10 text-sm sm:text-base font-light">
              Access the diagnostic terminal, benchmark enterprise clients, and generate comprehensive PDF audit reports in minutes.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white shadow-[0_4px_25px_rgba(255,87,34,0.4)] hover:shadow-[0_6px_35px_rgba(255,87,34,0.6)] transition-all duration-300"
              >
                <span>{user ? "Enter Command Center" : "Sign In to Terminal"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!user && (
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.1] transition-all duration-300"
                >
                  <span>Create Account</span>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-white/[0.07] bg-[#07080c] py-12 text-zinc-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-white font-bold tracking-wider font-sans">MINDVEST.</span>
            <span>© 2026 Mindvest Global Resources</span>
          </div>
          <div className="flex gap-6 uppercase tracking-widest text-[10px]">
            <Link href="/login" className="hover:text-white transition-colors">Portal</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="#domains" className="hover:text-white transition-colors">Framework</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
