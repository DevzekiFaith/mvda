'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Clock, CheckCircle, XCircle } from 'lucide-react'
import DashboardNav from '@/components/DashboardNav'

interface DiagnosisSession {
  id: string
  business_id: string
  status: string
  overall_score: number | null
  created_at: string
  completed_at: string | null
  businesses: {
    business_name: string
    industry: string
  }
}

export default function DiagnosesPage() {
  const [sessions, setSessions] = useState<DiagnosisSession[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('diagnostic_sessions')
      .select('*, businesses(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
    } else {
      setSessions(data || [])
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100/80 backdrop-blur-xl text-emerald-900'
      case 'in_progress':
        return 'bg-amber-100/80 backdrop-blur-xl text-amber-900'
      default:
        return 'bg-stone-100/80 backdrop-blur-xl text-stone-900'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />
      case 'in_progress':
        return <Clock className="h-5 w-5" />
      default:
        return <XCircle className="h-5 w-5" />
    }
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-2">Diagnostic Sessions</p>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Diagnoses</h1>
            <p className="text-slate-400 mt-2">Manage business diagnostic sessions</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/businesses')}
            className="flex items-center px-6 py-3 bg-emerald-700/90 backdrop-blur-xl text-white rounded-2xl border border-emerald-600/50 shadow-lg hover:bg-emerald-800 transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Diagnosis
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-lg mb-4">No diagnostic sessions found</p>
              <button
                onClick={() => router.push('/dashboard/businesses')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Start your first diagnosis →
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5 backdrop-blur-xl">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/5 backdrop-blur-xl divide-y divide-white/10">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{session.businesses?.business_name || 'Unknown'}</div>
                      <div className="text-sm text-slate-400">{session.businesses?.industry || 'No industry'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs leading-5 font-semibold rounded-full backdrop-blur-xl ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1">{session.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white">
                        {session.overall_score ? `${session.overall_score.toFixed(1)}/10` : '--'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(session.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => router.push(`/dashboard/diagnoses/${session.id}`)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}