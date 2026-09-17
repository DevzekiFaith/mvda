import Link from 'next/link'
import { ArrowLeft, Home, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f4f6] relative flex items-center justify-center p-6 overflow-hidden selection:bg-[#ff5722] selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
        <div className="absolute top-1/4 right-10 w-64 h-64 rounded-full border-[12px] border-[#ff5722]/20 blur-[2px] opacity-60 animate-pulse" />
        <div className="absolute top-1/3 left-10 w-80 h-80 rounded-full bg-[#ff5722]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" />
          <span>Error 404 • Not Found</span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-bold font-mono tracking-tight text-white">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-200">
            Page Not Found
          </h2>
          <p className="text-xs text-zinc-400 font-light max-w-sm mx-auto leading-relaxed">
            The requested diagnostic resource, endpoint, or business dossier does not exist or has been moved.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-zinc-200 hover:text-white transition-all"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white shadow-[0_3px_15px_rgba(255,87,34,0.35)] hover:shadow-[0_5px_20px_rgba(255,87,34,0.5)] transition-all"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
