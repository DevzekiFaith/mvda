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
    <nav className="bg-white/80 backdrop-blur-2xl border-r border-stone-200 w-64 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Mindvest</h1>
        <p className="text-xs font-medium text-stone-500 uppercase tracking-widest mt-1">Diagnostic OS v1.0</p>
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
                  ? 'bg-emerald-100/80 backdrop-blur-xl text-emerald-900'
                  : 'text-stone-600 hover:bg-stone-100/50'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
              {item.name}
            </Link>
          )
        })}
      </div>
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-stone-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-stone-600 hover:bg-stone-100/50 rounded-xl transition-all"
        >
          <LogOut className="mr-3 h-5 w-5 text-stone-400" />
          Sign out
        </button>
      </div>
    </nav>
  )
}
