'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function BaselinePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [existingBaseline, setExistingBaseline] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    revenue: 0,
    customers: 0,
    leads: 0,
    conversion_rate: 0,
    profit: 0,
    cash_flow: 0,
    average_transaction_value: 0,
    operating_costs: 0,
  })

  useEffect(() => {
    fetchSessionData()
    fetchExistingBaseline()
  }, [sessionId])

  const fetchSessionData = async () => {
    const { data } = await supabase
      .from('diagnostic_sessions')
      .select('*, businesses(*)')
      .eq('id', sessionId)
      .single()

    if (data) {
      setSession(data)
      setBusiness(data.businesses)
    }
    setLoading(false)
  }

  const fetchExistingBaseline = async () => {
    const { data } = await supabase
      .from('baseline_metrics')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (data) {
      setExistingBaseline(data)
      setFormData({
        revenue: data.revenue || 0,
        customers: data.customers || 0,
        leads: data.leads || 0,
        conversion_rate: data.conversion_rate || 0,
        profit: data.profit || 0,
        cash_flow: data.cash_flow || 0,
        average_transaction_value: data.average_transaction_value || 0,
        operating_costs: data.operating_costs || 0,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (existingBaseline) {
      await supabase
        .from('baseline_metrics')
        .update(formData)
        .eq('id', existingBaseline.id)
    } else {
      await supabase
        .from('baseline_metrics')
        .insert([{
          business_id: business?.id,
          session_id: sessionId,
          ...formData,
        }])
    }

    setSaving(false)
    router.push(`/dashboard/diagnoses/${sessionId}`)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="flex bg-gradient-to-br from-sage-100 via-emerald-50 to-eucalyptus-100 min-h-screen">
      <div className="flex-1 p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-stone-600 hover:text-stone-900 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
          <p className="text-xs font-medium text-emerald-700 uppercase tracking-widest mb-2">Baseline Recording</p>
          <h1 className="text-3xl font-semibold text-stone-900 tracking-tight">Record Baseline Metrics</h1>
          <p className="text-stone-600 mt-2">{business?.business_name}</p>
          <p className="text-sm text-stone-500 mt-2">
            These metrics will be used to measure the impact of interventions over time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6">
            <h2 className="text-lg font-semibold text-stone-900 tracking-tight mb-4">Revenue & Customers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Monthly Revenue
                </label>
                <input
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Total Customers
                </label>
                <input
                  type="number"
                  value={formData.customers}
                  onChange={(e) => setFormData({ ...formData, customers: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Monthly Leads
                </label>
                <input
                  type="number"
                  value={formData.leads}
                  onChange={(e) => setFormData({ ...formData, leads: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Conversion Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.conversion_rate}
                  onChange={(e) => setFormData({ ...formData, conversion_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg p-6">
            <h2 className="text-lg font-semibold text-stone-900 tracking-tight mb-4">Financial Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Monthly Profit
                </label>
                <input
                  type="number"
                  value={formData.profit}
                  onChange={(e) => setFormData({ ...formData, profit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Cash Flow
                </label>
                <input
                  type="number"
                  value={formData.cash_flow}
                  onChange={(e) => setFormData({ ...formData, cash_flow: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Average Transaction Value
                </label>
                <input
                  type="number"
                  value={formData.average_transaction_value}
                  onChange={(e) => setFormData({ ...formData, average_transaction_value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-widest mb-2">
                  Operating Costs
                </label>
                <input
                  type="number"
                  value={formData.operating_costs}
                  onChange={(e) => setFormData({ ...formData, operating_costs: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                />
              </div>
            </div>
          </div>

          {existingBaseline && (
            <div className="bg-emerald-50/80 backdrop-blur-xl border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                <span className="text-emerald-900">
                  Baseline already recorded on {new Date(existingBaseline.recorded_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-lg shadow-emerald-700/20"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  {existingBaseline ? 'Update Baseline' : 'Record Baseline'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
