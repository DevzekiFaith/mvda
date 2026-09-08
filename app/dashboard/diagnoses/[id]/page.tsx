'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertTriangle, Edit2, Save, Download } from 'lucide-react'

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
  }, [sessionId])

  const fetchDiagnosisData = async () => {
    const [sessionData, domainData, constraintData, analysisData] = await Promise.all([
      supabase.from('diagnostic_sessions').select('*, businesses(*)').eq('id', sessionId).single(),
      supabase.from('domain_scores').select('*').eq('session_id', sessionId),
      supabase.from('constraints').select('*').eq('session_id', sessionId).order('priority_score', { ascending: false }),
      supabase.from('ai_analyses').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }).limit(1).single(),
    ])

    if (sessionData.data) {
      setSession(sessionData.data)
      setBusiness(sessionData.data.businesses)
    }
    if (domainData.data) setDomainScores(domainData.data)
    if (constraintData.data) setConstraints(constraintData.data)
    if (analysisData.data) setAiAnalysis(analysisData.data)
    
    setLoading(false)
  }

  const handleScoreOverride = async (domainScoreId: string) => {
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
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-700 bg-emerald-100/80 backdrop-blur-xl'
    if (score >= 5) return 'text-amber-700 bg-amber-100/80 backdrop-blur-xl'
    if (score >= 3) return 'text-orange-700 bg-orange-100/80 backdrop-blur-xl'
    return 'text-red-700 bg-red-100/80 backdrop-blur-xl'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Exceptional'
    if (score >= 7) return 'Strong'
    if (score >= 5) return 'Functional'
    if (score >= 3) return 'Weak'
    return 'Critical'
  }

  if (loading) {
    return <div className="p-8">Loading diagnosis...</div>
  }

  return (
    <div className="flex bg-gradient-to-br from-sage-100 via-emerald-50 to-eucalyptus-100 min-h-screen">
      <div className="flex-1 p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-stone-600 hover:text-stone-900 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
          <p className="text-xs font-medium text-emerald-700 uppercase tracking-widest mb-2">Diagnostic Results</p>
          <h1 className="text-3xl font-semibold text-stone-900 tracking-tight">Diagnosis Details</h1>
          <p className="text-stone-600 mt-2">{business?.business_name}</p>
          <div className="flex items-center mt-4">
            <span className="text-sm text-stone-500 mr-4 uppercase tracking-widest">Overall Score:</span>
            <span className={`text-2xl font-bold ${getScoreColor(session?.overall_score || 0).split(' ')[0]}`}>
              {session?.overall_score?.toFixed(1) || '--'}/10
            </span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-xl ${getScoreColor(session?.overall_score || 0)}`}>
              {getScoreLabel(session?.overall_score || 0)}
            </span>
          </div>
        </div>

        {/* Domain Scores */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Domain Scores</h2>
            <span className="text-sm text-stone-500">Click score to override</span>
          </div>
          <div className="space-y-4">
            {domainScores.map((domainScore) => (
              <div key={domainScore.id} className="border border-stone-200/50 rounded-xl p-4 bg-white/40 backdrop-blur-xl">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-stone-900">{domainScore.domain_id.replace('_', ' ').toUpperCase()}</h3>
                    <p className="text-sm text-stone-600 mt-1">{domainScore.reason}</p>
                    {domainScore.evidence && (
                      <p className="text-sm text-stone-500 mt-2 italic">{domainScore.evidence}</p>
                    )}
                    <div className="flex items-center mt-2 space-x-4 text-xs text-stone-500">
                      <span>Confidence: {domainScore.confidence}</span>
                      {domainScore.consultant_override && (
                        <span className="text-orange-600">Consultant Override</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {editingScore === domainScore.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={editValue}
                          onChange={(e) => setEditValue(parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900"
                        />
                        <input
                          type="text"
                          placeholder="Reason"
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          className="w-40 px-2 py-1 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 placeholder-stone-400"
                        />
                        <button
                          onClick={() => handleScoreOverride(domainScore.id)}
                          className="p-1 text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingScore(null)}
                          className="p-1 text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingScore(domainScore.id)
                          setEditValue(domainScore.score)
                        }}
                        className={`text-2xl font-bold ${getScoreColor(domainScore.score).split(' ')[0]} hover:opacity-80`}
                      >
                        {domainScore.score.toFixed(1)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-stone-900 tracking-tight mb-4">Identified Constraints</h2>
          <div className="space-y-4">
            {constraints.map((constraint, index) => (
              <div key={constraint.id} className="border border-stone-200/50 rounded-xl p-4 bg-white/40 backdrop-blur-xl">
                <div className="flex items-start mb-3">
                  {index === 0 ? (
                    <CheckCircle className="h-5 w-5 text-red-600 mt-1 mr-2" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-1 mr-2" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-stone-900">
                        {index === 0 ? 'Primary Constraint' : 'Secondary Constraint'}
                      </h3>
                      <span className="text-sm font-medium text-stone-600">
                        Priority: {constraint.priority_score?.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-stone-700 mt-2">{constraint.description}</p>
                  </div>
                </div>
                <div className="ml-7 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-stone-900">Symptoms:</span>
                    <ul className="list-disc list-inside text-stone-600 mt-1">
                      {constraint.symptoms?.map((symptom: string, i: number) => (
                        <li key={i}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-stone-900">Opportunity:</span>
                    <p className="text-stone-600 mt-1">{constraint.opportunity}</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-xs mt-3">
                    <div className="bg-stone-50/80 backdrop-blur-xl p-2 rounded-lg">
                      <div className="text-stone-500">Severity</div>
                      <div className="font-medium text-stone-900">{constraint.severity}/10</div>
                    </div>
                    <div className="bg-stone-50/80 backdrop-blur-xl p-2 rounded-lg">
                      <div className="text-stone-500">Financial Impact</div>
                      <div className="font-medium text-stone-900">{constraint.financial_impact}/10</div>
                    </div>
                    <div className="bg-stone-50/80 backdrop-blur-xl p-2 rounded-lg">
                      <div className="text-stone-500">Evidence</div>
                      <div className="font-medium text-stone-900">{constraint.evidence_strength}/10</div>
                    </div>
                    <div className="bg-stone-50/80 backdrop-blur-xl p-2 rounded-lg">
                      <div className="text-stone-500">Dependency</div>
                      <div className="font-medium text-stone-900">{constraint.dependency}/10</div>
                    </div>
                    <div className="bg-stone-50/80 backdrop-blur-xl p-2 rounded-lg">
                      <div className="text-stone-500">Controllability</div>
                      <div className="font-medium text-stone-900">{constraint.controllability}/10</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
        {aiAnalysis && (
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-stone-900 tracking-tight">AI Analysis</h2>
              <span className="text-xs text-stone-500">Model: {aiAnalysis.model_used}</span>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-stone-900 mb-2">Primary Constraint</h3>
                <p className="text-stone-700">{aiAnalysis.output_data?.primary_constraint || 'Not identified'}</p>
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-2">Root Cause</h3>
                <p className="text-stone-700">{aiAnalysis.output_data?.root_cause || 'Not identified'}</p>
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-2">Recommended Interventions</h3>
                <ul className="list-disc list-inside text-stone-700 space-y-1">
                  {aiAnalysis.output_data?.recommended_interventions?.map((intervention: any, i: number) => (
                    <li key={i}>
                      <span className="font-medium">{intervention.title}</span> - {intervention.description}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-2">Confidence</h3>
                <p className="text-stone-700">{(aiAnalysis.output_data?.confidence * 100).toFixed(0)}%</p>
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-2">Missing Information</h3>
                <ul className="list-disc list-inside text-stone-600">
                  {aiAnalysis.output_data?.missing_information?.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-2">Risks</h3>
                <ul className="list-disc list-inside text-stone-600">
                  {aiAnalysis.output_data?.risks?.map((risk: string, i: number) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push(`/dashboard/diagnoses/${sessionId}/report`)}
            className="flex items-center px-6 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20"
          >
            <Download className="mr-2 h-5 w-5" />
            Generate Report
          </button>
          <button
            onClick={() => router.push(`/dashboard/diagnoses/${sessionId}/interventions`)}
            className="flex items-center px-6 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 text-stone-700 rounded-xl hover:bg-white/80 transition-all"
          >
            Create Interventions
          </button>
        </div>
      </div>
    </div>
  )
}
