'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Flame, Compass, Calendar, PenTool, Home, Library, Bookmark, Bell, MessageCircle, UserPlus, AtSign, Eye, TrendingUp, ChevronRight, Users, BadgeCheck } from 'lucide-react'
import OptimizedImage from '@/components/OptimizedImage'

export default function ExplorePage() {
  const router = useRouter()
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week')
  const [type, setType] = useState<'all' | 'fiction' | 'newsletter' | 'article'>('all')
  const [tag, setTag] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'saved'>('explore')
  const [showNotifications, setShowNotifications] = useState(false)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const toggleSaved = (id: string) =>
    setSaved(prev => ({ ...prev, [id]: !prev[id] }))

  const trendingTags = useMemo(() => [
    { tag: '#Descubrimientos', posts: '1.2k publicaciones', delta: '+15%' },
    { tag: '#HistoriasCortas', posts: '980 publicaciones', delta: '+8%' },
    { tag: '#FicciónLatam', posts: '820 publicaciones', delta: '+12%' },
    { tag: '#Ensayos', posts: '640 publicaciones', delta: '+5%' },
    { tag: '#Poemas', posts: '1.6k publicaciones', delta: '+22%' },
    { tag: '#Teatro', posts: '430 publicaciones', delta: '+3%' },
    { tag: '#Newsletters', posts: '700 publicaciones', delta: '+9%' }
  ], [])

  const suggestedAuthors = useMemo(() => [
    { name: 'Elena Martínez', username: '@elena_writes', followers: '12.5k', genre: 'Poesía', verified: true },
    { name: 'Carlos Ruiz', username: '@carlos_stories', followers: '8.9k', genre: 'Narrativa', verified: false },
    { name: 'Ana García', username: '@ana_teatro', followers: '6.2k', genre: 'Teatro', verified: true },
    { name: 'Lucía P.', username: '@lucia_letters', followers: '4.1k', genre: 'Narrativa', verified: false },
  ], [])

  const items = useMemo(() => (
    [
      {
        id: 'p1',
        title: 'Caminos de sal y viento',
        excerpt: 'En el altiplano, la sal brillaba como un cielo invertido...'
          + ' y no había más sonido que el viento contándonos historias antiguas.',
        author: { name: 'María González', username: '@mariagonzalez', avatar: '/api/placeholder/40/40' },
        cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=630&fit=crop',
        genre: 'Fantasía',
        readTime: '8 min',
        type: 'fiction',
      },
      {
        id: 'p2',
        title: 'Lo que aprendí publicando 20 newsletters',
        excerpt: 'De métricas a comunidad: las claves que realmente importan cuando escribes cada semana.',
        author: { name: 'Javier Torres', username: '@javi_news', avatar: '/api/placeholder/40/40' },
        cover: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop',
        genre: 'Newsletter',
        readTime: '6 min',
        type: 'newsletter',
      },
      {
        id: 'p3',
        title: 'Por qué el teatro breve está de regreso',
        excerpt: 'Ritmo, espacios pequeños y audiencia digital: una combinación inesperadamente poderosa.',
        author: { name: 'Ana García', username: '@ana_teatro', avatar: '/api/placeholder/40/40' },
        cover: 'https://images.unsplash.com/photo-1523246191919-5f75f0f7c5bb?w=1200&h=630&fit=crop',
        genre: 'Teatro',
        readTime: '5 min',
        type: 'article',
      },
      {
        id: 'p4',
        title: 'La carta que nunca envié',
        excerpt: 'Te escribí tantas veces que perdí la cuenta. Esta es la versión que mereces leer.',
        author: { name: 'Lucía P.', username: '@lucia_letters', avatar: '/api/placeholder/40/40' },
        cover: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=1200&h=630&fit=crop',
        genre: 'Narrativa',
        readTime: '7 min',
        type: 'fiction',
      },
    ]
  ), [])

  const filtered = items.filter(i => (type === 'all' || i.type === type) && (!tag || i.genre.toLowerCase().includes(tag.toLowerCase()) || i.title.toLowerCase().includes(tag.toLowerCase())))

  const navigationItems = useMemo(() => [
    { icon: Home, label: 'Inicio', id: 'feed' },
    { icon: Compass, label: 'Explorar', id: 'explore' },
    { icon: PenTool, label: 'Mis Obras', id: 'my-stories' },
    { icon: Library, label: 'Biblioteca', id: 'library' },
    { icon: Bookmark, label: 'Favoritos', id: 'saved' }
  ], [])

  const NavigationButton = React.useMemo(() => {
    return ({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => {
      const Icon = item.icon
      return (
        <Button
          variant={isActive ? 'default' : 'ghost'}
          className={`w-full justify-start text-sm transition-all duration-200 ${isActive ? 'bg-red-600 text-white hover:bg-red-700' : 'text-gray-700 hover:text-red-700 hover:bg-red-50'}`}
          onClick={onClick}
        >
          <Icon className="h-4 w-4 mr-3" />
          {item.label}
        </Button>
      )
    }
  }, [])

  const handleNav = (tabId: string) => {
    setActiveTab(tabId as any)
    if (tabId === 'explore') router.push('/explore')
    else if (tabId === 'feed') router.push('/main')
    else if (tabId === 'my-stories') router.push('/main?tab=my-stories')
    else if (tabId === 'library') router.push('/main?tab=library')
    else if (tabId === 'saved') router.push('/main?tab=saved')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (identical to /main) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-10 sm:px-16 lg:px-24 xl:px-32">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 overflow-hidden rounded-md flex items-center justify-center bg-transparent">
                <div className="relative h-[200%] w-[200%] -m-[50%]">
                  <Image src="/1.png" alt="Palabreo logo" fill sizes="56px" className="object-cover" priority />
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-red-600 [font-family:var(--font-poppins)]">
                Palabreo
              </h1>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar obras, autores..."
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white text-sm"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3 relative">
              <Button variant="ghost" size="sm" className="md:hidden">
                <Search className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-600 hover:text-red-600 hover:bg-red-50"
                onClick={() => setShowNotifications((v) => !v)}
                aria-expanded={showNotifications}
                aria-haspopup="menu"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <Button className="hidden md:inline-flex bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm" onClick={() => router.push('/writer')}>
                <PenTool className="h-4 w-4 mr-2" />
                Publicar
              </Button>
              
              <button onClick={() => router.push('/profile')} aria-label="Ir a mi perfil" className="rounded-full focus:outline-none focus:ring-2 focus:ring-red-600">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback className="text-xs bg-red-100 text-red-700">TU</AvatarFallback>
                </Avatar>
              </button>

              {showNotifications && (
                <div
                  role="menu"
                  aria-label="Notificaciones recientes"
                  className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-sm font-semibold text-red-800">Recientes</div>
                  <ul className="max-h-80 overflow-auto divide-y divide-gray-100">
                    <li className="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <MessageCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Nuevo comentario</div>
                          <div className="text-xs text-gray-600">Ana comentó tu capítulo “El último tren”.</div>
                        </div>
                      </div>
                    </li>
                    <li className="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <UserPlus className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Nuevo seguidor</div>
                          <div className="text-xs text-gray-600">Carlos empezó a seguirte.</div>
                        </div>
                      </div>
                    </li>
                    <li className="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <AtSign className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Mención</div>
                          <div className="text-xs text-gray-600">Te mencionaron en “Versos al amanecer”.</div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Carousel (same patrón que /main) */}
      <div className="lg:hidden max-w-full mx-auto px-0 sm:px-14 lg:px-24 xl:px-32">
        <div className="flex items-stretch border-b border-gray-200 bg-white">
          {[
            { icon: Home, label: 'Inicio', id: 'feed' },
            { icon: Compass, label: 'Explorar', id: 'explore' },
            { icon: Bookmark, label: 'Guardados', id: 'saved' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex-1 inline-flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors ${activeTab === item.id ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-full mx-auto px-8 sm:px-16 lg:px-24 xl:px-32 py-6">
        {/* Hero + Filters */}
        <section className="mb-6">
          <div className="flex items-center gap-2 text-gray-700 mb-3">
            <Compass className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold">Explorar</h2>
          </div>
          <p className="text-sm text-gray-600 mb-5">Descubre obras, autores y newsletters que podrían encantarte.</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full p-1.5">
              {(['today','week','month'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3.5 py-1.5 text-xs rounded-full ${period===p?'bg-red-600 text-white':'text-gray-700 hover:text-red-700'}`}>
                  <Calendar className="h-3.5 w-3.5 inline-block mr-1" /> {p==='today'?'Hoy':p==='week'?'Semana':'Mes'}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full p-1.5">
              {([
                {k:'all',l:'Todo'},
                {k:'fiction',l:'Ficción'},
                {k:'newsletter',l:'Newsletter'},
                {k:'article',l:'Artículo'}
              ] as const).map(o => (
                <button key={o.k} onClick={() => setType(o.k)} className={`px-3.5 py-1.5 text-xs rounded-full ${type===o.k?'bg-red-600 text-white':'text-gray-700 hover:text-red-700'}`}>{o.l}</button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Left: Trending / Authors */}
          <aside className="xl:col-span-3 space-y-7 order-2 lg:order-1">
            {/* Desktop Navigation Panel */}
            <Card className="hidden lg:block bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <CardContent className="p-6 pt-6">
                <nav className="space-y-1">
                  {navigationItems.map(item => (
                    <NavigationButton key={item.id} item={item} isActive={activeTab === item.id} onClick={() => handleNav(item.id)} />
                  ))}
                </nav>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 rounded-lg">
              <CardHeader className="p-5 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-red-800 flex items-center gap-2"><Flame className="h-4 w-4" /> Tendencias</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div role="list" className="space-y-2.5">
                  {trendingTags.map(t => (
                    <button
                      key={t.tag}
                      onClick={() => setTag(t.tag.replace('#',''))}
                      role="listitem"
                      aria-label={`Filtrar por tendencia ${t.tag}, ${t.posts}, variación ${t.delta}`}
                      className="w-full px-3.5 py-2.5 rounded-lg hover:bg-red-50 text-sm text-gray-800 border border-transparent hover:border-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 whitespace-normal break-words max-w-full">{t.tag}</Badge>
                        <span className="text-xs text-gray-500 truncate">• {t.posts}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> {t.delta}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-lg">
              <CardHeader className="p-5 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-red-800">Autores sugeridos</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div role="list" className="space-y-3.5">
                  {suggestedAuthors.map(a => (
                    <div role="listitem" key={a.username} className="flex flex-wrap items-center justify-between gap-2 w-full p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-8 w-8 ring-2 ring-red-100/60 flex-shrink-0">
                          <AvatarImage src="/api/placeholder/40/40" />
                          <AvatarFallback className="text-xs bg-red-50 text-red-700">{a.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div className="text-sm font-semibold text-gray-900 truncate">{a.name}</div>
                            {a.verified && <BadgeCheck className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{a.username}</div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                            <Badge variant="outline" className="px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-full sm:max-w-[140px]">{a.genre}</Badge>
                            <span className="inline-flex items-center gap-1 text-gray-500">
                              <Users className="h-3 w-3" /> {a.followers}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button aria-label={`Seguir a ${a.name}`} size="sm" variant="outline" className="text-xs border-red-300 text-red-600 hover:bg-red-100 flex-shrink-0 inline-flex items-center w-full sm:w-auto mt-2 sm:mt-0">
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Seguir
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Right: Grid of discoveries */}
          <section className="xl:col-span-9 order-1 lg:order-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
              {filtered.map(card => (
                <ExploreItemCard
                  key={card.id}
                  card={card}
                  saved={!!saved[card.id]}
                  onToggleSaved={() => toggleSaved(card.id)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

// Card with mobile long-press overlay controls
function ExploreItemCard({ card, saved, onToggleSaved }: { card: any; saved: boolean; onToggleSaved: () => void }) {
  const [isLongPressActive, setIsLongPressActive] = useState<boolean>(false)
  const longPressTimerRef = React.useRef<number | null>(null)
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null)
  const LONG_PRESS_MS = 350
  const MOVE_THRESHOLD_PX = 10

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }
  const onTouchStartCard = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, textarea, [role="button"]')) return
    const t = e.touches[0]
    touchStartPosRef.current = { x: t.clientX, y: t.clientY }
    clearLongPressTimer()
    longPressTimerRef.current = window.setTimeout(() => {
      setIsLongPressActive(true)
      try { (navigator as any).vibrate && (navigator as any).vibrate(10) } catch {}
    }, LONG_PRESS_MS)
  }
  const onTouchMoveCard = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return
    const t = e.touches[0]
    const dx = Math.abs(t.clientX - touchStartPosRef.current.x)
    const dy = Math.abs(t.clientY - touchStartPosRef.current.y)
    if (dx > MOVE_THRESHOLD_PX || dy > MOVE_THRESHOLD_PX) {
      clearLongPressTimer()
    }
  }
  const onTouchEndCard = () => {
    clearLongPressTimer()
    touchStartPosRef.current = null
  }
  const onShare = async () => {
    try {
      const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${card.id}` : `https://palabreo.com/post/${card.id}`
      if (navigator.share) {
        await navigator.share({ url: shareUrl, title: card.title, text: 'Mira este post en Palabreo' })
      } else {
        await navigator.clipboard.writeText(shareUrl)
      }
    } catch {}
  }
  const onRepost = () => {
    try {
      const key = 'palabreo-reposts'
      const raw = localStorage.getItem(key)
      const list: any[] = raw ? JSON.parse(raw) : []
      const item = { id: card.id, title: card.title, author: card.author, excerpt: (card.excerpt || '').slice(0, 160), image: card.cover || null, time: Date.now() }
      const exists = list.some(x => x && x.id === card.id)
      const next = exists ? list : [...list, item]
      localStorage.setItem(key, JSON.stringify(next))
    } catch {}
  }

  return (
    <Card
      className={`relative group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all focus-within:ring-2 focus-within:ring-red-500 ${isLongPressActive ? 'scale-[0.98] brightness-95' : ''}`}
      onTouchStart={onTouchStartCard}
      onTouchMove={onTouchMoveCard}
      onTouchEnd={onTouchEndCard}
      onContextMenu={(e) => { e.preventDefault() }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-2/5 h-44 sm:h-48 md:h-56 lg:h-64 xl:h-72 overflow-hidden">
          <Image
            src={card.cover}
            alt={card.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <button
            type="button"
            aria-label={saved ? 'Quitar de guardados' : 'Guardar'}
            aria-pressed={!!saved}
            onClick={onToggleSaved}
            className={`absolute top-3 right-3 z-10 rounded-full bg-white/90 backdrop-blur px-2.5 py-2 shadow-sm transition-colors ${saved ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] bg-red-50/90 text-red-700 border-red-200">{card.genre}</Badge>
            <span className="text-xs text-white/90 bg-black/30 px-2 py-0.5 rounded-full">{card.readTime}</span>
          </div>
        </div>
        <CardContent className="flex-1 p-4 md:p-5 lg:p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1.5 md:mb-2 line-clamp-2 md:line-clamp-2">
            {card.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 md:line-clamp-3 mb-3 md:mb-4">{card.excerpt}</p>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8 ring-2 ring-red-100/60 flex-shrink-0">
                <AvatarImage src={card.author.avatar} />
                <AvatarFallback className="text-[10px] bg-red-50 text-red-700">{card.author.name.split(' ').map((n:string)=>n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="text-sm text-gray-700 truncate">{card.author.name}</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-red-300 text-red-600 hover:bg-red-100 inline-flex items-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" /> Abrir
            </Button>
          </div>
        </CardContent>
      </div>
      {isLongPressActive && (
        <div className="absolute inset-0 z-50 md:hidden" onClick={() => setIsLongPressActive(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 shadow-xl border border-gray-200 px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-around">
              <button
                onClick={() => { onToggleSaved(); setIsLongPressActive(false) }}
                className={`flex flex-col items-center text-xs ${saved ? 'text-yellow-600' : 'text-gray-700'}`}
                aria-label="Guardar"
              >
                <Bookmark className={`h-6 w-6 ${saved ? 'fill-yellow-500' : ''}`} />
                <span className="mt-1">Guardar</span>
              </button>
              <button
                onClick={() => { onRepost(); setIsLongPressActive(false) }}
                className="flex flex-col items-center text-xs text-gray-700"
                aria-label="Repostear"
              >
                <Repeat2 className="h-6 w-6" />
                <span className="mt-1">Repostear</span>
              </button>
              <button
                onClick={async () => { await onShare(); setIsLongPressActive(false) }}
                className="flex flex-col items-center text-xs text-gray-700"
                aria-label="Compartir"
              >
                <Share2 className="h-6 w-6" />
                <span className="mt-1">Compartir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

