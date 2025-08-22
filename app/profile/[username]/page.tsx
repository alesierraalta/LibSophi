'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, UserPlus, MessageCircle, Share2, Repeat2, Heart, Eye } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import AppHeader from '@/components/AppHeader'
import ProfileSkeleton from '@/components/ProfileSkeleton'
import OptimizedProfileWorksGrid from '@/components/GridStack/OptimizedProfileWorksGrid'
import { WorkType } from '@/lib/validations'
import { dateUtils } from '@/lib/date-utils'
import { toggleFollow, getFollowStats, FollowStats } from '@/lib/supabase/follows'
import { measurePerformance, debounce, loadingStates } from '@/lib/performance-optimization'

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
  const [activeTab, setActiveTab] = useState<'works' | 'saved' | 'reposts'>('works')
  const [reposts, setReposts] = useState<any[]>([])
  const [isLoadingReposts, setIsLoadingReposts] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingWorks, setIsLoadingWorks] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Default banners from original profile page
  const defaultBanners: { title: string; url: string }[] = [
    { title: 'La noche estrellada (Van Gogh)', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
    { title: 'El nacimiento de Venus (Botticelli)', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg' },
    { title: 'La escuela de Atenas (Rafael)', url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/School_of_Athens_Raphael.jpg' },
    { title: 'La ronda de noche (Rembrandt)', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Rembrandt_van_Rijn-De_Nachtwacht-1642.jpg' },
    { title: 'La gran ola de Kanagawa (Hokusai)', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Great_Wave_off_Kanagawa2.jpg' },
    { title: 'El beso (Klimt)', url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg' },
  ]

  useEffect(() => {
    if (!username) {
      setError('Usuario no encontrado')
      setLoading(false)
      return
    }
    
    loadUserProfile()
  }, [username])

  const loadUserProfile = async () => {
    await measurePerformance('User Profile Load', async () => {
    try {
      setLoading(true)
      setIsLoadingProfile(true)
      setIsLoadingWorks(true)
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
      setIsLoadingProfile(false)
      setIsLoadingWorks(false)
    }
    })
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

  // Optimized stats calculation - moved before early returns
  const optimizedStats = useMemo(() => {
    return {
      works: stats.works || 0,
      followers: stats.followers || 0,
      following: stats.following || 0
    }
  }, [stats])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <ProfileSkeleton />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
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

  // Fallback profile for loading states
  const fallbackProfile: Profile = {
    id: '',
    name: 'Cargando...',
    username: '@cargando',
    bio: 'Cargando perfil...',
    avatar: '/api/placeholder/112/112',
    banner: '',
    created_at: new Date().toISOString()
  }

  const displayProfile = profile || fallbackProfile

  return (
    <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
      <AppHeader />
      
      {/* Profile Header Section */}
      <section className="bg-white">
        <div className="relative overflow-hidden">
          <div className="relative h-32 sm:h-48 md:h-56 border-b border-gray-100">
            {displayProfile.banner ? (
              <Image
                src={displayProfile.banner}
                alt="Banner de perfil"
                fill
                className="absolute inset-0 w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-white to-red-100" />
            )}
            <div className="absolute inset-0 bg-black/5" />
          </div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-5">
            <div className="flex items-start gap-4">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden ring-2 ring-red-100 bg-white flex-shrink-0 shadow-sm">
                <Image
                  src={displayProfile.avatar}
                  alt={displayProfile.name}
                  width={112}
                  height={112}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {displayProfile.name}
                  </h1>
                  
                  {/* Action Buttons - Only show for other users */}
                  {!isOwnProfile && profile && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        className={`flex items-center gap-2 text-sm ${!isFollowing ? 'bg-red-600 hover:bg-red-700' : ''}`}
                      >
                        <UserPlus className="h-4 w-4" />
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2 text-sm">
                        <MessageCircle className="h-4 w-4" />
                        Mensaje
                      </Button>
                      <Button
                        onClick={handleShare}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-sm"
                      >
                        <Share2 className="h-4 w-4" />
                        Compartir
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{displayProfile.username}</p>
                {displayProfile.bio && (
                  <p className="text-gray-700 mb-3 text-sm">{displayProfile.bio}</p>
                )}
                
                {/* Stats */}
                <div className="flex gap-6 text-sm text-gray-600 mb-3">
                  <span><strong className="text-gray-900">{optimizedStats.works}</strong> obras</span>
                  <button
                    onClick={() => router.push(`/profile/${displayProfile.username}/followers`)}
                    className="hover:underline"
                  >
                    <strong className="text-gray-900">{optimizedStats.followers}</strong> seguidores
                  </button>
                  <button
                    onClick={() => router.push(`/profile/${displayProfile.username}/following`)}
                    className="hover:underline"
                  >
                    <strong className="text-gray-900">{optimizedStats.following}</strong> siguiendo
                  </button>
                </div>
                
                <p className="text-sm text-gray-500">Se unió en {joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs header */}
      <div className="max-w-full mx-auto px-0 sm:px-6 lg:px-8 bg-white border-b border-gray-200 sticky top-14 z-40">
        <div className="flex items-stretch">
          <button 
            onClick={() => setActiveTab('works')} 
            className={`flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm ${
              activeTab === 'works' 
                ? 'text-red-600 border-b-2 border-red-600' 
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <BookOpen className="h-4 w-4"/> Obras ({optimizedStats.works})
          </button>
        </div>
      </div>

      {/* Content Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'works' && (
            <div>
              {isLoadingWorks ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                      <div className="relative h-48 w-full bg-gray-200" />
                      <CardHeader className="p-4 pb-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="h-4 bg-gray-200 rounded w-16" />
                          <div className="h-4 bg-gray-200 rounded w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : works.length > 0 ? (
                <OptimizedProfileWorksGrid 
                  works={works} 
                  editable={false}
                  onWorkClick={(work) => router.push(`/work/${work.id}`)}
                />
              ) : (
                <Card className="bg-white border border-gray-200">
                  <CardContent className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin obras publicadas</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {displayProfile.name} aún no ha publicado ninguna obra. ¡Mantente atento para ver su contenido!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}