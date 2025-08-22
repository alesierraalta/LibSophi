'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { toggleFollow } from '@/lib/supabase/follows'
import AppHeader from '@/components/AppHeader'

interface FollowerUser {
  id: string
  name: string
  username: string
  avatar_url: string
  bio: string
  created_at: string
}

export default function FollowersPage() {
  const router = useRouter()
  const [followers, setFollowers] = useState<FollowerUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowers()
  }, [])

  const loadFollowers = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData?.user) {
        router.push('/login')
        return
      }
      
      setCurrentUserId(userData.user.id)

      // Get followers
      const { data: followsData } = await supabase
        .from('follows')
        .select(`
          follower_id,
          created_at,
          follower:profiles!follows_follower_id_fkey(
            id,
            name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('followee_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (followsData) {
        const followerUsers = followsData
          .filter(f => f.follower)
          .map(f => ({
            id: (f.follower as any).id,
            name: (f.follower as any).name || 'Usuario',
            username: (f.follower as any).username || '@usuario',
            avatar_url: (f.follower as any).avatar_url || '/api/placeholder/48/48',
            bio: (f.follower as any).bio || '',
            created_at: f.created_at
          }))
        
        setFollowers(followerUsers)

        // Check which users the current user is following back
        if (followerUsers.length > 0) {
          const { data: followingData } = await supabase
            .from('follows')
            .select('followee_id')
            .eq('follower_id', userData.user.id)
            .in('followee_id', followerUsers.map(f => f.id))

          if (followingData) {
            setFollowingSet(new Set(followingData.map(f => f.followee_id)))
          }
        }
      }
    } catch (error) {
      console.error('Error loading followers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId: string) => {
    if (!currentUserId) return

    try {
      const result = await toggleFollow(userId)
      if (result.success) {
        setFollowingSet(prev => {
          const newSet = new Set(prev)
          if (result.following) {
            newSet.add(userId)
          } else {
            newSet.delete(userId)
          }
          return newSet
        })
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Seguidores</h1>
        </div>

        {followers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes seguidores aún</h3>
              <p className="text-gray-600">Cuando alguien te siga, aparecerá aquí.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {followers.map((follower) => (
              <Card key={follower.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={follower.avatar_url}
                      alt={follower.name}
                      className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-red-200 transition-all"
                      onClick={() => router.push(`/profile/${follower.username}`)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-semibold text-gray-900 truncate cursor-pointer hover:text-red-600 transition-colors"
                        onClick={() => router.push(`/profile/${follower.username}`)}
                      >
                        {follower.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{follower.username}</p>
                      {follower.bio && (
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">{follower.bio}</p>
                      )}
                    </div>
                    
                    {currentUserId !== follower.id && (
                      <Button
                        variant={followingSet.has(follower.id) ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleFollow(follower.id)}
                        className={followingSet.has(follower.id) ? "" : "bg-red-600 hover:bg-red-700"}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {followingSet.has(follower.id) ? 'Siguiendo' : 'Seguir'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}