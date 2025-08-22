import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { getServerSession } from 'next-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { archived } = await request.json()
    const workId = params.id

    if (typeof archived !== 'boolean') {
      return NextResponse.json({ error: 'Invalid archived value' }, { status: 400 })
    }

    const supabase = getSupabaseBrowserClient()

    // First, verify the user owns this work
    const { data: work, error: fetchError } = await supabase
      .from('works')
      .select('author_id, profiles:author_id(id)')
      .eq('id', workId)
      .single()

    if (fetchError || !work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 })
    }

    // Check if user owns this work
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', work.author_id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the work's archived status
    const { error: updateError } = await supabase
      .from('works')
      .update({ 
        archived,
        updated_at: new Date().toISOString()
      })
      .eq('id', workId)

    if (updateError) {
      console.error('Error updating work archive status:', updateError)
      return NextResponse.json({ error: 'Failed to update work' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      archived,
      message: archived ? 'Work archived successfully' : 'Work unarchived successfully'
    })

  } catch (error) {
    console.error('Archive API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
