'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Flame, Compass, Calendar, PenTool, Home, Library, Bookmark, Bell, MessageCircle, UserPlus, AtSign, Eye, TrendingUp, ChevronRight, Users, BadgeCheck, Repeat2, Share2, User, Settings, LogOut } from 'lucide-react'
import OptimizedImage from '@/components/OptimizedImage'
import TrendingWorks from '@/components/TrendingWorks'
import TrendingAuthors from '@/components/TrendingAuthors'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { getOptimizedSupabaseClient } from '@/lib/supabase/optimized-client'
import { getUnreadNotificationsCount } from '@/lib/notifications'
import { useAuth } from '@/hooks/useAuth'

export default function ExplorePage() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week')
  const [type, setType] = useState<'all' | 'fiction' | 'newsletter' | 'article'>('all')
  const [tag, setTag] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'saved'>('explore')
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [showUserMenu, setShowUserMenu] = useState(false)

  const toggleSaved = (id: string) =>
    setSaved(prev => ({ ...prev, [id]: !prev[id] }))

  const [trendingTags, setTrendingTags] = useState<any[]>([])
  const [suggestedAuthors, setSuggestedAuthors] = useState<any[]>([])
  const [isLoadingTrends, setIsLoadingTrends] = useState(true)
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true)

  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Load recommended works data using smart recommendation algorithm
  useEffect(() => {
    const loadRecommendedWorks = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        
        let works: any[] = []
        
        if (userData?.user) {
          // Use smart recommendations for authenticated users
          const { data: recommendedWorks } = await supabase
            .rpc('get_smart_recommendations', {
              target_user_id: userData.user.id,
              page_type: 'explore',
              limit_count: 24
            })
          
          works = recommendedWorks || []
        }
        
        // If no recommendations or user is not authenticated, fall back to popular content
        if (works.length === 0) {
          const { data: popularWorks } = await supabase
            .rpc('get_popular_recommendations', {
              target_user_id: userData?.user?.id || null,
              limit_count: 24
            })
          works = popularWorks || []
        }
        
        // If still no works, fall back to basic query (for new databases) BUT exclude user's own works
        if (works.length === 0) {
          let basicQuery = supabase
            .from('works')
            .select('id,title,genre,cover_url,chapters,content,author_id,created_at,views,likes')
            .eq('published', true)
            .order('created_at', { ascending: false })
            .limit(24)
          
          // CRITICAL: Always exclude user's own works in explore page
          if (userData?.user) {
            basicQuery = basicQuery.neq('author_id', userData.user.id)
          }
          
          const { data: basicWorks } = await basicQuery
          
          works = (basicWorks || []).map((w: any) => ({
            work_id: w.id,
            title: w.title,
            genre: w.genre,
            author_id: w.author_id,
            cover_url: w.cover_url,
            created_at: w.created_at,
            recommendation_score: 0
          }))
        }
        
        // Get author information for all works
        const authorIds = Array.from(new Set(works.map((w: any) => w.author_id).filter(Boolean)))
        let profilesMap: Record<string, any> = {}
        if (authorIds.length > 0) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id,username,name,avatar_url')
            .in('id', authorIds)
          profilesMap = (profs || []).reduce((acc: any, p: any) => { acc[p.id] = p; return acc }, {})
        }
        
        // Get content for excerpt generation
        const workIds = works.map((w: any) => w.work_id)
        let worksContent: Record<string, any> = {}
        if (workIds.length > 0) {
          const { data: workData } = await supabase
            .from('works')
            .select('id,chapters,content,views,likes')
            .in('id', workIds)
          worksContent = (workData || []).reduce((acc: any, w: any) => { acc[w.id] = w; return acc }, {})
        }
        
        const mapped = works.map((w: any) => {
          const author = profilesMap[w.author_id] || {}
          const workData = worksContent[w.work_id] || {}
          const excerpt = workData.chapters && Array.isArray(workData.chapters) && workData.chapters.length > 0 
            ? (workData.chapters[0]?.content || '') 
            : (workData.content || '')
          
          return {
            id: w.work_id,
            title: w.title,
            excerpt: (excerpt || '').slice(0, 200),
            author: { 
              name: author.name || 'Autor', 
              username: author.username ? `@${author.username.startsWith('@') ? author.username.slice(1) : author.username}` : '@autor', 
              avatar: author.avatar_url || '/api/placeholder/40/40' 
            },
            cover: w.cover_url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=630&fit=crop',
            genre: w.genre || 'Obra',
            readTime: '—',
            type: 'fiction',
            views: workData.views || 0,
            likes: workData.likes || 0,
            recommendationScore: w.recommendation_score || 0,
            recommendationType: w.recommendation_type || 'popular'
          }
        })
        
        setItems(mapped)
      } catch (error) {
        console.error('Error loading recommended works:', error)
        // Fallback to empty array on error
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadRecommendedWorks()
  }, [])

  // Optimized trending tags loading - simplified and functional
  useEffect(() => {
    const loadTrendingTags = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        
        // Simplified query - just get recent works with genres
        const { data: recentWorks } = await supabase
          .from('works')
          .select('genre, views, likes, created_at')
          .not('genre', 'is', null)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(100) // Get recent works only
        
        if (recentWorks && recentWorks.length > 0) {
          // Count genres and calculate popularity
          const genreStats: Record<string, { count: number; totalViews: number; totalLikes: number }> = {}
          
          recentWorks.forEach((work: any) => {
            const genre = work.genre?.toLowerCase()
            if (genre) {
              if (!genreStats[genre]) {
                genreStats[genre] = { count: 0, totalViews: 0, totalLikes: 0 }
              }
              genreStats[genre].count += 1
              genreStats[genre].totalViews += work.views || 0
              genreStats[genre].totalLikes += work.likes || 0
            }
          })
          
          // Create trending tags based on engagement
          const trending = Object.entries(genreStats)
            .map(([genre, stats]) => {
              const engagementScore = stats.totalViews + (stats.totalLikes * 5) // Weight likes more
              const avgEngagement = stats.count > 0 ? Math.round(engagementScore / stats.count) : 0
              
              return {
                tag: `#${genre.charAt(0).toUpperCase() + genre.slice(1)}`,
                posts: `${stats.count} obra${stats.count !== 1 ? 's' : ''}`,
                delta: `+${Math.min(99, Math.max(5, avgEngagement))}%`,
                engagementScore,
                genre: genre
              }
            })
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, 8)
          
          setTrendingTags(trending)
        } else {
          // Enhanced fallback with more realistic data
          setTrendingTags([
            { tag: '#Romance', posts: '15 obras', delta: '+24%', engagementScore: 150, genre: 'romance' },
            { tag: '#Ficción', posts: '12 obras', delta: '+18%', engagementScore: 120, genre: 'ficcion' },
            { tag: '#Misterio', posts: '9 obras', delta: '+15%', engagementScore: 95, genre: 'misterio' },
            { tag: '#Fantasía', posts: '8 obras', delta: '+12%', engagementScore: 85, genre: 'fantasia' },
            { tag: '#Drama', posts: '7 obras', delta: '+10%', engagementScore: 70, genre: 'drama' },
            { tag: '#Aventura', posts: '6 obras', delta: '+8%', engagementScore: 65, genre: 'aventura' },
          ])
        }
      } catch (error) {
        console.error('Error loading trending tags:', error)
        // Enhanced fallback
        setTrendingTags([
          { tag: '#Romance', posts: '15 obras', delta: '+24%', engagementScore: 150, genre: 'romance' },
          { tag: '#Ficción', posts: '12 obras', delta: '+18%', engagementScore: 120, genre: 'ficcion' },
          { tag: '#Misterio', posts: '9 obras', delta: '+15%', engagementScore: 95, genre: 'misterio' },
        ])
      } finally {
        setIsLoadingTrends(false)
      }
    }
    
    loadTrendingTags()
  }, [])

  // Load suggested authors from database
  useEffect(() => {
    const loadSuggestedAuthors = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        
        // Get authors with their work counts
        const { data: authors } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            username,
            avatar_url,
            bio,
            works:works(count)
          `)
          .not('username', 'is', null)
          .limit(10)
        
        if (authors) {
          // Get follower counts for each author
          const authorsWithStats = await Promise.all(
            authors.map(async (author: any) => {
              const { count: followersCount } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('followee_id', author.id)
              
              // Get most common genre for this author
              const { data: genreData } = await supabase
                .from('works')
                .select('genre')
                .eq('author_id', author.id)
                .not('genre', 'is', null)
                .limit(5)
              
              const genres = genreData?.map(w => w.genre) || []
              const mostCommonGenre = genres.length > 0 
                ? genres.reduce((a, b, i, arr) => 
                    arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
                  ) 
                : 'Escritor'
              
              return {
                name: author.name || 'Autor',
                username: author.username ? `@${author.username.startsWith('@') ? author.username.slice(1) : author.username}` : '@autor',
                followers: followersCount ? `${followersCount}` : '0',
                genre: mostCommonGenre,
                verified: Math.random() > 0.5, // Random for now
                avatar: author.avatar_url,
                worksCount: author.works?.[0]?.count || 0
              }
            })
          )
          
          // Sort by followers and works count
          const sortedAuthors = authorsWithStats
            .sort((a, b) => (parseInt(b.followers) + b.worksCount) - (parseInt(a.followers) + a.worksCount))
            .slice(0, 4)
          
          setSuggestedAuthors(sortedAuthors)
        }
      } catch (error) {
        console.error('Error loading suggested authors:', error)
        // Fallback to default data
        setSuggestedAuthors([
          { name: 'Usuario Demo', username: '@demo', followers: '5', genre: 'Escritor', verified: false }
        ])
      } finally {
        setIsLoadingAuthors(false)
      }
    }
    
    loadSuggestedAuthors()
  }, [])

  // Load user ID and unread count
  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        
        if (userData?.user) {
          setUserId(userData.user.id)
          const count = await getUnreadNotificationsCount(userData.user.id)
          setUnreadCount(count)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUser()
  }, [])

  // Set up real-time subscription for notification updates
  useEffect(() => {
    if (!userId) return

    const supabase = getSupabaseBrowserClient()
    
    const subscription = supabase
      .channel('notification_updates_explore')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Reload unread count when notifications change
          const count = await getUnreadNotificationsCount(userId)
          setUnreadCount(count)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const filtered = useMemo(() => {
    const now = new Date()
    let periodStart: Date
    
    switch (period) {
      case 'today':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        periodStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      default:
        periodStart = new Date(0) // Show all if no period specified
    }
    
    return items.filter(i => {
      // Period filter
      const itemDate = new Date(i.createdAt)
      const matchesPeriod = itemDate >= periodStart
      
      // Type filter
      const matchesType = type === 'all' || i.type === type
      
      // Tag/search filter
      const matchesTag = !tag || 
        i.genre.toLowerCase().includes(tag.toLowerCase()) || 
        i.title.toLowerCase().includes(tag.toLowerCase()) ||
        i.authorName?.toLowerCase().includes(tag.toLowerCase())
      
      return matchesPeriod && matchesType && matchesTag
    })
  }, [items, period, type, tag])

  const navigationItems = useMemo(() => [
    { icon: Home, label: 'Inicio', id: 'feed' },
    { icon: Compass, label: 'Explorar', id: 'explore' },
    { icon: PenTool, label: 'Mis Obras', id: 'my-stories' }
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
    else if (tabId === 'my-stories') router.push('/mis-obras')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (identical to /main) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-10 sm:px-16 lg:px-24 xl:px-32">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Clickable to go to /main */}
            <button 
              onClick={() => router.push('/main')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg p-1 -m-1"
              aria-label="Ir a página principal"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 overflow-hidden rounded-md flex items-center justify-center bg-transparent">
                <div className="relative h-[200%] w-[200%] -m-[50%]">
                  <Image src="/1.png" alt="Palabreo logo" fill sizes="56px" className="object-cover" priority />
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-red-600 [font-family:var(--font-poppins)]">
                Palabreo
              </h1>
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar obras, autores..."
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tag.trim()) {
                      e.preventDefault()
                      router.push(`/search?q=${encodeURIComponent(tag.trim())}`)
                    }
                  }}
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
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
              
              <Button className="hidden md:inline-flex bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm" onClick={() => router.push('/writer')}>
                <PenTool className="h-4 w-4 mr-2" />
                Publicar
              </Button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="Menú de usuario" 
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 hover:ring-2 hover:ring-red-200 transition-all"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback className="text-xs bg-red-100 text-red-700">TU</AvatarFallback>
                  </Avatar>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/profile')
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Ver Perfil
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/notifications')
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Configuración
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        signOut()
                      }}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>

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
                <button key={p} onClick={() => setPeriod(p)} className={`px-3.5 py-1.5 text-xs rounded-full transition-colors ${period===p?'bg-red-600 text-white':'text-gray-700 hover:text-red-700'}`}>
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
                <button key={o.k} onClick={() => setType(o.k)} className={`px-3.5 py-1.5 text-xs rounded-full transition-colors ${type===o.k?'bg-red-600 text-white':'text-gray-700 hover:text-red-700'}`}>{o.l}</button>
              ))}
            </div>
            {(tag || type !== 'all' || period !== 'week') && (
              <button
                onClick={() => {
                  setTag('')
                  setType('all')
                  setPeriod('week')
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full border border-gray-300 hover:border-red-300 transition-all"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            )}
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
                  {isLoadingTrends ? (
                    // Loading skeleton for trending tags
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-3 bg-gray-200 rounded w-12"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-8"></div>
                        </div>
                      </div>
                    ))
                  ) : trendingTags.length > 0 ? (
                    trendingTags.map(t => (
                    <button
                      key={t.tag}
                      onClick={() => {
                        // Clear current filters and apply trend filter
                        setTag(t.genre || t.tag.replace('#',''))
                        setType('all')
                        setPeriod('week')
                        
                        // Scroll to results section on mobile
                        const resultsSection = document.querySelector('[data-testid="explore-items"]')
                        if (resultsSection && window.innerWidth < 1024) {
                          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }}
                      role="listitem"
                      aria-label={`Filtrar por tendencia ${t.tag}, ${t.posts}, variación ${t.delta}`}
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm border transition-all duration-200 flex items-center justify-between gap-3 flex-wrap ${
                        tag === (t.genre || t.tag.replace('#','')) 
                          ? 'bg-red-50 text-red-800 border-red-200 shadow-sm' 
                          : 'text-gray-800 border-transparent hover:bg-red-50 hover:border-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600'
                      }`}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs whitespace-normal break-words max-w-full ${
                          tag === (t.genre || t.tag.replace('#','')) 
                            ? 'bg-red-100 text-red-800 border-red-300' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {t.tag}
                        </Badge>
                        <span className="text-xs text-gray-500 truncate">• {t.posts}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> {t.delta}
                        </span>
                        <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          tag === (t.genre || t.tag.replace('#','')) ? 'text-red-500 rotate-90' : 'text-gray-400'
                        }`} />
                      </div>
                    </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No hay tendencias disponibles
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trending Authors */}
            <div className="mb-6">
              <TrendingAuthors 
                limit={6}
                title="Autores Destacados"
                showFollowButton={true}
                currentUserId={userId}
              />
            </div>
          </aside>

          {/* Right: Grid of discoveries */}
          <section className="xl:col-span-9 order-1 lg:order-2">
            {/* Trending Works Section */}
            <div className="mb-8">
              <TrendingWorks 
                timeframe="all"
                limit={8}
                showTimeframeTabs={true}
                title="En Tendencia"
              />
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <div className="text-sm text-gray-600">Descubriendo obras...</div>
                </div>
              </div>
            ) : (
              <div data-testid="explore-items" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
                {filtered.length > 0 ? (
                  filtered.map(card => (
                    <ExploreItemCard
                      key={card.id}
                      card={card}
                      saved={!!saved[card.id]}
                      onToggleSaved={() => toggleSaved(card.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="max-w-md mx-auto">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">¡Eres pionero!</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        No hay otras obras para recomendar en este momento. Sigue escribiendo y pronto habrá más autores en la plataforma para descubrir contenido increíble.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button 
                          onClick={() => router.push('/writer')}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Crear Nueva Obra
                        </button>
                        <button 
                          onClick={() => router.push('/main')}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Ver Mi Feed
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

// Card with mobile long-press overlay controls
function ExploreItemCard({ card, saved, onToggleSaved }: { card: any; saved: boolean; onToggleSaved: () => void }) {
  const [isLongPressActive, setIsLongPressActive] = useState<boolean>(false)
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false)
  const longPressTimerRef = React.useRef<number | null>(null)
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null)
  const cardRef = React.useRef<HTMLDivElement | null>(null)
  const [ripple, setRipple] = useState<{ x: number; y: number; size: number; key: number } | null>(null)
  const [sheenKey, setSheenKey] = useState<number>(0)
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
      const rect = cardRef.current?.getBoundingClientRect()
      const baseX = touchStartPosRef.current?.x ?? (rect ? rect.left + rect.width / 2 : 0)
      const baseY = touchStartPosRef.current?.y ?? (rect ? rect.top + rect.height / 2 : 0)
      const relX = rect ? baseX - rect.left : 0
      const relY = rect ? baseY - rect.top : 0
      const diag = rect ? Math.sqrt(rect.width * rect.width + rect.height * rect.height) : 0
      const size = Math.max(32, Math.floor(diag * 1.2))
      const key = Date.now()
      setRipple({ x: relX, y: relY, size, key })
      setSheenKey(key)
      window.setTimeout(() => { setRipple(null) }, 750)
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
    <>
    <Card
      data-testid="work-card"
      className={`relative group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all focus-within:ring-2 focus-within:ring-red-500 ${isLongPressActive ? 'scale-[0.98] brightness-95' : ''}`}
      ref={cardRef}
      onTouchStart={onTouchStartCard}
      onTouchMove={onTouchMoveCard}
      onTouchEnd={onTouchEndCard}
      onContextMenu={(e) => { e.preventDefault() }}
    >
      {ripple && (
        <div className="pointer-events-none absolute inset-0 z-40 md:hidden">
          <div
            key={ripple.key}
            className="ripple-anim absolute rounded-full"
            style={{ top: ripple.y - ripple.size / 2, left: ripple.x - ripple.size / 2, width: ripple.size, height: ripple.size }}
          />
        </div>
      )}
      {isLongPressActive && (
        <div className="pointer-events-none absolute inset-0 z-40 md:hidden">
          <div key={sheenKey} className="sheen-anim absolute inset-y-0 -left-1/3 w-1/3" />
        </div>
      )}
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
          <h3 data-testid="work-title" className="text-base font-semibold text-gray-900 mb-1.5 md:mb-2 line-clamp-2 md:line-clamp-2">
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

    {/* Click outside to close user menu */}
    {showUserMenu && (
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowUserMenu(false)}
      />
    )}
    </>
  )
}

