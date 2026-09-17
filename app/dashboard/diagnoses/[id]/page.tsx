'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertTriangle, Edit2, Save, Download, FileText, BarChart2, ShieldCheck, Sparkles, X } from 'lucide-react'

export default function DiagnosisDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [domainScores, setDomainScores] = useState<any[]>([])
  const [constraints, setConstraints] = useState<any[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [editReason, setEditReason] = useState('')

  useEffect(() => {
    fetchDiagnosisData()

    const channel = supabase
      .channel(`session-${sessionId}-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'domain_scores', filter: `session_id=eq.${sessionId}` }, () => {
        fetchDiagnosisData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'constraints', filter: `session_id=eq.${sessionId}` }, () => {
        fetchDiagnosisData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diagnostic_sessions', filter: `id=eq.${sessionId}` }, () => {
        fetchDiagnosisData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  const fetchDiagnosisData = async () => {
    try {
      const [sessionData, domainData, constraintData, analysisData] = await Promise.all([
        supabase.from('diagnostic_sessions').select('*, businesses(*)').eq('id', sessionId).maybeSingle(),
        supabase.from('domain_scores').select('*').eq('session_id', sessionId),
        supabase.from('constraints').select('*').eq('session_id', sessionId).order('priority_score', { ascending: false }),
        supabase.from('ai_analyses').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])

      if (sessionData.data) {
        setSession(sessionData.data)
        setBusiness(sessionData.data.businesses)
      }
      if (domainData.data) setDomainScores(domainData.data)
      if (constraintData.data) setConstraints(constraintData.data)
      if (analysisData.data) setAiAnalysis(analysisData.data)
    } catch (err) {
      console.error('Error fetching diagnosis details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleScoreOverride = async (domainScoreId: string) => {
    try {
      const response = await fetch('/api/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'domain_score',
          entityId: domainScoreId,
          fieldName: 'score',
          originalValue: domainScores.find((ds) => ds.id === domainScoreId)?.score,
          newValue: editValue,
          reason: editReason,
        }),
      })

      if (response.ok) {
        setEditingScore(null)
        setEditValue(0)
        setEditReason('')
        fetchDiagnosisData()
      }
    } catch (err) {
      console.error('Error overriding score:', err)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (score >= 5) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-red-400 bg-red-500/10 border-red-500/20'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8.5) return 'Exceptional'
    if (score >= 7) return 'Robust'
    if (score >= 5) return 'Functional'
    if (score >= 3) return 'At Risk'
    return 'Critical Bottleneck'
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-zinc-500">
        Decrypting diagnostic telemetry...
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/dashboard/diagnoses"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Diagnoses</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
                Diagnostic Dossier
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {business?.business_name || 'Client Assessment'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
              Audited {session?.started_at ? new Date(session.started_at).toLocaleDateString() : 'Recently'} • Version {session?.framework_version || '1.0'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/diagnoses/${sessionId}/baseline`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 hover:text-white text-xs font-medium transition-all"
            >
              <BarChart2 className="h-3.5 w-3.5 text-zinc-400" />
              <span>Baseline KPIs</span>
            </Link>
            <Link
              href={`/dashboard/diagnoses/${sessionId}/report`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white text-xs font-semibold shadow-[0_3px_15px_rgba(255,87,34,0.35)] hover:shadow-[0_5px_20px_rgba(255,87,34,0.5)] transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Executive Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overall Score Highlight */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10121a]/90 border border-white/[0.08] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#ff5722]/10 blur-[100px] pointer-events-none" />
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            Composite System Score
          </span>
          <div className="flex items-baseline gap-4 mt-2">
            <span className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-tight">
              {session?.overall_score ? session.overall_score.toFixed(1) : '—'}
            </span>
            <span className="text-sm font-mono text-zinc-500">/ 10.0</span>
            <span className={`text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full border ${getScoreColor(session?.overall_score || 0)}`}>
              {getScoreLabel(session?.overall_score || 0)}
            </span>
          </div>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-white/[0.06]">
          <div className="text-[11px] font-mono uppercase text-zinc-500 mb-1">Assessed Domains</div>
          <div className="text-lg font-bold font-mono text-white">
            {domainScores.length} / 10 Evaluated
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Status: <span className="text-emerald-400 uppercase font-mono">{session?.status || 'In Progress'}</span>
          </p>
        </div>
      </div>

      {/* Domain Scores Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">10-Domain Diagnostics</h2>
            <p className="text-xs text-zinc-400 font-light">Click override on any domain to apply consultant adjustments.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {domainScores.map((ds) => {
            const score = Number(ds.score) || 0
            const domainTitle = ds.domain_id ? ds.domain_id.replace(/_/g, ' ') : 'Domain'

            return (
              <div
                key={ds.id}
                className="p-5 rounded-2xl bg-[#10121a]/90 border border-white/[0.07] hover:border-white/[0.15] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-sm font-bold text-white capitalize">
                      {domainTitle}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getScoreColor(score)}`}>
                        {score.toFixed(1)}
                      </span>
                      <button
                        onClick={() => {
                          setEditingScore(ds.id)
                          setEditValue(score)
                          setEditReason(ds.override_reason || '')
                        }}
                        className="p-1 rounded text-zinc-500 hover:text-white"
                        title="Override score"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Progress gauge */}
                  <div className="w-full bg-white/[0.05] h-1 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-gradient-to-r from-[#ff6a38] to-[#ff5722] h-full"
                      style={{ width: `${Math.min(100, Math.max(0, score * 10))}%` }}
                    />
                  </div>

                  <p className="text-xs text-zinc-400 font-light leading-relaxed mb-3">
                    {ds.reason || 'Telemetry recorded across key operational questions.'}
                  </p>

                  {ds.evidence && (
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-zinc-400 mb-2">
                      <span className="font-mono uppercase text-[9px] text-[#ff5722] block mb-0.5">Evidence Signal</span>
                      {ds.evidence}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Confidence: <span className="text-zinc-300 uppercase">{ds.confidence || 'Medium'}</span></span>
                  {ds.consultant_override && (
                    <span className="text-[#ff5722]">Consultant Override</span>
                  )}
                </div>

                {/* Score Override Dialog */}
                {editingScore === ds.id && (
                  <div className="mt-3 p-3 rounded-xl bg-[#141722] border border-[#ff5722]/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>Override Score</span>
                      <button onClick={() => setEditingScore(null)} className="text-zinc-500 hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={editValue}
                        onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white/[0.05] border border-white/[0.1] rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Reason for override..."
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white/[0.05] border border-white/[0.1] rounded text-xs text-white placeholder-zinc-500"
                      />
                    </div>
                    <button
                      onClick={() => handleScoreOverride(ds.id)}
                      className="w-full py-1.5 rounded bg-[#ff5722] text-white text-xs font-semibold"
                    >
                      Apply Override
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Constraints Matrix */}
      {constraints.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Derived Constraints</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {constraints.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-[#10121a]/90 border border-white/[0.07]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#ff5722]/10 text-[#ff5722]">
                    {c.constraint_type} Constraint
                  </span>
                  <span className="text-xs font-mono font-semibold text-white">
                    Priority {c.priority_score || c.severity || '—'}
                  </span>
                </div>
                <p className="text-xs font-medium text-white mb-2">{c.description}</p>
                {c.symptoms && (
                  <p className="text-[11px] text-zinc-400 font-light">Symptoms: {c.symptoms}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Pattern Recognition */}
      {aiAnalysis && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121520] to-[#0d0f16] border border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles className="h-4 w-4 text-[#ff5722]" />
            <span>AI Pattern Synthesis & Root Cause</span>
          </div>
          <div className="text-xs text-zinc-300 font-light leading-relaxed">
            {typeof aiAnalysis.output_data === 'string'
              ? aiAnalysis.output_data
              : JSON.stringify(aiAnalysis.output_data?.summary || aiAnalysis.output_data, null, 2)}
          </div>
        </div>
      )}
    </div>
  )
}
