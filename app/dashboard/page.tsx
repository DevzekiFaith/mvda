import DashboardNav from '@/components/DashboardNav'
import { createClient } from '@/lib/supabase/server'
import { Building2, Stethoscope, CheckCircle, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Fetch dashboard statistics
  const { count: totalBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeDiagnoses } = await supabase
    .from('diagnostic_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_progress')
  
  const { count: completedDiagnoses } = await supabase
    .from('diagnostic_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  // Fetch average diagnostic score
  const { data: scoreData } = await supabase
    .from('diagnostic_sessions')
    .select('overall_score')
    .eq('status', 'completed')
    .not('overall_score', 'is', null)

  const avgScore = scoreData && scoreData.length > 0
    ? (scoreData.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scoreData.length).toFixed(1)
    : '--'

  // Fetch recent businesses
  const { data: recentBusinesses } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch constraint heatmap data
  const { data: constraints } = await supabase
    .from('constraints')
    .select('description')
    .eq('constraint_type', 'primary')

  // Count constraints by domain (simplified - in production, you'd join with domain_scores)
  const constraintCounts: Record<string, number> = {}
  constraints?.forEach((c: any) => {
    const domain = c.description.split(' ').slice(-2).join(' ')
    constraintCounts[domain] = (constraintCounts[domain] || 0) + 1
  })

  return (
    <div className="flex bg-gradient-to-br from-sage-100 via-emerald-50 to-eucalyptus-100 min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <p className="text-xs font-medium text-emerald-700 uppercase tracking-widest mb-2">Overview</p>
          <h1 className="text-3xl font-semibold text-stone-900 tracking-tight">Dashboard</h1>
          <p className="text-stone-600 mt-2">Mindvest Diagnostic OS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-widest">Total Businesses</p>
                <p className="text-3xl font-bold text-stone-900 mt-2 tracking-tight">{totalBusinesses || 0}</p>
              </div>
              <div className="bg-emerald-100/60 backdrop-blur-xl p-3 rounded-xl">
                <Building2 className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-widest">Active Diagnoses</p>
                <p className="text-3xl font-bold text-stone-900 mt-2 tracking-tight">{activeDiagnoses || 0}</p>
              </div>
              <div className="bg-emerald-100/60 backdrop-blur-xl p-3 rounded-xl">
                <Stethoscope className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-widest">Completed Diagnoses</p>
                <p className="text-3xl font-bold text-stone-900 mt-2 tracking-tight">{completedDiagnoses || 0}</p>
              </div>
              <div className="bg-emerald-100/60 backdrop-blur-xl p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-widest">Avg Score</p>
                <p className="text-3xl font-bold text-stone-900 mt-2 tracking-tight">{avgScore}</p>
              </div>
              <div className="bg-emerald-100/60 backdrop-blur-xl p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6">
            <h2 className="text-sm font-semibold text-stone-900 mb-4 uppercase tracking-widest">Recent Businesses</h2>
            {recentBusinesses && recentBusinesses.length > 0 ? (
              <div className="space-y-3">
                {recentBusinesses.map((business: any) => (
                  <div key={business.id} className="flex items-center justify-between py-3 border-b border-stone-200/50">
                    <div>
                      <p className="font-medium text-stone-900">{business.business_name}</p>
                      <p className="text-sm text-stone-500">{business.industry || 'No industry'}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      business.status === 'diagnosing' ? 'bg-amber-100/80 backdrop-blur-xl text-amber-900' :
                      business.status === 'diagnosis_complete' ? 'bg-emerald-100/80 backdrop-blur-xl text-emerald-900' :
                      'bg-stone-100/80 backdrop-blur-xl text-stone-900'
                    }`}>
                      {business.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 text-sm">No businesses added yet</p>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6">
            <h2 className="text-sm font-semibold text-stone-900 mb-4 uppercase tracking-widest">Constraint Heatmap</h2>
            {Object.keys(constraintCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(constraintCounts)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([domain, count]) => (
                    <div key={domain} className="flex items-center">
                      <span className="flex-1 text-sm text-stone-700">{domain}</span>
                      <div className="flex items-center ml-4">
                        <div className="w-32 bg-stone-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-emerald-700 h-2 rounded-full"
                            style={{ width: `${Math.min((count as number) * 10, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-stone-900">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-stone-500 text-sm">No constraint data available</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
