'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Building2, 
  Stethoscope, 
  AlertTriangle, 
  Wrench, 
  ArrowRight, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Flame,
  FileText,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    businessCount: 0,
    sessionCount: 0,
    constraintCount: 0,
    interventionCount: 0,
  })
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [topConstraints, setTopConstraints] = useState<any[]>([])
  const [pendingInterventions, setPendingInterventions] = useState<any[]>([])

  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    fetchDashboardData()

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, () => {
        fetchDashboardData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diagnostic_sessions' }, () => {
        fetchDashboardData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'constraints' }, () => {
        fetchDashboardData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interventions' }, () => {
        fetchDashboardData()
      })
      .subscribe((status: string) => {
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [
        businessesRes,
        sessionsRes,
        constraintsRes,
        interventionsRes,
      ] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact' }),
        supabase.from('diagnostic_sessions').select('*, businesses(*)').order('started_at', { ascending: false }).limit(5),
        supabase.from('constraints').select('*, diagnostic_sessions(*, businesses(*))').order('priority_score', { ascending: false }).limit(4),
        supabase.from('interventions').select('*, diagnostic_sessions(*, businesses(*))').order('created_at', { ascending: false }).limit(4),
      ])

      setStats({
        businessCount: businessesRes.count || businessesRes.data?.length || 0,
        sessionCount: sessionsRes.data?.length || 0,
        constraintCount: constraintsRes.data?.length || 0,
        interventionCount: interventionsRes.data?.length || 0,
      })

      setRecentSessions(sessionsRes.data || [])
      setTopConstraints(constraintsRes.data || [])
      setPendingInterventions(interventionsRes.data || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreBadge = (score: number | null) => {
    if (score === null || score === undefined) return <span className="text-zinc-500 text-xs font-mono">Pending</span>
    if (score >= 7) return <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-xs font-mono border border-emerald-500/20">{score.toFixed(1)} / 10</span>
    if (score >= 5) return <span className="text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full text-xs font-mono border border-amber-500/20">{score.toFixed(1)} / 10</span>
    return <span className="text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full text-xs font-mono border border-red-500/20">{score.toFixed(1)} / 10</span>
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5722] shadow-[0_0_8px_#ff5722]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
              Operational Terminal
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Real-Time Live</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Command Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
            Diagnostic analytics, active constraint rankings, and surgical interventions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/businesses"
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-all"
          >
            Manage Businesses
          </Link>
          <Link
            href="/dashboard/diagnoses/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white text-xs font-semibold shadow-[0_3px_15px_rgba(255,87,34,0.35)] hover:shadow-[0_5px_20px_rgba(255,87,34,0.5)] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Diagnosis</span>
          </Link>
        </div>
      </div>

      {/* 4 Quantitative Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Client Businesses', value: stats.businessCount, icon: Building2, href: '/dashboard/businesses' },
          { label: 'Diagnostic Runs', value: stats.sessionCount, icon: Stethoscope, href: '/dashboard/diagnoses' },
          { label: 'Active Constraints', value: stats.constraintCount, icon: AlertTriangle, href: '/dashboard/constraints' },
          { label: 'Interventions', value: stats.interventionCount, icon: Wrench, href: '/dashboard/interventions' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className="p-5 rounded-2xl bg-[#10121a]/80 hover:bg-[#141722] border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                  {item.label}
                </span>
                <div className="p-2 rounded-lg bg-white/[0.04] text-zinc-400 group-hover:text-[#ff5722] transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-bold font-mono text-white group-hover:text-[#ff5722] transition-colors">
                {loading ? '—' : item.value}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Main Grid: Diagnoses & Constraints */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Recent Diagnostic Sessions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-[#ff5722]" />
              <h2 className="text-base font-semibold text-white tracking-tight">Recent Diagnoses</h2>
            </div>
            <Link 
              href="/dashboard/diagnoses" 
              className="text-xs text-zinc-400 hover:text-[#ff5722] flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-[#10121a]/80 rounded-2xl border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono">Loading sessions...</div>
            ) : recentSessions.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-zinc-400">No diagnostic sessions recorded yet.</p>
                <Link
                  href="/dashboard/diagnoses/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#ff5722] text-white shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Start First Diagnosis</span>
                </Link>
              </div>
            ) : (
              recentSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {s.businesses?.business_name || 'Client Assessment'}
                      </p>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        s.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                      <span>{new Date(s.started_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>v{s.framework_version || '1.0'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-mono uppercase text-zinc-500 mb-0.5">Score</div>
                      {getScoreBadge(s.overall_score)}
                    </div>

                    <Link
                      href={`/dashboard/diagnoses/${s.id}`}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] transition-all"
                      title="View Details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Top Identified Constraints */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#ff5722]" />
              <h2 className="text-base font-semibold text-white tracking-tight">Top Constraints</h2>
            </div>
            <Link 
              href="/dashboard/constraints" 
              className="text-xs text-zinc-400 hover:text-[#ff5722] flex items-center gap-1 transition-colors"
            >
              <span>Explore map</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono bg-[#10121a]/80 rounded-2xl border border-white/[0.07]">
                Loading constraints...
              </div>
            ) : topConstraints.length === 0 ? (
              <div className="p-8 text-center bg-[#10121a]/80 rounded-2xl border border-white/[0.07] text-xs text-zinc-400">
                No active bottlenecks identified yet. Complete a diagnostic questionnaire to reveal constraints.
              </div>
            ) : (
              topConstraints.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-[#10121a]/80 border border-white/[0.07] hover:border-[#ff5722]/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff5722] bg-[#ff5722]/10 px-2 py-0.5 rounded">
                      {c.constraint_type} Constraint
                    </span>
                    <span className="text-xs font-mono font-semibold text-white">
                      Priority {c.priority_score || c.severity || '—'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-200 line-clamp-2">
                    {c.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span className="truncate">
                      {c.diagnostic_sessions?.businesses?.business_name || 'Organization'}
                    </span>
                    <span>Sev: {c.severity || '—'}/10</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Bottom Section: Active Interventions Blueprint */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-[#ff5722]" />
            <h2 className="text-base font-semibold text-white tracking-tight">Active Interventions</h2>
          </div>
          <Link 
            href="/dashboard/interventions" 
            className="text-xs text-zinc-400 hover:text-[#ff5722] flex items-center gap-1 transition-colors"
          >
            <span>All interventions</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full p-8 text-center text-xs text-zinc-500 font-mono bg-[#10121a]/80 rounded-2xl border border-white/[0.07]">
              Loading interventions...
            </div>
          ) : pendingInterventions.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-[#10121a]/80 rounded-2xl border border-white/[0.07] text-xs text-zinc-400">
              No active interventions currently deployed.
            </div>
          ) : (
            pendingInterventions.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-2xl bg-[#10121a]/80 border border-white/[0.07] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      inv.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {inv.priority}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{inv.status}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-white mb-1 line-clamp-2">{inv.title}</h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{inv.description}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.05] text-[10px] font-mono text-zinc-500 truncate">
                  {inv.diagnostic_sessions?.businesses?.business_name || 'Client Business'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
