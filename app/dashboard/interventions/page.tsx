'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Wrench, Plus, Target } from 'lucide-react'
import DashboardNav from '@/components/DashboardNav'

interface Intervention {
  id: string
  session_id: string
  title: string
  description: string
  priority: string
  status: string
  created_at: string
  diagnostic_sessions: {
    businesses: {
      business_name: string
    }
  }
}

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterventions()
  }, [])

  const fetchInterventions = async () => {
    const { data, error } = await supabase
      .from('interventions')
      .select('*, diagnostic_sessions(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching interventions:', error)
    } else {
      setInterventions(data || [])
    }
    setLoading(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400'
      case 'medium':
        return 'bg-amber-500/20 text-amber-400'
      case 'low':
        return 'bg-emerald-500/20 text-emerald-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400'
      case 'planned':
        return 'bg-purple-500/20 text-purple-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-2">Strategic Interventions</p>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Interventions</h1>
            <p className="text-slate-400 mt-2">Manage strategic interventions and action plans</p>
          </div>
          <button className="flex items-center px-6 py-3 bg-emerald-700/90 backdrop-blur-xl text-white rounded-2xl border border-emerald-600/50 shadow-lg hover:bg-emerald-800 transition-all">
            <Plus className="mr-2 h-5 w-5" />
            New Intervention
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-white py-12">Loading interventions...</div>
          ) : interventions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Wrench className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No interventions found</p>
              <p className="text-slate-500 text-sm mt-2">Complete a diagnosis to create interventions</p>
            </div>
          ) : (
            interventions.map((intervention) => (
              <div key={intervention.id} className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6 hover:bg-white/15 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getPriorityColor(intervention.priority)}`}>
                      {intervention.priority}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getStatusColor(intervention.status)}`}>
                      {intervention.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-white font-medium mb-2">{intervention.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-3">{intervention.description}</p>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-500">
                    {intervention.diagnostic_sessions?.businesses?.business_name || 'Unknown Business'}
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