import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { archived } = await request.json()
    const workId = params.id

    if (typeof archived !== 'boolean') {
      return NextResponse.json({ error: 'Invalid archived value' }, { status: 400 })
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the JWT token with Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    const userId = userData.user.id

    // First, verify the user owns this work
    const { data: work, error: fetchError } = await supabaseAdmin
      .from('works')
      .select('author_id')
      .eq('id', workId)
      .single()

    if (fetchError || !work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 })
    }

    // Check if user owns this work
    if (work.author_id !== userId) {
      return NextResponse.json({ error: 'Forbidden - You can only archive your own works' }, { status: 403 })
    }

    // Update the work's archived status
    const { error: updateError } = await supabaseAdmin
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
