import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId query parameter is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
    const cookieStore = await cookies()

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    })

    const { data, error } = await supabase
      .from('baseline_metrics')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ baseline: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      sessionId, 
      businessId, 
      revenue, 
      customers, 
      leads, 
      conversion_rate, 
      profit, 
      cash_flow, 
      average_transaction_value, 
      operating_costs 
    } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
    const cookieStore = await cookies()

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    })

    // Resolve businessId if missing
    let targetBusinessId = businessId
    if (!targetBusinessId) {
      const { data: sessionData } = await supabase
        .from('diagnostic_sessions')
        .select('business_id')
        .eq('id', sessionId)
        .maybeSingle()

      targetBusinessId = sessionData?.business_id
    }

    if (!targetBusinessId) {
      return NextResponse.json({ error: 'Could not resolve business ID associated with this diagnostic session.' }, { status: 400 })
    }

    const payload = {
      business_id: targetBusinessId,
      session_id: sessionId,
      revenue: Number(revenue) || 0,
      customers: Number(customers) || 0,
      leads: Number(leads) || 0,
      conversion_rate: Number(conversion_rate) || 0,
      profit: Number(profit) || 0,
      cash_flow: Number(cash_flow) || 0,
      average_transaction_value: Number(average_transaction_value) || 0,
      operating_costs: Number(operating_costs) || 0,
      recorded_at: new Date().toISOString(),
    }

    // Check if baseline already exists for this session
    const { data: existing } = await supabase
      .from('baseline_metrics')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle()

    let res
    if (existing?.id) {
      res = await supabase
        .from('baseline_metrics')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .maybeSingle()
    } else {
      res = await supabase
        .from('baseline_metrics')
        .insert([payload])
        .select()
        .maybeSingle()
    }

    if (res.error) {
      return NextResponse.json(
        { 
          error: res.error.message, 
          code: res.error.code,
          hint: res.error.code === '42501' 
            ? 'Row Level Security (RLS) is blocking baseline metric updates. Run supabase/fix_rls_policies.sql in your Supabase SQL Editor.' 
            : undefined
        }, 
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, baseline: res.data })
  } catch (err: any) {
    console.error('Error saving baseline metrics:', err)
    return NextResponse.json({ error: err?.message || 'Server error saving baseline' }, { status: 500 })
  }
}
