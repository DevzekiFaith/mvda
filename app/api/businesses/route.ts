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
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ businesses: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      business_name, 
      industry, 
      location, 
      website, 
      founder_contact, 
      business_stage, 
      team_size, 
      revenue_range 
    } = body

    if (!business_name || !business_name.trim()) {
      return NextResponse.json({ error: 'Business Name is required.' }, { status: 400 })
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

    const { data: { user } } = await supabase.auth.getUser()

    // Ensure user exists in public.users to avoid foreign key errors
    let consultantId = user?.id || null
    if (consultantId) {
      try {
        await supabase.from('users').upsert({
          id: consultantId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Consultant',
          role: 'consultant',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
      } catch {
        consultantId = null
      }
    }

    const payload = {
      business_name: business_name.trim(),
      industry: industry?.trim() || null,
      location: location?.trim() || null,
      website: website?.trim() || null,
      founder_contact: founder_contact?.trim() || null,
      business_stage: business_stage || 'startup',
      team_size: parseInt(team_size) || 1,
      revenue_range: revenue_range || '0-100k',
      assigned_consultant_id: consultantId,
      status: 'intake',
    }

    let insertRes = await supabase.from('businesses').insert([payload]).select().maybeSingle()

    // If failed due to foreign key on assigned_consultant_id, retry with null
    if (insertRes.error && consultantId) {
      payload.assigned_consultant_id = null
      insertRes = await supabase.from('businesses').insert([payload]).select().maybeSingle()
    }

    if (insertRes.error) {
      return NextResponse.json(
        { 
          error: insertRes.error.message, 
          code: insertRes.error.code,
          hint: insertRes.error.code === '42501' 
            ? 'Row Level Security (RLS) is blocking inserts. Please run the SQL in supabase/fix_rls_policies.sql in your Supabase SQL Editor.' 
            : undefined
        }, 
        { status: 400 }
      )
    }

    return NextResponse.json({ business: insertRes.data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error creating business' }, { status: 500 })
  }
}
