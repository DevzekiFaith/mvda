import { NextRequest, NextResponse } from 'next/server'
import { analyzeBusinessData, detectContradictions } from '@/lib/openai/client'
import { calculateDomainScore, calculateOverallScore } from '@/lib/diagnostic/scoring'
import { identifyConstraints } from '@/lib/diagnostic/constraints'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, answers, businessInfo } = body

    const supabase = await createClient()

    // Extract metrics from answers
    const metrics: Record<string, number> = {}
    Object.entries(answers).forEach(([key, value]) => {
      if (typeof value === 'number') {
        metrics[key] = value
      }
    })

    // Calculate domain scores
    const domainScores: Record<string, number> = {}
    const domains = ['business_foundation', 'market_customer', 'offer_value', 'positioning_brand', 
                    'marketing_demand', 'sales_conversion', 'operations_delivery', 'financial_engine',
                    'people_leadership', 'strategy_execution']
    
    domains.forEach(domainId => {
      const score = calculateDomainScore({
        domainId,
        answers,
        metrics,
      })
      domainScores[domainId] = score.score
      
      // Save domain score to database
      supabase.from('domain_scores').insert([{
        session_id: sessionId,
        domain_id: domainId,
        score: score.score,
        reason: score.reason,
        evidence: score.evidence,
        confidence: score.confidence,
        missing_evidence: score.missingEvidence,
        ai_generated: true,
        consultant_override: false,
      }])
    })

    // Calculate overall score
    const overallScore = calculateOverallScore(
      Object.values(domainScores).map((score, index) => ({
        domainId: domains[index],
        score,
        reason: '',
        evidence: '',
        confidence: 'medium' as const,
        missingEvidence: '',
        aiGenerated: true,
        consultantOverride: false,
      }))
    )

    // Update session with overall score
    await supabase
      .from('diagnostic_sessions')
      .update({ overall_score: overallScore })
      .eq('id', sessionId)

    // Identify constraints
    const constraints = identifyConstraints({
      sessionId,
      domainScores,
      answers,
      metrics,
    })

    // Save constraints to database
    for (const constraint of constraints) {
      await supabase.from('constraints').insert([{
        session_id: sessionId,
        constraint_type: constraint.constraintType,
        description: constraint.description,
        severity: constraint.severity,
        financial_impact: constraint.financialImpact,
        evidence_strength: constraint.evidenceStrength,
        dependency: constraint.dependency,
        controllability: constraint.controllability,
        priority_score: constraint.priorityScore,
        symptoms: constraint.symptoms,
        opportunity: constraint.opportunity,
        ai_generated: true,
        consultant_override: false,
      }])
    }

    // Run AI analysis
    const aiAnalysis = await analyzeBusinessData({
      answers,
      domainScores,
      metrics,
      businessInfo,
    })

    // Save AI analysis to database
    await supabase.from('ai_analyses').insert([{
      session_id: sessionId,
      analysis_type: 'comprehensive',
      input_data: { answers, domainScores, metrics, businessInfo },
      output_data: aiAnalysis,
      model_used: 'gpt-4',
    }])

    // Detect contradictions
    const contradictions = await detectContradictions(answers, metrics)

    return NextResponse.json({
      success: true,
      domainScores,
      overallScore,
      constraints,
      aiAnalysis,
      contradictions,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze business data' },
      { status: 500 }
    )
  }
}
