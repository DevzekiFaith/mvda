'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TrendingUp, BarChart3, Calendar, DollarSign, Users, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

export default function OutcomesPage() {
  const [baselines, setBaselines] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOutcomesData()

    const channel = supabase
      .channel('outcomes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'baseline_metrics' }, () => {
        fetchOutcomesData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        fetchOutcomesData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchOutcomesData = async () => {
    try {
      const [baselinesRes, reviewsRes] = await Promise.all([
        supabase.from('baseline_metrics').select('*, businesses(*), diagnostic_sessions(*)').order('recorded_at', { ascending: false }),
        supabase.from('reviews').select('*, businesses(*)').order('review_date', { ascending: false }),
      ])

      setBaselines(baselinesRes.data || [])
      setReviews(reviewsRes.data || [])
    } catch (err) {
      console.error('Error fetching outcomes:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatMoney = (val: number | null) => {
    if (val === null || val === undefined) return '—'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
              Variance & Accountability
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Performance Outcomes
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
            Baseline metric tracking and 30 / 60 / 90-day intervention review milestones.
          </p>
        </div>
      </div>

      {/* Baseline Metric Profiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#ff5722]" />
            <h2 className="text-base font-semibold text-white tracking-tight">Client Baseline Telemetry</h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">{baselines.length} Recorded Baselines</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading outcome baselines...</div>
        ) : baselines.length === 0 ? (
          <div className="p-12 text-center bg-[#10121a]/80 rounded-2xl border border-white/[0.07] text-xs text-zinc-400">
            No baseline metrics logged yet. Open any diagnosis and navigate to Baseline to establish pre-intervention KPIs.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {baselines.map((b) => (
              <div
                key={b.id}
                className="p-6 rounded-2xl bg-[#10121a]/90 border border-white/[0.07] hover:border-white/[0.15] transition-all"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {b.businesses?.business_name || 'Client Business'}
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Logged {new Date(b.recorded_at).toLocaleDateString()}
                    </span>
                  </div>
                  {b.session_id && (
                    <Link
                      href={`/dashboard/diagnoses/${b.session_id}/baseline`}
                      className="text-xs font-medium text-[#ff5722] hover:underline"
                    >
                      Update Baseline
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Monthly Revenue</span>
                    <span className="text-base font-bold font-mono text-white">{formatMoney(b.revenue)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Net Cash Flow</span>
                    <span className="text-base font-bold font-mono text-white">{formatMoney(b.cash_flow)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Conversion Rate</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {b.conversion_rate ? `${b.conversion_rate}%` : '—'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Monthly Leads</span>
                    <span className="text-base font-bold font-mono text-white">{b.leads || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 30/60/90 Day Review Milestones */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#ff5722]" />
            <h2 className="text-base font-semibold text-white tracking-tight">Review Milestones (30/60/90 Days)</h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">{reviews.length} Completed Reviews</span>
        </div>

        {reviews.length === 0 && !loading && (
          <div className="p-8 text-center bg-[#10121a]/80 rounded-2xl border border-white/[0.07] text-xs text-zinc-400">
            Reviews will populate as intervention milestones reach 30, 60, and 90-day intervals.
          </div>
        )}

        {reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-[#10121a]/90 border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#ff5722]/10 text-[#ff5722] border border-[#ff5722]/20 font-semibold">
                      {r.review_type?.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {r.businesses?.business_name || 'Client Business'}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 font-light">
                    Intervention: {r.intervention_applied || 'Standard Protocol'}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-zinc-500">Result</div>
                    <div className="text-sm font-semibold text-emerald-400 font-mono">
                      {r.result || 'Achieved'}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {new Date(r.review_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}