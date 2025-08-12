'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Flame, Compass, Calendar, PenTool, Home, Library, Bookmark, Bell, MessageCircle, UserPlus, AtSign, Eye } from 'lucide-react'
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
    '#Descubrimientos', '#HistoriasCortas', '#FicciónLatam', '#Ensayos', '#Poemas', '#Teatro', '#Newsletters'
  ], [])

  const suggestedAuthors = useMemo(() => [
    { name: 'Elena Martínez', username: '@elena_writes' },
    { name: 'Carlos Ruiz', username: '@carlos_stories' },
    { name: 'Ana García', username: '@ana_teatro' },
    { name: 'Lucía P.', username: '@lucia_letters' },
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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="lg:hidden max-w-full mx-auto px-0 sm:px-6 lg:px-8">
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

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left: Trending / Authors */}
          <aside className="lg:col-span-1 space-y-7 order-2 lg:order-1">
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
                <div className="space-y-2.5">
                  {trendingTags.map(t => (
                    <button key={t} onClick={() => setTag(t.replace('#',''))} className="w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-red-50 text-sm text-gray-800 border border-transparent hover:border-red-200">
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 mr-2">{t}</Badge>
                      Explorar
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
                <div className="space-y-3.5">
                  {suggestedAuthors.map(a => (
                    <div key={a.username} className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-8 w-8 ring-2 ring-red-100/60 flex-shrink-0">
                          <AvatarImage src="/api/placeholder/40/40" />
                          <AvatarFallback className="text-xs bg-red-50 text-red-700">{a.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{a.name}</div>
                          <div className="text-xs text-gray-500 truncate">{a.username}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs border-red-300 text-red-600 hover:bg-red-100 flex-shrink-0">Seguir</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Right: Grid of discoveries */}
          <section className="lg:col-span-4 order-1 lg:order-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-7">
              {filtered.map(card => (
                <Card
                  key={card.id}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-red-500"
                >
                  <div className="relative h-44 sm:h-48 lg:h-52 overflow-hidden">
                    <Image
                      src={card.cover}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <button
                      type="button"
                      aria-label={saved[card.id] ? 'Quitar de guardados' : 'Guardar'}
                      aria-pressed={!!saved[card.id]}
                      onClick={() => toggleSaved(card.id)}
                      className={`absolute top-3 right-3 z-10 rounded-full bg-white/90 backdrop-blur px-2.5 py-2 shadow-sm transition-colors ${saved[card.id] ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-red-50/90 text-red-700 border-red-200">{card.genre}</Badge>
                      <span className="text-xs text-white/90 bg-black/30 px-2 py-0.5 rounded-full">{card.readTime}</span>
                    </div>
                  </div>
                  <CardContent className="px-5 pt-6 pb-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3.5">{card.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-7 w-7 ring-2 ring-red-100/60 flex-shrink-0">
                          <AvatarImage src={card.author.avatar} />
                          <AvatarFallback className="text-[10px] bg-red-50 text-red-700">{card.author.name.split(' ').map((n:string)=>n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="text-xs text-gray-700 truncate">{card.author.name}</div>
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
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-7">
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">Cargar más</Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}


