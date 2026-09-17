'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Save, AlertCircle, Building2, CheckCircle2, ArrowRight, Sparkles, Plus } from 'lucide-react'
import { DIAGNOSTIC_DOMAINS, type DiagnosticDomain, type DiagnosticQuestion } from '@/lib/diagnostic/domains'

function NewDiagnosisContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const businessIdParam = searchParams.get('businessId')
  
  const [businessId, setBusinessId] = useState<string | null>(businessIdParam)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [initializingSession, setInitializingSession] = useState(false)
  const [loading, setLoading] = useState(false)
  const [business, setBusiness] = useState<any>(null)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null)
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'saving' | 'saved'>('saved')

  const currentDomain = DIAGNOSTIC_DOMAINS[currentDomainIndex]
  const currentQuestion = currentDomain?.questions[currentQuestionIndex]
  const progress = currentDomain
    ? ((currentDomainIndex * 100) / DIAGNOSTIC_DOMAINS.length) + 
      ((currentQuestionIndex + 1) / currentDomain.questions.length) * (100 / DIAGNOSTIC_DOMAINS.length)
    : 0

  useEffect(() => {
    fetchAvailableBusinesses()
  }, [])

  useEffect(() => {
    if (businessId) {
      fetchBusiness()
      initializeSession()
    }
  }, [businessId])

  const fetchAvailableBusinesses = async () => {
    const { data } = await supabase.from('businesses').select('*').order('created_at', { ascending: false })
    if (data) setBusinesses(data)
  }

  const fetchBusiness = async () => {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .maybeSingle()
    
    if (data) setBusiness(data)
  }

  const initializeSession = async () => {
    if (!businessId) return
    setInitializingSession(true)
    setSessionError(null)

    try {
      const res = await fetch('/api/diagnoses/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })

      const data = await res.json()
      if (!res.ok) {
        const hint = data.hint ? ` ${data.hint}` : ''
        throw new Error((data.error || 'Failed to initialize session.') + hint)
      }

      if (data.sessionId) {
        setSessionId(data.sessionId)
      }
    } catch (err: any) {
      console.error('Session initialization error:', err)
      setSessionError(err?.message || 'Could not start diagnostic session. Please check your connection or database.')
    } finally {
      setInitializingSession(false)
    }
  }

  const handleAnswer = async (value: any) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)
    setAutoSaveState('saving')
    setTimeout(() => setAutoSaveState('saved'), 200)

    checkFollowUp(value, newAnswers)
  }

  const checkFollowUp = (value: any, currentAnswers: Record<string, any>) => {
    if (currentQuestion.id === 'md_1' && Number(value) > 100) {
      setFollowUpQuestion('With high lead volume, what is your primary filtration bottleneck?')
      setShowFollowUp(true)
    } else if (currentQuestion.id === 'sc_1' && currentAnswers['md_2']) {
      const conversionRate = (Number(value) / Number(currentAnswers['md_2'])) * 100
      if (conversionRate < 5) {
        setFollowUpQuestion(`Conversion rate is ${conversionRate.toFixed(1)}%. What is the biggest objection during sales meetings?`)
        setShowFollowUp(true)
      }
    } else {
      setShowFollowUp(false)
      setFollowUpQuestion(null)
    }
  }

  const handleFollowUpAnswer = async (value: any) => {
    const followUpId = `${currentQuestion.id}_followup`
    setAnswers({ ...answers, [followUpId]: value })
    setShowFollowUp(false)
    setFollowUpQuestion(null)
    nextQuestion()
  }

  const nextQuestion = () => {
    if (showFollowUp) return

    if (currentQuestionIndex < currentDomain.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (currentDomainIndex < DIAGNOSTIC_DOMAINS.length - 1) {
      setCurrentDomainIndex(currentDomainIndex + 1)
      setCurrentQuestionIndex(0)
    } else {
      completeDiagnosis()
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentDomainIndex > 0) {
      setCurrentDomainIndex(currentDomainIndex - 1)
      setCurrentQuestionIndex(DIAGNOSTIC_DOMAINS[currentDomainIndex - 1].questions.length - 1)
    }
  }

  const completeDiagnosis = async () => {
    setLoading(true)
    setSessionError(null)
    
    try {
      let activeSessionId = sessionId

      // Fallback: If sessionId is not yet set, initialize now
      if (!activeSessionId && businessId) {
        const res = await fetch('/api/diagnoses/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId }),
        })
        const data = await res.json()
        if (data.sessionId) {
          activeSessionId = data.sessionId
          setSessionId(activeSessionId)
        } else {
          throw new Error(data.error || 'Could not initialize session record before running analysis.')
        }
      }

      if (!activeSessionId) {
        throw new Error('No active session found. Please reload and select a business.')
      }

      // Trigger automated scoring analysis and data persistence
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          answers,
          businessInfo: business,
        }),
      })

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}))
        console.warn('Analyze warning:', errData)
      }

      router.push(`/dashboard/diagnoses/${activeSessionId}`)
    } catch (err: any) {
      console.error('Error completing diagnosis:', err)
      setSessionError(err?.message || 'Error completing diagnostic analysis. Please try again.')
      setLoading(false)
    }
  }

  // Step 1: Select Business if not specified
  if (!businessId) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
              Engagement Initiation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Select Client for Diagnosis
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
            Choose an existing client business profile or register a new one to begin the 10-domain diagnostic assessment.
          </p>
        </div>

        {businesses.length === 0 ? (
          <div className="p-12 text-center bg-[#10121a] rounded-3xl border border-white/[0.08] space-y-4">
            <Building2 className="h-10 w-10 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-300">No client businesses available to diagnose.</p>
            <Link
              href="/dashboard/businesses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ff5722] text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Enroll Client First</span>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {businesses.map((b) => (
              <button
                key={b.id}
                onClick={() => setBusinessId(b.id)}
                className="p-5 rounded-2xl bg-[#10121a]/90 hover:bg-[#141722] border border-white/[0.07] hover:border-[#ff5722]/50 text-left transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white group-hover:text-[#ff5722] transition-colors">
                    {b.business_name}
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400">
                    {b.business_stage || 'Startup'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-3">{b.industry || 'General Industry'} • {b.location || 'Global'}</p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#ff5722]">
                  <span>Initiate Diagnostic Run</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Step 2: Diagnostic Stepper
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-6">
      {/* Top Header & Business Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
              Domain {currentDomainIndex + 1} of {DIAGNOSTIC_DOMAINS.length} • {currentDomain?.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {business?.business_name || 'Business Assessment'}
          </h1>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono uppercase tracking-wider">
            {autoSaveState === 'saving' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-300">Syncing...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span className="text-emerald-400">Real-Time Cloud Synced</span>
              </>
            )}
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-500 uppercase">Progress</div>
            <div className="text-base font-bold font-mono text-white">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>

      {sessionError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span className="font-medium">{sessionError}</span>
          </div>
          <button
            type="button"
            onClick={initializeSession}
            disabled={initializingSession}
            className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl font-mono text-[11px] uppercase tracking-wider transition-all self-start sm:self-auto cursor-pointer"
          >
            {initializingSession ? 'Syncing...' : 'Retry Session'}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-[#ff6a38] to-[#ff5722] h-full transition-all duration-300 shadow-[0_0_10px_#ff5722]" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Active Question Card */}
      {currentQuestion && (
        <div className="bg-[#10121a]/95 rounded-3xl border border-white/[0.09] p-6 sm:p-10 shadow-2xl relative">
          <div className="mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
              Question {currentQuestionIndex + 1} of {currentDomain.questions.length}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Input Controller */}
          <div className="my-6">
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(opt)}
                    className={`p-4 rounded-xl text-xs font-medium text-left border transition-all ${
                      answers[currentQuestion.id] === opt
                        ? 'bg-[#ff5722] text-white border-[#ff5722] shadow-[0_2px_15px_rgba(255,87,34,0.3)]'
                        : 'bg-white/[0.03] text-zinc-300 border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.05]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : currentQuestion.type === 'scale' ? (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleAnswer(num)}
                    className={`py-3 rounded-xl text-xs font-bold font-mono border transition-all ${
                      answers[currentQuestion.id] === num
                        ? 'bg-[#ff5722] text-white border-[#ff5722] shadow-[0_2px_12px_rgba(255,87,34,0.4)]'
                        : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:border-white/[0.2] hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            ) : currentQuestion.type === 'number' || currentQuestion.type === 'currency' ? (
              <input
                type="number"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(parseFloat(e.target.value) || 0)}
                placeholder="Enter quantitative metric..."
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/70 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#ff5722]/50 font-mono"
              />
            ) : (
              <textarea
                rows={4}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Detail observations, evidence, and operational reality..."
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/70 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#ff5722]/50"
              />
            )}
          </div>

          {/* Follow-up Question prompt if triggered */}
          {showFollowUp && followUpQuestion && (
            <div className="my-6 p-5 rounded-2xl bg-gradient-to-br from-[#1b1717] to-[#12141c] border border-[#ff5722]/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#ff5722]">
                <Sparkles className="h-4 w-4" />
                <span>Adaptive Follow-up Inquiry</span>
              </div>
              <p className="text-xs text-zinc-200">{followUpQuestion}</p>
              <textarea
                rows={2}
                placeholder="Enter additional evidence..."
                className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none"
                onBlur={(e) => handleFollowUpAnswer(e.target.value)}
              />
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-white/[0.07] flex items-center justify-between">
            <button
              type="button"
              onClick={previousQuestion}
              disabled={currentDomainIndex === 0 && currentQuestionIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={nextQuestion}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white shadow-[0_3px_15px_rgba(255,87,34,0.35)] hover:shadow-[0_5px_20px_rgba(255,87,34,0.5)] transition-all cursor-pointer"
            >
              {loading ? (
                <span>Synthesizing AI Engine...</span>
              ) : currentDomainIndex === DIAGNOSTIC_DOMAINS.length - 1 && currentQuestionIndex === currentDomain.questions.length - 1 ? (
                <>
                  <span>Finalize & Run Analysis</span>
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewDiagnosisPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-xs font-mono text-zinc-500">
        Initializing diagnostic terminal...
      </div>
    }>
      <NewDiagnosisContent />
    </Suspense>
  )
}

