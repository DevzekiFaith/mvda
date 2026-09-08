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

    const { data } = await query.single()
    
    if (data) {
      setMetrics(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="p-6">Loading financial data...</div>
  }

  if (!metrics) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800">No financial data available. Please complete the diagnostic questionnaire.</span>
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
    {
      title: 'Average Transaction Value',
      value: formatCurrency(metrics.average_transaction_value),
      icon: null,
      trend: null,
    },
    {
      title: 'Customer Acquisition Cost',
      value: formatCurrency(metrics.customer_acquisition_cost),
      icon: null,
      trend: null,
    },
    {
      title: 'Break-even Revenue',
      value: formatCurrency(breakEvenRevenue),
      icon: AlertCircle,
      trend: metrics.monthly_revenue >= breakEvenRevenue ? 'positive' : 'negative',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {financialCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              {card.icon && (
                <div className={`p-3 rounded-full ${
                  card.trend === 'positive' ? 'bg-green-100' :
                  card.trend === 'negative' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  <card.icon className={`h-6 w-6 ${
                    card.trend === 'positive' ? 'text-green-600' :
                    card.trend === 'negative' ? 'text-red-600' :
                    'text-gray-600'
                  }`} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Health Indicators</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Profitability Status</span>
            <span className={`font-medium ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netProfit >= 0 ? 'Profitable' : 'Operating at Loss'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Gross Margin Health</span>
            <span className={`font-medium ${grossMargin >= 30 ? 'text-green-600' : grossMargin >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
              {grossMargin >= 30 ? 'Healthy' : grossMargin >= 20 ? 'Moderate' : 'Critical'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Cash Position</span>
            <span className={`font-medium ${metrics.cash_balance > metrics.monthly_operating_costs * 3 ? 'text-green-600' : metrics.cash_balance > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
              {metrics.cash_balance > metrics.monthly_operating_costs * 3 ? 'Strong' : metrics.cash_balance > 0 ? 'Adequate' : 'Critical'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Break-even Status</span>
            <span className={`font-medium ${metrics.monthly_revenue >= breakEvenRevenue ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.monthly_revenue >= breakEvenRevenue ? 'Above Break-even' : 'Below Break-even'}
            </span>
          </div>
        </div>
      </div>

      {(metrics.receivables > 0 || metrics.payables > 0 || metrics.debt > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Sheet Items</h3>
          <div className="space-y-3">
            {metrics.receivables > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Receivables</span>
                <span className="font-medium text-gray-900">{formatCurrency(metrics.receivables)}</span>
              </div>
            )}
            {metrics.payables > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Payables</span>
                <span className="font-medium text-gray-900">{formatCurrency(metrics.payables)}</span>
              </div>
            )}
            {metrics.debt > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Outstanding Debt</span>
                <span className="font-medium text-red-600">{formatCurrency(metrics.debt)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
