'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { AlertTriangle, TrendingUp, Filter } from 'lucide-react'
import DashboardNav from '@/components/DashboardNav'

interface Constraint {
  id: string
  session_id: string
  constraint_type: string
  description: string
  severity: number
  financial_impact: number
  priority_score: number
  created_at: string
  diagnostic_sessions: {
    businesses: {
      business_name: string
    }
  }
}

export default function ConstraintsPage() {
  const [constraints, setConstraints] = useState<Constraint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'primary' | 'secondary'>('all')

  useEffect(() => {
    fetchConstraints()
  }, [])

  const fetchConstraints = async () => {
    const { data, error } = await supabase
      .from('constraints')
      .select('*, diagnostic_sessions(*)')
      .order('priority_score', { ascending: false })

    if (error) {
      console.error('Error fetching constraints:', error)
    } else {
      setConstraints(data || [])
    }
    setLoading(false)
  }

  const filteredConstraints = constraints.filter(c => 
    filter === 'all' || c.constraint_type === filter
  )

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'text-red-400'
    if (severity >= 5) return 'text-amber-400'
    return 'text-emerald-400'
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-2">Business Constraints</p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Constraints</h1>
          <p className="text-slate-400 mt-2">Identified business constraints and bottlenecks</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center px-4 py-2 rounded-xl backdrop-blur-xl transition-all ${
              filter === 'all' 
                ? 'bg-emerald-700/90 text-white' 
                : 'bg-white/10 text-slate-400 hover:bg-white/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('primary')}
            className={`flex items-center px-4 py-2 rounded-xl backdrop-blur-xl transition-all ${
              filter === 'primary' 
                ? 'bg-emerald-700/90 text-white' 
                : 'bg-white/10 text-slate-400 hover:bg-white/20'
            }`}
          >
            Primary
          </button>
          <button
            onClick={() => setFilter('secondary')}
            className={`flex items-center px-4 py-2 rounded-xl backdrop-blur-xl transition-all ${
              filter === 'secondary' 
                ? 'bg-emerald-700/90 text-white' 
                : 'bg-white/10 text-slate-400 hover:bg-white/20'
            }`}
          >
            Secondary
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-white py-12">Loading constraints...</div>
          ) : filteredConstraints.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No constraints found</p>
              <p className="text-slate-500 text-sm mt-2">Complete a diagnosis to identify constraints</p>
            </div>
          ) : (
            filteredConstraints.map((constraint) => (
              <div key={constraint.id} className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6 hover:bg-white/15 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <span className={`text-2xl font-bold ${getSeverityColor(constraint.severity)}`}>
                    {constraint.severity}/10
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                    constraint.constraint_type === 'primary' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {constraint.constraint_type}
                  </span>
                </div>

                <h3 className="text-white font-medium mb-2 line-clamp-2">{constraint.description}</h3>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Priority Score</span>
                    <span className="text-white font-medium">{constraint.priority_score.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Financial Impact</span>
                    <span className="text-white font-medium">{constraint.financial_impact}/10</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-500">
                    {constraint.diagnostic_sessions?.businesses?.business_name || 'Unknown Business'}
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