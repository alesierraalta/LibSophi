'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { getOptimizedSupabaseClient } from '@/lib/supabase/optimized-client'

interface FollowButtonProps {
  currentUserId: string | null
  targetUserId: string
  initialIsFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'ghost'
}

export default function FollowButton({
  currentUserId,
  targetUserId,
  initialIsFollowing = false,
  onFollowChange,
  className = '',
  size = 'sm',
  variant = 'outline'
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false)
  const client = getOptimizedSupabaseClient()

  // Update initial state when prop changes
  useEffect(() => {
    setIsFollowing(initialIsFollowing)
    setHasCheckedStatus(initialIsFollowing !== false) // If we have an initial value, consider it checked
  }, [initialIsFollowing])

  // Check follow status on mount only if we don't have initial status
  useEffect(() => {
    if (currentUserId && targetUserId && currentUserId !== targetUserId && !hasCheckedStatus && initialIsFollowing === false) {
      checkFollowStatus()
    }
  }, [currentUserId, targetUserId, hasCheckedStatus, initialIsFollowing])

  const checkFollowStatus = async () => {
    if (!currentUserId || !targetUserId) return
    
    try {
      const following = await client.isFollowing(currentUserId, targetUserId)
      setIsFollowing(following)
      setHasCheckedStatus(true)
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollow = async () => {
    if (!currentUserId || !targetUserId || isLoading) {
      console.warn('FollowButton: Missing required data', { currentUserId, targetUserId, isLoading })
      return
    }
    
    console.log('FollowButton: Attempting to', isFollowing ? 'unfollow' : 'follow', 'user', targetUserId)
    setIsLoading(true)
    
    try {
      let success = false
      
      if (isFollowing) {
        success = await client.unfollowUser(currentUserId, targetUserId)
        console.log('FollowButton: Unfollow result:', success)
      } else {
        success = await client.followUser(currentUserId, targetUserId)
        console.log('FollowButton: Follow result:', success)
      }
      
      if (success) {
        const newFollowingState = !isFollowing
        setIsFollowing(newFollowingState)
        onFollowChange?.(newFollowingState)
        console.log('FollowButton: State updated to', newFollowingState)
      } else {
        console.error('FollowButton: Failed to update follow status')
        alert('Error al actualizar el estado de seguimiento')
      }
    } catch (error) {
      console.error('FollowButton: Error updating follow status:', error)
      alert('Error al procesar la acción de seguir/dejar de seguir')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show button if not authenticated or trying to follow yourself
  if (!currentUserId || currentUserId === targetUserId) {
    return null
  }

  const buttonVariant = isFollowing ? 'outline' : variant
  const buttonClass = `
    ${size === 'sm' ? 'text-xs px-3 py-1.5' : size === 'lg' ? 'text-base px-6 py-3' : 'text-sm px-4 py-2'}
    ${isFollowing 
      ? 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400' 
      : 'bg-red-600 hover:bg-red-700 text-white border-red-600'
    }
    ${className}
  `

  return (
    <Button
      variant={buttonVariant}
      size={size}
      onClick={handleFollow}
      disabled={isLoading}
      className={buttonClass}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          {isFollowing ? 'Dejando...' : 'Siguiendo...'}
        </>
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          Siguiendo
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Seguir
        </>
      )}
    </Button>
  )
}

// Hook for follow functionality
export function useFollowStatus(currentUserId: string | null, targetUserId: string) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const client = getOptimizedSupabaseClient()

  useEffect(() => {
    if (currentUserId && targetUserId && currentUserId !== targetUserId) {
      checkFollowStatus()
    }
  }, [currentUserId, targetUserId])

  const checkFollowStatus = async () => {
    if (!currentUserId || !targetUserId) return
    
    setIsLoading(true)
    try {
      const following = await client.isFollowing(currentUserId, targetUserId)
      setIsFollowing(following)
    } catch (error) {
      console.error('Error checking follow status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFollow = async () => {
    if (!currentUserId || !targetUserId || isLoading) return
    
    setIsLoading(true)
    
    try {
      let success = false
      
      if (isFollowing) {
        success = await client.unfollowUser(currentUserId, targetUserId)
      } else {
        success = await client.followUser(currentUserId, targetUserId)
      }
      
      if (success) {
        setIsFollowing(!isFollowing)
      }
      
      return success
    } catch (error) {
      console.error('Error updating follow status:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isFollowing,
    isLoading,
    toggleFollow,
    checkFollowStatus
  }
}
