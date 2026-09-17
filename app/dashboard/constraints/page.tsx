'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { AlertTriangle, TrendingUp, Filter, ExternalLink, ShieldAlert, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Constraint {
  id: string
  session_id: string
  constraint_type: string
  description: string
  severity: number
  financial_impact: number
  priority_score: number
  symptoms?: string
  opportunity?: string
  created_at: string
  diagnostic_sessions: {
    id: string
    businesses: {
      business_name: string
      industry?: string
    }
  }
}

export default function ConstraintsPage() {
  const [constraints, setConstraints] = useState<Constraint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'primary' | 'secondary'>('all')

  useEffect(() => {
    fetchConstraints()

    const channel = supabase
      .channel('constraints-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'constraints' }, () => {
        fetchConstraints()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchConstraints = async () => {
    const { data, error } = await supabase
      .from('constraints')
      .select('*, diagnostic_sessions(*, businesses(*))')
      .order('priority_score', { ascending: false })

    if (error) {
      console.error('Error fetching constraints:', error)
    } else {
      setConstraints((data as any) || [])
    }
    setLoading(false)
  }

  const filteredConstraints = constraints.filter(c => 
    filter === 'all' || c.constraint_type?.toLowerCase() === filter
  )

  const getSeverityBadge = (severity: number) => {
    if (severity >= 8) return <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[11px] font-mono">Critical ({severity}/10)</span>
    if (severity >= 5) return <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[11px] font-mono">High ({severity}/10)</span>
    return <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-mono">Moderate ({severity}/10)</span>
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
              Constraint Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Identified Constraints
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
            Ranked organizational bottlenecks by Severity × Impact × Evidence × Controllability.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          {(['all', 'primary', 'secondary'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                filter === tab
                  ? 'bg-[#ff5722] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Constraint List */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500">Calculating constraint rankings...</div>
      ) : filteredConstraints.length === 0 ? (
        <div className="p-12 text-center bg-[#10121a]/80 rounded-2xl border border-white/[0.07] text-xs text-zinc-400">
          No bottlenecks identified under this category. Run a business diagnosis to generate constraint telemetry.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConstraints.map((c) => {
            const businessName = c.diagnostic_sessions?.businesses?.business_name || 'Client Organization'
            const industry = c.diagnostic_sessions?.businesses?.industry

            return (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-[#10121a]/90 border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#ff5722]/10 text-[#ff5722] border border-[#ff5722]/20 font-semibold">
                        {c.constraint_type} Bottleneck
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        {businessName} {industry ? `• ${industry}` : ''}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {c.description}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-zinc-500">Priority Score</div>
                      <div className="text-lg font-bold font-mono text-white">{c.priority_score ? c.priority_score.toFixed(1) : (c.severity || '—')}</div>
                    </div>
                    {getSeverityBadge(c.severity || 0)}
                  </div>
                </div>

                {/* Symptoms / Opportunity Callout */}
                {(c.symptoms || c.opportunity) && (
                  <div className="mt-4 pt-4 border-t border-white/[0.05] grid sm:grid-cols-2 gap-4 text-xs font-light text-zinc-400">
                    {c.symptoms && (
                      <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 block mb-1">
                          Observed Symptoms
                        </span>
                        <p>{c.symptoms}</p>
                      </div>
                    )}
                    {c.opportunity && (
                      <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                          Economic Opportunity
                        </span>
                        <p>{c.opportunity}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <span>Logged {new Date(c.created_at).toLocaleDateString()}</span>
                  {c.session_id && (
                    <Link
                      href={`/dashboard/diagnoses/${c.session_id}`}
                      className="text-[#ff5722] hover:text-[#ff7a4d] inline-flex items-center gap-1 font-sans font-medium transition-colors"
                    >
                      <span>View Session Analysis</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}