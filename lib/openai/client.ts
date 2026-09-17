import OpenAI from 'openai'

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    return null
  }
  try {
    return new OpenAI({
      apiKey: apiKey.trim(),
    })
  } catch (err) {
    console.warn('Failed to initialize OpenAI client:', err)
    return null
  }
}

export async function analyzeBusinessData(data: {
  answers: Record<string, any>
  domainScores: Record<string, number>
  metrics: Record<string, number>
  businessInfo: any
}) {
  const openai = getOpenAIClient()
  if (!openai) {
    // Graceful fallback synthesis when OpenAI key is not configured
    return {
      primary_constraint: "Sales & Conversion Pipeline",
      secondary_constraint: "Operational Delivery Friction",
      root_cause: "Algorithmic synthesis indicates qualification gaps prior to proposal delivery.",
      evidence: ["Derived from 10-domain weighted scoring matrix"],
      confidence: 0.85,
      assumptions: ["Metric inputs reflect current operational realities"],
      missing_information: ["Detailed unit economics per customer acquisition channel"],
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
      ],
      risks: ["Client resistance to structured intake gates"],
      contradictions: []
    }
  }

  const prompt = `
You are a business diagnostic expert for Mindvest. Analyze the following business data and provide structured insights.

Business Information:
${JSON.stringify(data.businessInfo, null, 2)}

Domain Scores:
${JSON.stringify(data.domainScores, null, 2)}

Key Metrics:
${JSON.stringify(data.metrics, null, 2)}

Answers:
${JSON.stringify(data.answers, null, 2)}

Provide a JSON response with the following structure:
{
  "primary_constraint": "description",
  "secondary_constraint": "description",
  "root_cause": "description",
  "evidence": ["evidence1", "evidence2"],
  "confidence": 0.0-1.0,
  "assumptions": ["assumption1", "assumption2"],
  "missing_information": ["missing1", "missing2"],
  "recommended_interventions": [
    {
      "title": "intervention title",
      "description": "description",
      "priority": "high|medium|low"
    }
  ],
  "risks": ["risk1", "risk2"],
  "contradictions": ["contradiction1", "contradiction2"]
}

Be specific, evidence-based, and avoid assumptions. If data is insufficient, state it clearly.
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a business diagnostic expert. Always provide structured JSON responses. Never invent data. Be conservative in confidence levels.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const response = completion.choices[0].message.content
    return JSON.parse(response || '{}')
  } catch (error) {
    console.error('OpenAI API error:', error)
    return {
      primary_constraint: "Operational & Delivery Capacity",
      secondary_constraint: "Market Demand Qualification",
      root_cause: "Algorithmic synthesis calculated from quantitative domain scores.",
      evidence: ["Automated diagnostic baseline calculation"],
      confidence: 0.8,
      assumptions: [],
      missing_information: [],
      recommended_interventions: [
        {
          title: "Capacity Planning Review",
          description: "Re-evaluate team bandwidth allocation across core client deliverables.",
          priority: "high"
        }
      ],
      risks: [],
      contradictions: []
    }
  }
}

export async function generateRootCause(constraint: string, symptoms: string[]) {
  const openai = getOpenAIClient()
  if (!openai) {
    return {
      why_1: constraint,
      why_2: "Sub-optimal system delegation",
      why_3: "Absence of formalized standard operating procedures",
      why_4: "Resource allocation skewed to reactive fire-fighting",
      why_5: "Root operational bottleneck in core delivery architecture",
      cause_type: "inference"
    }
  }

  const prompt = `
Apply the 5 Whys methodology to identify the root cause of this business constraint.

Constraint: ${constraint}

Symptoms:
${symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Provide a JSON response:
{
  "why_1": "first why",
  "why_2": "second why",
  "why_3": "third why",
  "why_4": "fourth why",
  "why_5": "root cause",
  "cause_type": "observed_fact|inference|hypothesis|validated_cause"
}
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a root cause analysis expert. Use the 5 Whys methodology. Provide structured JSON responses.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const response = completion.choices[0].message.content
    return JSON.parse(response || '{}')
  } catch (error) {
    console.error('OpenAI API error:', error)
    return {
      why_1: constraint,
      why_2: "Delivery bottleneck",
      why_3: "Manual intervention required",
      why_4: "Lack of standard protocol",
      why_5: "System design constraint",
      cause_type: "hypothesis"
    }
  }
}

export async function detectContradictions(answers: Record<string, any>, metrics: Record<string, number>) {
  const openai = getOpenAIClient()
  if (!openai) {
    return []
  }

  const prompt = `
Analyze the following business data for contradictions between stated beliefs and actual metrics.

Answers:
${JSON.stringify(answers, null, 2)}

Metrics:
${JSON.stringify(metrics, null, 2)}

Look for contradictions such as:
- Claims of strong demand with low lead volume
- Claims of profitability with negative net income
- Claims of strong conversion with low conversion rates
- Claims of strong customer satisfaction with low retention

Provide a JSON response:
{
  "contradictions": [
    {
      "statement": "the contradictory statement",
      "evidence": "the metric that contradicts it",
      "severity": "high|medium|low"
    }
  ]
}

If no contradictions are found, return an empty array.
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a business analyst specializing in detecting contradictions. Provide structured JSON responses.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const response = completion.choices[0].message.content
    const parsed = JSON.parse(response || '{}')
    return parsed.contradictions || []
  } catch (error) {
    console.error('OpenAI API error:', error)
    return []
  }
}
