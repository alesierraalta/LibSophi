'use client'

import { getSupabaseBrowserClient } from './browser'

export interface WorksQueryOptions {
  includeArchived?: boolean
  authorId?: string
  limit?: number
  offset?: number
  published?: boolean
}

/**
 * Base query builder for works with archive filtering
 */
export function buildWorksQuery(options: WorksQueryOptions = {}) {
  const supabase = getSupabaseBrowserClient()
  let query = supabase.from('works')

  // Apply archive filter (exclude archived by default)
  if (!options.includeArchived) {
    query = query.eq('archived', false)
  }

  // Apply author filter
  if (options.authorId) {
    query = query.eq('author_id', options.authorId)
  }

  // Apply published filter
  if (options.published !== undefined) {
    query = query.eq('published', options.published)
  }

  return query
}

/**
 * Get works for a user (excluding archived by default)
 */
export async function getUserWorks(userId: string, includeArchived = false) {
  const query = buildWorksQuery({ 
    authorId: userId, 
    includeArchived,
    published: true 
  })
  
  const { data, error } = await query
    .select('id, title, description, genre, views, likes, created_at, updated_at, cover_url, published, reading_time, tags, content, display_order, archived')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user works:', error)
    return []
  }

  return data || []
}

/**
 * Get all works for a user including drafts (for author's own view)
 */
export async function getUserAllWorks(userId: string, includeArchived = false) {
  const query = buildWorksQuery({ 
    authorId: userId, 
    includeArchived 
  })
  
  const { data, error } = await query
    .select('id, title, description, genre, views, likes, created_at, updated_at, cover_url, published, reading_time, tags, content, display_order, archived')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user all works:', error)
    return []
  }

  return data || []
}

/**
 * Archive/unarchive a work
 */
export async function toggleWorkArchiveStatus(workId: string, archived: boolean) {
  const supabase = getSupabaseBrowserClient()
  
  const { error } = await supabase
    .from('works')
    .update({ archived, updated_at: new Date().toISOString() })
    .eq('id', workId)

  if (error) {
    console.error('Error updating archive status:', error)
    return false
  }

  return true
}

/**
 * Get archived works for a user
 */
export async function getUserArchivedWorks(userId: string) {
  const { data, error } = await buildWorksQuery({ 
    authorId: userId, 
    includeArchived: true 
  })
    .select('id, title, description, genre, views, likes, created_at, updated_at, cover_url, published, reading_time, tags, content, display_order, archived')
    .eq('archived', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching archived works:', error)
    return []
  }

  return data || []
}

/**
 * Search works (excluding archived by default)
 */
export async function searchWorks(query: string, includeArchived = false) {
  const worksQuery = buildWorksQuery({ 
    includeArchived,
    published: true 
  })
  
  const { data, error } = await worksQuery
    .select(`
      id, title, description, genre, views, likes, created_at, cover_url, reading_time, tags,
      profiles:author_id (
        id, username, name, avatar_url
      )
    `)
    .or(`title.ilike.%${query}%, description.ilike.%${query}%, tags.cs.{${query}}`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error searching works:', error)
    return []
  }

  return data || []
}
