'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { BookOpen, Sparkles, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react'

interface CaseStudy {
  id: string
  title: string
  industry?: string
  challenge?: string
  solution?: string
  outcome?: string
  created_at: string
}

const DEFAULT_CASE_STUDIES = [
  {
    id: 'cs-1',
    title: 'Precision Pricing Overhaul for B2B Logistics',
    industry: 'Supply Chain / Freight',
    challenge: 'High top-line volume with razor-thin margins and 14% unbilled scope creep across custom lanes.',
    solution: 'Engineered three-tier pricing model, decoupled fuel surcharges, and implemented automatic detention billing.',
    outcome: '+31.4% Net Margin Expansion within 60 days without client churn.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cs-2',
    title: 'Founder Delegation Protocol in Enterprise SaaS',
    industry: 'Software & Technology',
    challenge: 'All deal closures and onboarding dependent on single founder, capping growth at $1.8M ARR.',
    solution: 'Instituted two-stage discovery rubric and trained dedicated Solutions Architect team.',
    outcome: 'Founder time reclaimed by 70%; pipeline velocity accelerated from 42 to 19 days.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cs-3',
    title: 'Conversion Funnel Remediation for D2C Brand',
    industry: 'Consumer Goods',
    challenge: 'High CAC ($84) and sub-optimal checkout conversion rate (1.2%) draining operational cash reserves.',
    solution: 'Streamlined checkout friction, introduced post-purchase bundles, and eliminated unprofitable ad sets.',
    outcome: 'CAC decreased to $38; average order value expanded by 24.6%.',
    created_at: new Date().toISOString(),
  }
]

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCaseStudies()
  }, [])

  const fetchCaseStudies = async () => {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      setCaseStudies(DEFAULT_CASE_STUDIES)
    } else {
      setCaseStudies(data)
    }
    setLoading(false)
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
              Knowledge Base
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Transformational Case Studies
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
            Empirical before-and-after dossiers from executed diagnostic interventions.
          </p>
        </div>
      </div>

      {/* Case Studies Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading case studies archive...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((cs) => (
            <div
              key={cs.id}
              className="p-6 rounded-3xl bg-[#10121a]/90 border border-white/[0.08] hover:border-[#ff5722]/40 transition-all duration-300 flex flex-col justify-between shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-zinc-400">
                    {cs.industry || 'Enterprise'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" />
                </div>

                <h3 className="text-base font-bold text-white mb-3 group-hover:text-[#ff5722] transition-colors leading-snug">
                  {cs.title}
                </h3>

                <div className="space-y-3 text-xs font-light text-zinc-400">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 block mb-1">
                      Primary Constraint
                    </span>
                    <p className="line-clamp-3">{cs.challenge}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
                      Surgical Intervention
                    </span>
                    <p className="line-clamp-3">{cs.solution}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                  Verifiable Outcome
                </span>
                <p className="text-xs font-medium text-emerald-300">
                  {cs.outcome}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}