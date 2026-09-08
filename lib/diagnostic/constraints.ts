export interface Constraint {
  id?: string
  sessionId: string
  constraintType: 'primary' | 'secondary'
  description: string
  severity: number
  financialImpact: number
  evidenceStrength: number
  dependency: number
  controllability: number
  priorityScore: number
  symptoms: string[]
  opportunity: string
  aiGenerated: boolean
  consultantOverride: boolean
  overrideReason?: string
}

export interface ConstraintInput {
  sessionId: string
  domainScores: Record<string, number>
  answers: Record<string, any>
  metrics: Record<string, number>
}

export function calculateConstraintPriorityScore(
  severity: number,
  financialImpact: number,
  evidenceStrength: number,
  dependency: number,
  controllability: number
): number {
  // Formula: (Severity × Financial Impact × Evidence Strength × Dependency × Controllability) / 10000
  // This gives a score between 0 and 10
  const rawScore = (severity * financialImpact * evidenceStrength * dependency * controllability) / 10000
  return Math.round(rawScore * 100) / 100
}

export function identifyConstraints(input: ConstraintInput): Constraint[] {
  const { sessionId, domainScores, answers, metrics } = input
  const constraints: Constraint[] = []

  // Analyze each domain for potential constraints
  Object.entries(domainScores).forEach(([domainId, score]) => {
    if (score >= 7) return // Strong domains don't need constraint identification

    let description = ''
    let severity = 10 - score // Lower score = higher severity
    let financialImpact = 5
    let evidenceStrength = 7
    let dependency = 7
    let controllability = 7
    let symptoms: string[] = []
    let opportunity = ''

    switch (domainId) {
      case 'marketing_demand':
        if (metrics.monthly_leads && metrics.qualified_leads) {
          const qualificationRate = (metrics.qualified_leads / metrics.monthly_leads) * 100
          if (qualificationRate < 20) {
            description = 'Low lead qualification rate indicates ineffective targeting or acquisition channels'
            severity = 8
            financialImpact = 9
            evidenceStrength = 9
            dependency = 8
            controllability = 8
            symptoms = [
              `Only ${qualificationRate.toFixed(1)}% of leads are qualified`,
              'High volume of unqualified leads wasting resources',
              'Sales team spending time on poor-fit prospects'
            ]
            opportunity = 'Improving lead qualification could increase sales efficiency by 50-100%'
          }
        }
        break

      case 'sales_conversion':
        if (metrics.monthly_sales && metrics.qualified_leads) {
          const conversionRate = (metrics.monthly_sales / metrics.qualified_leads) * 100
          if (conversionRate < 10) {
            description = 'Low conversion rate from qualified leads to customers'
            severity = 9
            financialImpact = 10
            evidenceStrength = 9
            dependency = 9
            controllability = 8
            symptoms = [
              `Only ${conversionRate.toFixed(1)}% conversion from qualified leads`,
              'Lost revenue from qualified prospects',
              'Potential issues in sales process or proposal quality'
            ]
            opportunity = 'Improving conversion could double revenue without increasing lead generation'
          }
        }
        break

      case 'financial_engine':
        if (metrics.monthly_revenue && metrics.monthly_gross_profit) {
          const grossMargin = (metrics.monthly_gross_profit / metrics.monthly_revenue) * 100
          if (grossMargin < 30) {
            description = 'Low gross margin indicates pricing or cost structure issues'
            severity = 9
            financialImpact = 10
            evidenceStrength = 9
            dependency = 7
            controllability = 7
            symptoms = [
              `Gross margin of only ${grossMargin.toFixed(1)}%`,
              'Limited room for operating expenses',
              'Vulnerability to cost increases'
            ]
            opportunity = 'Improving gross margin could significantly increase profitability'
          }
        }
        if (metrics.monthly_revenue && metrics.monthly_operating_costs) {
          const netProfit = metrics.monthly_revenue - metrics.monthly_operating_costs
          if (netProfit < 0) {
            description = 'Business operating at a loss - unsustainable financial position'
            severity = 10
            financialImpact = 10
            evidenceStrength = 10
            dependency = 9
            controllability = 7
            symptoms = [
              `Monthly loss of ₦${Math.abs(netProfit).toLocaleString()}`,
              'Cash burn rate threatening business survival',
              'Limited runway for continued operations'
            ]
            opportunity = 'Achieving profitability is critical for business survival'
          }
        }
        break

      case 'business_foundation':
        if (answers['bf_7'] && answers['bf_7'] < 5) {
          description = 'Lack of strategic clarity leading to unfocused execution'
          severity = 7
          financialImpact = 8
          evidenceStrength = 6
          dependency = 9
          controllability = 8
          symptoms = [
            'Unclear strategic direction',
            'Inconsistent decision making',
            'Resources spread across too many initiatives'
          ]
          opportunity = 'Clarifying strategy could focus resources and improve outcomes'
        }
        break

      case 'people_leadership':
        if (answers['pl_1'] && answers['pl_1'] > 7) {
          description = 'High founder dependency creating scalability risk'
          severity = 7
          financialImpact = 8
          evidenceStrength = 7
          dependency = 8
          controllability = 6
          symptoms = [
            'Business heavily dependent on founder',
            'Bottlenecks in decision making',
            'Risk if founder becomes unavailable'
          ]
          opportunity = 'Reducing founder dependency could enable growth and reduce risk'
        }
        break

      case 'operations_delivery':
        if (answers['od_6'] && answers['od_6'] < 5) {
          description = 'Poor customer experience affecting retention and reputation'
          severity = 8
          financialImpact = 9
          evidenceStrength = 7
          dependency = 7
          controllability = 8
          symptoms = [
            'Low customer experience scores',
            'Potential negative word-of-mouth',
            'Risk of customer churn'
          ]
          opportunity = 'Improving customer experience could increase retention and referrals'
        }
        break

      case 'strategy_execution':
        if (answers['se_6'] && answers['se_6'] < 5) {
          description = 'Poor execution discipline preventing strategy realization'
          severity = 8
          financialImpact = 8
          evidenceStrength = 6
          dependency = 9
          controllability = 8
          symptoms = [
            'Strategic goals not being achieved',
            'Inconsistent follow-through on initiatives',
            'Gap between planning and execution'
          ]
          opportunity = 'Improving execution discipline could unlock strategic potential'
        }
        break
    }

    if (description) {
      const priorityScore = calculateConstraintPriorityScore(
        severity,
        financialImpact,
        evidenceStrength,
        dependency,
        controllability
      )

      constraints.push({
        sessionId,
        constraintType: 'secondary',
        description,
        severity,
        financialImpact,
        evidenceStrength,
        dependency,
        controllability,
        priorityScore,
        symptoms,
        opportunity,
        aiGenerated: true,
        consultantOverride: false,
      })
    }
  })

  // Sort by priority score and set primary constraint
  constraints.sort((a, b) => b.priorityScore - a.priorityScore)
  
  if (constraints.length > 0) {
    constraints[0].constraintType = 'primary'
  }

  return constraints
}

export function generateRootCause(constraint: Constraint): string[] {
  const rootCauses: string[] = []
  
  // 5 Whys methodology
  rootCauses.push(`Problem: ${constraint.description}`)
  rootCauses.push(`Why? ${constraint.symptoms[0] || 'Initial symptom identified'}`)
  rootCauses.push(`Why? Analysis of underlying patterns in the data`)
  rootCauses.push(`Why? Investigation of systemic issues`)
  rootCauses.push(`Why? Examination of fundamental business processes`)
  rootCauses.push(`Root Cause: ${constraint.opportunity}`)

  return rootCauses
}
