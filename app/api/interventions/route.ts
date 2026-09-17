import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
      .from('interventions')
      .select('*, diagnostic_sessions(*, businesses(*))')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ interventions: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error fetching interventions' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Intervention ID and status are required' }, { status: 400 })
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
      .from('interventions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, diagnostic_sessions(*, businesses(*))')
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code,
          hint: error.code === '42501' 
            ? 'Row Level Security (RLS) is blocking intervention updates. Run supabase/fix_rls_policies.sql in your Supabase SQL Editor.' 
            : undefined
        }, 
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, intervention: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error updating intervention' }, { status: 500 })
  }
}
