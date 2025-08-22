import { getSupabaseBrowserClient } from './browser'

export interface FollowStats {
  followers_count: number
  following_count: number
  is_following: boolean
}

export interface FollowResult {
  success: boolean
  action?: 'followed' | 'unfollowed'
  following?: boolean
  error?: string
}

/**
 * Toggle follow status for a user
 */
export async function toggleFollow(userId: string): Promise<FollowResult> {
  try {
    const supabase = getSupabaseBrowserClient()
    
    const { data, error } = await supabase.rpc('toggle_follow', {
      target_user_id: userId
    })
    
    if (error) {
      console.error('Toggle follow error:', error)
      return { success: false, error: error.message }
    }
    
    return data as FollowResult
  } catch (error) {
    console.error('Toggle follow error:', error)
    return { success: false, error: 'Error al seguir/dejar de seguir' }
  }
}

/**
 * Get follow statistics for a user
 */
export async function getFollowStats(userId: string): Promise<FollowStats | null> {
  try {
    const supabase = getSupabaseBrowserClient()
    
    const { data, error } = await supabase.rpc('get_follow_stats', {
      user_id: userId
    })
    
    if (error) {
      console.error('Get follow stats error:', error)
      return null
    }
    
    return data as FollowStats
  } catch (error) {
    console.error('Get follow stats error:', error)
    return null
  }
}

/**
 * Get list of followers for a user
 */
export async function getFollowers(userId: string, limit: number = 50) {
  try {
    const supabase = getSupabaseBrowserClient()
    
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        followee_id,
        created_at,
        follower:profiles!follows_follower_id_fkey(
          id,
          name,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('followee_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Get followers error:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Get followers error:', error)
    return []
  }
}

/**
 * Get list of users that a user is following
 */
export async function getFollowing(userId: string, limit: number = 50) {
  try {
    const supabase = getSupabaseBrowserClient()
    
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        followee_id,
        created_at,
        followee:profiles!follows_followee_id_fkey(
          id,
          name,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Get following error:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Get following error:', error)
    return []
  }
}

/**
 * Check if current user is following a specific user
 */
export async function isFollowing(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData?.user) return false
    
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', userData.user.id)
      .eq('followee_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Is following error:', error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error('Is following error:', error)
    return false
  }
}
