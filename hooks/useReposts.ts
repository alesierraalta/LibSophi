/**
 * Custom hook for managing reposts functionality
 */

import { useState, useEffect } from 'react'
import { toggleRepost, checkIfReposted, getRepostCount } from '@/lib/supabase/reposts'

export function useReposts(workId: string, initialCount = 0) {
  const [isReposted, setIsReposted] = useState(false)
  const [repostCount, setRepostCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial repost status and count
  useEffect(() => {
    const loadRepostData = async () => {
      try {
        const [repostedStatus, count] = await Promise.all([
          checkIfReposted(workId),
          getRepostCount(workId)
        ])
        
        setIsReposted(repostedStatus)
        setRepostCount(count)
      } catch (error) {
        console.error('Failed to load repost data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (workId) {
      loadRepostData()
    }
  }, [workId])

  const handleToggleRepost = async (caption?: string) => {
    try {
      setIsLoading(true)
      const result = await toggleRepost(workId, caption)
      
      if (result.success) {
        setIsReposted(result.reposted || false)
        setRepostCount(prev => result.action === 'reposted' ? prev + 1 : prev - 1)
        
        return {
          success: true,
          action: result.action,
          message: result.action === 'reposted' ? 'Republicado exitosamente' : 'Republicación eliminada'
        }
      } else {
        return {
          success: false,
          error: result.error
        }
      }
    } catch (error) {
      console.error('Toggle repost error:', error)
      return {
        success: false,
        error: 'Error al republicar la obra'
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isReposted,
    repostCount,
    isLoading,
    toggleRepost: handleToggleRepost
  }
}
