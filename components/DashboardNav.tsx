'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  Building2, 
  Stethoscope, 
  AlertTriangle, 
  Wrench, 
  TrendingUp, 
  BookOpen, 
  Settings,
  LogOut,
  User,
  Menu,
  X,
  PlusCircle,
  ExternalLink
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Businesses', href: '/dashboard/businesses', icon: Building2 },
  { name: 'Diagnoses', href: '/dashboard/diagnoses', icon: Stethoscope },
  { name: 'Constraints', href: '/dashboard/constraints', icon: AlertTriangle },
  { name: 'Interventions', href: '/dashboard/interventions', icon: Wrench },
  { name: 'Outcomes', href: '/dashboard/outcomes', icon: TrendingUp },
  { name: 'Case Studies', href: '/dashboard/case-studies', icon: BookOpen },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      // 1. Client-side sign out
      await supabase.auth.signOut()
      // 2. Server-side cookie clear
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      // 3. Clear storage and force hard refresh to login
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      window.location.href = '/login'
    }
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'Consultant'
  }

  const NavLinks = () => (
    <div className="space-y-1.5 px-3">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.1]'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-[#ff5722]' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              <span>{item.name}</span>
            </div>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722] shadow-[0_0_8px_#ff5722]" />
            )}
          </Link>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-5 h-16 bg-[#090a0f]/90 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5722] shadow-[0_0_10px_#ff5722]" />
            <span className="font-semibold text-white tracking-tight text-sm">MINDVEST<span className="text-[#ff5722]">.</span></span>
          </Link>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">OS</span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff5722] shadow-[0_0_10px_#ff5722]" />
                <span className="font-semibold text-white tracking-tight">MINDVEST OS</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks />
          </div>

          <div className="pt-6 border-t border-white/[0.08] space-y-3">
            {user && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/[0.1] flex items-center justify-center text-xs font-semibold text-white">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">{getUserDisplayName()}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col justify-between w-64 min-h-screen bg-[#090a0f] border-r border-white/[0.07] shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Brand Header */}
          <div className="p-6 pb-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5722] opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff5722] shadow-[0_0_12px_#ff5722]"></span>
              </span>
              <div>
                <span className="text-base font-bold tracking-wider text-white">
                  MINDVEST<span className="text-[#ff5722]">.</span>
                </span>
                <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 mt-0.5">
                  Diagnostic OS v1.0
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Action Button */}
          <div className="px-4 mb-4">
            <Link
              href="/dashboard/diagnoses/new"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-[#ff5722] text-zinc-200 hover:text-white text-xs font-semibold border border-white/[0.08] hover:border-[#ff5722] transition-all duration-300 shadow-sm group"
            >
              <PlusCircle className="h-3.5 w-3.5 text-[#ff5722] group-hover:text-white transition-colors" />
              <span>New Diagnosis</span>
            </Link>
          </div>

          {/* Main Navigation links */}
          <div className="mb-6">
            <p className="px-6 pb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">
              Workspace
            </p>
            <NavLinks />
          </div>
        </div>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="p-4 border-t border-white/[0.07] bg-[#0c0e14]/60 space-y-3">
          {!loading && user && (
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/[0.15] flex items-center justify-center text-xs font-semibold text-white shadow-inner">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{getUserDisplayName()}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Consultant</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/[0.08] border border-transparent hover:border-red-500/20 transition-all duration-200 group"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-3.5 w-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </span>
            <span className="text-[10px] font-mono text-zinc-600 group-hover:text-red-400">Esc</span>
          </button>
        </div>
      </aside>
    </>
  )
}
