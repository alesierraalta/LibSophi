'use client'

import { getSupabaseBrowserClient } from './browser'

// Track view for a work/post
export async function trackView(workId: string, userId?: string): Promise<boolean> {
  try {
    const supabase = getSupabaseBrowserClient()
    
    // First, increment the views count on the work
    const { error: updateError } = await supabase
      .rpc('increment_work_views', { work_id: workId })
    
    if (updateError) {
      console.warn('Error incrementing views:', updateError)
      
      // Fallback: manual increment
      const { data: work, error: fetchError } = await supabase
        .from('works')
        .select('views')
        .eq('id', workId)
        .single()
      
      if (!fetchError && work) {
        const { error: manualUpdateError } = await supabase
          .from('works')
          .update({ views: (work.views || 0) + 1 })
          .eq('id', workId)
        
        if (manualUpdateError) {
          console.error('Manual view increment failed:', manualUpdateError)
          return false
        }
      } else {
        return false
      }
    }
    
    // Optionally track individual view records for analytics (completely optional)
    if (userId) {
      // Use a completely safe approach - check if exists first, then insert only if not
      try {
        const { data: existingView } = await supabase
          .from('work_views')
          .select('id')
          .eq('work_id', workId)
          .eq('user_id', userId)
          .maybeSingle()
        
        if (!existingView) {
          // Only insert if no existing record
          await supabase
            .from('work_views')
            .insert({
              work_id: workId,
              user_id: userId
            })
        }
      } catch (viewError) {
        // Completely ignore view tracking errors - this is optional analytics
        console.log('📊 View analytics unavailable (non-critical)')
      }
    }
    
    return true
  } catch (error) {
    console.error('Error tracking view:', error)
    return false
  }
}

// Get view count for a work
export async function getViewCount(workId: string): Promise<number> {
  try {
    const supabase = getSupabaseBrowserClient()
    
    const { data, error } = await supabase
      .from('works')
      .select('views')
      .eq('id', workId)
      .single()
    
    if (error) {
      console.warn('Error fetching view count:', error)
      return 0
    }
    
    return data?.views || 0
  } catch (error) {
    console.error('Error getting view count:', error)
    return 0
  }
}

// Get view analytics for a user's works
export async function getUserWorksViews(userId: string): Promise<{ workId: string; title: string; views: number }[]> {
  try {
    const supabase = getSupabaseBrowserClient()
    
    const { data, error } = await supabase
      .from('works')
      .select('id, title, views')
      .eq('author_id', userId)
      .order('views', { ascending: false })
    
    if (error) {
      console.warn('Error fetching user works views:', error)
      return []
    }
    
    return (data || []).map(work => ({
      workId: work.id,
      title: work.title || 'Sin título',
      views: work.views || 0
    }))
  } catch (error) {
    console.error('Error getting user works views:', error)
    return []
  }
}

