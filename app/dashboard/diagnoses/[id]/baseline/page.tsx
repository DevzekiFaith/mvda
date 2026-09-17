'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from 'lucide-react'

export default function BaselinePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [existingBaseline, setExistingBaseline] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
      .maybeSingle()

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
      .maybeSingle()

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
    setSavedSuccess(false)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/baseline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          businessId: session?.business_id,
          ...formData,
        }),
      })

      const resData = await res.json()

      if (!res.ok) {
        const hint = resData.hint ? ` ${resData.hint}` : ''
        throw new Error((resData.error || 'Failed to save baseline metrics.') + hint)
      }

      setSavedSuccess(true)
      fetchExistingBaseline()
    } catch (err: any) {
      console.error('Error saving baseline:', err)
      setErrorMessage(err?.message || 'Failed to record baseline telemetry. Please check database permissions.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <Link
          href={`/dashboard/diagnoses/${sessionId}`}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Analysis</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
                Pre-Intervention Benchmarking
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Baseline Metrics
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
              Lock in initial KPIs for {business?.business_name || 'Client'} to measure verified 30/60/90-day improvement.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Baseline metrics recorded successfully. 30/60/90-day variances will track against these numbers.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#10121a] rounded-3xl border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Monthly Revenue ($)
            </label>
            <input
              type="number"
              value={formData.revenue}
              onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Monthly Operating Costs ($)
            </label>
            <input
              type="number"
              value={formData.operating_costs}
              onChange={(e) => setFormData({ ...formData, operating_costs: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Net Profit ($)
            </label>
            <input
              type="number"
              value={formData.profit}
              onChange={(e) => setFormData({ ...formData, profit: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Cash Flow ($)
            </label>
            <input
              type="number"
              value={formData.cash_flow}
              onChange={(e) => setFormData({ ...formData, cash_flow: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Monthly Inbound Leads
            </label>
            <input
              type="number"
              value={formData.leads}
              onChange={(e) => setFormData({ ...formData, leads: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Conversion Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.conversion_rate}
              onChange={(e) => setFormData({ ...formData, conversion_rate: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Average Transaction Value ($)
            </label>
            <input
              type="number"
              value={formData.average_transaction_value}
              onChange={(e) => setFormData({ ...formData, average_transaction_value: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Active Customers Count
            </label>
            <input
              type="number"
              value={formData.customers}
              onChange={(e) => setFormData({ ...formData, customers: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.07] flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Recording Telemetry...' : 'Save Baseline Telemetry'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
