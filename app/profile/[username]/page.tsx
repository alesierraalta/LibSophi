'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, MessageCircle, Share2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import AppHeader from '@/components/AppHeader'
import ProfileSkeleton from '@/components/ProfileSkeleton'
import OptimizedProfileWorksGrid from '@/components/GridStack/OptimizedProfileWorksGrid'
import { WorkType } from '@/lib/validations'
import { dateUtils } from '@/lib/date-utils'
import { toggleFollow, getFollowStats, FollowStats } from '@/lib/supabase/follows'

interface Profile {
  id: string
  name: string
  username: string
  bio: string
  avatar: string
  banner: string
  created_at: string
}

interface Stats {
  works: number
  followers: number
  following: number
}

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams() as { username?: string }
  const username = decodeURIComponent(params?.username?.toString() || '')
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [works, setWorks] = useState<WorkType[]>([])
  const [stats, setStats] = useState<Stats>({ works: 0, followers: 0, following: 0 })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) {
      setError('Usuario no encontrado')
      setLoading(false)
      return
    }
    
    loadUserProfile()
  }, [username])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = getSupabaseBrowserClient()
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        setCurrentUserId(userData.user.id)
      }
      
      // Try multiple username formats to find the user
      let profileData = null
      let profileError = null
      
      // Try exact match first
      const searchAttempts = [
        username.startsWith('@') ? username : `@${username}`, // Ensure @ prefix first
        username, // As provided
        `@${username.replace('@', '')}` // Clean and add @ prefix
      ]
      
      for (const searchTerm of searchAttempts) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, username, bio, avatar_url, banner_url, created_at')
          .eq('username', searchTerm)
          .single()
        
        if (data && !error) {
          profileData = data
          profileError = null
          break
        }
      }
      
      // If still not found, try case-insensitive search
      if (!profileData) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, username, bio, avatar_url, banner_url, created_at')
          .ilike('username', `%${username.replace('@', '')}%`)
          .single()
        
        if (data && !error) {
          profileData = data
          profileError = null
        } else {
          profileError = error
        }
      }
      
      if (profileError || !profileData) {
        setError('Usuario no encontrado')
        setLoading(false)
        return
      }
      
      const userProfile: Profile = {
        id: profileData.id,
        name: profileData.name || 'Usuario',
        username: profileData.username || '@usuario',
        bio: profileData.bio || 'Sin biografía',
        avatar: profileData.avatar_url || '/api/placeholder/112/112',
        banner: profileData.banner_url || '',
        created_at: profileData.created_at
      }
      setProfile(userProfile)
      
      // Load user's works
      const { data: worksData, error: worksError } = await supabase
        .from('works')
        .select('id, title, description, genre, views, likes, created_at, updated_at, cover_url, published, reading_time, tags, content, display_order')
        .eq('author_id', profileData.id)
        .eq('published', true) // Only show published works
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(20)

      if (!worksError && worksData) {
        const formattedWorks: WorkType[] = worksData.map(work => ({
          id: work.id,
          title: work.title || 'Sin título',
          description: work.description || '',
          genre: work.genre || 'General',
          views: Number(work.views) || 0,
          likes: Number(work.likes) || 0,
          comments_count: 0, // Will be loaded separately if needed
          reposts_count: 0, // Will be loaded separately if needed
          created_at: new Date(work.created_at),
          updated_at: new Date(work.updated_at || work.created_at),
          coverUrl: work.cover_url,
          cover_image_url: work.cover_url,
          published: work.published || false,
          archived: false, // Default value since archived column may not exist in DB
          author_id: profileData.id,
          content: work.content || '',
          tags: work.tags || [],
          reading_time: work.reading_time || 5,
        }))
        setWorks(formattedWorks)
      }
      
      // Load works count
      const { count: worksCount } = await supabase
        .from('works')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', profileData.id)
        .eq('published', true)
      
      // Load follow stats using the new function
      const followStats = await getFollowStats(profileData.id)
      
      if (followStats) {
        setStats({
          works: worksCount || 0,
          followers: followStats.followers_count,
          following: followStats.following_count
        })
        
        // Set following status for current user
        if (userData?.user && userData.user.id !== profileData.id) {
          setIsFollowing(followStats.is_following)
        }
      } else {
        setStats({
          works: worksCount || 0,
          followers: 0,
          following: 0
        })
      }
      
    } catch (error) {
      console.error('Error loading profile:', error)
      console.error('Searched username:', username)
      setError(`Error al cargar el perfil: ${username}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUserId || !profile) return
    
    try {
      const result = await toggleFollow(profile.id)
      
      if (result.success) {
        setIsFollowing(result.following || false)
        
        // Update stats
        if (result.action === 'followed') {
          setStats(prev => ({ ...prev, followers: prev.followers + 1 }))
        } else if (result.action === 'unfollowed') {
          setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }))
        }
      } else {
        console.error('Follow error:', result.error)
        alert(result.error || 'Error al seguir/dejar de seguir')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      alert('Error al seguir/dejar de seguir')
    }
  }

  const handleShare = async () => {
    if (!profile) return
    
    const shareUrl = `${window.location.origin}/profile/${profile.username}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} (@${profile.username})`,
          text: profile.bio,
          url: shareUrl,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Enlace copiado al portapapeles')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <ProfileSkeleton />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Usuario no encontrado</h2>
              <p className="text-gray-600 mb-4">{error || 'El usuario que buscas no existe.'}</p>
              <Button onClick={() => router.push('/main')}>
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUserId === profile.id
  const joinDate = new Date(profile.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          {/* Banner */}
          {profile.banner && (
            <div className="h-48 bg-gradient-to-r from-red-400 to-red-600 relative">
              <img 
                src={profile.banner} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {!profile.banner && (
            <div className="h-48 bg-gradient-to-r from-red-400 to-red-600"></div>
          )}
          
          <CardContent className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 relative z-10">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.name}</h1>
                <p className="text-gray-600 mb-2">{profile.username}</p>
                <p className="text-gray-700 mb-4">{profile.bio}</p>
                
                {/* Stats */}
                <div className="flex gap-6 text-sm text-gray-600 mb-4">
                  <span><strong className="text-gray-900">{stats.works}</strong> obras</span>
                  <span><strong className="text-gray-900">{stats.followers}</strong> seguidores</span>
                  <span><strong className="text-gray-900">{stats.following}</strong> siguiendo</span>
                </div>
                
                <p className="text-sm text-gray-500">Se unió en {joinDate}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 sm:mt-0">
                {!isOwnProfile && currentUserId && (
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing ? "" : "bg-red-600 hover:bg-red-700"}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </Button>
                )}
                
                {!isOwnProfile && (
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mensaje
                  </Button>
                )}
                
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                
                {isOwnProfile && (
                  <Button variant="outline" onClick={() => router.push('/profile')}>
                    Editar perfil
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Works Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Obras publicadas</span>
              <span className="text-sm font-normal text-gray-500">({stats.works})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {works.length > 0 ? (
              <OptimizedProfileWorksGrid
                works={works}
                isLoading={false}
                onWorkClick={(work) => router.push(`/work/${work.id}`)}
                editable={false} // Other users' works are not editable
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay obras publicadas</h3>
                <p className="text-gray-600">
                  {isOwnProfile 
                    ? 'Aún no has publicado ninguna obra. ¡Empieza a escribir!'
                    : `${profile.name} aún no ha publicado ninguna obra.`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
