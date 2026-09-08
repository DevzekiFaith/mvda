'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Save, AlertCircle } from 'lucide-react'
import { DIAGNOSTIC_DOMAINS, type DiagnosticDomain, type DiagnosticQuestion } from '@/lib/diagnostic/domains'

export default function NewDiagnosisPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const businessId = searchParams.get('businessId')
  
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [business, setBusiness] = useState<any>(null)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null)

  const currentDomain = DIAGNOSTIC_DOMAINS[currentDomainIndex]
  const currentQuestion = currentDomain.questions[currentQuestionIndex]
  const progress = ((currentDomainIndex * 100) / DIAGNOSTIC_DOMAINS.length) + 
                   ((currentQuestionIndex + 1) / currentDomain.questions.length) * (100 / DIAGNOSTIC_DOMAINS.length)

  useEffect(() => {
    if (businessId) {
      fetchBusiness()
      initializeSession()
    }
  }, [businessId])

  const fetchBusiness = async () => {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()
    
    if (data) setBusiness(data)
  }

  const initializeSession = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data } = await supabase
      .from('diagnostic_sessions')
      .insert([{
        business_id: businessId,
        consultant_id: user?.id,
        framework_version: '1.0',
        status: 'in_progress',
      }])
      .select()
      .single()

    if (data) setSessionId(data.id)
  }

  const handleAnswer = async (value: any) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    // Save answer to database
    if (sessionId) {
      await supabase
        .from('diagnostic_answers')
        .insert([{
          session_id: sessionId,
          question_id: currentQuestion.id,
          answer: String(value),
        }])
    }

    // Check for follow-up logic
    checkFollowUp(value, newAnswers)
  }

  const checkFollowUp = (value: any, currentAnswers: Record<string, any>) => {
    // Adaptive questioning logic
    if (currentQuestion.id === 'md_1' && value > 100) {
      setFollowUpQuestion('With high lead volume, how do you ensure lead quality?')
      setShowFollowUp(true)
    } else if (currentQuestion.id === 'sc_1' && currentAnswers['md_2']) {
      const conversionRate = (value / currentAnswers['md_2']) * 100
      if (conversionRate < 5) {
        setFollowUpQuestion(`Conversion rate is ${conversionRate.toFixed(1)}%. What percentage of qualified leads receive a proposal?`)
        setShowFollowUp(true)
      }
    } else if (currentQuestion.id === 'fe_1' && currentAnswers['fe_3']) {
      const netProfit = value - currentAnswers['fe_3']
      if (netProfit < 0) {
        setFollowUpQuestion('Revenue is below operating costs. What is your plan to achieve profitability?')
        setShowFollowUp(true)
      }
    } else {
      setShowFollowUp(false)
      setFollowUpQuestion(null)
    }
  }

  const handleFollowUpAnswer = async (value: any) => {
    const followUpId = `${currentQuestion.id}_followup`
    const newAnswers = { ...answers, [followUpId]: value }
    setAnswers(newAnswers)
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
      // Complete diagnosis
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
    
    // Trigger AI analysis
    await supabase
      .from('diagnostic_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId)

    router.push(`/dashboard/diagnoses/${sessionId}`)
  }

  const renderQuestionInput = (question: DiagnosticQuestion) => {
    const value = answers[question.id]

    switch (question.type as any) {
      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
            rows={3}
            placeholder="Enter your answer..."
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleAnswer(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
            placeholder="Enter a number..."
          />
        )
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-4 top-3 text-stone-500">₦</span>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleAnswer(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
              placeholder="0.00"
            />
          </div>
        )
      case 'percentage':
        return (
          <div className="relative">
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleAnswer(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
              placeholder="0"
              min="0"
              max="100"
            />
            <span className="absolute right-4 top-3 text-stone-500">%</span>
          </div>
        )
      case 'yes_no':
        return (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className={`flex-1 px-6 py-3 rounded-xl border-2 transition-all backdrop-blur-xl ${
                value === true
                  ? 'border-emerald-500 bg-emerald-100/80 text-emerald-900'
                  : 'border-stone-300 hover:border-stone-400 bg-white/60'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`flex-1 px-6 py-3 rounded-xl border-2 transition-all backdrop-blur-xl ${
                value === false
                  ? 'border-emerald-500 bg-emerald-100/80 text-emerald-900'
                  : 'border-stone-300 hover:border-stone-400 bg-white/60'
              }`}
            >
              No
            </button>
          </div>
        )
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all backdrop-blur-xl ${
                  value === option
                    ? 'border-emerald-500 bg-emerald-100/80 text-emerald-900'
                    : 'border-stone-300 hover:border-stone-400 bg-white/60'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )
      case 'scale':
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={question.min || 1}
              max={question.max || 10}
              value={value || 5}
              onChange={(e) => handleAnswer(parseInt(e.target.value))}
              className="w-full accent-emerald-700"
            />
            <div className="flex justify-between text-sm text-stone-500">
              <span>{question.min || 1}</span>
              <span className="text-2xl font-bold text-emerald-700">{value || 5}</span>
              <span>{question.max || 10}</span>
            </div>
          </div>
        )
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 transition-all"
          />
        )
      default:
        return null
    }
  }

  if (!business) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="flex bg-gradient-to-br from-sage-100 via-emerald-50 to-eucalyptus-100 min-h-screen">
      <div className="flex-1 p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-medium text-emerald-700 uppercase tracking-widest mb-2">Diagnostic Session</p>
          <h1 className="text-3xl font-semibold text-stone-900 tracking-tight">New Diagnosis</h1>
          <p className="text-stone-600 mt-2">{business.business_name}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-stone-600 mb-2">
            <span className="text-xs font-medium uppercase tracking-widest">Domain {currentDomainIndex + 1} of {DIAGNOSTIC_DOMAINS.length}</span>
            <span className="text-xs font-medium uppercase tracking-widest">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div
              className="bg-emerald-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Domain Header */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-stone-900 tracking-tight mb-2">{currentDomain.name}</h2>
          <p className="text-stone-600 text-sm">{currentDomain.description}</p>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6 mb-6">
          <div className="flex items-start mb-4">
            <span className="bg-emerald-100/80 backdrop-blur-xl text-emerald-900 text-xs font-semibold px-3 py-1 rounded-xl mr-3">
              Question {currentQuestionIndex + 1} of {currentDomain.questions.length}
            </span>
            {currentQuestion.required && (
              <span className="bg-red-100/80 backdrop-blur-xl text-red-900 text-xs font-semibold px-3 py-1 rounded-xl">
                Required
              </span>
            )}
            {currentQuestion.evidence_required && (
              <span className="bg-amber-100/80 backdrop-blur-xl text-amber-900 text-xs font-semibold px-3 py-1 rounded-xl">
                Evidence Required
              </span>
            )}
          </div>

          <h3 className="text-lg font-medium text-stone-900 mb-6">{currentQuestion.question}</h3>

          {renderQuestionInput(currentQuestion)}

          {currentQuestion.evidence_required && (
            <div className="mt-4 p-4 bg-amber-50/80 backdrop-blur-xl border border-amber-200 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Evidence Required</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Please provide supporting evidence (documents, metrics, or observations) for this answer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Follow-up Question */}
        {showFollowUp && followUpQuestion && (
          <div className="bg-emerald-50/80 backdrop-blur-xl border border-emerald-200 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-medium text-emerald-900 mb-4">Follow-up Question</h3>
            <p className="text-emerald-800 mb-4">{followUpQuestion}</p>
            <textarea
              onChange={(e) => handleFollowUpAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
              rows={3}
              placeholder="Enter your response..."
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousQuestion}
            disabled={currentDomainIndex === 0 && currentQuestionIndex === 0}
            className="flex items-center px-6 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl text-stone-700 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Previous
          </button>

          <button
            onClick={() => supabase.from('diagnostic_sessions').update({ notes: 'Saved manually' }).eq('id', sessionId)}
            className="flex items-center px-4 py-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <Save className="mr-2 h-5 w-5" />
            Save Progress
          </button>

          <button
            onClick={nextQuestion}
            disabled={!answers[currentQuestion.id] && currentQuestion.required}
            className="flex items-center px-6 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-700/20"
          >
            {currentDomainIndex === DIAGNOSTIC_DOMAINS.length - 1 && 
             currentQuestionIndex === currentDomain.questions.length - 1
              ? 'Complete Diagnosis'
              : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
          </button>
        </div>
      </div>
    </div>
  )
}
