'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Bookmark, UserPlus, Edit3, Repeat2, Share2, Copy, Trash2, Image as ImageIcon } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'works' | 'saved' | 'reposts'>('works')
  const [reposts, setReposts] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
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
  const [editProfile, setEditProfile] = useState<Profile>(profile)
  const [showEdit, setShowEdit] = useState(false)
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
    try {
      const raw = localStorage.getItem('palabreo-profile')
      if (raw) {
        const saved = JSON.parse(raw) as Profile
        if (saved && typeof saved === 'object') {
          setProfile({
            name: saved.name || defaultProfile.name,
            username: (saved.username || defaultProfile.username).replace(/^@+/, ''),
            bio: saved.bio ?? defaultProfile.bio,
            avatar: saved.avatar || defaultProfile.avatar,
            banner: saved.banner || '',
          })
        }
      }
      const rp = localStorage.getItem('palabreo-reposts')
      if (rp) {
        const list = JSON.parse(rp)
        if (Array.isArray(list)) setReposts(list.sort((a: any, b: any) => b.time - a.time))
      }
    } catch {}
  }, [])

  const openEdit = () => {
    setEditProfile(profile)
    setShowEdit(true)
  }

  const saveEdit = () => {
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
    try { localStorage.setItem('palabreo-profile', JSON.stringify(cleaned)) } catch {}
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
    if (!(avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/'))) e.avatar = 'URL de avatar inválida. Usa http(s) o ruta absoluta.'
    const banner = (p.banner || '').trim()
    if (banner && !(banner.startsWith('http://') || banner.startsWith('https://') || banner.startsWith('/'))) e.banner = 'URL de banner inválida.'
    return e
  }

  useEffect(() => {
    setErrors(validate(editProfile))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editProfile.name, editProfile.username, editProfile.bio, editProfile.avatar])

  const stats = useMemo(() => ({
    works: 18,
    followers: '2.4k',
    following: 312,
  }), [])

  const works = useMemo(() => [
    { id: 1, title: 'El susurro del viento', type: 'Novela', reads: '12.5k', cover: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=640&h=360&fit=crop' },
    { id: 2, title: 'Versos de medianoche', type: 'Poesía', reads: '8.1k', cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop' },
    { id: 3, title: 'Crónicas del andén', type: 'Relato', reads: '5.7k', cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop' },
  ], [])

  // Quick actions for works (mobile long-press and desktop menu)
  const [activeWorkOverlayId, setActiveWorkOverlayId] = useState<number | null>(null)
  const [activeOverlayPos, setActiveOverlayPos] = useState<{ x: number; y: number } | null>(null)
  const overlayTimerRef = React.useRef<number | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const activationTriggeredRef = React.useRef<boolean>(false)
  const lastHoverIndexRef = React.useRef<number | null>(null)
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null)
  const LONG_PRESS_MS = 350
  const MOVE_THRESHOLD_PX = 10
  const scrollLockedRef = React.useRef<boolean>(false)
  const scrollLockPosRef = React.useRef<number>(0)

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

  return (
    <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
      {/* Header (brand) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div onClick={() => router.push('/main')} className="h-12 w-12 overflow-hidden rounded-md flex items-center justify-center bg-transparent cursor-pointer" title="Ir al inicio" aria-label="Ir al inicio" role="link">
                <div className="relative h-[200%] w-[200%] -m-[50%]">
                  <Image src="/1.png" alt="Palabreo logo" fill sizes="56px" className="object-cover" priority />
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-red-600 cursor-pointer" onClick={() => router.push('/main')}>
                Palabreo
              </h1>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push('/landing')}>
                Landing
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs" onClick={() => router.push('/writer')}>
                Escribir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile cover + header */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map(w => (
              <Card key={w.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden relative">
                <div
                  className="relative h-48 sm:h-56 lg:h-64 w-full touch-manipulation"
                  onTouchStart={onTouchStartWork(w.id)}
                  onTouchMove={onTouchMoveWork}
                  onTouchEnd={onTouchEndWork}
                  style={{ touchAction: 'none' }}
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
                    onClick={() => { setActiveWorkOverlayId(null); setActiveOverlayPos(null); setHoverIndex(null); unlockBodyScroll() }}
                    onTouchMove={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onWheel={(e) => { e.preventDefault() }}
                    onTouchEnd={() => { setActiveWorkOverlayId(null); setActiveOverlayPos(null); setHoverIndex(null); activationTriggeredRef.current = false; unlockBodyScroll() }}
                    onTouchCancel={() => { setActiveWorkOverlayId(null); setActiveOverlayPos(null); setHoverIndex(null); activationTriggeredRef.current = false; unlockBodyScroll() }}
                    onPointerMove={(e) => { e.preventDefault() }}
                    style={{ touchAction: 'none' }}
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
                        const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (ev) => {
                          if (!activeOverlayPos) return
                          const t = ev.touches[0]
                          const dx = t.clientX - centerX
                          const dy = t.clientY - centerY
                          const r = Math.hypot(dx, dy)
                          if (r < safeRadius * 0.6) {
                            setHoverIndex(null)
                            return
                          }
                          // Angle in degrees [0,360)
                          let deg = Math.atan2(dy, dx) * (180 / Math.PI)
                          if (deg < 0) deg += 360
                          // Normalize relative to startDeg
                          const start = startDeg < 0 ? startDeg + 360 : startDeg
                          const angleNorm = (deg - start + 360) % 360
                          const idx = Math.floor((angleNorm + (stepDeg / 2)) / stepDeg) % actions.length
                          if (idx !== lastHoverIndexRef.current) {
                            try { (navigator as any).vibrate && (navigator as any).vibrate(8) } catch {}
                            lastHoverIndexRef.current = idx
                          }
                          setHoverIndex(idx)
                          // Ejecutar acción al alcanzar el anillo exterior
                          if (r >= safeRadius * 0.7 && !activationTriggeredRef.current) {
                            activationTriggeredRef.current = true
                            const a = actions[idx]
                            a.onClick()
                            setActiveWorkOverlayId(null)
                            setActiveOverlayPos(null)
                            setHoverIndex(null)
                            unlockBodyScroll()
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
                          const px = ev.clientX
                          const py = ev.clientY
                          const dx = px - centerX
                          const dy = py - centerY
                          const r = Math.hypot(dx, dy)
                          if (r < safeRadius * 0.6) {
                            setHoverIndex(null)
                            return
                          }
                          let deg = Math.atan2(dy, dx) * (180 / Math.PI)
                          if (deg < 0) deg += 360
                          const start = startDeg < 0 ? startDeg + 360 : startDeg
                          const angleNorm = (deg - start + 360) % 360
                          const idx = Math.floor((angleNorm + (stepDeg / 2)) / stepDeg) % actions.length
                          if (idx !== lastHoverIndexRef.current) {
                            try { (navigator as any).vibrate && (navigator as any).vibrate(8) } catch {}
                            lastHoverIndexRef.current = idx
                          }
                          setHoverIndex(idx)
                          if (r >= safeRadius * 0.7 && !activationTriggeredRef.current) {
                            activationTriggeredRef.current = true
                            const a = actions[idx]
                            a.onClick()
                            setActiveWorkOverlayId(null)
                            setActiveOverlayPos(null)
                            setHoverIndex(null)
                            unlockBodyScroll()
                          }
                          ev.preventDefault()
                          ev.stopPropagation()
                        }
                        const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          setActiveWorkOverlayId(null)
                          setActiveOverlayPos(null)
                          setHoverIndex(null)
                          activationTriggeredRef.current = false
                          unlockBodyScroll()
                        }
                        const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
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
                                  style={{ top, left, animationDelay: `${i * 40}ms` }}
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
      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Editar perfil</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-500 hover:text-gray-700 text-sm">Cerrar</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nombre</label>
                <input
                  value={editProfile.name}
                  onChange={(e) => setEditProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Usuario</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-sm text-gray-600">@</span>
                  <input
                    value={editProfile.username}
                    onChange={(e) => setEditProfile(p => ({ ...p, username: e.target.value }))}
                    className="w-full border border-gray-300 rounded-r-md px-3 py-2 text-sm"
                  />
                </div>
                {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Bio</label>
                <textarea
                  value={editProfile.bio}
                  onChange={(e) => setEditProfile(p => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className={errors.bio ? 'text-red-600' : 'text-gray-500'}>
                    {editProfile.bio.length}/{maxBioLen}
                  </span>
                  {errors.bio && <span className="text-red-600">{errors.bio}</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Avatar (URL)</label>
                <input
                  value={editProfile.avatar}
                  onChange={(e) => setEditProfile(p => ({ ...p, avatar: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                {errors.avatar && <p className="mt-1 text-xs text-red-600">{errors.avatar}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Banner (URL)</label>
                <input
                  value={editProfile.banner}
                  onChange={(e) => setEditProfile(p => ({ ...p, banner: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">O elige uno por defecto:</p>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-auto pr-1">
                  {defaultBanners.map((b) => (
                    <button key={b.url} type="button" onClick={() => setEditProfile(p => ({ ...p, banner: b.url }))} className="relative h-16 rounded-md overflow-hidden border border-gray-200 hover:ring-2 hover:ring-red-400">
                      <img src={b.url} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-1 py-0.5 truncate">{b.title}</span>
                    </button>
                  ))}
                </div>
                {errors.banner && <p className="mt-1 text-xs text-red-600">{errors.banner}</p>}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetDefaults}>Restablecer</Button>
              <Button variant="outline" size="sm" onClick={() => setShowEdit(false)}>Cancelar</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50" onClick={saveEdit} disabled={Object.keys(errors).length > 0}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


