'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Download, Sparkles, Building2, User, FileText, CheckCircle2 } from 'lucide-react'

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [domainScores, setDomainScores] = useState<any[]>([])
  const [constraints, setConstraints] = useState<any[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [consultant, setConsultant] = useState<any>(null)

  useEffect(() => {
    fetchReportData()
  }, [sessionId])

  const fetchReportData = async () => {
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
      console.error('Error fetching report:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-zinc-500">
        Assembling executive audit dossier...
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-8">
      {/* Action Header - Hidden when printing */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/[0.07] print:hidden">
        <Link
          href={`/dashboard/diagnoses/${sessionId}`}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Analysis</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div 
        id="report-content"
        className="bg-[#10121a] print:bg-white print:text-black border border-white/[0.08] print:border-none rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-white/[0.08] print:border-zinc-300">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5722] print:bg-black" />
              <span className="text-xl font-bold tracking-wider text-white print:text-black font-sans">
                MINDVEST<span className="text-[#ff5722] print:text-black">.</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 print:text-zinc-600 ml-2">
                Executive Audit Report
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white print:text-black mt-2">
              {business?.business_name || 'Enterprise Assessment'}
            </h1>
            <p className="text-xs text-zinc-400 print:text-zinc-600 font-mono mt-1">
              Industry: {business?.industry || 'Unspecified'} • Stage: {business?.business_stage || 'Growth'}
            </p>
          </div>

          <div className="sm:text-right text-xs font-mono text-zinc-400 print:text-zinc-600 space-y-1">
            <p>Session ID: <span className="text-zinc-200 print:text-black">{sessionId.slice(0, 8)}</span></p>
            <p>Audit Date: <span className="text-zinc-200 print:text-black">{new Date().toLocaleDateString()}</span></p>
            <p>Framework Version: <span className="text-zinc-200 print:text-black">1.0</span></p>
          </div>
        </div>

        {/* Executive Summary & Composite Metric */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 p-6 rounded-2xl bg-white/[0.02] print:bg-zinc-100 border border-white/[0.06] print:border-zinc-200 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#ff5722] print:text-zinc-800">
              Executive Evaluation Summary
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 print:text-zinc-800 font-light leading-relaxed">
              This diagnostic report evaluates the client business across ten interconnected domains to identify high-leverage constraints, prioritize capital and operational allocation, and eliminate growth bottlenecks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] print:bg-zinc-100 border border-white/[0.06] print:border-zinc-200 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 print:text-zinc-600 mb-1">
              Overall Score
            </span>
            <div className="text-4xl font-bold font-mono text-white print:text-black">
              {session?.overall_score ? session.overall_score.toFixed(1) : '—'}
            </div>
            <span className="text-xs text-zinc-500 print:text-zinc-600 font-mono mt-1">Scale of 0 to 10.0</span>
          </div>
        </div>

        {/* 10 Diagnostic Domains Score Matrix */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white print:text-black tracking-tight">
            Diagnostic Domain Performance
          </h2>
          <div className="border border-white/[0.08] print:border-zinc-300 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] print:bg-zinc-100 border-b border-white/[0.07] print:border-zinc-300 text-zinc-400 print:text-zinc-700 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Primary Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] print:divide-zinc-200 text-zinc-300 print:text-zinc-800 font-light">
                {domainScores.map((ds) => (
                  <tr key={ds.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-4 font-medium capitalize text-white print:text-black">
                      {ds.domain_id ? ds.domain_id.replace(/_/g, ' ') : 'Domain'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {Number(ds.score).toFixed(1)}/10
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-[10px] text-zinc-400 print:text-zinc-600">
                      {ds.confidence || 'Medium'}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 print:text-zinc-700">
                      {ds.reason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Primary Constraints Matrix */}
        {constraints.length > 0 && (
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-bold text-white print:text-black tracking-tight">
              Ranked Business Constraints
            </h2>
            <div className="space-y-3">
              {constraints.map((c, i) => (
                <div 
                  key={c.id} 
                  className="p-4 rounded-xl bg-white/[0.02] print:bg-zinc-50 border border-white/[0.06] print:border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[#ff5722] print:text-black font-bold">#{i + 1}</span>
                      <span className="font-semibold text-white print:text-black">{c.description}</span>
                    </div>
                    {c.symptoms && (
                      <p className="text-zinc-400 print:text-zinc-600 font-light">Symptoms: {c.symptoms}</p>
                    )}
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <span className="text-[10px] uppercase text-zinc-500 print:text-zinc-600 block">Severity</span>
                    <span className="text-sm font-bold text-white print:text-black">{c.severity || '—'}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="pt-8 border-t border-white/[0.08] print:border-zinc-300 flex items-center justify-between text-[11px] font-mono text-zinc-500 print:text-zinc-600">
          <span>Mindvest Global Resources • Confidential Diagnostic Audit</span>
          <span>Verified & Signed</span>
        </div>
      </div>
    </div>
  )
}
