'use client'

import { getSupabaseBrowserClient } from './browser'
import { performanceConfig, createOptimizedQuery, getCached, setCache, handleError } from '../performance-optimization'
import { getUserAllWorks, toggleWorkArchiveStatus } from './works-queries'

// Optimized Supabase client with built-in performance improvements
export class OptimizedSupabaseClient {
  private client = getSupabaseBrowserClient()
  private abortController?: AbortController

  constructor() {
    // Create abort controller for cleanup
    this.abortController = new AbortController()
  }

  // Cleanup method
  cleanup() {
    this.abortController?.abort()
  }

  // Optimized user profile loading
  async loadUserProfile(userId: string) {
    const cacheKey = `profile_${userId}`
    const cached = getCached(cacheKey, null)
    
    if (cached && performanceConfig.USE_CACHE_FIRST) {
      return cached
    }

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('username, name, bio, avatar_url, banner_url, followers_count, following_count, is_private')
        .eq('id', userId)
        .single()
        .abortSignal(this.abortController?.signal)

      if (error) {
        console.warn('Profile load error:', error)
        return null
      }

      const profile = {
        name: data.name || 'Usuario',
        username: data.username || 'usuario',
        bio: data.bio || '',
        avatar: data.avatar_url || '/api/placeholder/112/112',
        banner: data.banner_url || '',
        followers_count: data.followers_count || 0,
        following_count: data.following_count || 0,
        is_private: data.is_private || false,
      }

      setCache(cacheKey, profile)
      return profile
    } catch (error) {
      return handleError(error, null)
    }
  }

    // Optimized works loading - minimal queries (excludes archived by default)
  async loadUserWorks(userId: string, includeArchived = false) {
    console.log('loadUserWorks called with userId:', userId, 'includeArchived:', includeArchived)
    
    if (!userId) {
      console.warn('No userId provided to loadUserWorks')
      return []
    }
    
    const cacheKey = `works_${userId}_${includeArchived ? 'with_archived' : 'no_archived'}`
    const cached = getCached(cacheKey, [])
    
    if (cached.length > 0 && performanceConfig.USE_CACHE_FIRST) {
      console.log('Returning cached works:', cached.length)
      return cached
    }

    try {
      console.log('Querying database for works...')
      let query = this.client
        .from('works')
        .select('id, title, description, genre, views, likes, created_at, updated_at, cover_url, published, reading_time, tags, content, display_order, archived')
        .eq('author_id', userId)

      // Only filter archived if we don't want to include them
      if (!includeArchived) {
        query = query.eq('archived', false)
      }

      const { data, error } = await query
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(performanceConfig.DEFAULT_LIMIT)
        .abortSignal(this.abortController?.signal)

      console.log('Database query result:', { data: data?.length, error })

      if (error) {
        console.warn('Works load error:', error)
        return []
      }

      const works = (data || []).map(work => ({
        id: work.id,
        title: work.title || 'Sin título',
        description: work.description || '',
        genre: work.genre || 'General',
        views: Number(work.views) || 0, // Ensure views is a number
        likes: Number(work.likes) || 0, // Ensure likes is a number
        comments_count: 0, // Skip expensive count queries for performance
        reposts_count: 0, // Skip expensive count queries for performance
        created_at: new Date(work.created_at),
        updated_at: new Date(work.updated_at || work.created_at),
        coverUrl: work.cover_url,
        cover_image_url: work.cover_url, // Add both formats for compatibility
        published: work.published || false,
        author_id: userId,
        content: work.content || '', // Include content
        tags: work.tags || [], // Include tags
        reading_time: work.reading_time || 5, // Real reading time from database
      }))

      setCache(cacheKey, works)
      return works
    } catch (error) {
      return handleError(error, [])
    }
  }

  // Archive/unarchive work
  async toggleWorkArchive(workId: string, archived: boolean) {
    try {
      const success = await toggleWorkArchiveStatus(workId, archived)
      if (success) {
        // Clear relevant caches
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('perf_cache_works_')) {
            localStorage.removeItem(key)
          }
        })
      }
      return success
    } catch (error) {
      console.error('Error toggling work archive status:', error)
      return false
    }
  }

  // Simplified authentication check
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser()
      if (error) {
        console.warn('Auth error:', error)
        return null
      }
      return user
    } catch (error) {
      return handleError(error, null)
    }
  }

  // Fast work deletion
  async deleteWork(workId: string, userId: string) {
    try {
      const { error } = await this.client
        .from('works')
        .delete()
        .eq('id', workId)
        .eq('author_id', userId)

      if (error) {
        console.error('Delete error:', error)
        return false
      }

      // Clear cache
      const cacheKey = `works_${userId}`
      setCache(cacheKey, [])
      
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }

  // Save work order
  async saveWorkOrder(userId: string, workOrder: { id: string; order: number }[]) {
    try {
      const updates = workOrder.map(item => ({
        id: item.id,
        display_order: item.order,
        updated_at: new Date().toISOString()
      }))

      const { error } = await this.client
        .from('works')
        .upsert(updates, { onConflict: 'id' })

      if (error) {
        console.error('Work order save error:', error)
        return false
      }

      // Clear works cache to force refresh
      const cacheKey = `works_${userId}`
      this.clearCache(cacheKey)
      
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }

  private clearCache(key: string) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${key}`)
    }
  }

  // Follow/Unfollow functionality
  async followUser(followerId: string, followeeId: string) {
    try {
      const { error } = await this.client
        .from('follows')
        .insert({
          follower_id: followerId,
          followee_id: followeeId
        })

      if (error) {
        console.error('Follow error:', error)
        return false
      }

      // Clear relevant caches
      this.clearCache(`profile_${followerId}`)
      this.clearCache(`profile_${followeeId}`)
      
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }

  async unfollowUser(followerId: string, followeeId: string) {
    try {
      const { error } = await this.client
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('followee_id', followeeId)

      if (error) {
        console.error('Unfollow error:', error)
        return false
      }

      // Clear relevant caches
      this.clearCache(`profile_${followerId}`)
      this.clearCache(`profile_${followeeId}`)
      
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }

  async isFollowing(followerId: string, followeeId: string) {
    try {
      const { data, error } = await this.client
        .from('follows')
        .select('follower_id')
        .eq('follower_id', followerId)
        .eq('followee_id', followeeId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Check follow status error:', error)
        return false
      }

      return !!data
    } catch (error) {
      handleError(error)
      return false
    }
  }

  async getFollowers(userId: string, limit = 50) {
    try {
      const { data, error } = await this.client
        .from('user_follows_view')
        .select('*')
        .eq('followee_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Get followers error:', error)
        return []
      }

      return data || []
    } catch (error) {
      return handleError(error, [])
    }
  }

  async getFollowing(userId: string, limit = 50) {
    try {
      const { data, error } = await this.client
        .from('user_follows_view')
        .select('*')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Get following error:', error)
        return []
      }

      return data || []
    } catch (error) {
      return handleError(error, [])
    }
  }

  // Trending functionality
  async getTrendingWorks(timeframe: 'daily' | 'weekly' | 'monthly' | 'all' = 'all', limit = 20) {
    try {
      const scoreColumn = timeframe === 'daily' ? 'daily_score' 
                        : timeframe === 'weekly' ? 'weekly_score'
                        : timeframe === 'monthly' ? 'monthly_score'
                        : 'trending_score'

      const { data, error } = await this.client
        .from('trending_scores')
        .select(`
          work_id,
          trending_score,
          daily_score,
          weekly_score,
          monthly_score,
          works!inner(
            id,
            title,
            description,
            genre,
            cover_url,
            views,
            likes,
            created_at,
            reading_time,
            tags,
            profiles!inner(
              id,
              username,
              name,
              avatar_url
            )
          )
        `)
        .order(scoreColumn, { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Get trending works error:', error)
        return []
      }

      return (data || []).map(item => ({
        id: item.works.id,
        title: item.works.title,
        description: item.works.description,
        genre: item.works.genre,
        views: item.works.views || 0,
        likes: item.works.likes || 0,
        comments_count: 0,
        reposts_count: 0,
        created_at: new Date(item.works.created_at),
        updated_at: new Date(item.works.created_at),
        coverUrl: item.works.cover_url,
        published: true,
        author_id: item.works.profiles.id,
        content: '',
        tags: item.works.tags || [],
        reading_time: item.works.reading_time || 5,
        trending_score: parseFloat(item.trending_score),
        author: {
          id: item.works.profiles.id,
          username: item.works.profiles.username,
          name: item.works.profiles.name,
          avatar_url: item.works.profiles.avatar_url
        }
      }))
    } catch (error) {
      return handleError(error, [])
    }
  }

  async getTrendingAuthors(limit = 10) {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select(`
          id,
          username,
          name,
          bio,
          avatar_url,
          followers_count,
          following_count,
          works!inner(count)
        `)
        .order('followers_count', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Get trending authors error:', error)
        return []
      }

      return data || []
    } catch (error) {
      return handleError(error, [])
    }
  }

  async getRecentWorks(limit = 10) {
    try {
      const { data, error } = await this.client
        .from('works')
        .select(`
          id,
          title,
          description,
          genre,
          cover_url,
          views,
          likes,
          created_at,
          reading_time,
          tags,
          profiles!inner(
            id,
            username,
            name,
            avatar_url
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Get recent works error:', error)
        return []
      }

      return (data || []).map(work => ({
        id: work.id,
        title: work.title,
        description: work.description,
        genre: work.genre,
        views: work.views || 0,
        likes: work.likes || 0,
        comments_count: 0,
        reposts_count: 0,
        created_at: new Date(work.created_at),
        updated_at: new Date(work.created_at),
        coverUrl: work.cover_url,
        published: true,
        author_id: work.profiles.id,
        content: '',
        tags: work.tags || [],
        reading_time: work.reading_time || 5,
        author: {
          id: work.profiles.id,
          username: work.profiles.username,
          name: work.profiles.name,
          avatar_url: work.profiles.avatar_url
        }
      }))
    } catch (error) {
      return handleError(error, [])
    }
  }

  async getWorksByGenre(genre: string, limit = 10) {
    try {
      const { data, error } = await this.client
        .from('works')
        .select(`
          id,
          title,
          description,
          genre,
          cover_url,
          views,
          likes,
          created_at,
          reading_time,
          tags,
          profiles!inner(
            id,
            username,
            name,
            avatar_url
          )
        `)
        .eq('published', true)
        .eq('genre', genre)
        .order('views', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Get works by genre error:', error)
        return []
      }

      return (data || []).map(work => ({
        id: work.id,
        title: work.title,
        description: work.description,
        genre: work.genre,
        views: work.views || 0,
        likes: work.likes || 0,
        comments_count: 0,
        reposts_count: 0,
        created_at: new Date(work.created_at),
        updated_at: new Date(work.created_at),
        coverUrl: work.cover_url,
        published: true,
        author_id: work.profiles.id,
        content: '',
        tags: work.tags || [],
        reading_time: work.reading_time || 5,
        author: {
          id: work.profiles.id,
          username: work.profiles.username,
          name: work.profiles.name,
          avatar_url: work.profiles.avatar_url
        }
      }))
    } catch (error) {
      return handleError(error, [])
    }
  }

  // Optimized profile update
  async updateProfile(userId: string, profileData: any) {
    try {
      const { error } = await this.client
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Profile update error:', error)
        return false
      }

      // Update cache
      const cacheKey = `profile_${userId}`
      setCache(cacheKey, profileData)
      
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }

  // Search History Methods
  async saveSearchHistory(userId: string, query: string, searchType: 'search' | 'trending' | 'suggestion' = 'search') {
    try {
      const { error } = await this.client
        .from('search_history')
        .upsert({
          user_id: userId,
          query: query.trim(),
          search_type: searchType,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,query',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Search history save error:', error)
        return false
      }

      // Clear cache to force refresh
      const cacheKey = `search_history_${userId}`
      setCache(cacheKey, null)
      
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }

  async getSearchHistory(userId: string, limit: number = 10) {
    const cacheKey = `search_history_${userId}`
    const cached = getCached(cacheKey, null)
    
    if (cached && performanceConfig.USE_CACHE_FIRST) {
      return cached
    }

    try {
      const { data, error } = await this.client
        .from('search_history')
        .select('id, query, search_type, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit)
        .abortSignal(this.abortController?.signal)

      if (error) {
        console.error('Search history load error:', error)
        return []
      }

      const searchHistory = data || []
      
      // Cache the results
      setCache(cacheKey, searchHistory)
      
      return searchHistory
    } catch (error) {
      return handleError(error, [])
    }
  }

  async deleteSearchHistoryItem(userId: string, query: string) {
    try {
      const { error } = await this.client
        .from('search_history')
        .delete()
        .eq('user_id', userId)
        .eq('query', query)

      if (error) {
        console.error('Search history delete error:', error)
        return false
      }

      // Clear cache to force refresh
      const cacheKey = `search_history_${userId}`
      setCache(cacheKey, null)
      
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }

  async clearSearchHistory(userId: string) {
    try {
      const { error } = await this.client
        .from('search_history')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Search history clear error:', error)
        return false
      }

      // Clear cache
      const cacheKey = `search_history_${userId}`
      setCache(cacheKey, null)
      
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }
}

// Singleton instance
let optimizedClient: OptimizedSupabaseClient | null = null

export function getOptimizedSupabaseClient(): OptimizedSupabaseClient {
  if (!optimizedClient) {
    optimizedClient = new OptimizedSupabaseClient()
  }
  return optimizedClient
}

// Cleanup function for page unmount
export function cleanupOptimizedClient() {
  if (optimizedClient) {
    optimizedClient.cleanup()
    optimizedClient = null
  }
}
