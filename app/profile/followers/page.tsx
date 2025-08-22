'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import AppHeader from '@/components/AppHeader'
import FollowButton from '@/components/FollowButton'
import { getOptimizedSupabaseClient, cleanupOptimizedClient } from '@/lib/supabase/optimized-client'

interface Follower {
  follower_id: string
  follower_username: string
  follower_name: string
  follower_avatar: string
  created_at: string
}

export default function FollowersPage() {
  const router = useRouter()
  const client = getOptimizedSupabaseClient()
  const [followers, setFollowers] = useState<Follower[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFollowers()
    
    return () => {
      cleanupOptimizedClient()
    }
  }, [])

  const loadFollowers = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get current user
      const user = await client.getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      setCurrentUserId(user.id)
      
      // Load followers
      const followersData = await client.getFollowers(user.id)
      setFollowers(followersData)
      
    } catch (error) {
      console.error('Error loading followers:', error)
      setError('Error al cargar seguidores')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    // Update the followers list if needed
    // This could trigger a refresh or update local state
  }

  return (
    <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
      <AppHeader />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">Seguidores</h1>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 text-center">
            <div className="text-red-600 mb-2">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadFollowers} variant="outline">
              Reintentar
            </Button>
          </Card>
        )}

        {/* Followers List */}
        {!isLoading && !error && (
          <>
            {followers.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Users className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aún no tienes seguidores
                </h3>
                <p className="text-gray-600 mb-6">
                  Cuando otros usuarios te sigan, aparecerán aquí.
                </p>
                <Button 
                  onClick={() => router.push('/explore')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Explorar usuarios
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  {followers.length} {followers.length === 1 ? 'seguidor' : 'seguidores'}
                </p>
                
                {followers.map((follower) => (
                  <Card key={follower.follower_id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => router.push(`/user/${follower.follower_username}`)}
                        className="flex items-center gap-4 flex-1 text-left"
                      >
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <Image
                            src={follower.follower_avatar || '/api/placeholder/48/48'}
                            alt={follower.follower_name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {follower.follower_name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            @{follower.follower_username}
                          </p>
                        </div>
                      </button>
                      
                      <FollowButton
                        currentUserId={currentUserId}
                        targetUserId={follower.follower_id}
                        onFollowChange={(isFollowing) => handleFollowChange(follower.follower_id, isFollowing)}
                        size="sm"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
