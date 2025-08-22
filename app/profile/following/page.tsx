'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, UserMinus } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { toggleFollow } from '@/lib/supabase/follows'
import AppHeader from '@/components/AppHeader'

interface FollowingUser {
  id: string
  name: string
  username: string
  avatar_url: string
  bio: string
  created_at: string
}

export default function FollowingPage() {
  const router = useRouter()
  const [following, setFollowing] = useState<FollowingUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowing()
  }, [])

  const loadFollowing = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData?.user) {
        router.push('/login')
        return
      }
      
      setCurrentUserId(userData.user.id)

      // Get following
      const { data: followsData } = await supabase
        .from('follows')
        .select(`
          followee_id,
          created_at,
          followee:profiles!follows_followee_id_fkey(
            id,
            name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('follower_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (followsData) {
        const followingUsers = followsData
          .filter(f => f.followee)
          .map(f => ({
            id: (f.followee as any).id,
            name: (f.followee as any).name || 'Usuario',
            username: (f.followee as any).username || '@usuario',
            avatar_url: (f.followee as any).avatar_url || '/api/placeholder/48/48',
            bio: (f.followee as any).bio || '',
            created_at: f.created_at
          }))
        
        setFollowing(followingUsers)
      }
    } catch (error) {
      console.error('Error loading following:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async (userId: string) => {
    if (!currentUserId) return

    try {
      const result = await toggleFollow(userId)
      if (result.success && !result.following) {
        // Remove from local state
        setFollowing(prev => prev.filter(user => user.id !== userId))
      }
    } catch (error) {
      console.error('Error unfollowing:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">Siguiendo</h1>
        </div>

        {following.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sigues a nadie aún</h3>
              <p className="text-gray-600">Encuentra usuarios interesantes para seguir.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {following.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-red-200 transition-all"
                      onClick={() => router.push(`/profile/${user.username}`)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-semibold text-gray-900 truncate cursor-pointer hover:text-red-600 transition-colors"
                        onClick={() => router.push(`/profile/${user.username}`)}
                      >
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">{user.bio}</p>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(user.id)}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Dejar de seguir
                    </Button>
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