import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { businessId } = body

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required to start a diagnostic session.' }, { status: 400 })
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

    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    let consultantId = user?.id || null

    // Ensure consultant user exists in public.users to satisfy foreign key constraint
    if (consultantId) {
      try {
        await supabase.from('users').upsert({
          id: consultantId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Consultant',
          role: 'consultant',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
      } catch (upsertErr) {
        console.warn('Consultant user upsert warning:', upsertErr)
      }
    } else {
      // If unauthenticated session, locate or create a default consultant
      const { data: existingUsers } = await supabase.from('users').select('id').limit(1)
      if (existingUsers && existingUsers.length > 0) {
        consultantId = existingUsers[0].id
      } else {
        // Fallback create default consultant
        const fallbackId = '00000000-0000-0000-0000-000000000001'
        await supabase.from('users').upsert({
          id: fallbackId,
          email: 'consultant@mindvest.internal',
          full_name: 'Lead Consultant',
          role: 'consultant',
        }, { onConflict: 'id' })
        consultantId = fallbackId
      }
    }

    const sessionPayload = {
      business_id: businessId,
      consultant_id: consultantId,
      framework_version: '1.0',
      status: 'in_progress',
    }

    const { data: session, error } = await supabase
      .from('diagnostic_sessions')
      .insert([sessionPayload])
      .select()
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code,
          hint: error.code === '42501' 
            ? 'Row Level Security (RLS) is blocking session creation. Run supabase/fix_rls_policies.sql in your Supabase SQL Editor.' 
            : undefined
        }, 
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      sessionId: session?.id, 
      session 
    })
  } catch (err: any) {
    console.error('Error starting diagnostic session:', err)
    return NextResponse.json({ error: err?.message || 'Failed to initialize session' }, { status: 500 })
  }
}
