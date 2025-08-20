'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Bookmark, UserPlus, Edit3, Repeat2, Share2, Copy, Trash2, Image as ImageIcon } from 'lucide-react'
import ProfileImageUpload from '@/components/ProfileImageUpload'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import ProfileWorksGridNew from '@/components/GridStack/ProfileWorksGridNew'
import { WorkType } from '@/lib/validations'
import { dateUtils } from '@/lib/date-utils'
import AppHeader from '@/components/AppHeader'
import ProfileSkeleton from '@/components/ProfileSkeleton'

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'works' | 'saved' | 'reposts'>('works')
  const [reposts, setReposts] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [hasLoadedFromDB, setHasLoadedFromDB] = useState(false)
  // Suponemos perfil propio por ahora (sin auth). Oculta Seguir.
  const isOwnProfile = true

  type Profile = {
    name: string
    username: string
    bio: string
    avatar: string
    banner: string
  }
  const [profile, setProfile] = useState<Profile>({
    name: 'María González',
    username: 'mariagonzalez',
    bio: 'Escritora de ficción contemporánea. Amante de las historias que transforman. Café, gatos y metáforas.',
    avatar: '/api/placeholder/112/112',
    banner: '',
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [editProfile, setEditProfile] = useState<Profile>(profile)
  const [showEdit, setShowEdit] = useState(false)
  const [works, setWorks] = useState<WorkType[]>([])
  const [isLoadingWorks, setIsLoadingWorks] = useState(true)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const defaultProfile: Profile = {
    name: 'María González',
    username: 'mariagonzalez',
    bio: 'Escritora de ficción contemporánea. Amante de las historias que transforman. Café, gatos y metáforas.',
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

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true)
      
      // First, try to load from localStorage for immediate display (but don't show it yet)
      let cachedProfile: Profile | null = null
      try {
        const raw = localStorage.getItem('palabreo-profile')
        if (raw) {
          const saved = JSON.parse(raw) as Profile
          if (saved && typeof saved === 'object') {
            cachedProfile = {
              name: saved.name || defaultProfile.name,
              username: (saved.username || defaultProfile.username).replace(/^@+/, ''),
              bio: saved.bio ?? defaultProfile.bio,
              avatar: saved.avatar || defaultProfile.avatar,
              banner: saved.banner || '',
            }
          }
        }
        const rp = localStorage.getItem('palabreo-reposts')
        if (rp) {
          const list = JSON.parse(rp)
          if (Array.isArray(list)) setReposts(list.sort((a: any, b: any) => b.time - a.time))
        }
      } catch {}
      
      // Now try to load from database
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          setUserId(userData.user.id)
          const { data: prof } = await supabase
            .from('profiles')
            .select('username,name,bio,avatar_url,banner_url')
            .eq('id', userData.user.id)
            .single()
          
          if (prof) {
            // Database data found - use it
            const dbProfile = {
              name: prof.name || defaultProfile.name,
              username: (prof.username || defaultProfile.username).replace(/^@+/, ''),
              bio: prof.bio ?? defaultProfile.bio,
              avatar: prof.avatar_url || defaultProfile.avatar,
              banner: prof.banner_url || '',
            }
            setProfile(dbProfile)
            setHasLoadedFromDB(true)
            
            // Update localStorage with fresh data
            try {
              localStorage.setItem('palabreo-profile', JSON.stringify(dbProfile))
            } catch {}
          } else if (cachedProfile) {
            // No database data, but we have cached data
            setProfile(cachedProfile)
          } else {
            // No data anywhere, use default
            setProfile(defaultProfile)
          }
        } else if (cachedProfile) {
          // Not authenticated, but we have cached data
          setProfile(cachedProfile)
        } else {
          // Not authenticated, no cached data
          setProfile(defaultProfile)
        }
      } catch {
        // Database error, fall back to cached or default
        if (cachedProfile) {
          setProfile(cachedProfile)
        } else {
          setProfile(defaultProfile)
        }
      } finally {
        setIsLoadingProfile(false)
      }
    }
    
    loadProfile()
  }, [])

  // Load works from Supabase
  useEffect(() => {
    const loadWorks = async () => {
      setIsLoadingWorks(true)
      
      try {
        const supabase = getSupabaseBrowserClient()
        
        // Try to get authenticated user first
        let targetUserId = userId
        if (!targetUserId) {
          // If no authenticated user, try to load works for the demo user
          targetUserId = '9f8ff736-aec0-458f-83ae-309b923c5556' // Demo user ID
        }
        
        // Load user's works from database
        const { data: userWorks, error } = await supabase
          .from('works')
          .select('*')
          .eq('author_id', targetUserId)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error loading works:', error)
          // Fall back to default works if error
          setWorks(defaultWorks)
        } else if (userWorks && userWorks.length > 0) {
          // Map database works to WorkType format
          const mappedWorks: WorkType[] = userWorks.map(work => ({
            id: work.id,
            title: work.title || 'Sin título',
            description: work.description || '',
            content: work.content || '',
            author_id: work.author_id,
            genre: work.genre || 'Sin género',
            tags: work.tags || [],
            published: work.published || false,
            reading_time: work.reading_time || 5,
            views: work.views || 0,
            likes: work.likes || 0,
            created_at: work.created_at ? new Date(work.created_at) : new Date(),
            updated_at: work.updated_at ? new Date(work.updated_at) : new Date(),
            coverUrl: work.cover_url || undefined,
          }))
          setWorks(mappedWorks)
        } else {
          // No works in database, use default works for demo
          setWorks(defaultWorks)
        }
      } catch (error) {
        console.error('Error loading works:', error)
        // Fall back to default works on error
        setWorks(defaultWorks)
      } finally {
        setIsLoadingWorks(false)
      }
    }
    
    loadWorks()
  }, [userId]) // Re-load when userId changes

  // Load user statistics
  useEffect(() => {
    const loadStats = async () => {
      setIsLoadingStats(true)
      
      try {
        const supabase = getSupabaseBrowserClient()
        
        // Try to get authenticated user first
        let targetUserId = userId
        if (!targetUserId) {
          // If no authenticated user, try to load stats for the demo user
          targetUserId = '9f8ff736-aec0-458f-83ae-309b923c5556' // Demo user ID
        }
        
        // Get followers count
        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('followee_id', targetUserId)
        
        // Get following count
        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', targetUserId)
        
        setFollowersCount(followersCount || 0)
        setFollowingCount(followingCount || 0)
        
      } catch (error) {
        console.error('Error loading stats:', error)
        // Keep default values on error
      } finally {
        setIsLoadingStats(false)
      }
    }
    
    loadStats()
  }, [userId])

  const openEdit = () => {
    setEditProfile(profile)
    setShowEdit(true)
  }

  const saveEdit = async () => {
    const currentErrors = validate(editProfile)
    setErrors(currentErrors)
    const hasErrors = Object.keys(currentErrors).length > 0
    if (hasErrors) return
    const cleaned: Profile = {
      name: editProfile.name.trim(),
      username: editProfile.username.replace(/^@+/, '').trim(),
      bio: editProfile.bio.trim(),
      avatar: editProfile.avatar.trim(),
      banner: editProfile.banner.trim(),
    }
    setProfile(cleaned)
    try {
      localStorage.setItem('palabreo-profile', JSON.stringify(cleaned))
    } catch {}
    try {
      if (userId) {
        const supabase = getSupabaseBrowserClient()
        await supabase.from('profiles').upsert({
          id: userId,
          username: cleaned.username,
          name: cleaned.name,
          bio: cleaned.bio,
          avatar_url: cleaned.avatar,
          banner_url: cleaned.banner,
        })
      }
    } catch {}
    setShowEdit(false)
  }

  const resetDefaults = () => {
    setEditProfile(defaultProfile)
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

  const stats = useMemo(() => ({
    works: works.length,
    followers: followersCount,
    following: followingCount,
  }), [works.length, followersCount, followingCount])

  const defaultWorks: WorkType[] = [
    { 
      id: '1', 
      title: 'El susurro del viento', 
      description: 'Una novela sobre los secretos que el viento lleva entre las montañas y los corazones que encuentra en su camino.',
      content: 'El viento susurraba secretos entre las montañas...',
      author_id: 'user-1',
      genre: 'Novela', 
      tags: ['romance', 'misterio', 'montañas'],
      published: true,
      reading_time: 45,
      views: 12500, 
      likes: 892,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-20'),
    },
    { 
      id: '2', 
      title: 'Versos de medianoche', 
      description: 'Una colección de poemas escritos en las horas más silenciosas de la noche, cuando el alma habla más claro.',
      content: 'En la medianoche, cuando el mundo duerme...',
      author_id: 'user-1',
      genre: 'Poesía', 
      tags: ['noche', 'soledad', 'reflexión'],
      published: true,
      reading_time: 15,
      views: 8100, 
      likes: 567,
      created_at: new Date('2024-02-01'),
      updated_at: new Date('2024-02-05'),
    },
    { 
      id: '3', 
      title: 'Crónicas del andén', 
      description: 'Historias breves de personas que se cruzan en estaciones de tren, cada una llevando su propio destino.',
      content: 'El andén número tres siempre estaba lleno de historias...',
      author_id: 'user-1',
      genre: 'Relato', 
      tags: ['viajes', 'encuentros', 'destino'],
      published: false,
      reading_time: 25,
      views: 5700, 
      likes: 234,
      created_at: new Date('2024-02-10'),
      updated_at: new Date('2024-02-12'),
    },
  ]

  const [savedLayout, setSavedLayout] = useState<any[]>([])

  // Load saved layout from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('palabreo-profile-layout')
      if (saved) {
        setSavedLayout(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading saved layout:', error)
    }
  }, [])

  // Quick actions for works (mobile long-press and desktop menu)
  const [activeWorkOverlayId, setActiveWorkOverlayId] = useState<number | null>(null)
  const [activeOverlayPos, setActiveOverlayPos] = useState<{ x: number; y: number } | null>(null)
  const overlayTimerRef = React.useRef<number | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const activationTriggeredRef = React.useRef<boolean>(false)
  const lastHoverIndexRef = React.useRef<number | null>(null)
  const touchStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null)
  const LONG_PRESS_MS = 500 // Increased for better reliability
  const MOVE_THRESHOLD_PX = 15 // Increased threshold for better touch handling
  const scrollLockedRef = React.useRef<boolean>(false)
  const scrollLockPosRef = React.useRef<number>(0)
  const rafMoveIdRef = React.useRef<number | null>(null)
  const pendingMoveRef = React.useRef<{ x: number; y: number } | null>(null)
  const isLongPressActiveRef = React.useRef<boolean>(false)
  const touchMoveCountRef = React.useRef<number>(0)

  const preventScrollEvent = React.useCallback((e: Event) => { e.preventDefault() }, [])
  const lockBodyScroll = React.useCallback(() => {
    if (scrollLockedRef.current) return
    const y = window.scrollY || window.pageYOffset || 0
    scrollLockPosRef.current = y
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${y}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    window.addEventListener('touchmove', preventScrollEvent, { passive: false })
    window.addEventListener('wheel', preventScrollEvent, { passive: false })
    document.addEventListener('touchmove', preventScrollEvent, { passive: false })
    document.addEventListener('wheel', preventScrollEvent, { passive: false })
    scrollLockedRef.current = true
  }, [preventScrollEvent])
  const unlockBodyScroll = React.useCallback(() => {
    if (!scrollLockedRef.current) return
    const y = scrollLockPosRef.current || 0
    const body = document.body
    window.removeEventListener('touchmove', preventScrollEvent as any, { passive: false } as any)
    window.removeEventListener('wheel', preventScrollEvent as any, { passive: false } as any)
    document.removeEventListener('touchmove', preventScrollEvent as any, { passive: false } as any)
    document.removeEventListener('wheel', preventScrollEvent as any, { passive: false } as any)
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.width = ''
    body.style.overflow = ''
    window.scrollTo(0, y)
    scrollLockedRef.current = false
  }, [preventScrollEvent])
  const [scrollLockPos, setScrollLockPos] = useState<number | null>(null)

  const clearOverlayTimer = () => {
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current)
      overlayTimerRef.current = null
    }
  }

  React.useEffect(() => {
    return () => {
      clearOverlayTimer()
      unlockBodyScroll()
      if (rafMoveIdRef.current) {
        cancelAnimationFrame(rafMoveIdRef.current)
        rafMoveIdRef.current = null
      }
    }
  }, [unlockBodyScroll])

  // Lock background scroll while radial overlay is open (robust for iOS/Android)
  React.useEffect(() => {
    const isOpen = activeWorkOverlayId != null && !!activeOverlayPos
    const body = typeof document !== 'undefined' ? document.body : null
    const prevent = (e: Event) => { e.preventDefault() }
    if (isOpen && body) {
      const y = window.scrollY || window.pageYOffset || 0
      setScrollLockPos(y)
      // Fix body to prevent scroll and layout shift
      body.style.position = 'fixed'
      body.style.top = `-${y}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'
      body.style.overflow = 'hidden'
      body.style.WebkitTouchCallout = 'none'
      body.style.WebkitUserSelect = 'none'
      body.style.userSelect = 'none'
      // Add non-passive listeners to block touch/scroll at root
      window.addEventListener('touchmove', prevent, { passive: false })
      window.addEventListener('wheel', prevent, { passive: false })
      document.addEventListener('touchmove', prevent, { passive: false })
      document.addEventListener('wheel', prevent, { passive: false })
    }
    return () => {
      if (!body) return
      // Remove listeners
      window.removeEventListener('touchmove', prevent as any, { passive: false } as any)
      window.removeEventListener('wheel', prevent as any, { passive: false } as any)
      document.removeEventListener('touchmove', prevent as any, { passive: false } as any)
      document.removeEventListener('wheel', prevent as any, { passive: false } as any)
      // Restore body scroll position and styles
      const y = scrollLockPos ?? 0
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''
      body.style.overflow = ''
      if (scrollLockPos != null) {
        window.scrollTo(0, y)
        setScrollLockPos(null)
      }
    }
  }, [activeWorkOverlayId, activeOverlayPos, scrollLockPos])

  const onTouchStartWork = (workId: number) => (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
    clearOverlayTimer()
    // Save viewport coordinates for a fixed overlay (can extend beyond card)
    setActiveOverlayPos({ x: t.clientX, y: t.clientY })
    activationTriggeredRef.current = false
    lockBodyScroll()
    try { e.preventDefault(); e.stopPropagation() } catch {}
    overlayTimerRef.current = window.setTimeout(() => {
      setActiveWorkOverlayId(workId)
      try { (navigator as any).vibrate && (navigator as any).vibrate(10) } catch {}
    }, LONG_PRESS_MS)
  }

  const onTouchMoveWork = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const t = e.touches[0]
    const dx = Math.abs(t.clientX - touchStartRef.current.x)
    const dy = Math.abs(t.clientY - touchStartRef.current.y)
    if (dx > MOVE_THRESHOLD_PX || dy > MOVE_THRESHOLD_PX) {
      clearOverlayTimer()
      // If overlay hasn't opened yet, release lock so normal scroll can resume
      if (!activeWorkOverlayId) {
        unlockBodyScroll()
      }
    }
    try { e.preventDefault(); e.stopPropagation() } catch {}
  }

  const onTouchEndWork = () => {
    clearOverlayTimer()
    touchStartRef.current = null
    setHoverIndex(null)
    if (!activeWorkOverlayId) {
      unlockBodyScroll()
    }
  }

  // Pointer Events version (unified for touch/pen; ignore mouse)
  const onPointerDownWork = (workId: number) => (e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, textarea, [role="button"]')) return
    if (e.pointerType === 'mouse') return
    
    const px = e.clientX
    const py = e.clientY
    const currentTime = Date.now()
    
    touchStartRef.current = { x: px, y: py, time: currentTime }
    touchMoveCountRef.current = 0
    isLongPressActiveRef.current = false
    clearOverlayTimer()
    setActiveOverlayPos({ x: px, y: py })
    activationTriggeredRef.current = false
    
    // Prevent default behavior to avoid conflicts
    e.preventDefault()
    e.stopPropagation()
    
    try { (e.currentTarget as any).setPointerCapture(e.pointerId) } catch {}
    
    overlayTimerRef.current = window.setTimeout(() => {
      if (touchStartRef.current && touchMoveCountRef.current < 3) {
        isLongPressActiveRef.current = true
        setActiveWorkOverlayId(workId)
        lockBodyScroll()
        try { 
          if (navigator.vibrate) navigator.vibrate([50])
        } catch {}
      }
    }, LONG_PRESS_MS)
  }

  const onPointerMoveWork = (e: React.PointerEvent) => {
    if (!touchStartRef.current) return
    
    const px = e.clientX
    const py = e.clientY
    const dx = Math.abs(px - touchStartRef.current.x)
    const dy = Math.abs(py - touchStartRef.current.y)
    const totalMove = Math.sqrt(dx * dx + dy * dy)
    
    touchMoveCountRef.current++
    
    // If we're moving too much before long press activates, cancel it
    if (totalMove > MOVE_THRESHOLD_PX && !isLongPressActiveRef.current) {
      clearOverlayTimer()
      if (!activeWorkOverlayId) {
        unlockBodyScroll()
      }
    }
    
    // Prevent default to avoid scroll conflicts
    e.preventDefault()
    e.stopPropagation()
  }

  const onPointerUpWork = (e: React.PointerEvent) => {
    clearOverlayTimer()
    touchStartRef.current = null
    touchMoveCountRef.current = 0
    isLongPressActiveRef.current = false
    setHoverIndex(null)
    
    if (!activeWorkOverlayId) {
      unlockBodyScroll()
    }
    
    try { (e.currentTarget as any).releasePointerCapture(e.pointerId) } catch {}
    e.preventDefault()
    e.stopPropagation()
  }

  const onPointerCancelWork = (e: React.PointerEvent) => {
    clearOverlayTimer()
    touchStartRef.current = null
    touchMoveCountRef.current = 0
    isLongPressActiveRef.current = false
    setHoverIndex(null)
    
    if (!activeWorkOverlayId) {
      unlockBodyScroll()
    }
    
    e.preventDefault()
    e.stopPropagation()
  }

  const shareWork = async (w: any) => {
    try {
      const url = typeof window !== 'undefined' ? `${window.location.origin}/work/${w.id}` : `https://palabreo.com/work/${w.id}`
      if (navigator.share) {
        await navigator.share({ url, title: w.title, text: 'Mira mi obra en Palabreo' })
      } else {
        await navigator.clipboard.writeText(url)
      }
    } catch {}
  }

  const duplicateWork = (w: any) => {
    // Placeholder: only UI feedback for now
    alert(`Duplicado: ${w.title}`)
  }

  const changeCover = (w: any) => {
    alert(`Cambiar portada de: ${w.title}`)
  }

  const deleteWork = (w: any) => {
    if (confirm(`¿Eliminar "${w.title}"? Esta acción no se puede deshacer.`)) {
      alert('Eliminado (demo)')
    }
  }

  const handleWorkEdit = (work: WorkType) => {
    router.push(`/writer?edit=${work.id}`)
  }

  const handleWorkDelete = (workId: string) => {
    const work = works.find(w => w.id === workId)
    if (work && confirm(`¿Eliminar "${work.title}"? Esta acción no se puede deshacer.`)) {
      alert('Eliminado (demo)')
    }
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

  return (
    <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
      {/* Header */}
      <AppHeader />

      {/* Profile cover + header */}
      {isLoadingProfile ? (
        <ProfileSkeleton />
      ) : (
        <section className="bg-white">
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
                  <Image src={profile.avatar || '/api/placeholder/112/112'} alt="Avatar" width={112} height={112} className="object-cover" />
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
                    <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700"><strong className="text-gray-900">{stats.followers}</strong> seguidores</span>
                    <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700"><strong className="text-gray-900">{stats.following}</strong> siguiendo</span>
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
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24">
        {activeTab === 'works' && (
          <>
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
            ) : (
              <ProfileWorksGridNew
                  works={works}
                  onWorkClick={(work) => {
                    console.log('Clicked work:', work.title)
                    // You can navigate to work detail page here
                    // router.push(`/work/${work.id}`)
                  }}
                  onLayoutChange={(layout) => {
                    try {
                      localStorage.setItem('palabreo-profile-layout', JSON.stringify(layout))
                      setSavedLayout(layout)
                    } catch (error) {
                      console.error('Error saving layout:', error)
                    }
                  }}
                  editable={isOwnProfile}
                  savedLayout={savedLayout}
                />
            )}
          </>
        )}

        {activeTab === 'works' && false && ( // Hide old grid implementation
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map(w => (
              <Card key={w.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden relative">
                <div
                  className="relative h-48 sm:h-56 lg:h-64 w-full touch-manipulation select-none"
                  onPointerDown={onPointerDownWork(w.id)}
                  onPointerMove={onPointerMoveWork}
                  onPointerUp={onPointerUpWork}
                  onPointerCancel={onPointerCancelWork}
                  onContextMenu={(e) => { e.preventDefault() }}
                  onTouchStart={(e) => { e.stopPropagation() }}
                  onTouchMove={(e) => { e.stopPropagation() }}
                  onTouchEnd={(e) => { e.stopPropagation() }}
                  style={{ 
                    touchAction: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                >
                  <img src={w.cover} alt={w.title} className="absolute inset-0 w-full h-full object-cover"/>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{w.title}</h3>
                      <div className="text-sm text-gray-600 mt-1">{w.type} · {w.reads} lecturas</div>
                    </div>
                    {/* Desktop inline menu */}
                    <div className="hidden sm:flex items-center gap-2">
                      <button className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => router.push(`/writer?edit=${w.id}`)}>
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => duplicateWork(w)}>
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => changeCover(w)}>
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <button className="text-xs px-2 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50" onClick={() => deleteWork(w)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => shareWork(w)}>
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>

                {/* Mobile long-press overlay: radial menu at touch point */}
                {activeWorkOverlayId === w.id && activeOverlayPos && (
                  <div
                    className="sm:hidden fixed inset-0 z-30 overscroll-none select-none"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Acciones de obra"
                    onClick={() => { setActiveWorkOverlayId(null); setActiveOverlayPos(null); setHoverIndex(null); unlockBodyScroll() }}
                    onTouchMove={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onWheel={(e) => { e.preventDefault() }}
                    onTouchEnd={() => { setActiveWorkOverlayId(null); setActiveOverlayPos(null); setHoverIndex(null); activationTriggeredRef.current = false; unlockBodyScroll() }}
                    onTouchCancel={() => { setActiveWorkOverlayId(null); setActiveOverlayPos(null); setHoverIndex(null); activationTriggeredRef.current = false; unlockBodyScroll() }}
                    onPointerMove={(e) => { e.preventDefault() }}
                    style={{ 
                      touchAction: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm radial-overlay-fade" />
                    {(() => {
                        const centerX = activeOverlayPos.x
                        const centerY = activeOverlayPos.y
                        const vw = typeof window !== 'undefined' ? window.innerWidth : 360
                        const vh = typeof window !== 'undefined' ? window.innerHeight : 640
                        const baseRadius = 104
                        const padding = 24
                        const maxRLeft = Math.max(0, centerX - padding)
                        const maxRRight = Math.max(0, vw - centerX - padding)
                        const maxRTop = Math.max(0, centerY - padding)
                        const maxRBottom = Math.max(0, vh - centerY - padding)
                        const safeRadius = Math.max(64, Math.min(baseRadius, maxRLeft, maxRRight, maxRTop, maxRBottom))
                        const startDeg = -90
                        const stepDeg = 360 / 5
                        const actions = [
                          { label: 'Editar', icon: Edit3, onClick: () => router.push(`/writer?edit=${w.id}`), tone: 'default' as const },
                          { label: 'Duplicar', icon: Copy, onClick: () => duplicateWork(w), tone: 'default' as const },
                          { label: 'Portada', icon: ImageIcon, onClick: () => changeCover(w), tone: 'default' as const },
                          { label: 'Eliminar', icon: Trash2, onClick: () => deleteWork(w), tone: 'danger' as const },
                          { label: 'Compartir', icon: Share2, onClick: () => shareWork(w), tone: 'default' as const },
                        ]
                        const processMove = (x: number, y: number) => {
                          const dx = x - centerX
                          const dy = y - centerY
                          const r = Math.hypot(dx, dy)
                          
                          // Dead zone in center - no selection
                          if (r < safeRadius * 0.4) {
                            setHoverIndex(null)
                            return
                          }
                          
                          // Selection zone - highlight option
                          if (r >= safeRadius * 0.4 && r < safeRadius * 0.8) {
                            let deg = Math.atan2(dy, dx) * (180 / Math.PI)
                            if (deg < 0) deg += 360
                            const start = startDeg < 0 ? startDeg + 360 : startDeg
                            const angleNorm = (deg - start + 360) % 360
                            const idx = Math.floor((angleNorm + (stepDeg / 2)) / stepDeg) % actions.length
                            
                            if (idx !== lastHoverIndexRef.current) {
                              try { 
                                if (navigator.vibrate) navigator.vibrate([15])
                              } catch {}
                              lastHoverIndexRef.current = idx
                            }
                            setHoverIndex(idx)
                          }
                          
                          // Activation zone - trigger action
                          if (r >= safeRadius * 0.8 && !activationTriggeredRef.current && hoverIndex !== null) {
                            activationTriggeredRef.current = true
                            const a = actions[hoverIndex]
                            try { 
                              if (navigator.vibrate) navigator.vibrate([30])
                            } catch {}
                            a.onClick()
                            setActiveWorkOverlayId(null)
                            setActiveOverlayPos(null)
                            setHoverIndex(null)
                            unlockBodyScroll()
                          }
                        }
                        const scheduleProcess = (x: number, y: number) => {
                          pendingMoveRef.current = { x, y }
                          if (rafMoveIdRef.current == null) {
                            rafMoveIdRef.current = window.requestAnimationFrame(() => {
                              const p = pendingMoveRef.current
                              if (p) processMove(p.x, p.y)
                              rafMoveIdRef.current = null
                            })
                          }
                        }
                        const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (ev) => {
                          if (!activeOverlayPos || ev.touches.length === 0) return
                          const t = ev.touches[0]
                          if (t) {
                            scheduleProcess(t.clientX, t.clientY)
                          }
                          ev.preventDefault()
                          ev.stopPropagation()
                        }
                        const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          try { (ev.currentTarget as any).setPointerCapture(ev.pointerId) } catch {}
                        }
                        const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (ev) => {
                          if (!activeOverlayPos) return
                          scheduleProcess(ev.clientX, ev.clientY)
                          ev.preventDefault()
                          ev.stopPropagation()
                        }
                        const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          if (rafMoveIdRef.current != null) {
                            cancelAnimationFrame(rafMoveIdRef.current)
                            rafMoveIdRef.current = null
                          }
                          pendingMoveRef.current = null
                          setActiveWorkOverlayId(null)
                          setActiveOverlayPos(null)
                          setHoverIndex(null)
                          activationTriggeredRef.current = false
                          unlockBodyScroll()
                        }
                        const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          if (rafMoveIdRef.current != null) {
                            cancelAnimationFrame(rafMoveIdRef.current)
                            rafMoveIdRef.current = null
                          }
                          pendingMoveRef.current = null
                          setActiveWorkOverlayId(null)
                          setActiveOverlayPos(null)
                          setHoverIndex(null)
                          activationTriggeredRef.current = false
                          unlockBodyScroll()
                        }
                        return (
                          <div className="fixed inset-0" onClick={(e) => e.stopPropagation()} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
                            {actions.map((a, i) => {
                              const theta = ((startDeg + i * stepDeg) * Math.PI) / 180
                              const top = centerY + safeRadius * Math.sin(theta)
                              const left = centerX + safeRadius * Math.cos(theta)
                              const isActive = hoverIndex === i
                              const common = 'absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md border text-gray-700 bg-white transition-transform duration-200 ease-out radial-pop'
                              const tone = a.tone === 'danger' ? 'border-red-300 text-red-700 bg-red-50' : 'border-gray-200'
                              const ring = isActive ? 'scale-110 ring-2 ring-red-400' : 'scale-100'
                              return (
                                <button
                                  key={a.label}
                                  className={`${common} ${tone} ${ring} w-10 h-10 flex items-center justify-center`}
                                  style={{ top, left, animationDelay: `${i * 40}ms`, willChange: 'transform' }}
                                  onClick={(e) => { e.stopPropagation(); a.onClick(); setActiveWorkOverlayId(null); setActiveOverlayPos(null); setHoverIndex(null) }}
                                  aria-label={a.label}
                                >
                                  <a.icon className="h-5 w-5" />
                                </button>
                              )
                            })}
                            {/* Center hint dot */}
                            <div className="absolute w-3.5 h-3.5 rounded-full bg-white border border-gray-300 shadow" style={{ top: centerY, left: centerX, transform: 'translate(-50%, -50%)' }} />
                          </div>
                        )
                      })()}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="text-sm text-gray-600">Tus obras guardadas aparecerán aquí.</div>
        )}

        {activeTab === 'reposts' && (
          <div className="space-y-3">
            {reposts.length === 0 ? (
              <div className="text-sm text-gray-600">Aún no tienes reposts.</div>
            ) : (
              reposts.map((r) => (
                <Card key={r.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {r.image && (
                    <div className="relative h-36 w-full">
                      <img src={r.image} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Reposteado {new Date(r.time).toLocaleString()}</div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{r.title}</h3>
                    <div className="text-xs text-gray-600 mb-2 truncate">por {r.author?.name} {r.author?.username}</div>
                    <p className="text-sm text-gray-700 line-clamp-2">{r.excerpt}</p>
                  </CardContent>
                </Card>
              ))
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


