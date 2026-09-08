import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeBusinessData(data: {
  answers: Record<string, any>
  domainScores: Record<string, number>
  metrics: Record<string, number>
  businessInfo: any
}) {
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
    throw new Error('Failed to analyze business data')
  }
}

export async function generateRootCause(constraint: string, symptoms: string[]) {
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
    throw new Error('Failed to generate root cause')
  }
}

export async function detectContradictions(answers: Record<string, any>, metrics: Record<string, number>) {
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
    return JSON.parse(response || '{}')
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to detect contradictions')
  }
}
