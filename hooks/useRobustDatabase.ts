/**
 * Custom hook for robust database operations
 * Automatically handles schema mismatches and provides fallbacks
 */

import { useState, useCallback } from 'react'
import { robustQuery, robustLikesCount, robustFollowsCount, robustCommentsQuery } from '@/lib/database-validator'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

export function useRobustDatabase() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const executeQuery = useCallback(async <T>(
    queryFn: () => Promise<{ data: T | null, error: any }>,
    fallbackData: T,
    context: string = 'Database query'
  ): Promise<T> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await robustQuery(queryFn, fallbackData, context)
      
      if (result.fallback) {
        console.log(`🔄 Using fallback data for ${context}`)
      }
      
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown database error'
      setError(errorMessage)
      console.error(`Database operation failed (${context}):`, err)
      return fallbackData
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Specific methods for common operations
  const getLikesCount = useCallback(async (workId: string): Promise<number> => {
    setIsLoading(true)
    try {
      const result = await robustLikesCount(workId)
      if (result.fallback) {
        console.log('🔄 Using fallback for likes count')
      }
      return result.count
    } catch (err) {
      console.error('Failed to get likes count:', err)
      return 0
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getFollowersCount = useCallback(async (userId: string): Promise<number> => {
    const result = await robustFollowsCount(userId, 'followers')
    return result.count
  }, [])

  const getFollowingCount = useCallback(async (userId: string): Promise<number> => {
    const result = await robustFollowsCount(userId, 'following')
    return result.count
  }, [])

  const getComments = useCallback(async (workId: string): Promise<any[]> => {
    const result = await robustCommentsQuery(workId)
    return result.data
  }, [])

  // Safe profile query
  const getProfile = useCallback(async (userId: string) => {
    return executeQuery(
      () => supabase
        .from('profiles')
        .select('id, username, name, bio, avatar_url, banner_url')
        .eq('id', userId)
        .single(),
      null,
      `profile for user ${userId}`
    )
  }, [executeQuery])

  // Safe works query
  const getUserWorks = useCallback(async (userId: string, includeArchived = false) => {
    return executeQuery(
      () => supabase
        .from('works')
        .select('id, title, description, genre, views, likes, created_at, cover_url, published, archived')
        .eq('author_id', userId)
        .eq('archived', includeArchived)
        .order('created_at', { ascending: false }),
      [],
      `works for user ${userId}`
    )
  }, [executeQuery])

  // Safe likes check
  const checkIfLiked = useCallback(async (workId: string, userId: string): Promise<boolean> => {
    const result = await executeQuery(
      () => supabase
        .from('likes')
        .select('work_id')
        .eq('work_id', workId)
        .eq('user_id', userId)
        .maybeSingle(),
      null,
      `like status for work ${workId}`
    )
    return !!result
  }, [executeQuery])

  // Safe bookmarks check
  const checkIfBookmarked = useCallback(async (workId: string, userId: string): Promise<boolean> => {
    const result = await executeQuery(
      () => supabase
        .from('bookmarks')
        .select('work_id')
        .eq('work_id', workId)
        .eq('user_id', userId)
        .maybeSingle(),
      null,
      `bookmark status for work ${workId}`
    )
    return !!result
  }, [executeQuery])

  // Safe follow operations
  const toggleLike = useCallback(async (workId: string, userId: string, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('work_id', workId)
          .eq('user_id', userId)
      } else {
        await supabase
          .from('likes')
          .insert({ work_id: workId, user_id: userId })
      }
      return { success: true }
    } catch (error) {
      console.error('Toggle like failed:', error)
      return { success: false, error }
    }
  }, [])

  const toggleBookmark = useCallback(async (workId: string, userId: string, currentlyBookmarked: boolean) => {
    try {
      if (currentlyBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('work_id', workId)
          .eq('user_id', userId)
      } else {
        await supabase
          .from('bookmarks')
          .insert({ work_id: workId, user_id: userId })
      }
      return { success: true }
    } catch (error) {
      console.error('Toggle bookmark failed:', error)
      return { success: false, error }
    }
  }, [])

  const toggleFollow = useCallback(async (targetUserId: string, currentUserId: string, currentlyFollowing: boolean) => {
    try {
      if (currentlyFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('followee_id', targetUserId)
      } else {
        await supabase
          .from('follows')
          .insert({ 
            follower_id: currentUserId, 
            followee_id: targetUserId 
          })
      }
      return { success: true, following: !currentlyFollowing }
    } catch (error) {
      console.error('Toggle follow failed:', error)
      
      // Try with alternative column names
      try {
        if (currentlyFollowing) {
          await supabase
            .from('follows')
            .delete()
            .eq('follower_id', currentUserId)
            .eq('followed_id', targetUserId)
        } else {
          await supabase
            .from('follows')
            .insert({ 
              follower_id: currentUserId, 
              followed_id: targetUserId 
            })
        }
        return { success: true, following: !currentlyFollowing }
      } catch (fallbackError) {
        console.error('Toggle follow fallback failed:', fallbackError)
        return { success: false, error: fallbackError }
      }
    }
  }, [])

  return {
    isLoading,
    error,
    executeQuery,
    getLikesCount,
    getFollowersCount,
    getFollowingCount,
    getComments,
    getProfile,
    getUserWorks,
    checkIfLiked,
    checkIfBookmarked,
    toggleLike,
    toggleBookmark,
    toggleFollow
  }
}
