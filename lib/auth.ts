import { createClient } from '@/lib/supabase/server'

export async function getUser() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return null
    }

    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Ensure user exists in public.users to prevent foreign key errors on consultant_id
    try {
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Consultant',
        role: 'consultant',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    } catch (err) {
      // Ignore if table schema or permissions differ
    }
    
    return user
  } catch (err) {
    console.error('Failed to get user session:', err)
    return null
  }
}

