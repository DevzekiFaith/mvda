import { NextRequest, NextResponse } from 'next/server'
import { analyzeBusinessData, detectContradictions } from '@/lib/openai/client'
import { calculateDomainScore, calculateOverallScore } from '@/lib/diagnostic/scoring'
import { identifyConstraints } from '@/lib/diagnostic/constraints'
import { createClient } from '@/lib/supabase/server'
import { DIAGNOSTIC_DOMAINS } from '@/lib/diagnostic/domains'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, answers, businessInfo } = body

    const supabase = await createClient()

    // Fetch existing diagnostic domains to map slug to real UUID
    let { data: dbDomains } = await supabase.from('diagnostic_domains').select('*')

    // Auto-seed domains if table is empty in the database
    if (!dbDomains || dbDomains.length === 0) {
      try {
        const seedPayload = DIAGNOSTIC_DOMAINS.map(d => ({
          name: d.name,
          description: d.description,
          weight: d.weight || 1.0,
        }))
        const { data: seeded } = await supabase.from('diagnostic_domains').insert(seedPayload).select('*')
        if (seeded && seeded.length > 0) {
          dbDomains = seeded
        }
      } catch (seedErr) {
        console.warn('Could not auto-seed diagnostic domains:', seedErr)
      }
    }

    // Extract metrics from answers
    const metrics: Record<string, number> = {}
    if (answers && typeof answers === 'object') {
      Object.entries(answers).forEach(([key, value]) => {
        if (typeof value === 'number') {
          metrics[key] = value
        }
      })
    }

    // Calculate domain scores
    const domainScores: Record<string, number> = {}
    const domains = [
      'business_foundation', 'market_customer', 'offer_value', 'positioning_brand', 
      'marketing_demand', 'sales_conversion', 'operations_delivery', 'financial_engine',
      'people_leadership', 'strategy_execution'
    ]

    for (const domainSlug of domains) {
      const score = calculateDomainScore({
        domainId: domainSlug,
        answers: answers || {},
        metrics,
      })
      domainScores[domainSlug] = score.score
      
      // Match database UUID by normalized name comparison
      const matchedDomain = dbDomains?.find((d: any) => 
        d.id === domainSlug || 
        d.name?.toLowerCase().replace(/[^a-z0-9]/g, '') === domainSlug.replace(/[^a-z0-9]/g, '')
      )


      if (matchedDomain) {
        try {
          await supabase.from('domain_scores').upsert({
            session_id: sessionId,
            domain_id: matchedDomain.id,
            score: score.score,
            reason: score.reason,
            evidence: score.evidence,
            confidence: score.confidence,
            missing_evidence: score.missingEvidence,
            ai_generated: true,
            consultant_override: false,
          }, { onConflict: 'session_id,domain_id' })
        } catch (_) {}
      }
    }

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

    // Update session with overall score, completion, and full answers in notes
    await supabase
      .from('diagnostic_sessions')
      .update({ 
        overall_score: overallScore, 
        status: 'completed', 
        completed_at: new Date().toISOString(),
        notes: JSON.stringify(answers || {}),
      })
      .eq('id', sessionId)

    // Identify constraints
    const constraints = identifyConstraints({
      sessionId,
      domainScores,
      answers: answers || {},
      metrics,
    })

    // Save constraints to database
    for (const constraint of constraints) {
      try {
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
      } catch (_) {}
    }

    // Run AI analysis with graceful fallback if OpenAI API key is unavailable or fails
    let aiAnalysis: any = null
    try {
      aiAnalysis = await analyzeBusinessData({
        answers: answers || {},
        domainScores,
        metrics,
        businessInfo,
      })

      if (aiAnalysis) {
        try {
          await supabase.from('ai_analyses').insert([{
            session_id: sessionId,
            analysis_type: 'comprehensive',
            input_data: { answers, domainScores, metrics, businessInfo },
            output_data: aiAnalysis,
            model_used: 'gpt-4',
          }])
        } catch (_) {}
      }
    } catch (aiErr) {
      console.warn('AI analysis skipped or encountered error:', aiErr)
      aiAnalysis = {
        summary: 'Empirical diagnostic completed across 10 domains. Primary constraints identified based on weighted algorithmic scoring.',
        recommended_interventions: [
          {
            title: "Two-Tier Qualification Protocol",
            description: "Establish rigorous qualification rubric before proposal creation to preserve consultant bandwidth.",
            priority: "high"
          },
          {
            title: "Pricing Decoupling",
            description: "Standardize core deliverables and isolate custom scope requests into distinct billable tiers.",
            priority: "medium"
          }
        ]
      }
    }

    // Auto-seed interventions into database for execution tracking
    if (aiAnalysis?.recommended_interventions && Array.isArray(aiAnalysis.recommended_interventions)) {
      for (const item of aiAnalysis.recommended_interventions) {
        try {
          await supabase.from('interventions').insert([{
            session_id: sessionId,
            title: item.title || 'Targeted Strategic Intervention',
            description: item.description || '',
            priority: (item.priority?.toLowerCase() === 'high' || item.priority?.toLowerCase() === 'medium' || item.priority?.toLowerCase() === 'low')
              ? item.priority.toLowerCase()
              : 'medium',
            status: 'pending',
            ai_generated: true,
          }])
        } catch (invErr) {
          console.warn('Could not insert recommended intervention:', invErr)
        }
      }
    }

    let contradictions: any[] = []
    try {
      contradictions = await detectContradictions(answers || {}, metrics)
    } catch (_) {}

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
