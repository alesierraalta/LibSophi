import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

// POST - Create a repost
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { work_id, caption } = body

    if (!work_id) {
      return NextResponse.json({ error: 'work_id is required' }, { status: 400 })
    }

    const supabase = getSupabaseBrowserClient()
    
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = userData.user.id

    // Check if user already reposted this work
    const { data: existingRepost } = await supabase
      .from('reposts')
      .select('id')
      .eq('work_id', work_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingRepost) {
      return NextResponse.json({ error: 'Already reposted' }, { status: 409 })
    }

    // Create the repost
    const { data: repost, error: repostError } = await supabase
      .from('reposts')
      .insert({
        work_id,
        user_id: userId,
        caption: caption || null
      })
      .select()
      .single()

    if (repostError) {
      console.error('Repost creation error:', repostError)
      return NextResponse.json({ error: 'Failed to create repost' }, { status: 500 })
    }

    // Create notification for the original author
    try {
      // Get original work author
      const { data: work } = await supabase
        .from('works')
        .select('author_id, title')
        .eq('id', work_id)
        .single()

      if (work && work.author_id !== userId) {
        // Get current user profile for notification
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('name, username')
          .eq('id', userId)
          .single()

        const userName = userProfile?.name || userProfile?.username || 'Alguien'

        await supabase
          .from('notifications')
          .insert({
            user_id: work.author_id,
            type: 'repost',
            title: 'Nueva republicación',
            body: `${userName} republicó tu obra "${work.title}"`,
            from_user_id: userId,
            work_id: work_id
          })
      }
    } catch (notificationError) {
      console.warn('Failed to create repost notification:', notificationError)
      // Don't fail the repost if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      repost,
      message: 'Repost created successfully' 
    })

  } catch (error) {
    console.error('Repost API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove a repost
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const work_id = searchParams.get('work_id')

    if (!work_id) {
      return NextResponse.json({ error: 'work_id is required' }, { status: 400 })
    }

    const supabase = getSupabaseBrowserClient()
    
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = userData.user.id

    // Delete the repost
    const { error: deleteError } = await supabase
      .from('reposts')
      .delete()
      .eq('work_id', work_id)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Repost deletion error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete repost' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Repost removed successfully' 
    })

  } catch (error) {
    console.error('Repost deletion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get reposts for a work or user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const work_id = searchParams.get('work_id')
    const user_id = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = getSupabaseBrowserClient()

    let query = supabase
      .from('reposts')
      .select(`
        id,
        created_at,
        caption,
        work_id,
        user_id,
        works:work_id (
          id,
          title,
          genre,
          cover_url,
          created_at,
          author_id,
          profiles:author_id (
            name,
            username,
            avatar_url
          )
        ),
        profiles:user_id (
          name,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (work_id) {
      query = query.eq('work_id', work_id)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    const { data: reposts, error } = await query

    if (error) {
      console.error('Get reposts error:', error)
      return NextResponse.json({ error: 'Failed to get reposts' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      reposts: reposts || [],
      count: reposts?.length || 0
    })

  } catch (error) {
    console.error('Get reposts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
