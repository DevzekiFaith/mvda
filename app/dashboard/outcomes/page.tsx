'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TrendingUp, BarChart3, Calendar } from 'lucide-react'
import DashboardNav from '@/components/DashboardNav'

interface Outcome {
  id: string
  session_id: string
  metric_name: string
  baseline_value: number
  target_value: number
  current_value: number
  measurement_date: string
  diagnostic_sessions: {
    businesses: {
      business_name: string
    }
  }
}

export default function OutcomesPage() {
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOutcomes()
  }, [])

  const fetchOutcomes = async () => {
    const { data, error } = await supabase
      .from('baseline_metrics')
      .select('*, diagnostic_sessions(*)')
      .order('recorded_at', { ascending: false })

    if (error) {
      console.error('Error fetching outcomes:', error)
    } else {
      setOutcomes(data || [])
    }
    setLoading(false)
  }

  const calculateProgress = (baseline: number, target: number, current: number) => {
    if (target === baseline) return 0
    const progress = ((current - baseline) / (target - baseline)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-2">Performance Tracking</p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Outcomes</h1>
          <p className="text-slate-400 mt-2">Track intervention outcomes and business performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Total Metrics</span>
            </div>
            <div className="text-3xl font-bold text-white">{outcomes.length}</div>
            <div className="text-sm text-slate-400 mt-1">Tracked outcomes</div>
          </div>

          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Avg Progress</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {outcomes.length > 0 
                ? `${Math.round(outcomes.reduce((sum, o) => sum + calculateProgress(o.baseline_value, o.target_value, o.current_value), 0) / outcomes.length)}%`
                : '0%'
              }
            </div>
            <div className="text-sm text-slate-400 mt-1">Overall improvement</div>
          </div>

          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Active Tracking</span>
            </div>
            <div className="text-3xl font-bold text-white">{outcomes.length}</div>
            <div className="text-sm text-slate-400 mt-1">Businesses monitored</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white">Loading outcomes...</div>
          ) : outcomes.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No outcomes tracked yet</p>
              <p className="text-slate-500 text-sm mt-2">Complete a diagnosis and set baseline metrics to start tracking</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5 backdrop-blur-xl">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/5 backdrop-blur-xl divide-y divide-white/10">
                {outcomes.map((outcome) => {
                  const progress = calculateProgress(outcome.baseline_value, outcome.target_value, outcome.current_value)
                  return (
                    <tr key={outcome.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {outcome.diagnostic_sessions?.businesses?.business_name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{outcome.metric_name}</div>
                        <div className="text-xs text-slate-500">
                          {outcome.baseline_value} → {outcome.target_value}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-white/20 rounded-full h-2 mr-2">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white">{Math.round(progress)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(outcome.measurement_date).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}