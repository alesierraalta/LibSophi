/**
 * Repost functionality for social media features
 */

import { getSupabaseBrowserClient } from './browser'

export interface Repost {
  id: string
  work_id: string
  user_id: string
  caption?: string
  created_at: string
  works?: {
    id: string
    title: string
    genre?: string
    cover_url?: string
    created_at: string
    author_id: string
    profiles?: {
      name?: string
      username?: string
      avatar_url?: string
    }
  }
  profiles?: {
    name?: string
    username?: string
    avatar_url?: string
  }
}

/**
 * Toggle repost for a work
 */
export async function toggleRepost(workId: string, caption?: string) {
  try {
    const supabase = getSupabaseBrowserClient()
    
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return { success: false, error: 'Authentication required' }
    }

    const userId = userData.user.id

    // Check if already reposted
    const { data: existingRepost } = await supabase
      .from('reposts')
      .select('id')
      .eq('work_id', workId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingRepost) {
      // Remove repost
      const { error: deleteError } = await supabase
        .from('reposts')
        .delete()
        .eq('id', existingRepost.id)

      if (deleteError) {
        return { success: false, error: 'Failed to remove repost' }
      }

      return { 
        success: true, 
        action: 'unreposted',
        reposted: false 
      }
    } else {
      // Create repost
      const { data: repost, error: insertError } = await supabase
        .from('reposts')
        .insert({
          work_id: workId,
          user_id: userId,
          caption: caption || null
        })
        .select()
        .single()

      if (insertError) {
        return { success: false, error: 'Failed to create repost' }
      }

      // Create notification for original author
      try {
        const { data: work } = await supabase
          .from('works')
          .select('author_id, title')
          .eq('id', workId)
          .single()

        if (work && work.author_id !== userId) {
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
              work_id: workId
            })
        }
      } catch (notificationError) {
        console.warn('Failed to create repost notification:', notificationError)
      }

      return { 
        success: true, 
        action: 'reposted',
        reposted: true,
        repost 
      }
    }
  } catch (error) {
    console.error('Toggle repost error:', error)
    return { success: false, error: 'Failed to toggle repost' }
  }
}

/**
 * Check if user has reposted a work
 */
export async function checkIfReposted(workId: string, userId?: string): Promise<boolean> {
  try {
    const supabase = getSupabaseBrowserClient()
    
    let targetUserId = userId
    if (!targetUserId) {
      const { data: userData } = await supabase.auth.getUser()
      targetUserId = userData?.user?.id
    }

    if (!targetUserId) return false

    const { data } = await supabase
      .from('reposts')
      .select('id')
      .eq('work_id', workId)
      .eq('user_id', targetUserId)
      .maybeSingle()

    return !!data
  } catch (error) {
    console.error('Check repost status error:', error)
    return false
  }
}

/**
 * Get repost count for a work
 */
export async function getRepostCount(workId: string): Promise<number> {
  try {
    const supabase = getSupabaseBrowserClient()
    
    const { count, error } = await supabase
      .from('reposts')
      .select('*', { count: 'exact', head: true })
      .eq('work_id', workId)

    if (error) {
      console.error('Get repost count error:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Get repost count error:', error)
    return 0
  }
}

/**
 * Get reposts by user
 */
export async function getUserReposts(userId: string, limit = 20): Promise<Repost[]> {
  try {
    const supabase = getSupabaseBrowserClient()
    
    const { data, error } = await supabase
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
          content,
          chapters,
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Get user reposts error:', error)
      return []
    }

    return (data as any) || []
  } catch (error) {
    console.error('Get user reposts error:', error)
    return []
  }
}

/**
 * Get reposts of a work
 */
export async function getWorkReposts(workId: string, limit = 20): Promise<Repost[]> {
  try {
    const supabase = getSupabaseBrowserClient()
    
    const { data, error } = await supabase
      .from('reposts')
      .select(`
        id,
        created_at,
        caption,
        work_id,
        user_id,
        profiles:user_id (
          name,
          username,
          avatar_url
        )
      `)
      .eq('work_id', workId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Get work reposts error:', error)
      return []
    }

    return (data as any) || []
  } catch (error) {
    console.error('Get work reposts error:', error)
    return []
  }
}

/**
 * Get timeline with reposts (for social feed)
 */
export async function getTimelineWithReposts(userId?: string, limit = 20) {
  try {
    const supabase = getSupabaseBrowserClient()
    
    let targetUserId = userId
    if (!targetUserId) {
      const { data: userData } = await supabase.auth.getUser()
      targetUserId = userData?.user?.id
    }

    // Get reposts from followed users
    const { data: reposts, error: repostsError } = await supabase
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
          content,
          chapters,
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

    if (repostsError) {
      console.error('Get timeline reposts error:', repostsError)
      return []
    }

    return reposts || []
  } catch (error) {
    console.error('Get timeline with reposts error:', error)
    return []
  }
}
