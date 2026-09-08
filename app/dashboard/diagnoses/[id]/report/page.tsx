'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Printer } from 'lucide-react'

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
    const [sessionData, domainData, constraintData, analysisData] = await Promise.all([
      supabase.from('diagnostic_sessions').select('*, businesses(*), users(*)').eq('id', sessionId).single(),
      supabase.from('domain_scores').select('*').eq('session_id', sessionId),
      supabase.from('constraints').select('*').eq('session_id', sessionId).order('priority_score', { ascending: false }),
      supabase.from('ai_analyses').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }).limit(1).single(),
    ])

    if (sessionData.data) {
      setSession(sessionData.data)
      setBusiness(sessionData.data.businesses)
      setConsultant(sessionData.data.users)
    }
    if (domainData.data) setDomainScores(domainData.data)
    if (constraintData.data) setConstraints(constraintData.data)
    if (analysisData.data) setAiAnalysis(analysisData.data)
    
    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const reportContent = document.getElementById('report-content')
    if (reportContent) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Mindvest Diagnostic Report - ${business?.business_name}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                h1 { color: #1e3a8a; }
                h2 { color: #374151; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                h3 { color: #4b5563; margin-top: 20px; }
                .score { font-size: 24px; font-weight: bold; }
                .score-high { color: #16a34a; }
                .score-medium { color: #ca8a04; }
                .score-low { color: #dc2626; }
                .metric { display: inline-block; margin: 10px 20px 10px 0; }
                .label { color: #6b7280; font-size: 14px; }
                .value { font-weight: bold; color: #1f2937; }
                .constraint { background: #f9fafb; padding: 15px; margin: 10px 0; border-left: 4px solid #3b82f6; }
                .primary-constraint { border-left-color: #dc2626; }
                .secondary-constraint { border-left-color: #f59e0b; }
                .evidence { font-style: italic; color: #6b7280; font-size: 14px; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              ${reportContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'score-high'
    if (score >= 5) return 'score-medium'
    return 'score-low'
  }

  if (loading) {
    return <div className="p-8">Loading report...</div>
  }

  return (
    <div className="flex bg-gradient-to-br from-sage-100 via-emerald-50 to-eucalyptus-100 min-h-screen">
      <div className="flex-1 p-8 max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center text-stone-600 hover:text-stone-900 mb-4 transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </button>
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-widest mb-2">Report Generation</p>
            <h1 className="text-3xl font-semibold text-stone-900 tracking-tight">Diagnostic Report</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-white/60 backdrop-blur-xl border border-stone-200 text-stone-700 rounded-xl hover:bg-white/80 transition-all"
            >
              <Printer className="mr-2 h-5 w-5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20"
            >
              <Download className="mr-2 h-5 w-5" />
              Download PDF
            </button>
          </div>
        </div>

        <div id="report-content" className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-900 tracking-tight">MINDVEST BUSINESS DIAGNOSTIC REPORT</h1>
            <p className="text-stone-600 mt-2">Framework Version: {session?.framework_version || '1.0'}</p>
          </div>

          {/* Business Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-stone-900 tracking-tight border-b border-stone-200 pb-2">Business Information</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="label">Business Name:</span>
                <span className="value ml-2">{business?.business_name}</span>
              </div>
              <div>
                <span className="label">Industry:</span>
                <span className="value ml-2">{business?.industry || 'N/A'}</span>
              </div>
              <div>
                <span className="label">Location:</span>
                <span className="value ml-2">{business?.location || 'N/A'}</span>
              </div>
              <div>
                <span className="label">Business Stage:</span>
                <span className="value ml-2">{business?.business_stage || 'N/A'}</span>
              </div>
              <div>
                <span className="label">Report Date:</span>
                <span className="value ml-2">{new Date(session?.completed_at || session?.started_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="label">Consultant:</span>
                <span className="value ml-2">{consultant?.full_name || consultant?.email}</span>
              </div>
            </div>
          </div>

          {/* Executive Diagnosis */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-stone-900 tracking-tight border-b border-stone-200 pb-2">Executive Diagnosis</h2>
            <div className="mt-4">
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl font-bold text-emerald-900">{session?.overall_score?.toFixed(1) || '--'}</span>
                <span className="text-2xl text-stone-600 ml-2">/ 10</span>
              </div>
              <p className="text-center text-gray-700">
                Overall Business Health Score
              </p>
            </div>
          </div>

          {/* 10-Domain Assessment */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-stone-900 tracking-tight border-b border-stone-200 pb-2">10-Domain Assessment</h2>
            <div className="mt-4 space-y-3">
              {domainScores.map((domainScore) => (
                <div key={domainScore.id} className="flex justify-between items-center py-2 border-b border-stone-200">
                  <span className="text-stone-700">{domainScore.domain_id.replace('_', ' ').toUpperCase()}</span>
                  <div className="text-right">
                    <span className={`score ${getScoreColor(domainScore.score)}`}>{domainScore.score.toFixed(1)}</span>
                    <p className="evidence text-xs mt-1">{domainScore.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Constraint */}
          {constraints.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 tracking-tight border-b border-stone-200 pb-2">Primary Constraint</h2>
              <div className="mt-4 constraint primary-constraint bg-stone-50/80 backdrop-blur-xl p-4 rounded-xl border-l-4 border-red-600">
                <p className="font-medium text-stone-900">{constraints[0].description}</p>
                <div className="mt-3">
                  <p className="label">Symptoms:</p>
                  <ul className="list-disc list-inside text-stone-700 mt-1">
                    {constraints[0].symptoms?.map((symptom: string, i: number) => (
                      <li key={i}>{symptom}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3">
                  <p className="label">Opportunity:</p>
                  <p className="text-stone-700 mt-1">{constraints[0].opportunity}</p>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2 text-sm">
                  <div>
                    <span className="label">Severity:</span>
                    <span className="value ml-1">{constraints[0].severity}/10</span>
                  </div>
                  <div>
                    <span className="label">Financial Impact:</span>
                    <span className="value ml-1">{constraints[0].financial_impact}/10</span>
                  </div>
                  <div>
                    <span className="label">Evidence:</span>
                    <span className="value ml-1">{constraints[0].evidence_strength}/10</span>
                  </div>
                  <div>
                    <span className="label">Dependency:</span>
                    <span className="value ml-1">{constraints[0].dependency}/10</span>
                  </div>
                  <div>
                    <span className="label">Controllability:</span>
                    <span className="value ml-1">{constraints[0].controllability}/10</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Constraint */}
          {constraints.length > 1 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 tracking-tight border-b border-stone-200 pb-2">Secondary Constraint</h2>
              <div className="mt-4 constraint secondary-constraint bg-stone-50/80 backdrop-blur-xl p-4 rounded-xl border-l-4 border-amber-600">
                <p className="font-medium text-stone-900">{constraints[1].description}</p>
                <div className="mt-3">
                  <p className="label">Opportunity:</p>
                  <p className="text-stone-700 mt-1">{constraints[1].opportunity}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {aiAnalysis && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 tracking-tight border-b border-stone-200 pb-2">Recommended Interventions</h2>
              <div className="mt-4 space-y-3">
                {aiAnalysis.output_data?.recommended_interventions?.map((intervention: any, i: number) => (
                  <div key={i} className="bg-stone-50/80 backdrop-blur-xl p-4 rounded-xl">
                    <h3 className="font-medium text-stone-900">{intervention.title}</h3>
                    <p className="text-stone-700 mt-1">{intervention.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded bg-emerald-100/80 backdrop-blur-xl text-emerald-900">
                      {intervention.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {aiAnalysis?.output_data?.risks && aiAnalysis.output_data.risks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 tracking-tight border-b border-stone-200 pb-2">Risks</h2>
              <div className="mt-4">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {aiAnalysis.output_data.risks.map((risk: string, i: number) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Data Gaps */}
          {aiAnalysis?.output_data?.missing_information && aiAnalysis.output_data.missing_information.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Data Gaps</h2>
              <div className="mt-4">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {aiAnalysis.output_data.missing_information.map((gap: string, i: number) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <p>This report was generated by Mindvest Diagnostic OS v1.0</p>
            <p>Report ID: {sessionId}</p>
            <p>Generated on: {new Date().toLocaleString()}</p>
            <p className="mt-2">
              Note: This diagnosis is based on the information provided at the time of assessment. 
              Business conditions may change. Regular re-assessment is recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
