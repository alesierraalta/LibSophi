/**
 * Social Media Interactions API
 * Centralized functions for all social media features using Supabase RPC functions
 */

import { getSupabaseBrowserClient } from './browser'

export interface SocialStats {
  likes: number
  comments: number
  reposts: number
  bookmarks: number
  user_liked: boolean
  user_bookmarked: boolean
  user_reposted: boolean
}

export interface SocialActionResult {
  success: boolean
  data?: any
  error?: string
}

/**
 * Toggle like on a work
 */
export async function toggleWorkLike(workId: string, userId: string): Promise<SocialActionResult> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.rpc('toggle_work_like', {
      work_id: workId,
      user_id: userId
    })

    if (error) {
      console.error('Error toggling work like:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error toggling work like:', error)
    return { success: false, error: 'Error inesperado al dar like' }
  }
}

/**
 * Toggle bookmark on a work
 */
export async function toggleWorkBookmark(workId: string, userId: string): Promise<SocialActionResult> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.rpc('toggle_work_bookmark', {
      work_id: workId,
      user_id: userId
    })

    if (error) {
      console.error('Error toggling work bookmark:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error toggling work bookmark:', error)
    return { success: false, error: 'Error inesperado al guardar' }
  }
}

/**
 * Toggle repost on a work
 */
export async function toggleWorkRepost(workId: string, userId: string, caption?: string): Promise<SocialActionResult> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.rpc('toggle_work_repost', {
      work_id: workId,
      user_id: userId,
      caption: caption || null
    })

    if (error) {
      console.error('Error toggling work repost:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error toggling work repost:', error)
    return { success: false, error: 'Error inesperado al repostear' }
  }
}

/**
 * Add comment to a work
 */
export async function addWorkComment(workId: string, userId: string, text: string, parentId?: string): Promise<SocialActionResult> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.rpc('add_work_comment', {
      work_id: workId,
      user_id: userId,
      comment_text: text.trim(),
      parent_id: parentId || null
    })

    if (error) {
      console.error('Error adding work comment:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error adding work comment:', error)
    return { success: false, error: 'Error inesperado al comentar' }
  }
}

/**
 * Toggle like on a comment
 */
export async function toggleCommentLike(commentId: string, userId: string): Promise<SocialActionResult> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.rpc('toggle_comment_like', {
      comment_id: commentId,
      user_id: userId
    })

    if (error) {
      console.error('Error toggling comment like:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error toggling comment like:', error)
    return { success: false, error: 'Error inesperado al dar like al comentario' }
  }
}

/**
 * Get social stats for a work
 */
export async function getWorkSocialStats(workId: string, userId?: string): Promise<SocialStats | null> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.rpc('get_work_social_stats', {
      work_id: workId,
      user_id: userId || null
    })

    if (error) {
      console.error('Error getting work social stats:', error)
      return null
    }

    return data as SocialStats
  } catch (error) {
    console.error('Unexpected error getting work social stats:', error)
    return null
  }
}

/**
 * Get user's social feed
 */
export async function getSocialFeed(userId: string, limit: number = 20, offset: number = 0) {
  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.rpc('get_social_feed', {
      user_id: userId,
      page_limit: limit,
      page_offset: offset
    })

    if (error) {
      console.error('Error getting social feed:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error getting social feed:', error)
    return []
  }
}

/**
 * Batch get social stats for multiple works
 */
export async function getBatchWorkStats(workIds: string[], userId?: string): Promise<Record<string, SocialStats>> {
  const results: Record<string, SocialStats> = {}
  
  // Process in batches to avoid overwhelming the database
  const batchSize = 10
  for (let i = 0; i < workIds.length; i += batchSize) {
    const batch = workIds.slice(i, i + batchSize)
    const promises = batch.map(workId => getWorkSocialStats(workId, userId))
    const batchResults = await Promise.all(promises)
    
    batch.forEach((workId, index) => {
      if (batchResults[index]) {
        results[workId] = batchResults[index]!
      }
    })
  }
  
  return results
}

/**
 * Helper function to format social stats for display
 */
export function formatSocialCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`
  return `${(count / 1000000).toFixed(1)}M`
}

/**
 * Helper function to get appropriate action text
 */
export function getSocialActionText(action: string, count: number): string {
  switch (action) {
    case 'liked':
      return count === 1 ? '1 me gusta' : `${count} me gusta`
    case 'commented':
      return count === 1 ? '1 comentario' : `${count} comentarios`
    case 'reposted':
      return count === 1 ? '1 repost' : `${count} reposts`
    case 'bookmarked':
      return count === 1 ? '1 guardado' : `${count} guardados`
    default:
      return `${count}`
  }
}
