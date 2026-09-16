'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { BookOpen, FileText, Clock, TrendingUp } from 'lucide-react'
import DashboardNav from '@/components/DashboardNav'

interface CaseStudy {
  id: string
  title: string
  industry: string
  challenge: string
  solution: string
  outcome: string
  created_at: string
}

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

    if (error) {
      console.error('Error fetching case studies:', error)
    } else {
      setCaseStudies(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-2">Knowledge Base</p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Case Studies</h1>
          <p className="text-slate-400 mt-2">Learn from successful business transformations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-white py-12">Loading case studies...</div>
          ) : caseStudies.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No case studies available</p>
              <p className="text-slate-500 text-sm mt-2">Case studies will be added as interventions are completed</p>
            </div>
          ) : (
            caseStudies.map((caseStudy) => (
              <div key={caseStudy.id} className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6 hover:bg-white/15 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-400" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                    {caseStudy.industry}
                  </span>
                </div>

                <h3 className="text-white font-medium mb-2">{caseStudy.title}</h3>
                
                <div className="space-y-3 mt-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-xs text-slate-500">Challenge</span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2">{caseStudy.challenge}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-slate-500" />
                      <span className="text-xs text-slate-500">Outcome</span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2">{caseStudy.outcome}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-500">
                    {new Date(caseStudy.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}