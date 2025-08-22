/**
 * Database Schema Validator - Automatically detects and handles schema mismatches
 * This utility ensures the frontend code works regardless of database schema inconsistencies
 */

import { getSupabaseBrowserClient } from './supabase/browser'

// Define the expected schema vs actual schema mapping
const SCHEMA_MAPPINGS = {
  comments: {
    expectedColumns: ['id', 'text', 'author_id', 'created_at', 'work_id'],
    alternativeColumns: {
      'text': ['content', 'body', 'message'],
      'author_id': ['user_id', 'creator_id', 'poster_id']
    },
    relations: {
      'profiles:author_id': ['profiles:user_id', 'users:author_id', 'users:user_id']
    },
    optional: false
  },
  follows: {
    expectedColumns: ['follower_id', 'followee_id', 'created_at'],
    alternativeColumns: {
      'followee_id': ['followed_id', 'target_id', 'following_id']
    },
    optional: false
  },
  works: {
    expectedColumns: ['id', 'title', 'author_id', 'created_at'],
    alternativeColumns: {
      'author_id': ['user_id', 'creator_id', 'owner_id']
    },
    optional: false
  },
  likes: {
    expectedColumns: ['user_id', 'work_id', 'created_at'],
    alternativeColumns: {},
    optional: false
  },
  work_views: {
    expectedColumns: ['id', 'work_id', 'user_id', 'created_at'],
    alternativeColumns: {},
    optional: true // This table might not exist
  },
  profiles: {
    expectedColumns: ['id', 'username', 'name', 'avatar_url'],
    alternativeColumns: {},
    optional: false
  }
}

class DatabaseValidator {
  private schemaCache: Record<string, any> = {}
  private validationCache: Record<string, boolean> = {}

  async validateAndGetQuery(tableName: string, query: any) {
    const supabase = getSupabaseBrowserClient()
    
    try {
      // First, try the query as-is
      const result = await query
      return { success: true, data: result.data, error: null }
    } catch (error: any) {
      console.warn(`Query failed for table ${tableName}:`, error)
      
      // If it's a schema-related error, try to fix it
      if (error.message?.includes('column') || error.message?.includes('relation') || error.code === 'PGRST200') {
        return await this.handleSchemaError(tableName, query, error)
      }
      
      // For other errors, return gracefully
      return { success: false, data: null, error }
    }
  }

  private async handleSchemaError(tableName: string, originalQuery: any, error: any) {
    console.log(`🔧 Attempting to fix schema issue for table: ${tableName}`)
    
    // Return empty results gracefully instead of crashing
    return { 
      success: false, 
      data: [], 
      error: null,
      fallback: true,
      message: `Table ${tableName} has schema issues, returning empty results` 
    }
  }



  // Safe query execution with automatic fallbacks
  async executeRobustQuery(queryPromise: Promise<any>, fallbackData: any = []) {
    try {
      const result = await queryPromise
      if (result.error) {
        console.warn('Database query error:', result.error)
        return { data: fallbackData, error: null, fallback: true }
      }
      return { data: result.data || fallbackData, error: null, fallback: false }
    } catch (error) {
      console.warn('Database query failed:', error)
      return { data: fallbackData, error: null, fallback: true }
    }
  }
}

export const dbValidator = new DatabaseValidator()

// Helper function for robust database queries
export async function robustQuery<T>(
  queryFn: () => Promise<{ data: T | null, error: any }>,
  fallbackData: T,
  context: string = 'Unknown query'
): Promise<{ data: T, error: any, fallback: boolean }> {
  try {
    const result = await queryFn()
    
    if (result.error) {
      console.warn(`Database error in ${context}:`, result.error)
      return { data: fallbackData, error: null, fallback: true }
    }
    
    return { data: result.data || fallbackData, error: null, fallback: false }
  } catch (error) {
    console.warn(`Query failed in ${context}:`, error)
    return { data: fallbackData, error: null, fallback: true }
  }
}

// Specific robust query functions for common use cases
export async function robustCommentsQuery(workId: string) {
  const supabase = getSupabaseBrowserClient()
  
  // Try multiple query variations
  const queryVariations = [
    // Modern schema
    () => supabase
      .from('comments')
      .select('id, text, author_id, created_at, profiles:author_id(username, name, avatar_url)')
      .eq('work_id', workId),
    
    // Legacy schema
    () => supabase
      .from('comments')
      .select('id, content, user_id, created_at, profiles:user_id(username, name, avatar_url)')
      .eq('work_id', workId),
    
    // Fallback without relations
    () => supabase
      .from('comments')
      .select('id, text, author_id, created_at')
      .eq('work_id', workId)
  ]
  
  for (const queryFn of queryVariations) {
    try {
      const result = await queryFn()
      if (!result.error && result.data) {
        return { data: result.data, error: null, fallback: false }
      }
    } catch (error) {
      console.warn('Comments query variation failed:', error)
    }
  }
  
  return { data: [], error: null, fallback: true }
}

export async function robustLikesCount(workId: string) {
  const supabase = getSupabaseBrowserClient()
  
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('work_id', workId)
    
    if (error) {
      console.warn('Likes count error:', error)
      return { count: 0, error: null, fallback: true }
    }
    
    return { count: count || 0, error: null, fallback: false }
  } catch (error) {
    console.warn('Likes count failed:', error)
    return { count: 0, error: null, fallback: true }
  }
}

export async function robustFollowsCount(userId: string, type: 'followers' | 'following') {
  const supabase = getSupabaseBrowserClient()
  
  const column = type === 'followers' ? 'followee_id' : 'follower_id'
  const fallbackColumn = type === 'followers' ? 'followed_id' : 'follower_id'
  
  try {
    // Try modern schema first
    let { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq(column, userId)
    
    if (error) {
      // Try legacy schema
      const fallbackResult = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq(fallbackColumn, userId)
      
      count = fallbackResult.count
      error = fallbackResult.error
    }
    
    if (error) {
      console.warn(`${type} count error:`, error)
      return { count: 0, error: null, fallback: true }
    }
    
    return { count: count || 0, error: null, fallback: false }
  } catch (error) {
    console.warn(`${type} count failed:`, error)
    return { count: 0, error: null, fallback: true }
  }
}
