/**
 * React Hook for Social Media Interactions
 * Provides easy-to-use functions for social features with state management
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  toggleWorkLike, 
  toggleWorkBookmark, 
  toggleWorkRepost, 
  addWorkComment, 
  getWorkSocialStats,
  SocialStats,
  formatSocialCount,
  getSocialActionText
} from '@/lib/supabase/social-interactions'
import { useAuth } from './useAuth'

export interface UseSocialInteractionsProps {
  workId: string
  initialStats?: Partial<SocialStats>
}

export interface UseSocialInteractionsReturn {
  // Stats
  stats: SocialStats
  loading: boolean
  error: string | null
  
  // Actions
  handleLike: () => Promise<void>
  handleBookmark: () => Promise<void>
  handleRepost: (caption?: string) => Promise<void>
  handleComment: (text: string, parentId?: string) => Promise<void>
  
  // Utilities
  formatCount: (count: number) => string
  getActionText: (action: string, count: number) => string
  refreshStats: () => Promise<void>
  
  // States for optimistic updates
  isLiking: boolean
  isBookmarking: boolean
  isReposting: boolean
  isCommenting: boolean
}

export function useSocialInteractions({ 
  workId, 
  initialStats 
}: UseSocialInteractionsProps): UseSocialInteractionsReturn {
  const { user } = useAuth()
  const userId = user?.id

  // State management
  const [stats, setStats] = useState<SocialStats>({
    likes: 0,
    comments: 0,
    reposts: 0,
    bookmarks: 0,
    user_liked: false,
    user_bookmarked: false,
    user_reposted: false,
    ...initialStats
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Action states for optimistic updates
  const [isLiking, setIsLiking] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [isReposting, setIsReposting] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)

  // Load initial stats
  const refreshStats = useCallback(async () => {
    if (!workId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const newStats = await getWorkSocialStats(workId, userId)
      if (newStats) {
        setStats(newStats)
      }
    } catch (err) {
      console.error('Error refreshing social stats:', err)
      setError('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }, [workId, userId])

  // Load stats on mount and when workId or userId changes
  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  // Handle like action
  const handleLike = useCallback(async () => {
    if (!userId || isLiking) return
    
    setIsLiking(true)
    setError(null)
    
    // Optimistic update
    const wasLiked = stats.user_liked
    setStats(prev => ({
      ...prev,
      user_liked: !wasLiked,
      likes: wasLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1
    }))
    
    try {
      const result = await toggleWorkLike(workId, userId)
      
      if (!result.success) {
        // Revert optimistic update on error
        setStats(prev => ({
          ...prev,
          user_liked: wasLiked,
          likes: wasLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1)
        }))
        setError(result.error || 'Error al dar like')
      } else {
        // Update with server response
        setStats(prev => ({
          ...prev,
          user_liked: result.data.liked,
          likes: result.data.count
        }))
      }
    } catch (err) {
      // Revert optimistic update on error
      setStats(prev => ({
        ...prev,
        user_liked: wasLiked,
        likes: wasLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1)
      }))
      setError('Error inesperado al dar like')
    } finally {
      setIsLiking(false)
    }
  }, [workId, userId, stats.user_liked, stats.likes, isLiking])

  // Handle bookmark action
  const handleBookmark = useCallback(async () => {
    if (!userId || isBookmarking) return
    
    setIsBookmarking(true)
    setError(null)
    
    // Optimistic update
    const wasBookmarked = stats.user_bookmarked
    setStats(prev => ({
      ...prev,
      user_bookmarked: !wasBookmarked,
      bookmarks: wasBookmarked ? Math.max(0, prev.bookmarks - 1) : prev.bookmarks + 1
    }))
    
    try {
      const result = await toggleWorkBookmark(workId, userId)
      
      if (!result.success) {
        // Revert optimistic update on error
        setStats(prev => ({
          ...prev,
          user_bookmarked: wasBookmarked,
          bookmarks: wasBookmarked ? prev.bookmarks + 1 : Math.max(0, prev.bookmarks - 1)
        }))
        setError(result.error || 'Error al guardar')
      } else {
        // Update with server response
        setStats(prev => ({
          ...prev,
          user_bookmarked: result.data.bookmarked
        }))
      }
    } catch (err) {
      // Revert optimistic update on error
      setStats(prev => ({
        ...prev,
        user_bookmarked: wasBookmarked,
        bookmarks: wasBookmarked ? prev.bookmarks + 1 : Math.max(0, prev.bookmarks - 1)
      }))
      setError('Error inesperado al guardar')
    } finally {
      setIsBookmarking(false)
    }
  }, [workId, userId, stats.user_bookmarked, stats.bookmarks, isBookmarking])

  // Handle repost action
  const handleRepost = useCallback(async (caption?: string) => {
    if (!userId || isReposting) return
    
    setIsReposting(true)
    setError(null)
    
    // Optimistic update
    const wasReposted = stats.user_reposted
    setStats(prev => ({
      ...prev,
      user_reposted: !wasReposted,
      reposts: wasReposted ? Math.max(0, prev.reposts - 1) : prev.reposts + 1
    }))
    
    try {
      const result = await toggleWorkRepost(workId, userId, caption)
      
      if (!result.success) {
        // Revert optimistic update on error
        setStats(prev => ({
          ...prev,
          user_reposted: wasReposted,
          reposts: wasReposted ? prev.reposts + 1 : Math.max(0, prev.reposts - 1)
        }))
        setError(result.error || 'Error al repostear')
      } else {
        // Update with server response
        setStats(prev => ({
          ...prev,
          user_reposted: result.data.reposted,
          reposts: result.data.count
        }))
      }
    } catch (err) {
      // Revert optimistic update on error
      setStats(prev => ({
        ...prev,
        user_reposted: wasReposted,
        reposts: wasReposted ? prev.reposts + 1 : Math.max(0, prev.reposts - 1)
      }))
      setError('Error inesperado al repostear')
    } finally {
      setIsReposting(false)
    }
  }, [workId, userId, stats.user_reposted, stats.reposts, isReposting])

  // Handle comment action
  const handleComment = useCallback(async (text: string, parentId?: string) => {
    if (!userId || isCommenting || !text.trim()) return
    
    setIsCommenting(true)
    setError(null)
    
    // Optimistic update
    setStats(prev => ({
      ...prev,
      comments: prev.comments + 1
    }))
    
    try {
      const result = await addWorkComment(workId, userId, text, parentId)
      
      if (!result.success) {
        // Revert optimistic update on error
        setStats(prev => ({
          ...prev,
          comments: Math.max(0, prev.comments - 1)
        }))
        setError(result.error || 'Error al comentar')
      } else {
        // Update with server response
        setStats(prev => ({
          ...prev,
          comments: result.data.count
        }))
      }
    } catch (err) {
      // Revert optimistic update on error
      setStats(prev => ({
        ...prev,
        comments: Math.max(0, prev.comments - 1)
      }))
      setError('Error inesperado al comentar')
    } finally {
      setIsCommenting(false)
    }
  }, [workId, userId, isCommenting])

  return {
    // Stats
    stats,
    loading,
    error,
    
    // Actions
    handleLike,
    handleBookmark,
    handleRepost,
    handleComment,
    
    // Utilities
    formatCount: formatSocialCount,
    getActionText: getSocialActionText,
    refreshStats,
    
    // States
    isLiking,
    isBookmarking,
    isReposting,
    isCommenting
  }
}
