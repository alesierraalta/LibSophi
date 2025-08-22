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
import AppHeader from '@/components/AppHeader'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { createLikeNotification, createCommentNotification, createFollowNotification } from '@/lib/notifications'

// Lazy load ThemeSelector for better performance
const ThemeSelector = lazy(() => import('@/components/ThemeSelector'))

// Memoized components for better performance
const MemoizedBadge = memo(Badge)
const MemoizedButton = memo(Button)
const MemoizedAvatar = memo(Avatar)

// Removed static initial posts data to prevent showing static data before real data loads

function MainPageInner() {
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState('feed')
  const [currentTheme, setCurrentTheme] = useState<string>('variant-1')
  const [showNotifications, setShowNotifications] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])
  const [suggestedAuthors, setSuggestedAuthors] = useState<any[]>([])
  const [spotlightNewsletters, setSpotlightNewsletters] = useState<any[]>([])
  const [popularStories, setPopularStories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    ;(async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) setCurrentUserId(userData.user.id)
        // Get followed users for main page (always shows followed content)
        let authorFilterIds: string[] | null = null
        // /main page ALWAYS shows only content from people you follow
        let works: any[] = []
        
        if (userData?.user) {
          // Always get followed users for main page
          if (!authorFilterIds) {
            const { data: flw } = await supabase
              .from('follows')
              .select('followee_id')
              .eq('follower_id', userData.user.id)
            authorFilterIds = Array.from(new Set((flw || []).map((r: any) => r.followee_id)))
          }
          
          if (authorFilterIds && authorFilterIds.length > 0) {
            // Main page shows content from followed users only
            const { data: followedWorks } = await supabase
              .from('works')
              .select('id,title,genre,cover_url,created_at,author_id,chapters,content,views,likes')
              .in('author_id', authorFilterIds)
              .eq('published', true)
              .order('created_at', { ascending: false })
              .limit(25)
            
            works = (followedWorks || []).map((w: any) => ({
              work_id: w.id,
              title: w.title,
              genre: w.genre,
              author_id: w.author_id,
              cover_url: w.cover_url,
              created_at: w.created_at,
              chapters: w.chapters,
              content: w.content,
              views: w.views,
              likes: w.likes,
              recommendation_score: 0,
              recommendation_type: 'following'
            }))
          }
        }
        
        // Fallback to basic query if no works found
        if (works.length === 0) {
          const { data: basicWorks } = await supabase
            .from('works')
            .select('id,title,genre,cover_url,created_at,author_id,chapters,content,views,likes')
            .eq('published', true)
            .order('created_at', { ascending: false })
            .limit(25)
          
          works = (basicWorks || []).map((w: any) => ({
            work_id: w.id,
            title: w.title,
            genre: w.genre,
            author_id: w.author_id,
            cover_url: w.cover_url,
            created_at: w.created_at,
            chapters: w.chapters,
            content: w.content,
            views: w.views || 0,
            likes: w.likes || 0,
            recommendation_score: 0,
            recommendation_type: 'basic'
          }))
        }
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
              id: w.work_id || w.id, // Handle both recommendation and basic queries
              author: {
                name: author.name || 'Autor',
                username: author.username ? (author.username.startsWith('@') ? author.username : `@${author.username}`) : '@autor',
                avatar: author.avatar_url || '/api/placeholder/40/40',
              },
              title: w.title,
              content: body,
              genre: w.genre || 'Obra',
              readTime: '—',
              likes: w.likes || 0,
              comments: 0,
              shares: 0,
              isLiked: false,
              bookmarked: false,
              timestamp: new Date(w.created_at || Date.now()).toLocaleString(),
              image: w.cover_url || null,
              recommendationScore: w.recommendation_score || 0,
              recommendationType: w.recommendation_type || 'basic',
              author_id: w.author_id // Keep for excluding user's own works
            }
          })
          // aggregate counts
          const workIds = mapped.map((m: any) => m.id)
          if (workIds.length > 0) {
            try {
              const [likesResult, commentsResult, bmResult] = await Promise.allSettled([
                supabase.from('likes').select('work_id').in('work_id', workIds),
                supabase.from('comments').select('work_id').in('work_id', workIds),
                supabase.from('bookmarks').select('work_id').in('work_id', workIds),
              ])
              
              const likesRows = likesResult.status === 'fulfilled' ? likesResult.value.data : []
              const commentsRows = commentsResult.status === 'fulfilled' ? commentsResult.value.data : []
              const bmRows = bmResult.status === 'fulfilled' ? bmResult.value.data : []
              
              if (commentsResult.status === 'rejected') {
                console.warn('Comments table not available:', commentsResult.reason)
              }
              
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
            } catch (error) {
              console.warn('Error loading counts:', error)
              // Use default values if counts fail
              mapped = mapped.map((m: any) => ({
                ...m,
                likes: 0,
                comments: 0,
                shares: 0,
              }))
            }
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
        } else {
          setPosts([])
        }
      } catch (error) {
        console.error('Error loading posts:', error)
        setPosts([])
      }
    })()
  }, [])

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
            username: p?.username ? (p.username.startsWith('@') ? p.username : `@${p.username}`) : '@autor',
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
          try {
            const { data: p2 } = await supabase.from('profiles').select('id,name').in('id', nlAuthorIds)
            nlProfiles = p2 || []
          } catch (error) {
            console.warn('Profiles table not available for newsletters:', error)
            nlProfiles = []
          }
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
          try {
            const { data: p } = await supabase.from('profiles').select('id,name').in('id', topAuthorIds2)
            pTop = p || []
          } catch (error) {
            console.warn('Profiles table not available for popular stories:', error)
            pTop = []
          }
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
      finally {
        setIsLoading(false)
      }
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
    { icon: PenTool, label: 'Mis Obras', id: 'my-stories' }
  ], [])

  // Mobile top carousel items only: Inicio, Explorar
  const mobileNavItems = useMemo(() => [
    { icon: Home, label: 'Inicio', id: 'feed' },
    { icon: Compass, label: 'Explorar', id: 'explore' },
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

  // Removed static memoized posts data to prevent showing static data before real data loads

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
    const [comments, setComments] = useState<{ id: string; author: any; text: string; time: number }[]>([])
    const [isLoadingComments, setIsLoadingComments] = useState(true)
    
    React.useEffect(() => { setLocalComments(comments.length) }, [comments])
    
    // Load comments from database
    React.useEffect(() => {
      const loadComments = async () => {
        try {
          const supabase = getSupabaseBrowserClient()
          
          // Get comments with author information
          const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select(`
              id,
              text,
              created_at,
              author_id,
              profiles:author_id (
                name,
                username,
                avatar_url
              )
            `)
            .eq('work_id', post.id)
            .order('created_at', { ascending: true })
          
          if (commentsError) {
            console.warn('Comments table not available:', commentsError)
            setComments([])
            return
          }
          
          if (commentsData) {
            const formattedComments = commentsData.map((comment: any) => ({
              id: comment.id,
              author: {
                name: comment.profiles?.name || 'Usuario',
                username: comment.profiles?.username ? (comment.profiles.username.startsWith('@') ? comment.profiles.username : `@${comment.profiles.username}`) : '@usuario',
                avatar: comment.profiles?.avatar_url
              },
              text: comment.text,
              time: new Date(comment.created_at).getTime()
            }))
            
            setComments(formattedComments)
          }
        } catch (error) {
          console.error('Error loading comments:', error)
        } finally {
          setIsLoadingComments(false)
        }
      }
      
      loadComments()
    }, [post.id])
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
      if (!trimmed || !currentUserId) return
      
      try {
        const supabase = getSupabaseBrowserClient()
        
        // Get current user profile for immediate UI update
        const { data: userData } = await supabase.auth.getUser()
        let userProfile = null
        try {
          const { data } = await supabase
            .from('profiles')
            .select('name, username, avatar_url')
            .eq('id', currentUserId)
            .single()
          userProfile = data
        } catch (error) {
          console.warn('Profiles table not available:', error)
        }
        
        // Insert comment into database
        const { data: newComment, error } = await supabase
          .from('comments')
          .insert({ 
            work_id: post.id, 
            user_id: currentUserId, 
            content: trimmed 
          })
          .select(`
            id,
            content,
            created_at,
            user_id
          `)
          .single()
        
        if (error) {
          console.warn('Comments table not available:', error)
          alert('La función de comentarios no está disponible en este momento.')
          return
        }
        
        // Immediately update UI with the new comment
        const newCommentItem = {
          id: newComment.id,
          author: {
            name: userProfile?.name || userData?.user?.user_metadata?.name || 'Tú',
            username: userProfile?.username ? (userProfile.username.startsWith('@') ? userProfile.username : `@${userProfile.username}`) : '@tu',
            avatar: userProfile?.avatar_url
          },
          text: trimmed,
          time: new Date(newComment.created_at).getTime()
        }
        
        setComments(prev => [...prev, newCommentItem])
        
        // Clear the comment input
        setCommentText('')
        
        // Create notification for the author
        if (currentUserId !== post.author_id) {
          const currentUserName = userProfile?.name || userData?.user?.user_metadata?.name || userData?.user?.email || 'Alguien'
          createCommentNotification(post.id, post.title, post.author_id, currentUserId, currentUserName)
        }
        
      } catch (error) {
        console.error('Error adding comment:', error)
      }
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
          <h3 
            className="text-lg font-semibold text-gray-900 mb-3 hover:text-red-700 transition-colors duration-200 cursor-pointer"
            onClick={() => router.push(`/work/${post.id}`)}
          >
            {post.title}
          </h3>
          <p className="text-gray-700 leading-relaxed mb-2 line-clamp-3" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {post.content}
          </p>
          <button 
            onClick={() => router.push(`/work/${post.id}`)}
            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200 mb-2"
          >
            Leer más →
          </button>
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
        
        {/* Post Actions - Simplified */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            {/* Actions removed - keeping only basic structure */}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Like Button */}
              <button 
                onClick={onLike}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  localIsLiked 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <svg className="h-5 w-5" fill={localIsLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-medium">{localLikes}</span>
              </button>

              {/* Comments Button */}
              <button 
                onClick={() => setShowCommentBox(!showCommentBox)}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-all duration-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm font-medium">{localComments}</span>
              </button>

              {/* Repost Button */}
              <button 
                onClick={() => {
                  setLocalReposted(!localReposted)
                  setLocalReposts(prev => localReposted ? prev - 1 : prev + 1)
                }}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  localReposted 
                    ? 'text-green-600 hover:text-green-700' 
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium">{localReposts}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Bookmark Button */}
              <button 
                onClick={() => {
                  setBookmarked(!bookmarked)
                  // Handle bookmark logic
                  try {
                    const raw = localStorage.getItem('palabreo-bookmarks')
                    let ids: any[] = raw ? JSON.parse(raw) : []
                    if (!bookmarked) {
                      if (!ids.includes(post.id)) ids.push(post.id)
                    } else {
                      ids = ids.filter((id: any) => id !== post.id)
                    }
                    localStorage.setItem('palabreo-bookmarks', JSON.stringify(ids))
                  } catch {}
                }}
                className={`p-2 transition-all duration-200 ${
                  bookmarked 
                    ? 'text-yellow-600 hover:text-yellow-700' 
                    : 'text-gray-500 hover:text-yellow-600'
                }`}
              >
                <svg className="h-5 w-5" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              {/* Share Button */}
              <button 
                className="p-2 text-gray-500 hover:text-blue-600 transition-all duration-200"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: `${post.content.substring(0, 100)}...`,
                      url: `${window.location.origin}/work/${post.id}`
                    })
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/work/${post.id}`)
                    alert('¡Enlace copiado al portapapeles!')
                  }
                }}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {showCommentBox && (
          <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
            {isLoadingComments ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2 animate-pulse">
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
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
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </div>
            )}
            <div className="flex items-center gap-2">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Escribe un comentario..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <button
                onClick={() => onAddComment(commentText)}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!commentText.trim() || !currentUserId}
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
    { tag: '#PoesíaContemporánea', posts: '4' },
    { tag: '#CuentosCortos', posts: '3' },
    { tag: '#NovelaNegra', posts: '3' },
    { tag: '#EscrituraCreativa', posts: '2' },
    { tag: '#TeatroIndependiente', posts: '1' }
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
            .eq('username', author.username.startsWith('@') ? author.username : `@${author.username}`)
            .single()
          
          if (followedUser) {
            // Insert follow record
            await supabase
              .from('follows')
              .insert({ follower_id: userData.user.id, followee_id: followedUser.id })
            
            // Create notification
            const currentUserName = userData.user.user_metadata?.name || userData.user.email || 'Alguien'
            createFollowNotification(followedUser.id, userData.user.id, currentUserName)
          }
        } else if (userData?.user && isFollowing) {
          // Get the followed user's ID and unfollow
          const { data: followedUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', author.username.startsWith('@') ? author.username : `@${author.username}`)
            .single()
          
          if (followedUser) {
            await supabase
              .from('follows')
              .delete()
              .eq('follower_id', userData.user.id)
              .eq('followee_id', followedUser.id)
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
      <AppHeader />


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
                  <span className="text-xs text-gray-600 inline-flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Contenido de personas que sigues
                  </span>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <div className="text-sm text-gray-600">Cargando publicaciones...</div>
                    </div>
                  </div>
                ) : posts.length > 0 ? (
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