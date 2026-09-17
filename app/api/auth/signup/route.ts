import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

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
    let response = NextResponse.json({ success: true, hasSession: false })

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

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // If session was created, sync to public.users
    if (data.user) {
      try {
        await supabase.from('users').upsert(
          {
            id: data.user.id,
            email: data.user.email || '',
            full_name: fullName?.trim() || data.user.email?.split('@')[0] || 'Consultant',
            role: 'consultant',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
      } catch (dbErr) {
        console.warn('Could not upsert user to public.users:', dbErr)
      }
    }

    return NextResponse.json(
      {
        success: true,
        hasSession: Boolean(data.session),
        user: data.user,
      },
      {
        headers: response.headers,
      }
    )
  } catch (err: any) {
    console.error('Server signup error:', err)
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred during registration.' },
      { status: 500 }
    )
  }
}
