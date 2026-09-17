import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          error:
            'Supabase credentials are missing on this deployment. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel Project Settings > Environment Variables, then redeploy.',
        },
        { status: 500 }
      )
    }

    const cookieStore = await cookies()
    let response = NextResponse.json({ success: true })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'Authentication succeeded but session could not be established. Please retry.' },
        { status: 400 }
      )
    }

    // Synchronize to public.users table for consultant foreign key integrity
    if (data.user) {
      try {
        await supabase.from('users').upsert(
          {
            id: data.user.id,
            email: data.user.email || '',
            full_name:
              data.user.user_metadata?.full_name ||
              data.user.email?.split('@')[0] ||
              'Consultant',
            role: 'consultant',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
      } catch (dbErr) {
        console.warn('Could not upsert user to public.users:', dbErr)
      }
    }

    return response
  } catch (err: any) {
    console.error('Server login error:', err)
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred during login.' },
      { status: 500 }
    )
  }
}
