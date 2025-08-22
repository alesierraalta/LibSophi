'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Bookmark, UserPlus, Edit3, Repeat2, Share2, Copy, Trash2, Image as ImageIcon, Archive, ArchiveRestore } from 'lucide-react'
import ProfileImageUpload from '@/components/ProfileImageUpload'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import OptimizedProfileWorksGrid from '@/components/GridStack/OptimizedProfileWorksGrid'
import { WorkType } from '@/lib/validations'
import { dateUtils } from '@/lib/date-utils'
import AppHeader from '@/components/AppHeader'
import ProfileSkeleton from '@/components/ProfileSkeleton'
import { openConfirmDialog } from '@/components/ConfirmDialog'
import { measurePerformance, debounce, loadingStates } from '@/lib/performance-optimization'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [activeTab, setActiveTab] = useState<'works' | 'saved' | 'reposts' | 'archived'>('works')
  const [showArchived, setShowArchived] = useState(false)

  // Sync showArchived with activeTab
  useEffect(() => {
    if (activeTab === 'archived') {
      setShowArchived(true)
    } else if (activeTab === 'works') {
      setShowArchived(false)
    }
  }, [activeTab])
  const [reposts, setReposts] = useState<any[]>([])
  const [isLoadingReposts, setIsLoadingReposts] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [hasLoadedFromDB, setHasLoadedFromDB] = useState(false)
  const isOwnProfile = true

  type Profile = {
    name: string
    username: string
    bio: string
    avatar: string
    banner: string
  }

  // Optimized state management
  const [profile, setProfile] = useState<Profile>(loadingStates.profile)
  const [userId, setUserId] = useState<string | null>(null)
  const [editProfile, setEditProfile] = useState<Profile>(loadingStates.profile)
  const [showEdit, setShowEdit] = useState(false)
  const [works, setWorks] = useState<WorkType[]>(loadingStates.works)
  const [isLoadingWorks, setIsLoadingWorks] = useState(true)
  const [stats, setStats] = useState(loadingStates.stats)
  const [isLoadingStats, setIsLoadingStats] = useState(false) // Start as false for performance
  const [hasNoProfileData, setHasNoProfileData] = useState(false)
  const [hasNoWorksData, setHasNoWorksData] = useState(false)
  const [databaseError, setDatabaseError] = useState<string | null>(null)

  // Fallback profile for when no user is found - more generic
  const fallbackProfile: Profile = {
    name: 'Usuario Demo',
    username: 'demo_user',
    bio: 'Perfil de demostración. Inicia sesión para ver tu perfil personalizado.',
    avatar: '/api/placeholder/112/112',
    banner: '',
  }
  const maxBioLen = 280
  const [errors, setErrors] = useState<{ name?: string; username?: string; bio?: string; avatar?: string; banner?: string }>({})

  const defaultBanners: { title: string; url: string }[] = [
    { title: 'La noche estrellada (Van Gogh)', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
    { title: 'El nacimiento de Venus (Botticelli)', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg' },
    { title: 'La escuela de Atenas (Rafael)', url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/School_of_Athens_Raphael.jpg' },
    { title: 'La ronda de noche (Rembrandt)', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Rembrandt_van_Rijn-De_Nachtwacht-1642.jpg' },
    { title: 'La gran ola de Kanagawa (Hokusai)', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Great_Wave_off_Kanagawa2.jpg' },
    { title: 'El beso (Klimt)', url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg' },
  ]

  // Optimized profile loading
  useEffect(() => {
    const loadProfile = async () => {
      await measurePerformance('Profile Load', async () => {
      setIsLoadingProfile(true)
      setDatabaseError(null)
        
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            setUserId(user.id)
            
            // Load profile
            const { data: profileData } = await supabase
            .from('profiles')
              .select('name, username, bio, avatar_url, banner_url')
              .eq('id', user.id)
            .single()
          
            if (profileData) {
                              const profile = {
                  name: profileData.name || user.email?.split('@')[0] || 'Usuario',
                  username: profileData.username || `@${user.email?.split('@')[0] || 'usuario'}`,
                  bio: profileData.bio || 'Nuevo en Palabreo',
                  avatar: profileData.avatar_url || '/api/placeholder/112/112',
                  banner: profileData.banner_url || '',
                }
              setProfile(profile)
            setHasLoadedFromDB(true)
            setHasNoProfileData(false)
          } else {
              // Create basic profile from user data
              const basicProfile = {
                name: user.email?.split('@')[0] || 'Usuario',
                username: user.email?.split('@')[0] || 'usuario',
                bio: 'Nuevo en Palabreo',
                avatar: '/api/placeholder/112/112',
                banner: '',
              }
              setProfile(basicProfile)
              setHasNoProfileData(false)
            }
          } else {
            setProfile(fallbackProfile)
            setHasNoProfileData(true)
        }
      } catch (error) {
          console.error('Profile load error:', error)
          setDatabaseError('Error al cargar perfil')
          setProfile(fallbackProfile)
          setHasNoProfileData(true)
      } finally {
        setIsLoadingProfile(false)
      }
      })
    }
    
          loadProfile()
      
      // No cleanup needed for standard client
    }, [])

    // Load follow stats separately using direct queries
    useEffect(() => {
      const loadFollowStats = async () => {
        if (!userId) return
        
        console.log('Loading follow stats for userId:', userId)
        try {
          const supabase = getSupabaseBrowserClient()
          
          // Get followers count
          const { count: followersCount } = await supabase
            .from('follows')
            .select('follower_id', { count: 'exact', head: true })
            .eq('followee_id', userId)
          
          // Get following count  
          const { count: followingCount } = await supabase
            .from('follows')
            .select('followee_id', { count: 'exact', head: true })
            .eq('follower_id', userId)
          
          console.log('Direct query results - followers:', followersCount, 'following:', followingCount)
          
          setStats(prev => ({
            ...prev,
            followers: followersCount || 0,
            following: followingCount || 0
          }))
          
        } catch (error) {
          console.error('Error loading follow stats:', error)
        }
      }
      
      loadFollowStats()
    }, [userId])

  // Load reposts when reposts tab is active
  useEffect(() => {
    if (activeTab === 'reposts' && userId) {
      const loadReposts = async () => {
        setIsLoadingReposts(true)
        try {
          const { getUserReposts } = await import('@/lib/supabase/reposts')
          const userReposts = await getUserReposts(userId)
          
          // Format reposts for display
          const formattedReposts = userReposts.map(repost => {
            // Extract text content from the work
            let workContent = ''
            if (repost.works) {
              const work = repost.works as any // Type assertion para evitar errores de TypeScript
              // Try to get content from chapters or direct content
              if (work.chapters && Array.isArray(work.chapters) && work.chapters.length > 0) {
                workContent = work.chapters[0]?.content || ''
              } else if (work.content) {
                workContent = work.content
              }
            }
            
            // Create a clean excerpt (remove HTML tags and limit length)
            const cleanContent = workContent.replace(/<[^>]*>/g, '').trim()
            const excerpt = cleanContent.length > 150 
              ? cleanContent.substring(0, 150) + '...' 
              : cleanContent || 'Sin contenido disponible'

            return {
              id: repost.id,
              title: repost.works?.title || 'Obra sin título',
              author: {
                name: repost.works?.profiles?.name || 'Autor desconocido',
                username: repost.works?.profiles?.username || '@autor'
              },
              excerpt,
              content: workContent,
              image: repost.works?.cover_url || null,
              time: new Date(repost.created_at).getTime(),
              caption: repost.caption,
              originalWorkId: repost.work_id,
              genre: repost.works?.genre || 'General'
            }
          })
          
          setReposts(formattedReposts)
        } catch (error) {
          console.error('Error loading reposts:', error)
          setReposts([])
        } finally {
          setIsLoadingReposts(false)
        }
      }
      
      loadReposts()
    }
  }, [activeTab, userId])

  // Optimized works loading
  useEffect(() => {
    if (!userId) return
    
    const loadWorks = async () => {
      await measurePerformance('Works Load', async () => {
      setIsLoadingWorks(true)
      setHasNoWorksData(false)
      
      try {
          console.log('Loading works for userId:', userId)
          
          // Load works directly from Supabase
          const { data, error } = await supabase
            .from('works')
            .select('id, title, description, genre, views, likes, created_at, updated_at, cover_url, published, reading_time, tags, content, display_order, archived')
            .eq('author_id', userId)
            .eq('archived', showArchived)
            .order('display_order', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false })
            .limit(20)

          console.log('Database query result:', { data: data?.length, error })

          if (error) {
            console.error('Supabase query error:', error)
            throw error
          }

          const worksData = (data || []).map(work => ({
                id: work.id,
                title: work.title || 'Sin título',
                description: work.description || '',
            genre: work.genre || 'General',
            views: Number(work.views) || 0,
            likes: Number(work.likes) || 0,
            comments_count: 0,
            reposts_count: 0,
            created_at: new Date(work.created_at),
            updated_at: new Date(work.updated_at || work.created_at),
            coverUrl: work.cover_url,
            cover_image_url: work.cover_url,
            published: work.published || false,
            author_id: userId,
                content: work.content || '',
                tags: work.tags || [],
                reading_time: work.reading_time || 5,
                archived: work.archived || false,
          }))
          
          console.log('Loaded works data:', worksData)
          
          if (worksData.length > 0) {
            setWorks(worksData)
            setHasNoWorksData(false)
            setStats(prev => ({ ...prev, works: worksData.length }))
          } else {
            setWorks([])
            setHasNoWorksData(true)
            setStats(prev => ({ ...prev, works: 0 }))
          }
          
                    // Follow stats are loaded separately in their own useEffect
      } catch (error) {
          console.error('Works load error:', error)
          setDatabaseError('Error al cargar obras')
          setWorks([])
          setHasNoWorksData(true)
      } finally {
        setIsLoadingWorks(false)
      }
      })
    }
    
    loadWorks()
  }, [userId, showArchived])

  const openEdit = () => {
    setEditProfile(profile)
    setShowEdit(true)
  }

  const saveEdit = async () => {
    const currentErrors = validate(editProfile)
    setErrors(currentErrors)
    if (Object.keys(currentErrors).length > 0) return
    
    const cleaned: Profile = {
      name: editProfile.name.trim(),
      username: editProfile.username.replace(/^@+/, '').trim(),
      bio: editProfile.bio.trim(),
      avatar: editProfile.avatar.trim(),
      banner: editProfile.banner.trim(),
    }
    
    setProfile(cleaned)
    
      if (userId) {
      // Update profile directly with Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: cleaned.name,
          username: cleaned.username,
          bio: cleaned.bio,
        })
        .eq('id', userId)
      
      const success = !error
      if (error) {
        console.error('Profile update error:', error)
      }
      
      if (!success) {
        setDatabaseError('Error al actualizar perfil')
        return
      }
    }
    
    setShowEdit(false)
  }

  const toggleWorkArchive = async (workId: string, archived: boolean) => {
    try {
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch(`/api/works/${workId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ archived })
      })

      if (!response.ok) {
        throw new Error('Failed to update archive status')
      }

      // Update the work in the current works list
      setWorks(prevWorks => 
        prevWorks.map(work => 
          work.id === workId 
            ? { ...work, archived } 
            : work
        ).filter(work => (work as any).archived === showArchived)
      )
    } catch (error) {
      console.error('Error toggling archive status:', error)
    }
  }

  const resetDefaults = () => {
    setEditProfile(fallbackProfile)
    setErrors({})
  }

  const validate = (p: Profile) => {
    const e: { name?: string; username?: string; bio?: string; avatar?: string; banner?: string } = {}
    const name = (p.name || '').trim()
    const username = (p.username || '').replace(/^@+/, '').trim()
    const bio = (p.bio || '')
    const avatar = (p.avatar || '').trim()
    if (name.length < 2) e.name = 'El nombre debe tener al menos 2 caracteres.'
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) e.username = 'Usuario inválido. Usa 3-20 caracteres: letras, números o _.'
    if (bio.length > maxBioLen) e.bio = `Máximo ${maxBioLen} caracteres.`
    // Allow uploaded images (from Supabase Storage) and placeholder URLs
    if (avatar && !(avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/') || avatar.includes('supabase'))) {
      e.avatar = 'URL de avatar inválida.'
    }
    const banner = (p.banner || '').trim()
    if (banner && !(banner.startsWith('http://') || banner.startsWith('https://') || banner.startsWith('/') || banner.includes('supabase'))) {
      e.banner = 'URL de banner inválida.'
    }
    return e
  }

  useEffect(() => {
    setErrors(validate(editProfile))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editProfile.name, editProfile.username, editProfile.bio, editProfile.avatar])

  // Remove old stats calculation - now using state directly



  // Removed savedLayout state and useEffect for performance optimization

  // Removed complex long-press overlay code for better performance

  // Removed old touch/pointer event handlers - now handled by OptimizedProfileWorksGrid

  const handleWorkEdit = (work: WorkType) => {
    router.push(`/writer?edit=${work.id}`)
  }

  const handleWorkDelete = async (workId: string) => {
    const work = works.find(w => w.id === workId)
    
    if (!work || !userId) return
      
      openConfirmDialog({
        title: 'Eliminar obra',
        message: `¿Estás seguro de que quieres eliminar "${work.title}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        variant: 'danger',
        onConfirm: async () => {
        // Delete work directly with Supabase
        const { error } = await supabase
            .from('works')
            .delete()
            .eq('id', workId)
            .eq('author_id', userId)
        
        const success = !error
          if (error) {
          console.error('Work delete error:', error)
        }
        
        if (success) {
          setWorks(prev => prev.filter(w => w.id !== workId))
          setStats(prev => ({ ...prev, works: prev.works - 1 }))
          alert('Obra eliminada exitosamente')
        } else {
          alert('Error al eliminar la obra')
        }
      }
    })
  }

  const handleWorkShare = async (work: WorkType) => {
    try {
      const url = `${window.location.origin}/work/${work.id}`
      if (navigator.share) {
        await navigator.share({ url, title: work.title, text: 'Mira mi obra en Palabreo' })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Enlace copiado al portapapeles')
      }
    } catch (error) {
      console.error('Error sharing work:', error)
    }
  }

  const handleWorkDuplicate = (work: WorkType) => {
    // Navigate to writer with duplicate mode
    router.push(`/writer?duplicate=${work.id}`)
  }

  const handleWorkCoverChange = (work: WorkType) => {
    // For now, just show an alert. This could open a modal for cover selection
    alert(`Cambiar portada de: ${work.title}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
      {/* Header */}
      <AppHeader />

      {/* Profile cover + header */}
      {isLoadingProfile ? (
        <ProfileSkeleton />
      ) : (
        <section className="bg-white">
          {/* Profile data state notification */}
          {hasNoProfileData && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Mostrando perfil de demostración. <a href="/login" className="font-medium underline hover:text-blue-800">Inicia sesión</a> para ver tu perfil personalizado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="relative overflow-hidden">
            <div className="relative h-32 sm:h-48 md:h-56 border-b border-gray-100">
              {profile.banner ? (
                <img src={profile.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-white to-red-100" />
              )}
              <div className="absolute inset-0 bg-black/5" />
            </div>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-5">
              <div className="flex items-start gap-4">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden ring-2 ring-red-100 bg-white flex-shrink-0 shadow-sm">
                  <Image src={profile.avatar || '/api/placeholder/112/112'} alt="Avatar" width={112} height={112} className="object-cover" priority />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{profile.name}</h2>
                      <div className="text-xs text-gray-500 truncate">@{profile.username}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-xs" onClick={openEdit}>
                        <Edit3 className="h-4 w-4 mr-1"/> Editar
                      </Button>
                      {!isOwnProfile && (
                        <Button size="sm" className={`${isFollowing ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-red-600 border-red-300 hover:bg-red-50'} text-xs`} onClick={() => setIsFollowing(v => !v)}>
                          <UserPlus className="h-4 w-4 mr-1"/>{isFollowing ? 'Siguiendo' : 'Seguir'}
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{profile.bio}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                    <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700"><strong className="text-gray-900">{stats.works}</strong> obras</span>
                    <button 
                      className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                      onClick={() => router.push('/profile/followers')}
                    >
                      <strong className="text-gray-900">{stats.followers}</strong> seguidores
                    </button>
                    <button 
                      className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                      onClick={() => router.push('/profile/following')}
                    >
                      <strong className="text-gray-900">{stats.following}</strong> siguiendo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs header */}
      <div className="max-w-full mx-auto px-0 sm:px-6 lg:px-8 bg-white border-b border-gray-200 sticky top-14 z-40">
        <div className="flex items-stretch">
          <button onClick={() => setActiveTab('works')} className={`flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm ${activeTab === 'works' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
            <BookOpen className="h-4 w-4"/> Obras
          </button>
          <button onClick={() => setActiveTab('saved')} className={`flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm ${activeTab === 'saved' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
            <Bookmark className="h-4 w-4"/> Guardados
          </button>
          <button onClick={() => setActiveTab('reposts')} className={`flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm ${activeTab === 'reposts' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
            <Repeat2 className="h-4 w-4"/> Reposts
          </button>
          <button 
            onClick={() => {
              const newArchivedState = !showArchived
              setShowArchived(newArchivedState)
              // Switch to archived tab when showing archived works
              if (newArchivedState) {
                setActiveTab('archived')
              } else {
                setActiveTab('works')
              }
            }} 
            className={`flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm ${showArchived || activeTab === 'archived' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}
          >
            {showArchived || activeTab === 'archived' ? <ArchiveRestore className="h-4 w-4"/> : <Archive className="h-4 w-4"/>}
            {showArchived || activeTab === 'archived' ? 'Obras Normales' : 'Ver Archivadas'}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24">
        {activeTab === 'works' && (
          <>
            {/* Error message banner */}
            {databaseError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{databaseError}</p>
                  </div>
                </div>
              </div>
            )}

            {isLoadingWorks ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hasNoWorksData ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <BookOpen className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hasNoProfileData ? 'Sin obras disponibles' : 'No tienes obras aún'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {hasNoProfileData 
                    ? 'Inicia sesión para ver y gestionar tus obras literarias.'
                    : 'Comienza tu viaje literario creando tu primera obra. ¡El mundo está esperando tu historia!'
                  }
                </p>
                {!hasNoProfileData && (
                  <Button 
                    onClick={() => router.push('/writer')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Crear mi primera obra
                  </Button>
                )}
              </div>
            ) : (
              <OptimizedProfileWorksGrid
                  works={works}
                  isLoading={isLoadingWorks}
                  onWorkArchive={toggleWorkArchive}
                  onWorkClick={(work) => {
                    router.push(`/work/${work.id}`)
                  }}
                  onLayoutChange={async (layout) => {
                    try {
                      // Save to localStorage for immediate feedback
                      localStorage.setItem('palabreo-profile-layout', JSON.stringify(layout))
                      
                      // Save to database if user is authenticated
                      if (userId && layout.length > 0) {
                        // Save work order directly with Supabase
                        let success = true
                        try {
                          for (const item of layout) {
                            const { error } = await supabase
                              .from('works')
                              .update({ display_order: item.order })
                              .eq('id', item.id)
                              .eq('author_id', userId)
                            
                            if (error) {
                              console.error('Work order update error:', error)
                              success = false
                              break
                            }
                          }
                        } catch (error) {
                          console.error('Unexpected error saving work order:', error)
                          success = false
                        }
                        if (success) {
                          console.log('Order saved to database:', layout)
                          
                          // Update local works state to match saved order
                          const reorderedWorks = layout.map(item => 
                            works.find(work => work.id === item.id)
                          ).filter(Boolean) as WorkType[]
                          
                          // Add any works not in the layout (shouldn't happen, but safety)
                          const layoutIds = new Set(layout.map(item => item.id))
                          const remainingWorks = works.filter(work => !layoutIds.has(work.id))
                          
                          setWorks([...reorderedWorks, ...remainingWorks])
                        } else {
                          console.error('Failed to save order to database')
                        }
                      }
                    } catch (error) {
                      console.error('Error saving layout:', error)
                    }
                  }}
                  editable={isOwnProfile}
                  onWorkEdit={handleWorkEdit}
                  onWorkDelete={handleWorkDelete}
                  onWorkShare={handleWorkShare}
                  onWorkDuplicate={handleWorkDuplicate}
                  onWorkCoverChange={handleWorkCoverChange}
                />
            )}
          </>
        )}

        {/* Old grid implementation removed for performance */}

        {activeTab === 'saved' && (
          <div className="text-sm text-gray-600">Tus obras guardadas aparecerán aquí.</div>
        )}

        {activeTab === 'reposts' && (
          <div className="space-y-3">
            {isLoadingReposts ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                    <CardContent className="p-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : reposts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600 mb-1">Aún no tienes reposts</div>
                <div className="text-xs text-gray-500">Republica obras interesantes para que aparezcan aquí</div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reposts.map((r) => (
                  <Card 
                    key={r.id} 
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-red-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => router.push(`/work/${r.originalWorkId}`)}
                  >
                    {/* Repost Header */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-100">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                          <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-green-800">Republicaste esto</div>
                          <div className="text-xs text-green-600">{new Date(r.time).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</div>
                        </div>
                      </div>
                    </div>

                    {/* Cover Image */}
                    {r.image ? (
                      <div className="relative h-40 w-full overflow-hidden">
                        <img 
                          src={r.image} 
                          alt={r.title} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                        {/* Genre badge */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {r.genre}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Fallback design when no image
                      <div className="h-24 bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="h-8 w-8 mx-auto text-red-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <div className="text-xs font-medium text-red-600">{r.genre}</div>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <CardContent className="p-4 space-y-3">
                      {/* Caption if exists */}
                      {r.caption && (
                        <div className="bg-gray-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                          <div className="text-xs text-gray-500 mb-1">Tu comentario:</div>
                          <div className="text-sm text-gray-700 italic">"{r.caption}"</div>
                        </div>
                      )}

                      {/* Work Title */}
                      <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 text-base leading-tight">
                        {r.title}
                      </h3>

                      {/* Work Excerpt */}
                      <div className="bg-gray-50 rounded-lg p-3 border-l-2 border-red-200">
                        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                          {r.excerpt}
                        </p>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-red-700">
                            {(r.author?.name || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-600 truncate">
                            por <span className="font-medium text-gray-800">{r.author?.name}</span>
                          </div>
                          <div className="text-xs text-gray-500 truncate">{r.author?.username}</div>
                        </div>
                      </div>

                      {/* Action Hint */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Toca para leer la obra</span>
                          <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      {/* Edit Profile Modal - Improved UI/UX */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in-0 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-red-50 to-red-100 px-6 py-5 border-b border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Editar perfil</h3>
                  <p className="text-sm text-gray-600 mt-1">Personaliza tu información pública</p>
                </div>
                <button
                  onClick={() => setShowEdit(false)}
                  className="p-2 hover:bg-red-200 rounded-full transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
              <div className="p-6 space-y-8">
                {/* Profile Images Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Imágenes de perfil</h4>
                      <p className="text-sm text-gray-500">Sube tus fotos de avatar y banner</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <ProfileImageUpload
                        currentImageUrl={editProfile.avatar}
                        userId={userId || ''}
                        type="avatar"
                        onImageUploaded={(imageUrl) => setEditProfile(p => ({ ...p, avatar: imageUrl }))}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <ProfileImageUpload
                        currentImageUrl={editProfile.banner}
                        userId={userId || ''}
                        type="banner"
                        onImageUploaded={(imageUrl) => setEditProfile(p => ({ ...p, banner: imageUrl }))}
                      />
                    </div>
                  </div>

                  {/* Banner Templates */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Banners prediseñados
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {defaultBanners.map((b) => (
                        <button 
                          key={b.url} 
                          type="button" 
                          onClick={() => setEditProfile(p => ({ ...p, banner: b.url }))} 
                          className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
                            editProfile.banner === b.url ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:border-red-400'
                          }`}
                        >
                          <img src={b.url} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[10px] px-2 py-1 truncate">
                            {b.title}
                          </span>
                          {editProfile.banner === b.url && (
                            <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profile Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Edit3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Información personal</h4>
                      <p className="text-sm text-gray-500">Actualiza tu nombre, usuario y biografía</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                      <input
                        value={editProfile.name}
                        onChange={(e) => setEditProfile(p => ({ ...p, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Tu nombre completo"
                      />
                      {errors.name && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs">{errors.name}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Nombre de usuario</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-sm text-gray-500 font-medium">@</span>
                        <input
                          value={editProfile.username}
                          onChange={(e) => setEditProfile(p => ({ ...p, username: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="usuario"
                        />
                      </div>
                      {errors.username && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs">{errors.username}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Biografía</label>
                    <textarea
                      value={editProfile.bio}
                      onChange={(e) => setEditProfile(p => ({ ...p, bio: e.target.value }))}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                      placeholder="Cuéntanos sobre ti, tu estilo de escritura, intereses..."
                    />
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`${errors.bio ? 'text-red-600' : 'text-gray-500'} font-medium`}>
                          {editProfile.bio.length}/{maxBioLen} caracteres
                        </span>
                        {editProfile.bio.length > maxBioLen * 0.8 && (
                          <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs">
                            Cerca del límite
                          </span>
                        )}
                      </div>
                      {errors.bio && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{errors.bio}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetDefaults}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restablecer
              </Button>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowEdit(false)}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  className={`px-8 py-2.5 font-medium shadow-lg transition-all ${
                    Object.keys(errors).length > 0
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 hover:shadow-xl'
                  } text-white`}
                  onClick={saveEdit} 
                  disabled={Object.keys(errors).length > 0}
                >
                  {Object.keys(errors).length > 0 ? (
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Corrige errores
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar cambios
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


