'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, Bell, Shield, Palette, Database, LogOut, CheckCircle2, KeyRound } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await supabase.auth.signOut()
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      window.location.href = '/login'
    } catch (err) {
      window.location.href = '/login'
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
              System Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Consultant Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
            Identity, security parameters, and terminal environment preferences.
          </p>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading configuration...</div>
      ) : (
        <div className="space-y-6">
          {/* Profile Dossier */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#10121a]/90 border border-white/[0.08] shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/[0.1] flex items-center justify-center text-xl font-bold text-white shadow-inner">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Consultant Profile'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-zinc-400">Authenticated Consultant</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] uppercase text-zinc-500 block mb-1">Email Address</span>
                <span className="text-zinc-200">{user?.email}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] uppercase text-zinc-500 block mb-1">UUID</span>
                <span className="text-zinc-400 truncate block">{user?.id}</span>
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#10121a]/90 border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-5 w-5 text-[#ff5722]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Security & Session Management
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Sessions are guarded with encrypted HTTP-only SSR cookies via Supabase Auth. Terminating your session clears client and server storage immediately.
            </p>
            <div className="pt-2">
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.08] hover:border-red-500/30 text-xs font-medium text-zinc-300 hover:text-red-400 transition-all"
              >
                Terminate Active Session & Logout
              </button>
            </div>
          </div>

          {/* Theme & Terminal Aesthetic */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#10121a]/90 border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Palette className="h-5 w-5 text-[#ff5722]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Visual System
              </h3>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div>
                <p className="text-xs font-semibold text-white">Matte Obsidian & Ember Mode</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">High-contrast executive minimalist palette</p>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#ff5722]/10 text-[#ff5722] border border-[#ff5722]/20 font-semibold">
                Active System
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}