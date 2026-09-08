'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-100 via-emerald-50 to-eucalyptus-100 relative overflow-hidden flex items-center justify-center">
      {/* Floating decorative spheres */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 opacity-60 blur-sm"></div>
      <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 opacity-40 blur-sm"></div>
      <div className="absolute bottom-40 left-40 w-20 h-20 rounded-full bg-gradient-to-br from-stone-300 to-stone-400 opacity-50 blur-sm"></div>
      <div className="absolute top-60 right-60 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-400 opacity-30 blur-sm"></div>

      {/* Glassmorphism signup panel */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-2">Mindvest</h1>
            <span className="text-xs font-medium text-stone-500 uppercase tracking-widest">Diagnostic OS</span>
          </div>

          <div className="mb-8">
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-widest mb-2">Create Account</p>
            <p className="text-stone-600 text-sm">Join the diagnostic platform</p>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur-xl border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                  placeholder="••••••••"
                />
                <p className="mt-2 text-xs text-stone-500">Minimum 6 characters</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 text-white py-4 rounded-xl font-medium hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-lg shadow-emerald-700/20"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <div className="text-center pt-4">
              <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Already have an account? <span className="font-medium">Sign in</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-stone-500 hover:text-stone-700 transition-colors uppercase tracking-widest">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
