'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Stethoscope, 
  AlertTriangle, 
  Wrench, 
  TrendingUp, 
  BookOpen, 
  Settings,
  LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white/5 backdrop-blur-2xl border-r border-white/10 w-64 min-h-screen hidden lg:block">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">Mindvest</h1>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Diagnostic OS v1.0</p>
      </div>
      <div className="px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-700/90 backdrop-blur-xl text-white border border-emerald-600/50'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              {item.name}
            </Link>
          )
        })}
      </div>
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white rounded-xl transition-all"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-500" />
          Sign out
        </button>
      </div>
    </nav>
  )
}
