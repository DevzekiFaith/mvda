'use client'

import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Lock, Mail, User as UserIcon, CheckCircle2, AlertTriangle } from 'lucide-react'


export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        }),
      })

      const resData = await res.json()

      if (!res.ok) {
        setError(resData.error || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      if (resData.hasSession) {
        // Also synchronize client-side session if available
        if (isSupabaseConfigured) {
          try {
            await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            })
          } catch (_) {}
        }
        window.location.href = '/dashboard'
      } else {
        setSuccessMessage(
          'Account created successfully! If email confirmation is enabled on your Supabase project, please check your inbox to verify before signing in.'
        )
        setLoading(false)
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f4f6] relative flex items-center justify-center p-4 overflow-hidden antialiased">
      {/* Background Ambience & Minimalist Ring Motif */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
        <div className="absolute top-1/4 right-10 w-72 h-72 rounded-full border-[14px] border-[#ff5722]/30 blur-[2px] opacity-70 animate-pulse" />
        <div className="absolute top-1/3 left-10 w-96 h-96 rounded-full bg-[#ff5722]/10 blur-[120px] pointer-events-none" />
      </div>

      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Brand header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5722] shadow-[0_0_12px_#ff5722]" />
            <span className="text-lg font-bold tracking-wider text-white">
              MINDVEST<span className="text-[#ff5722]">.</span>
            </span>
          </Link>
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-500 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
            Consultant Onboarding
          </span>
        </div>

        {/* Minimalist Glass Card */}
        <div className="bg-[#10121a]/90 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#ff5722]/40 to-transparent" />

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Create Account
            </h1>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Register as an accredited consultant to initiate enterprise business diagnoses.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-200">Supabase Credentials Not Found</p>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  Ensure <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are configured in your Vercel Project Settings &gt; Environment Variables.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white mb-1">Registration Complete</p>
                <p>{successMessage}</p>
                <Link href="/login" className="inline-block mt-3 text-xs font-semibold text-[#ff5722] hover:underline">
                  Proceed to Sign In →
                </Link>
              </div>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label 
                  htmlFor="fullName" 
                  className="block text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-400 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Marcus Sterling"
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] border border-white/[0.08] focus:border-[#ff5722]/70 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#ff5722]/50 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-400 mb-2"
                >
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="consultant@mindvest.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] border border-white/[0.08] focus:border-[#ff5722]/70 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#ff5722]/50 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-400 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-11 py-3 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] border border-white/[0.08] focus:border-[#ff5722]/70 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#ff5722]/50 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium text-xs tracking-wider uppercase bg-gradient-to-r from-[#ff6a38] to-[#ff5722] hover:from-[#ff7a4d] hover:to-[#ff6433] text-white shadow-[0_4px_25px_rgba(255,87,34,0.35)] hover:shadow-[0_6px_30px_rgba(255,87,34,0.5)] border border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Consultant ID</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-xs text-zinc-400">
              Already registered?{' '}
              <Link 
                href="/login" 
                className="text-[#ff5722] hover:text-[#ff7844] font-medium transition-colors ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-2"
          >
            <span>←</span> Back to Mindvest
          </Link>
        </div>
      </div>
    </div>
  )
}
