'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Eye, Clock, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react'

interface DiagnosisSession {
  id: string
  business_id: string
  status: string
  overall_score: number | null
  started_at: string
  completed_at: string | null
  businesses: {
    business_name: string
    industry?: string
    location?: string
  }
}

export default function DiagnosesPage() {
  const [sessions, setSessions] = useState<DiagnosisSession[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSessions()

    const channel = supabase
      .channel('sessions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diagnostic_sessions' }, () => {
        fetchSessions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('diagnostic_sessions')
      .select('*, businesses(*)')
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
    } else {
      setSessions((data as any) || [])
    }
    setLoading(false)
  }

  const getScoreBadge = (score: number | null) => {
    if (score === null || score === undefined) return <span className="text-zinc-500 text-xs font-mono">In Progress</span>
    if (score >= 7) return <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded text-xs font-mono border border-emerald-500/20">{score.toFixed(1)} / 10</span>
    if (score >= 5) return <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded text-xs font-mono border border-amber-500/20">{score.toFixed(1)} / 10</span>
    return <span className="text-red-400 bg-red-500/10 px-2.5 py-1 rounded text-xs font-mono border border-red-500/20">{score.toFixed(1)} / 10</span>
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
              Audit Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Diagnostic Sessions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
            Historical and active enterprise diagnostic audits, scores, and reports.
          </p>
        </div>

        <Link
          href="/dashboard/diagnoses/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white text-xs font-semibold shadow-[0_3px_15px_rgba(255,87,34,0.35)] hover:shadow-[0_5px_20px_rgba(255,87,34,0.5)] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Diagnosis</span>
        </Link>
      </div>

      {/* Sessions List */}
      <div className="bg-[#10121a]/90 rounded-2xl border border-white/[0.07] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading diagnostic sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-xs text-zinc-400">No diagnostic assessments logged yet.</p>
            <Link
              href="/dashboard/diagnoses/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-[#ff5722] text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Launch Assessment</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-base font-bold text-white">
                      {session.businesses?.business_name || 'Client Organization'}
                    </h3>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      session.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {session.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-mono">
                    <span>Started: {new Date(session.started_at).toLocaleDateString()}</span>
                    {session.businesses?.industry && <span>• {session.businesses.industry}</span>}
                    {session.businesses?.location && <span>• {session.businesses.location}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Overall Score</div>
                    {getScoreBadge(session.overall_score)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/diagnoses/${session.id}/report`}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.07] transition-colors"
                      title="View PDF / Diagnostic Report"
                    >
                      <FileText className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/diagnoses/${session.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ff5722]/10 hover:bg-[#ff5722] text-[#ff5722] hover:text-white border border-[#ff5722]/30 hover:border-[#ff5722] text-xs font-medium transition-all"
                    >
                      <span>Analysis</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}