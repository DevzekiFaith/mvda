'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'
import { formatCurrency, formatPercentage, calculateGrossMargin, calculateNetMargin } from '@/lib/utils'

interface FinancialMetrics {
  monthly_revenue: number
  monthly_gross_profit: number
  monthly_operating_costs: number
  cash_balance: number
  receivables: number
  payables: number
  debt: number
  average_transaction_value: number
  customer_acquisition_cost: number
}

export default function FinancialDashboard({ businessId, sessionId }: { businessId: string; sessionId?: string }) {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancialMetrics()
  }, [businessId, sessionId])

  const fetchFinancialMetrics = async () => {
    let query = supabase.from('financial_metrics').select('*')
    
    if (sessionId) {
      query = query.eq('session_id', sessionId)
    } else {
      query = query.eq('business_id', businessId).order('recorded_at', { ascending: false }).limit(1)
    }

    const { data } = await query.maybeSingle()
    
    if (data) {
      setMetrics(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="p-8 text-center text-xs font-mono text-zinc-500">Evaluating financial metrics...</div>
  }

  if (!metrics) {
    return (
      <div className="p-6 bg-[#10121a] border border-white/[0.08] rounded-2xl">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
          <span className="text-xs text-zinc-300">
            No quantitative financial metrics recorded for this session yet. Complete the Financial Engine questions to generate telemetry.
          </span>
        </div>
      </div>
    )
  }

  const grossMargin = calculateGrossMargin(metrics.monthly_revenue, metrics.monthly_gross_profit)
  const netProfit = metrics.monthly_revenue - metrics.monthly_operating_costs
  const netMargin = calculateNetMargin(metrics.monthly_revenue, netProfit)
  const breakEvenRevenue = metrics.monthly_operating_costs / (metrics.monthly_gross_profit / metrics.monthly_revenue || 1)

  const financialCards = [
    {
      title: 'Monthly Revenue',
      value: formatCurrency(metrics.monthly_revenue),
      icon: DollarSign,
      trend: null,
    },
    {
      title: 'Gross Profit',
      value: formatCurrency(metrics.monthly_gross_profit),
      icon: TrendingUp,
      trend: grossMargin >= 30 ? 'positive' : 'negative',
    },
    {
      title: 'Gross Margin',
      value: formatPercentage(grossMargin),
      icon: null,
      trend: grossMargin >= 30 ? 'positive' : 'negative',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(netProfit),
      icon: netProfit >= 0 ? TrendingUp : TrendingDown,
      trend: netProfit >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Net Margin',
      value: formatPercentage(netMargin),
      icon: null,
      trend: netMargin >= 10 ? 'positive' : 'negative',
    },
    {
      title: 'Cash Balance',
      value: formatCurrency(metrics.cash_balance),
      icon: DollarSign,
      trend: metrics.cash_balance > 0 ? 'positive' : 'negative',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {financialCards.map((card, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-[#10121a]/90 border border-white/[0.07] flex flex-col justify-between"
          >
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">{card.title}</p>
              <p className="text-2xl font-bold font-mono text-white mt-1">{card.value}</p>
            </div>
            {card.trend && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-mono">
                <span className={card.trend === 'positive' ? 'text-emerald-400' : 'text-red-400'}>
                  {card.trend === 'positive' ? '● Healthy Range' : '▲ Below Target'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-[#10121a]/90 border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">Financial Health Diagnostics</h3>
        <div className="space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
            <span className="text-zinc-400">Profitability Engine</span>
            <span className={netProfit >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {netProfit >= 0 ? 'Profitable' : 'Operating at Burn Loss'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
            <span className="text-zinc-400">Gross Margin Buffer</span>
            <span className={grossMargin >= 30 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {grossMargin >= 30 ? 'Strong (>30%)' : 'Compressed Margin'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
            <span className="text-zinc-400">Break-even Threshold</span>
            <span className={metrics.monthly_revenue >= breakEvenRevenue ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {metrics.monthly_revenue >= breakEvenRevenue ? 'Cleared' : 'Deficit'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
