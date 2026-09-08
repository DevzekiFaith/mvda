export interface DomainScore {
  domainId: string
  score: number
  reason: string
  evidence: string
  confidence: 'low' | 'medium' | 'high'
  missingEvidence: string
  aiGenerated: boolean
  consultantOverride: boolean
  overrideReason?: string
}

export interface ScoringInput {
  domainId: string
  answers: Record<string, any>
  metrics: Record<string, number>
}

export function calculateDomainScore(input: ScoringInput): DomainScore {
  const { domainId, answers, metrics } = input
  
  // Base score calculation based on metrics and answers
  let score = 5 // Default mid-range score
  let reason = 'Based on available data'
  let evidence = ''
  let confidence: 'low' | 'medium' | 'high' = 'medium'
  let missingEvidence = ''

  // Domain-specific scoring logic
  switch (domainId) {
    case 'marketing_demand':
      if (metrics.monthly_leads && metrics.qualified_leads) {
        const qualificationRate = (metrics.qualified_leads / metrics.monthly_leads) * 100
        score = Math.min(10, Math.max(0, qualificationRate / 10))
        reason = `Lead qualification rate: ${qualificationRate.toFixed(1)}%`
        evidence = `${metrics.monthly_leads} leads, ${metrics.qualified_leads} qualified`
        confidence = 'high'
      } else {
        score = 3
        reason = 'Insufficient lead data'
        missingEvidence = 'Monthly leads and qualified leads metrics'
        confidence = 'low'
      }
      break

    case 'sales_conversion':
      if (metrics.monthly_sales && metrics.qualified_leads) {
        const conversionRate = (metrics.monthly_sales / metrics.qualified_leads) * 100
        score = Math.min(10, Math.max(0, conversionRate / 5))
        reason = `Conversion rate: ${conversionRate.toFixed(1)}%`
        evidence = `${metrics.monthly_sales} sales from ${metrics.qualified_leads} leads`
        confidence = 'high'
      } else {
        score = 3
        reason = 'Insufficient conversion data'
        missingEvidence = 'Monthly sales and qualified leads metrics'
        confidence = 'low'
      }
      break

    case 'financial_engine':
      if (metrics.monthly_revenue && metrics.monthly_gross_profit) {
        const grossMargin = (metrics.monthly_gross_profit / metrics.monthly_revenue) * 100
        score = Math.min(10, Math.max(0, grossMargin / 10))
        reason = `Gross margin: ${grossMargin.toFixed(1)}%`
        evidence = `Revenue: ₦${metrics.monthly_revenue.toLocaleString()}, Gross Profit: ₦${metrics.monthly_gross_profit.toLocaleString()}`
        confidence = 'high'
      } else {
        score = 3
        reason = 'Insufficient financial data'
        missingEvidence = 'Monthly revenue and gross profit metrics'
        confidence = 'low'
      }
      break

    default:
      // For other domains, use scale-based answers if available
      const scaleAnswers = Object.entries(answers).filter(([_, value]) => 
        typeof value === 'number' && value >= 1 && value <= 10
      )
      
      if (scaleAnswers.length > 0) {
        const avgScale = scaleAnswers.reduce((sum, [_, value]) => sum + (value as number), 0) / scaleAnswers.length
        score = avgScale
        reason = `Average of ${scaleAnswers.length} scale responses`
        evidence = scaleAnswers.map(([key, value]) => `${key}: ${value}`).join(', ')
        confidence = 'medium'
      } else {
        score = 5
        reason = 'No quantitative metrics available, using neutral score'
        missingEvidence = 'Scale-based responses or metrics'
        confidence = 'low'
      }
  }

  return {
    domainId,
    score: Math.round(score * 10) / 10,
    reason,
    evidence,
    confidence,
    missingEvidence,
    aiGenerated: true,
    consultantOverride: false,
  }
}

export function calculateOverallScore(domainScores: DomainScore[]): number {
  if (domainScores.length === 0) return 0
  
  const totalScore = domainScores.reduce((sum, ds) => sum + ds.score, 0)
  return Math.round((totalScore / domainScores.length) * 10) / 10
}

export function getScoreInterpretation(score: number): string {
  if (score >= 9) return 'Exceptional'
  if (score >= 7) return 'Strong'
  if (score >= 5) return 'Functional but constrained'
  if (score >= 3) return 'Weak'
  return 'Critical'
}
