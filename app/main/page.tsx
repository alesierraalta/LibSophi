'use client'

import React, { useState, useCallback, useMemo, memo, lazy, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share2, Bookmark, Plus, Search, Bell, Home, Compass, PenTool, Library, Settings, Edit3, UserPlus, AtSign, BookOpen, Eye, Mail, Copy, Repeat2 } from 'lucide-react'
import ProfileHoverCard from '@/components/ProfileHoverCard'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { createLikeNotification, createCommentNotification, createFollowNotification } from '@/lib/notifications'

// Lazy load ThemeSelector for better performance
const ThemeSelector = lazy(() => import('@/components/ThemeSelector'))

// Memoized components for better performance
const MemoizedBadge = memo(Badge)
const MemoizedButton = memo(Button)
const MemoizedAvatar = memo(Avatar)

// Initial posts data - moved outside component to prevent recreation
const initialPosts = [
  {
    id: 1,
    author: {
      name: "María González",
      username: "@mariagonzalez",
      avatar: "/api/placeholder/40/40"
    },
    title: "El susurro del viento - Capítulo 3",
    content: "En las montañas de los Andes, donde el viento susurra secretos ancestrales, una joven escritora descubre que las palabras tienen el poder de cambiar el destino. El manuscrito que había encontrado en la biblioteca de su abuela no era solo una colección de cuentos, sino un grimorio de historias que cobraban vida cuando eran leídas en voz alta...",
    genre: "Fantasía",
    readTime: "12 min",
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    timestamp: "hace 2 horas"
  }
]

function MainPageInner() {
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [onlyFollowing, setOnlyFollowing] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState('feed')
  const [currentTheme, setCurrentTheme] = useState<string>('variant-1')
  const [showNotifications, setShowNotifications] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])
  const [suggestedAuthors, setSuggestedAuthors] = useState<any[]>([])
  const [spotlightNewsletters, setSpotlightNewsletters] = useState<any[]>([])
  const [popularStories, setPopularStories] = useState<any[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    ;(async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) setCurrentUserId(userData.user.id)
        // Determine author filter if onlyFollowing
        let authorFilterIds: string[] | null = null
        if (onlyFollowing && userData?.user) {
          const { data: flw } = await supabase
            .from('follows')
            .select('followee_id')
            .eq('follower_id', userData.user.id)
          authorFilterIds = Array.from(new Set((flw || []).map((r: any) => r.followee_id)))
          if (authorFilterIds.length === 0) {
            setPosts([])
            return
          }
        }
        // Fetch latest works
        let query = supabase
          .from('works')
          .select('id,title,genre,cover_url,created_at,author_id,chapters,content')
          .order('created_at', { ascending: false })
          .limit(25)
        if (authorFilterIds && authorFilterIds.length > 0) {
          query = query.in('author_id', authorFilterIds)
        }
        const { data: works } = await query
        if (Array.isArray(works)) {
          // Bulk fetch authors
          const authorIds = Array.from(new Set(works.map((w: any) => w.author_id).filter(Boolean)))
          let profilesMap: Record<string, any> = {}
          if (authorIds.length > 0) {
            const { data: profs } = await supabase
              .from('profiles')
              .select('id,username,name,avatar_url')
              .in('id', authorIds)
            if (Array.isArray(profs)) {
              profilesMap = profs.reduce((acc: any, p: any) => { acc[p.id] = p; return acc }, {})
            }
          }
          let mapped = works.map((w: any) => {
            const author = profilesMap[w.author_id] || {}
            const body = w.chapters && Array.isArray(w.chapters) && w.chapters.length > 0 ? (w.chapters[0]?.content || '') : (w.content || '')
            return {
              id: w.id,
              author: {
                name: author.name || 'Autor',
                username: author.username ? `@${author.username}` : '@autor',
                avatar: author.avatar_url || '/api/placeholder/40/40',
              },
              title: w.title,
              content: body,
              genre: w.genre || 'Obra',
              readTime: '—',
              likes: 0,
              comments: 0,
              shares: 0,
              isLiked: false,
              bookmarked: false,
              timestamp: new Date(w.created_at || Date.now()).toLocaleString(),
              image: w.cover_url || null,
            }
          })
          // aggregate counts
          const workIds = mapped.map((m: any) => m.id)
          if (workIds.length > 0) {
            const [{ data: likesRows }, { data: commentsRows }, { data: bmRows }] = await Promise.all([
              supabase.from('likes').select('work_id').in('work_id', workIds),
              supabase.from('comments').select('work_id').in('work_id', workIds),
              supabase.from('bookmarks').select('work_id').in('work_id', workIds),
            ])
            const likesCount: Record<string, number> = {}
            const commentsCount: Record<string, number> = {}
            const bookmarksCount: Record<string, number> = {}
            ;(likesRows || []).forEach((r: any) => { likesCount[r.work_id] = (likesCount[r.work_id] || 0) + 1 })
            ;(commentsRows || []).forEach((r: any) => { commentsCount[r.work_id] = (commentsCount[r.work_id] || 0) + 1 })
            ;(bmRows || []).forEach((r: any) => { bookmarksCount[r.work_id] = (bookmarksCount[r.work_id] || 0) + 1 })
            mapped = mapped.map((m: any) => ({
              ...m,
              likes: likesCount[m.id] || 0,
              comments: commentsCount[m.id] || 0,
              shares: 0,
            }))
          }
          // Mark liked/bookmarked for current user
          if (userData?.user && mapped.length > 0) {
            const workIds = mapped.map((m: any) => m.id)
            const [{ data: userLikes }, { data: userBookmarks }] = await Promise.all([
              supabase.from('likes').select('work_id').eq('user_id', userData.user.id).in('work_id', workIds),
              supabase.from('bookmarks').select('work_id').eq('user_id', userData.user.id).in('work_id', workIds),
            ])
            const likedSet = new Set((userLikes || []).map((r: any) => r.work_id))
            const bookmarkedSet = new Set((userBookmarks || []).map((r: any) => r.work_id))
            mapped = mapped.map((m: any) => ({
              ...m,
              isLiked: likedSet.has(m.id),
              bookmarked: bookmarkedSet.has(m.id),
            }))
          }
          setPosts(mapped)
        }
      } catch {}
    })()
  }, [onlyFollowing])

  // Sidebar data: tendencias, autores sugeridos, newsletters y obras destacadas
  React.useEffect(() => {
    ;(async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        // Fetch recent works to derive multiple aggregates
        const { data: works } = await supabase
          .from('works')
          .select('id,title,genre,cover_url,author_id,created_at')
          .order('created_at', { ascending: false })
          .limit(200)

        const worksSafe = Array.isArray(works) ? works : []

        // 1) Tendencias por género
        const genreToCount: Record<string, number> = {}
        worksSafe.forEach((w: any) => {
          const g = (w.genre || 'General').toString()
          genreToCount[g] = (genreToCount[g] || 0) + 1
        })
        const topGenres = Object.entries(genreToCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([g, c]) => ({ tag: `#${g}`, count: String(c) }))
        setTrendingTopics(topGenres)

        // 2) Autores sugeridos (por seguidores)
        const { data: follows } = await supabase
          .from('follows')
          .select('followee_id')
          .limit(1000)
        const followCounts: Record<string, number> = {}
        ;(follows || []).forEach((r: any) => {
          if (r?.followee_id) followCounts[r.followee_id] = (followCounts[r.followee_id] || 0) + 1
        })
        const topAuthorIds = Object.entries(followCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => id as string)
        let authors: any[] = []
        if (topAuthorIds.length > 0) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id,username,name,avatar_url')
            .in('id', topAuthorIds)
          const worksByTop = worksSafe.filter((w: any) => topAuthorIds.includes(w.author_id))
          const authorToGenre: Record<string, string> = {}
          topAuthorIds.forEach((id) => {
            const ws = worksByTop.filter((w: any) => w.author_id === id)
            const counts: Record<string, number> = {}
            ws.forEach((w: any) => {
              const g = (w.genre || 'Obra').toString()
              counts[g] = (counts[g] || 0) + 1
            })
            const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Obra'
            authorToGenre[id] = top
          })
          authors = (profs || []).map((p: any) => ({
            name: p?.name || 'Autor',
            username: p?.username ? `@${p.username}` : '@autor',
            followers: String(followCounts[p.id] || 0),
            genre: authorToGenre[p.id] || 'Obra',
            verified: false,
          }))
        }
        setSuggestedAuthors(authors)

        // 3) Newsletters destacados (por género que contenga "newsletter")
        const newsletters = worksSafe
          .filter((w: any) => (w.genre || '').toString().toLowerCase().includes('newsletter'))
          .slice(0, 3)
        const nlIds = newsletters.map((n: any) => n.id)
        let bmRows: any[] = []
        if (nlIds.length > 0) {
          const { data: bm } = await supabase.from('bookmarks').select('work_id').in('work_id', nlIds)
          bmRows = bm || []
        }
        const subsCount: Record<string, number> = {}
        bmRows.forEach((r: any) => { subsCount[r.work_id] = (subsCount[r.work_id] || 0) + 1 })
        const nlAuthorIds = Array.from(new Set(newsletters.map((n: any) => n.author_id).filter(Boolean)))
        let nlProfiles: any[] = []
        if (nlAuthorIds.length > 0) {
          const { data: p2 } = await supabase.from('profiles').select('id,name').in('id', nlAuthorIds)
          nlProfiles = p2 || []
        }
        const idToName: Record<string, string> = {}
        nlProfiles.forEach((p: any) => { idToName[p.id] = p.name || 'Autor' })
        setSpotlightNewsletters(newsletters.map((n: any) => ({
          title: n.title,
          author: idToName[n.author_id] || 'Autor',
          subscribers: String(subsCount[n.id] || 0),
          frequency: '—',
          genre: n.genre || 'Newsletter',
        })))

        // 4) Obras destacadas (más me gusta)
        const workIdsAll = worksSafe.map((w: any) => w.id)
        let likeRows: any[] = []
        if (workIdsAll.length > 0) {
          const { data: lr } = await supabase.from('likes').select('work_id').in('work_id', workIdsAll)
          likeRows = lr || []
        }
        const likeCounts: Record<string, number> = {}
        likeRows.forEach((r: any) => { likeCounts[r.work_id] = (likeCounts[r.work_id] || 0) + 1 })
        const topWorks = [...worksSafe]
          .sort((a: any, b: any) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0))
          .slice(0, 3)
        const topAuthorIds2 = Array.from(new Set(topWorks.map((w: any) => w.author_id)))
        let pTop: any[] = []
        if (topAuthorIds2.length > 0) {
          const { data: p } = await supabase.from('profiles').select('id,name').in('id', topAuthorIds2)
          pTop = p || []
        }
        const idToNameTop: Record<string, string> = {}
        pTop.forEach((p: any) => { idToNameTop[p.id] = p.name || 'Autor' })
        setPopularStories(topWorks.map((w: any) => ({
          title: w.title,
          author: idToNameTop[w.author_id] || 'Autor',
          reads: String(likeCounts[w.id] || 0),
          genre: w.genre || 'Obra',
        })))
      } catch {}
    })()
  }, [])

  // Memoized callback to prevent unnecessary re-renders
  const handleLike = useCallback((postId: number) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ))
  }, [])

  const handleAddComment = useCallback((postId: number) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === postId 
        ? { ...post, comments: (post.comments ?? 0) + 1 }
        : post
    ))
  }, [])

  const handleShare = useCallback(async (postId: number) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === postId 
        ? { ...post, shares: (post.shares ?? 0) + 1 }
        : post
    ))
    try {
      const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${postId}` : `https://palabreo.com/post/${postId}`
      if (navigator.share) {
        await navigator.share({ url: shareUrl, title: 'Palabreo', text: 'Mira este post' })
      } else {
        await navigator.clipboard.writeText(shareUrl)
      }
    } catch {}
  }, [])

  const handleRepost = useCallback((postId: number) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === postId 
        ? { ...post, reposts: (post as any).reposts ? (post as any).reposts + 1 : 1 }
        : post
    ))
  }, [])

  // Memoized navigation items
  const navigationItems = useMemo(() => [
    { icon: Home, label: 'Inicio', id: 'feed' },
    { icon: Compass, label: 'Explorar', id: 'explore' },
    { icon: PenTool, label: 'Mis Obras', id: 'my-stories' },
    { icon: Library, label: 'Biblioteca', id: 'library' },
    { icon: Bookmark, label: 'Favoritos', id: 'saved' }
  ], [])

  // Mobile top carousel items only: Inicio, Explorar, Guardados
  const mobileNavItems = useMemo(() => [
    { icon: Home, label: 'Inicio', id: 'feed' },
    { icon: Compass, label: 'Explorar', id: 'explore' },
    { icon: Bookmark, label: 'Guardados', id: 'saved' },
  ], [])

  // Memoized navigation button component
  const NavigationButton = memo(({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => {
    const Icon = item.icon
    return (
      <MemoizedButton
        variant={isActive ? 'default' : 'ghost'}
        className={`w-full justify-start text-sm transition-all duration-200 ${
          isActive 
            ? 'bg-red-600 text-white hover:bg-red-700'
        : 'text-gray-700 hover:text-red-700 hover:bg-red-50'
        }`}
        onClick={onClick}
      >
        <Icon className="h-4 w-4 mr-3" />
        {item.label}
      </MemoizedButton>
    )
  })

  // Memoized callback for tab changes
  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === 'explore') {
      router.push('/explore')
      return
    }
    if (tabId === 'feed') {
      router.push('/main')
      setActiveTab('feed')
      return
    }
    if (tabId === 'my-stories') {
      router.push('/mis-obras')
      return
    }
    if (tabId === 'library') {
      router.push('/main?tab=library')
      setActiveTab('library')
      return
    }
    if (tabId === 'saved') {
      router.push('/main?tab=saved')
      setActiveTab('saved')
      return
    }
    setActiveTab(tabId)
  }, [router])

  // Sync active tab with URL query param
  React.useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'my-stories' || tab === 'library' || tab === 'saved') {
      if (activeTab !== tab) setActiveTab(tab)
    } else if (!tab && activeTab !== 'feed') {
      setActiveTab('feed')
    }
  }, [searchParams, activeTab])

  // Tendencias obtenidas dinámicamente (estado: trendingTopics)

  // Memoized trending topic component
  const TrendingTopic = memo(({ topic }: { topic: any }) => (
    <button
      type="button"
      aria-label={`Ver tendencia ${topic.tag}`}
      className="w-full text-left group p-3 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
    >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
            <MemoizedBadge
              variant="outline"
              className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 whitespace-normal break-words max-w-full group-hover:text-red-800"
            >
              {topic.tag}
            </MemoizedBadge>
          </div>
          <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">{topic.count}</span>
        </div>
    </button>
  ))

  // Memoized posts data with expanded content
  const memoizedPosts = useMemo(() => [
    {
      id: 1,
      author: {
        name: "María González",
        username: "@mariagonzalez",
        avatar: "/api/placeholder/40/40"
      },
      title: "El susurro del viento - Capítulo 3",
      content: "En las montañas de los Andes, donde el viento susurra secretos ancestrales, una joven escritora descubre que las palabras tienen el poder de cambiar el destino. El manuscrito que había encontrado en la biblioteca de su abuela no era solo una colección de cuentos, sino un grimorio de historias que cobraban vida cuando eran leídas en voz alta...",
      genre: "Fantasía",
      readTime: "12 min",
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      timestamp: "hace 2 horas",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop"
    },
    {
      id: 2,
      author: {
        name: "Carlos Mendoza",
        username: "@carlosmendoza",
        avatar: "/api/placeholder/40/40"
      },
      title: "Versos al amanecer",
      content: "Cuando la luz toca las montañas / y el silencio se vuelve canción, / mi alma despierta entre las ramas / de un sueño que no tiene razón. / El viento susurra promesas / que solo el corazón puede entender, / mientras las estrellas se desvanecen / en el lienzo del amanecer...",
      genre: "Poesía",
      readTime: "3 min",
      likes: 18,
      comments: 5,
      shares: 2,
      isLiked: true,
      timestamp: "hace 4 horas",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop"
    },
    {
      id: 3,
      author: {
        name: "Ana Rodríguez",
        username: "@anarodriguez",
        avatar: "/api/placeholder/40/40"
      },
      title: "Capítulo 1: El último tren",
      content: "La estación estaba desierta a esa hora de la madrugada. Solo el eco de mis pasos resonaba entre los andenes vacíos, creando una sinfonía melancólica que parecía narrar todas las despedidas que habían ocurrido en ese lugar. El último tren de la noche se acercaba, y con él, la oportunidad de cambiar mi destino para siempre. Pero ¿estaba realmente preparada para dejar atrás todo lo que conocía?",
      genre: "Novela",
      readTime: "8 min",
      likes: 42,
      comments: 15,
      shares: 8,
      isLiked: false,
      timestamp: "hace 6 horas",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop"
    },
    {
      id: 4,
      author: {
        name: "Diego Herrera",
        username: "@diegoherrera",
        avatar: "/api/placeholder/40/40"
      },
      title: "Monólogo del tiempo perdido",
      content: "(El personaje camina lentamente por el escenario, con una maleta en la mano) / PERSONAJE: ¿Cuántas veces hemos dejado que el tiempo se escurra entre nuestros dedos como arena? Yo he sido coleccionista de momentos perdidos, archivero de oportunidades que nunca tomé. Esta maleta... (la levanta) está llena de todos los 'hubiera' que nunca se convirtieron en 'hice'.",
      genre: "Teatro",
      readTime: "5 min",
      likes: 31,
      comments: 12,
      shares: 6,
      isLiked: true,
      timestamp: "hace 8 horas"
    },
    {
      id: 5,
      author: {
        name: "Sofía Martín",
        username: "@sofiamartin",
        avatar: "/api/placeholder/40/40"
      },
      title: "Reflexiones semanales: El arte de la paciencia",
      content: "Queridos lectores, esta semana he estado reflexionando sobre algo que nuestra sociedad acelerada parece haber olvidado: el arte de la paciencia. En un mundo donde todo debe ser instantáneo, donde la gratificación inmediata es la norma, hemos perdido la capacidad de esperar, de saborear el proceso, de encontrar belleza en la lentitud. Les comparto tres ejercicios que he estado practicando...",
      genre: "Newsletter",
      readTime: "6 min",
      likes: 67,
      comments: 23,
      shares: 15,
      isLiked: false,
      timestamp: "hace 12 horas",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop"
    }
  ], [])

  // Memoized post card component
  const PostCard = memo(({ post }: { post: any }) => {
    const [showCommentBox, setShowCommentBox] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [localLikes, setLocalLikes] = useState<number>(post.likes ?? 0)
    const [localIsLiked, setLocalIsLiked] = useState<boolean>(!!post.isLiked)
    const [localComments, setLocalComments] = useState<number>(post.comments ?? 0)
    const [localReposts, setLocalReposts] = useState<number>((post as any).reposts ?? 0)
    const [localReposted, setLocalReposted] = useState<boolean>(false)
    const [bookmarked, setBookmarked] = useState<boolean>(false)
    const [comments, setComments] = useState<{ id: string; author: any; text: string; time: number }[]>(() => {
      try {
        const raw = localStorage.getItem(`palabreo-comments-${post.id}`)
        return raw ? JSON.parse(raw) : []
      } catch { return [] }
    })
    React.useEffect(() => { setLocalComments(comments.length) }, [comments])
    React.useEffect(() => {
      // Seed example comments if none
      try {
        const key = `palabreo-comments-${post.id}`
        const seededKey = `palabreo-comments-seeded-${post.id}`
        if (localStorage.getItem(seededKey)) return
        const raw = localStorage.getItem(key)
        const existing = raw ? JSON.parse(raw) : []
        if (Array.isArray(existing) && existing.length > 0) return
        const now = Date.now()
        const samples = [
          { id: `${now}-1`, author: { name: 'Elena Martínez', username: '@elena_writes' }, text: `Impresionante atmósfera, @${post.author.username.replace('@','')} 👏`, time: now - 1000*60*20 },
          { id: `${now}-2`, author: { name: 'Carlos Ruiz', username: '@carlos_stories' }, text: 'Coincido, gran ritmo narrativo.', time: now - 1000*60*12 },
        ]
        localStorage.setItem(key, JSON.stringify(samples))
        localStorage.setItem(seededKey, '1')
        setComments(samples)
      } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const onLike = async () => {
      const supabase = getSupabaseBrowserClient()
      if (!currentUserId) {
        setLocalLikes(prev => (localIsLiked ? Math.max(0, prev - 1) : prev + 1))
        setLocalIsLiked(v => !v)
        return
      }
      try {
        if (!localIsLiked) {
          await supabase.from('likes').insert({ user_id: currentUserId, work_id: post.id })
          setLocalLikes(prev => prev + 1)
          setLocalIsLiked(true)
          
          // Create notification for the author
          if (currentUserId !== post.author_id) {
            const { data: userData } = await supabase.auth.getUser()
            const currentUserName = userData?.user?.user_metadata?.name || userData?.user?.email || 'Alguien'
            createLikeNotification(post.id, post.title, post.author_id, currentUserId, currentUserName)
          }
        } else {
          await supabase.from('likes').delete().eq('user_id', currentUserId).eq('work_id', post.id)
          setLocalLikes(prev => Math.max(0, prev - 1))
          setLocalIsLiked(false)
        }
      } catch {}
    }
    const onAddComment = async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const newItem = { id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, author: { name: 'Tú', username: '@tu' }, text: trimmed, time: Date.now() }
      setComments(prev => {
        const next = [...prev, newItem]
        try { localStorage.setItem(`palabreo-comments-${post.id}`, JSON.stringify(next)) } catch {}
        return next
      })
      try {
        if (currentUserId) {
          const supabase = getSupabaseBrowserClient()
          await supabase.from('comments').insert({ work_id: post.id, author_id: currentUserId, text: trimmed })
          
          // Create notification for the author
          if (currentUserId !== post.author_id) {
            const { data: userData } = await supabase.auth.getUser()
            const currentUserName = userData?.user?.user_metadata?.name || userData?.user?.email || 'Alguien'
            createCommentNotification(post.id, post.title, post.author_id, currentUserId, currentUserName)
          }
        }
      } catch {}
    }
    const onRepost = async () => {
      setLocalReposts(prev => (localReposted ? Math.max(0, prev - 1) : prev + 1))
      setLocalReposted(v => !v)
      try {
        if (currentUserId) {
          const supabase = getSupabaseBrowserClient()
          if (!localReposted) {
            await supabase.from('reposts').insert({ user_id: currentUserId, work_id: post.id })
          } else {
            await supabase.from('reposts').delete().eq('user_id', currentUserId).eq('work_id', post.id)
          }
        } else {
          const key = 'palabreo-reposts'
          const raw = localStorage.getItem(key)
          const list: any[] = raw ? JSON.parse(raw) : []
          if (!localReposted) {
            const item = { id: post.id, title: post.title, author: post.author, excerpt: (post.content || '').slice(0, 160), image: post.image || null, time: Date.now() }
            const exists = list.some(x => x && x.id === post.id)
            const next = exists ? list : [...list, item]
            localStorage.setItem(key, JSON.stringify(next))
          } else {
            const next = list.filter(x => x && x.id !== post.id)
            localStorage.setItem(key, JSON.stringify(next))
          }
        }
      } catch {}
    }
    const onShare = async () => {
      try {
        const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : `https://palabreo.com/post/${post.id}`
        if (navigator.share) {
          await navigator.share({ url: shareUrl, title: post.title, text: 'Mira este post en Palabreo' })
        } else {
          await navigator.clipboard.writeText(shareUrl)
        }
      } catch {}
    }
    // Mobile long-press (Pinterest-like) overlay state
    
    const toggleBookmark = async () => {
      const supabase = getSupabaseBrowserClient()
      setBookmarked(prev => !prev)
      try {
        if (currentUserId) {
          if (!bookmarked) {
            await supabase.from('bookmarks').insert({ user_id: currentUserId, work_id: post.id })
          } else {
            await supabase.from('bookmarks').delete().eq('user_id', currentUserId).eq('work_id', post.id)
          }
        } else {
          const raw = localStorage.getItem('palabreo-bookmarks')
          let ids: any[] = raw ? JSON.parse(raw) : []
          if (!bookmarked) {
            if (!ids.includes(post.id)) ids.push(post.id)
          } else {
            ids = ids.filter((id: any) => id !== post.id)
          }
          localStorage.setItem('palabreo-bookmarks', JSON.stringify(ids))
        }
      } catch {}
    }
    return (
    <Card
      className={`relative bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden mb-6`}
    >
      <CardContent className="p-6 pt-8">
        {/* Post Header */}
        <div className="flex items-start space-x-4 mb-5">
          <div className="relative group" tabIndex={0}>
            <MemoizedAvatar className="h-12 w-12 ring-2 ring-red-100/60 hover:ring-red-200/80 transition-all duration-300">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="text-sm bg-red-50 text-red-700 font-semibold">{post.author.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </MemoizedAvatar>
            <ProfileHoverCard author={{ name: post.author.name, username: post.author.username, avatar: post.author.avatar }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm hover:text-red-700 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">{post.author.name}</h4>
                <span className="text-gray-500 text-xs hover:text-gray-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">{post.author.username}</span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 font-medium">{post.timestamp}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
            <MemoizedBadge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 font-medium">
                  {post.genre}
                </MemoizedBadge>
              </div>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{post.readTime} de lectura</span>
              </span>
            </div>
          </div>
        </div>
        {/* Post Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-red-700 transition-colors duration-200 cursor-pointer">
            {post.title}
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {post.content}
          </p>
          {post.image && (
            <div className="relative rounded-xl overflow-hidden mb-4 group">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
        </div>
        
        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button onClick={onLike} className={`flex items-center space-x-2 text-gray-500 transition-colors duration-200 group ${localIsLiked ? 'text-red-600' : 'hover:text-red-600'}`} title={localIsLiked ? 'Quitar me gusta' : 'Me gusta'}>
              <Heart className={`h-5 w-5 group-hover:scale-110 transition-transform duration-200 ${localIsLiked ? 'text-red-600 fill-red-600' : ''}`} />
              <span className="text-sm font-medium">{localLikes}</span>
            </button>
            <button onClick={() => setShowCommentBox(v => !v)} className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors duration-200 group">
              <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">{localComments}</span>
            </button>
            <button onClick={onRepost} className={`flex items-center space-x-2 text-gray-500 transition-colors duration-200 group ${localReposted ? 'text-purple-600' : 'hover:text-purple-600'}`} title={localReposted ? 'Quitar repost' : 'Repostear'}>
              <Repeat2 className={`h-5 w-5 group-hover:scale-110 transition-transform duration-200 ${localReposted ? 'text-purple-600' : ''}`} />
              <span className="text-sm font-medium">{localReposts}</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={toggleBookmark} className={`text-gray-500 hover:text-yellow-600 transition-colors duration-200 ${bookmarked ? 'text-yellow-600' : ''}`} aria-label="Guardar">
              <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-yellow-500' : ''}`} />
            </button>
            <button onClick={onShare} className="text-gray-500 hover:text-gray-700 transition-colors duration-200" aria-label="Compartir" title="Compartir">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showCommentBox && (
          <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
            {comments.length > 0 && (
              <div className="space-y-2">
                {comments.slice(-5).map((c) => {
                  const displayName = typeof c.author === 'object' && c.author?.name ? c.author.name : (typeof c.author === 'string' ? c.author : 'Usuario')
                  const username = typeof c.author === 'object' && c.author?.username ? c.author.username : null
                  const initials = (displayName || 'U').split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()
                  const usernameDisplay = username || ('@' + (displayName || 'usuario').toLowerCase().replace(/[^a-z0-9_]+/gi, ''))
                  return (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className="h-8 w-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">
                      {initials}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 max-w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">{usernameDisplay}</span>
                        <span className="text-xs text-gray-500">{displayName}</span>
                        <span className="text-[11px] text-gray-400 ml-auto">{new Date(c.time).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">{c.text}</div>
                    </div>
                  </div>)
                })}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Escribe un comentario..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <button
                onClick={() => { onAddComment(commentText); setCommentText('') }}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Comentar
              </button>
            </div>
          </div>
        )}
      </CardContent>

      
    </Card>
  )})

  // Memoized sidebar trends data
  const sidebarTrends = useMemo(() => [
    { tag: '#PoesíaContemporánea', posts: '2.1k' },
    { tag: '#CuentosCortos', posts: '1.8k' },
    { tag: '#NovelaNegra', posts: '1.5k' },
    { tag: '#EscrituraCreativa', posts: '1.2k' },
    { tag: '#TeatroIndependiente', posts: '890' }
  ], [])

  // Autores sugeridos obtenidos dinámicamente (estado: suggestedAuthors)

  // Memoized sidebar trend component
  const SidebarTrend = memo(({ trend }: { trend: any }) => (
    <div className="group flex items-center justify-between p-2 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer">
      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
        <span className="w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-125 transition-transform duration-200 flex-shrink-0"></span>
        <span className="font-medium text-gray-900 group-hover:text-primary transition-colors duration-200 text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{trend.tag}</span>
      </div>
      <span className="text-xs text-gray-500 font-medium ml-2 flex-shrink-0">{trend.posts}</span>
    </div>
  ))

  // Memoized suggested author component
  const SuggestedAuthor = memo(({ author }: { author: any }) => {
    const [isFollowing, setIsFollowing] = useState<boolean>(() => {
      try {
        const raw = localStorage.getItem('palabreo-following')
        const ids: string[] = raw ? JSON.parse(raw) : []
        return ids.includes(author.username)
      } catch { return false }
    })
    const toggleFollow = async () => {
      setIsFollowing(prev => {
        const next = !prev
        try {
          const raw = localStorage.getItem('palabreo-following')
          let ids: string[] = raw ? JSON.parse(raw) : []
          if (next) {
            if (!ids.includes(author.username)) ids.push(author.username)
          } else {
            ids = ids.filter(id => id !== author.username)
          }
          localStorage.setItem('palabreo-following', JSON.stringify(ids))
        } catch {}
        return next
      })

      // Handle Supabase follow/unfollow and notifications
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        
        if (userData?.user && !isFollowing) {
          // Get the followed user's ID by username
          const { data: followedUser } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('username', author.username.replace('@', ''))
            .single()
          
          if (followedUser) {
            // Insert follow record
            await supabase
              .from('follows')
              .insert({ follower_id: userData.user.id, followed_id: followedUser.id })
            
            // Create notification
            const currentUserName = userData.user.user_metadata?.name || userData.user.email || 'Alguien'
            createFollowNotification(followedUser.id, userData.user.id, currentUserName)
          }
        } else if (userData?.user && isFollowing) {
          // Get the followed user's ID and unfollow
          const { data: followedUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', author.username.replace('@', ''))
            .single()
          
          if (followedUser) {
            await supabase
              .from('follows')
              .delete()
              .eq('follower_id', userData.user.id)
              .eq('followed_id', followedUser.id)
          }
        }
      } catch (error) {
        console.error('Error handling follow:', error)
      }
    }
    return (
      <div className="group p-3 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-red-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <MemoizedAvatar className="h-10 w-10 ring-2 ring-red-100/50 group-hover:ring-red-200/70 transition-all duration-300">
                <img src={`/api/placeholder/40/40`} alt={author.name} className="rounded-full" />
              </MemoizedAvatar>
              {author.verified && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2 min-w-0">
                <p className="font-semibold text-gray-900 text-sm group-hover:text-red-700 transition-colors duration-200 leading-tight truncate max-w-full">
                  {author.name}
                </p>
                <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">{author.followers}</span>
              </div>
              <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200 truncate mb-1">{author.username}</p>
              <div className="flex items-center space-x-1 min-w-0">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                <MemoizedBadge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 truncate max-w-full sm:max-w-[160px]">
                  {author.genre}
                </MemoizedBadge>
              </div>
            </div>
          </div>
          <MemoizedButton onClick={toggleFollow} size="sm" variant={isFollowing ? 'default' : 'outline'} className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 ml-0 sm:ml-3 ${isFollowing ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' : 'border-red-300 text-red-600 hover:bg-red-100 hover:text-red-900 hover:border-red-400'}`}>
            {isFollowing ? 'Siguiendo' : 'Seguir'}
          </MemoizedButton>
        </div>
      </div>
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
      {/* Theme Selector for Red Palette */}
      <Suspense fallback={<div className="h-0" />}>
        <ThemeSelector />
      </Suspense>
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-10 sm:px-16 lg:px-24 xl:px-32">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 overflow-hidden rounded-md flex items-center justify-center bg-transparent">
                <div className="relative h-[200%] w-[200%] -m-[50%]">
                  <Image
                    src="/1.png"
                    alt="Palabreo logo"
                    fill
                    sizes="56px"
                    className="object-cover"
                    priority
                  />
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white text-sm"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3 relative">
              <MemoizedButton variant="ghost" size="sm" className="md:hidden">
                <Search className="h-4 w-4" />
              </MemoizedButton>
              
              <MemoizedButton
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
              </MemoizedButton>
              
              <MemoizedButton className="hidden md:inline-flex bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm" onClick={() => router.push('/writer')}>
                <PenTool className="h-4 w-4 mr-2" />
                Publicar
              </MemoizedButton>
              
              <button onClick={() => router.push('/profile')} aria-label="Ir a mi perfil" className="rounded-full focus:outline-none focus:ring-2 focus:ring-red-600">
                <MemoizedAvatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback className="text-xs bg-red-100 text-red-700">TU</AvatarFallback>
                </MemoizedAvatar>
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
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button
                      onClick={() => { setShowNotifications(false); router.push('/notifications') }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      aria-label="Ver más notificaciones"
                    >
                      Ver más
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Carousel - moved to top */}
      <div className="lg:hidden max-w-full mx-auto px-0 sm:px-14 lg:px-24 xl:px-32">
        <div className="flex items-stretch border-b border-gray-200 bg-white">
          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex-1 inline-flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-full mx-auto px-8 sm:px-16 lg:px-24 xl:px-32 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Sidebar - Mobile Navigation */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {/* Mobile Navigation moved to top */}

            {/* Desktop Navigation */}
            <Card className="hidden lg:block bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden">
              <CardContent className="p-6 pt-6">
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <NavigationButton
                      key={item.id}
                      item={item}
                      isActive={activeTab === item.id}
                      onClick={() => handleTabChange(item.id)}
                    />
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Trending Topics - Hidden on mobile */}
            <Card className="hidden lg:block bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden mt-6">
          <CardHeader className="bg-red-50 border-b border-red-200 p-6">
            <CardTitle className="text-lg font-semibold text-red-800">Tendencias</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {(trendingTopics.length > 0 ? trendingTopics : [
                    { tag: '#General', count: '—' },
                  ]).map((topic) => (
                    <TrendingTopic key={topic.tag} topic={{
                      tag: topic.tag,
                      count: topic.count,
                      bgClass: 'bg-red-50',
                      textClass: 'text-red-700',
                      hoverClass: 'group-hover:text-red-800',
                      maxWidth: 'max-w-[160px]'
                    }} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 lg:col-span-2 order-1 lg:order-2">
            <div className="space-y-4 sm:space-y-6">
              {/* Posts Feed */}
              <div className="mt-0">
                <div className="flex items-center justify-end mb-2">
                  <label className="text-xs text-gray-600 inline-flex items-center gap-2">
                    <input type="checkbox" checked={onlyFollowing} onChange={(e) => setOnlyFollowing(e.target.checked)} />
                    Solo seguidos
                  </label>
                </div>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-sm text-gray-600">No hay publicaciones por ahora.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Hidden on mobile, visible on tablet and desktop */}
          <div className="hidden md:block lg:col-span-1 md:col-span-1 lg:col-span-1 order-3">


            {/* Suggested Authors */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden mt-0">
              <CardHeader className="bg-red-50 border-b border-red-200 p-3 md:p-4 lg:p-6">
                <CardTitle className="text-sm md:text-base lg:text-lg font-semibold text-red-800">Autores Sugeridos</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 lg:p-6 pt-3 md:pt-4 lg:pt-6">
                <div className="space-y-3">
                  {(suggestedAuthors.length > 0 ? suggestedAuthors : []).map((author, index) => (
                    <SuggestedAuthor key={index} author={author} />
                  ))}
                  {suggestedAuthors.length === 0 && (
                    <div className="text-sm text-gray-600">Sin sugerencias por ahora.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Spotlight */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden mt-4 md:mt-6">
              <CardHeader className="bg-red-50 border-b border-red-200 p-3 md:p-4 lg:p-6">
                <CardTitle className="text-sm md:text-base lg:text-lg font-semibold flex items-center text-red-800">
                  <Mail className="h-4 w-4 mr-2" />
                  Newsletters Destacados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 lg:p-4 pt-3 md:pt-4 lg:pt-6">
                <div className="space-y-3">
                  {(spotlightNewsletters.length > 0 ? spotlightNewsletters : []).map((newsletter, index) => (
                    <div key={index} className="group p-3 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-red-200">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 text-gray-900 group-hover:text-red-700 transition-colors duration-200 line-clamp-2 whitespace-normal break-words">{newsletter.title}</h4>
                          <p className="text-gray-500 text-xs mb-2 group-hover:text-gray-600 transition-colors duration-200 truncate">por {newsletter.author}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs px-3 py-1.5 border-red-300 text-red-600 hover:bg-red-100 hover:text-red-900 hover:border-red-400 transition-all duration-300 rounded-full font-medium flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 ml-0 sm:ml-2">
                          Suscribirse
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-full sm:max-w-[140px]">
                            {newsletter.genre}
                          </Badge>
                        </div>
                           <span className="text-gray-600 text-xs font-medium flex-shrink-0">{newsletter.frequency}</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                         <span className="text-gray-500 text-xs font-medium">{newsletter.subscribers} suscriptores</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">Activo</span>
                        </div>
                      </div>
                    </div>
                   ))}
                  {spotlightNewsletters.length === 0 && (
                    <div className="text-sm text-gray-600">Aún no hay newsletters destacados.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Popular Stories */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden mt-4 md:mt-6">
              <CardHeader className="bg-red-50 border-b border-red-200 p-3 md:p-4 lg:p-6">
                <CardTitle className="text-sm md:text-base lg:text-lg font-semibold text-red-800">Obras Destacadas</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 lg:p-6 pt-3 md:pt-4 lg:pt-6">
                <div className="space-y-3">
                  {(popularStories.length > 0 ? popularStories : []).map((story, index) => (
                    <div key={index} className="group p-3 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-red-200">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 text-gray-900 group-hover:text-red-700 transition-colors duration-200 line-clamp-2 whitespace-normal break-words">{story.title}</h4>
                          <p className="text-gray-500 text-xs mb-2 group-hover:text-gray-600 transition-colors duration-200 truncate">por {story.author}</p>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 ml-0 sm:ml-2 justify-end">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-orange-600 font-medium">Popular</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-full sm:max-w-[140px]">
                            {story.genre}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500 text-xs">
                          <Eye className="h-4 w-4 text-gray-400" />
                           <span className="font-medium">{story.reads}</span>
                        </div>
                      </div>
                    </div>
                   ))}
                  {popularStories.length === 0 && (
                    <div className="text-sm text-gray-600">Sin obras destacadas aún.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Publish Button - Mobile only */}
      <button
        onClick={() => router.push('/writer')}
        aria-label="Publicar"
        className="md:hidden fixed bottom-20 right-4 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-600"
      >
        <PenTool className="h-6 w-6" />
      </button>
    </div>
  )
}

export default function MainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <MainPageInner />
    </Suspense>
  )
}