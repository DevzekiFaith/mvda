'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Wrench, Plus, CheckCircle2, Clock, Target, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface Intervention {
  id: string
  session_id: string
  title: string
  description: string
  priority: string
  status: string
  created_at: string
  diagnostic_sessions: {
    id: string
    businesses: {
      business_name: string
    }
  }
}

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')

  useEffect(() => {
    fetchInterventions()

    const channel = supabase
      .channel('interventions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interventions' }, () => {
        fetchInterventions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchInterventions = async () => {
    const { data, error } = await supabase
      .from('interventions')
      .select('*, diagnostic_sessions(*, businesses(*))')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching interventions:', error)
    } else {
      setInterventions((data as any) || [])
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('interventions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setInterventions(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv))
    }
  }

  const filteredInterventions = interventions.filter(inv =>
    statusFilter === 'all' || inv.status === statusFilter
  )

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-500/10 text-red-400 border border-red-500/20">High Priority</span>
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium Priority</span>
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Low Priority</span>
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
              Execution Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Surgical Interventions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
            Prescribed actions, operational redesigns, and constraint alleviation plans.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-x-auto">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-[#ff5722] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Interventions Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading active interventions...</div>
      ) : filteredInterventions.length === 0 ? (
        <div className="p-12 text-center bg-[#10121a]/80 rounded-2xl border border-white/[0.07] text-xs text-zinc-400">
          No interventions matching this status filter. Run a business diagnosis to generate actionable recommendations.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInterventions.map((inv) => {
            const businessName = inv.diagnostic_sessions?.businesses?.business_name || 'Client Business'

            return (
              <div
                key={inv.id}
                className="p-6 rounded-2xl bg-[#10121a]/90 border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {getPriorityBadge(inv.priority)}
                    <select
                      value={inv.status}
                      onChange={(e) => updateStatus(inv.id, e.target.value)}
                      className="text-[10px] font-mono uppercase bg-[#141722] border border-white/[0.08] text-zinc-300 rounded px-2 py-0.5 focus:outline-none focus:border-[#ff5722]"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {inv.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed mb-4">
                    {inv.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <span className="truncate max-w-[150px]">{businessName}</span>
                  {inv.session_id && (
                    <Link
                      href={`/dashboard/diagnoses/${inv.session_id}`}
                      className="text-[#ff5722] hover:underline inline-flex items-center gap-1 font-sans"
                    >
                      <span>Session</span>
                      <ArrowRight className="h-3 w-3" />
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