'use client'

import { getSupabaseBrowserClient } from './browser'
import { performanceConfig, createOptimizedQuery, getCached, setCache, handleError } from '../performance-optimization'

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
        .select('username, name, bio, avatar_url, banner_url')
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
      }

      setCache(cacheKey, profile)
      return profile
    } catch (error) {
      return handleError(error, null)
    }
  }

    // Optimized works loading - minimal queries
  async loadUserWorks(userId: string) {
    console.log('loadUserWorks called with userId:', userId)
    
    if (!userId) {
      console.warn('No userId provided to loadUserWorks')
      return []
    }
    
    const cacheKey = `works_${userId}`
    const cached = getCached(cacheKey, [])
    
    if (cached.length > 0 && performanceConfig.USE_CACHE_FIRST) {
      console.log('Returning cached works:', cached.length)
      return cached
    }

    try {
      console.log('Querying database for works...')
      const { data, error } = await this.client
        .from('works')
        .select('id, title, description, genre, views, likes, created_at, updated_at, cover_url, published, reading_time, tags, content, display_order')
        .eq('author_id', userId)
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
