import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entityType, entityId, fieldName, originalValue, newValue, reason } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Log the override in consultant_overrides table
    await supabase.from('consultant_overrides').insert([{
      consultant_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      field_name: fieldName,
      original_value: originalValue,
      new_value: newValue,
      reason,
    }])

    // Log the action in audit_logs table
    await supabase.from('audit_logs').insert([{
      user_id: user.id,
      action: 'override',
      entity_type: entityType,
      entity_id: entityId,
      changes: {
        field: fieldName,
        original: originalValue,
        new: newValue,
        reason,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    }])

    // Update the entity based on type
    switch (entityType) {
      case 'domain_score':
        await supabase
          .from('domain_scores')
          .update({
            [fieldName]: newValue,
            consultant_override: true,
            override_reason: reason,
          })
          .eq('id', entityId)
        break

      case 'constraint':
        await supabase
          .from('constraints')
          .update({
            [fieldName]: newValue,
            consultant_override: true,
            override_reason: reason,
          })
          .eq('id', entityId)
        break

      case 'intervention':
        await supabase
          .from('interventions')
          .update({
            [fieldName]: newValue,
            consultant_override: true,
            override_reason: reason,
          })
          .eq('id', entityId)
        break

      default:
        return NextResponse.json({ success: false, error: 'Invalid entity type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Override error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process override' },
      { status: 500 }
    )
  }
}
