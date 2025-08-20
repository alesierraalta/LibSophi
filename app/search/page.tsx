'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Filter, Users, BookOpen, Tag, Eye, Heart, MessageCircle, Clock, User, Bookmark } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

type SearchResultType = 'all' | 'works' | 'authors' | 'genres'

interface WorkResult {
  id: string
  title: string
  excerpt: string
  genre: string
  author_id: string
  author_name: string
  author_username: string
  cover_url: string
  created_at: string
  views: number
  likes: number
  published: boolean
  type: 'work'
}

interface AuthorResult {
  id: string
  name: string
  username: string
  bio: string
  avatar_url: string
  followers_count: number
  works_count: number
  verified: boolean
  type: 'author'
}

interface GenreResult {
  name: string
  works_count: number
  type: 'genre'
}

type SearchResult = WorkResult | AuthorResult | GenreResult

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(query)
  const [searchType, setSearchType] = useState<SearchResultType>('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())
  const [savedWorks, setSavedWorks] = useState<Set<string>>(new Set())

  // Load current user and their following/saved data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        
        if (userData?.user) {
          setCurrentUserId(userData.user.id)
          
          // Load following data
          const { data: followingData } = await supabase
            .from('follows')
            .select('followee_id')
            .eq('follower_id', userData.user.id)
          
          if (followingData) {
            setFollowingUsers(new Set(followingData.map(f => f.followee_id)))
          }
          
          // Load saved works
          const { data: savedData } = await supabase
            .from('bookmarks')
            .select('work_id')
            .eq('user_id', userData.user.id)
          
          if (savedData) {
            setSavedWorks(new Set(savedData.map(s => s.work_id)))
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUserData()
  }, [])

  // Perform search when query or type changes
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch()
    } else {
      setResults([])
      setTotalResults(0)
    }
  }, [searchQuery, searchType])

  // Update search query when URL parameter changes
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery)
    }
  }, [searchParams])

  const performSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const searchTerm = searchQuery.trim().toLowerCase()
      let allResults: SearchResult[] = []
      
      // Search works
      if (searchType === 'all' || searchType === 'works') {
        const { data: works } = await supabase
          .from('works')
          .select(`
            id,
            title,
            content,
            genre,
            author_id,
            cover_url,
            created_at,
            views,
            likes,
            published,
            profiles:author_id (name, username)
          `)
          .eq('published', true)
          .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,genre.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false })
          .limit(searchType === 'works' ? 50 : 20)
        
        if (works) {
          const workResults: WorkResult[] = works.map(work => ({
            id: work.id,
            title: work.title,
            excerpt: work.content ? work.content.substring(0, 200) + '...' : '',
            genre: work.genre || 'Sin género',
            author_id: work.author_id,
            author_name: (work.profiles as any)?.name || 'Autor desconocido',
            author_username: (work.profiles as any)?.username || 'usuario',
            cover_url: work.cover_url || '/api/placeholder/300/400',
            created_at: work.created_at,
            views: work.views || 0,
            likes: work.likes || 0,
            published: work.published,
            type: 'work' as const
          }))
          allResults.push(...workResults)
        }
      }
      
      // Search authors
      if (searchType === 'all' || searchType === 'authors') {
        const { data: authors } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            username,
            bio,
            avatar_url
          `)
          .or(`name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
          .limit(searchType === 'authors' ? 50 : 10)
        
        if (authors) {
          // Get additional stats for each author
          const authorsWithStats = await Promise.all(
            authors.map(async (author) => {
              const [followersResult, worksResult] = await Promise.all([
                supabase.from('follows').select('id', { count: 'exact' }).eq('followee_id', author.id),
                supabase.from('works').select('id', { count: 'exact' }).eq('author_id', author.id).eq('published', true)
              ])
              
              return {
                id: author.id,
                name: author.name || author.username,
                username: author.username,
                bio: author.bio || '',
                avatar_url: author.avatar_url || '/api/placeholder/100/100',
                followers_count: followersResult.count || 0,
                works_count: worksResult.count || 0,
                verified: false, // Could be implemented later
                type: 'author' as const
              }
            })
          )
          
          allResults.push(...authorsWithStats)
        }
      }
      
      // Search genres (unique genres from works that match)
      if (searchType === 'all' || searchType === 'genres') {
        const { data: genreWorks } = await supabase
          .from('works')
          .select('genre')
          .eq('published', true)
          .ilike('genre', `%${searchTerm}%`)
        
        if (genreWorks) {
          const genreCounts = genreWorks.reduce((acc, work) => {
            const genre = work.genre || 'Sin género'
            acc[genre] = (acc[genre] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          
          const genreResults: GenreResult[] = Object.entries(genreCounts)
            .map(([name, count]) => ({
              name,
              works_count: count,
              type: 'genre' as const
            }))
            .sort((a, b) => b.works_count - a.works_count)
            .slice(0, searchType === 'genres' ? 20 : 5)
          
          allResults.push(...genreResults)
        }
      }
      
      setResults(allResults)
      setTotalResults(allResults.length)
      
    } catch (error) {
      console.error('Error performing search:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = (newQuery: string) => {
    if (newQuery.trim()) {
      setSearchQuery(newQuery)
      // Update URL
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', newQuery.trim())
      router.push(`/search?${params.toString()}`)
    }
  }

  const handleFollowUser = async (userId: string) => {
    if (!currentUserId) return
    
    try {
      const supabase = getSupabaseBrowserClient()
      const isFollowing = followingUsers.has(userId)
      
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('followee_id', userId)
        
        setFollowingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            followee_id: userId
          })
        
        setFollowingUsers(prev => new Set(prev).add(userId))
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const handleSaveWork = async (workId: string) => {
    if (!currentUserId) return
    
    try {
      const supabase = getSupabaseBrowserClient()
      const isSaved = savedWorks.has(workId)
      
      if (isSaved) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', currentUserId)
          .eq('work_id', workId)
        
        setSavedWorks(prev => {
          const newSet = new Set(prev)
          newSet.delete(workId)
          return newSet
        })
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            user_id: currentUserId,
            work_id: workId
          })
        
        setSavedWorks(prev => new Set(prev).add(workId))
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  const filteredResults = useMemo(() => {
    if (searchType === 'all') return results
    return results.filter(result => result.type === searchType.slice(0, -1)) // Remove 's' from end
  }, [results, searchType])

  const resultCounts = useMemo(() => {
    const counts = { works: 0, authors: 0, genres: 0 }
    results.forEach(result => {
      if (result.type === 'work') counts.works++
      else if (result.type === 'author') counts.authors++
      else if (result.type === 'genre') counts.genres++
    })
    return counts
  }, [results])

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Resultados de búsqueda
              </h1>
              {searchQuery && (
                <p className="text-gray-600 mt-1">
                  {isLoading ? 'Buscando...' : `${totalResults} resultado${totalResults !== 1 ? 's' : ''} para "${searchQuery}"`}
                </p>
              )}
            </div>
            
            {/* Search Input for mobile */}
            <div className="sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar obras, autores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-400 focus:border-red-400 bg-white text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <div className="flex space-x-8 overflow-x-auto">
              {[
                { key: 'all', label: 'Todo', count: totalResults },
                { key: 'works', label: 'Obras', count: resultCounts.works },
                { key: 'authors', label: 'Autores', count: resultCounts.authors },
                { key: 'genres', label: 'Géneros', count: resultCounts.genres }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSearchType(tab.key as SearchResultType)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    searchType === tab.key
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <div className="text-sm text-gray-600">Buscando contenido...</div>
            </div>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-4">
            {filteredResults.map((result, index) => (
              <div key={`${result.type}-${index}`}>
                {result.type === 'work' && <WorkResultCard work={result as WorkResult} onSave={handleSaveWork} isSaved={savedWorks.has(result.id)} />}
                {result.type === 'author' && <AuthorResultCard author={result as AuthorResult} onFollow={handleFollowUser} isFollowing={followingUsers.has(result.id)} />}
                {result.type === 'genre' && <GenreResultCard genre={result as GenreResult} />}
              </div>
            ))}
          </div>
        ) : searchQuery.trim() ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-600 mb-6">
              No encontramos nada para "{searchQuery}". Intenta con otros términos de búsqueda.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Verifica la ortografía de tu búsqueda</p>
              <p>• Intenta con palabras más generales</p>
              <p>• Busca por autor, título o género</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Comienza a buscar</h3>
            <p className="text-gray-600">
              Encuentra obras, autores y géneros usando la barra de búsqueda.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

// Work Result Card Component
function WorkResultCard({ work, onSave, isSaved }: { work: WorkResult; onSave: (id: string) => void; isSaved: boolean }) {
  const router = useRouter()
  
  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-red-500">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-20 sm:w-20 sm:h-24 relative overflow-hidden rounded-lg bg-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <Image
                src={work.cover_url}
                alt={work.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="80px"
              />
              {work.published && (
                <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                  ✓
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-lg font-bold text-gray-900 hover:text-red-600 cursor-pointer line-clamp-2 transition-colors duration-200"
                  onClick={() => router.push(`/work/${work.id}`)}
                >
                  {work.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  por{' '}
                  <span 
                    className="text-red-600 hover:text-red-700 cursor-pointer font-medium hover:underline transition-all"
                    onClick={() => router.push(`/profile/${work.author_id}`)}
                  >
                    {work.author_name}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors">
                    {work.genre}
                  </Badge>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 hover:text-red-600 transition-colors">
                      <Eye className="h-3 w-3" />
                      <span className="font-medium">{formatNumber(work.views)}</span>
                    </span>
                    <span className="flex items-center gap-1 hover:text-red-600 transition-colors">
                      <Heart className="h-3 w-3" />
                      <span className="font-medium">{formatNumber(work.likes)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(work.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2 leading-relaxed">
                  {work.excerpt}
                </p>
                
                {/* Enhanced interaction buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/work/${work.id}`)}
                    className="text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Leer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSave(work.id)}
                    className={`text-xs transition-all ${
                      isSaved 
                        ? 'text-red-600 hover:text-red-700 bg-red-50' 
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Bookmark className={`h-3 w-3 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Guardado' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Author Result Card Component
function AuthorResultCard({ author, onFollow, isFollowing }: { author: AuthorResult; onFollow: (id: string) => void; isFollowing: boolean }) {
  const router = useRouter()
  
  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar 
              className="h-14 w-14 cursor-pointer ring-2 ring-gray-200 hover:ring-blue-400 transition-all duration-200" 
              onClick={() => router.push(`/profile/${author.id}`)}
            >
              <AvatarImage src={author.avatar_url} className="hover:scale-110 transition-transform duration-200" />
              <AvatarFallback className="bg-red-100 text-red-700 font-bold text-lg">
                {author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {author.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 
                className="font-bold text-lg text-gray-900 hover:text-red-600 cursor-pointer transition-colors duration-200"
                onClick={() => router.push(`/profile/${author.id}`)}
              >
                {author.name}
              </h3>
              {author.verified && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                  ✓ Verificado
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 font-medium">@{author.username}</p>
            {author.bio && (
              <p className="text-sm text-gray-700 mt-2 line-clamp-2 leading-relaxed">{author.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{formatNumber(author.followers_count)}</span> seguidores
              </span>
              <span className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors">
                <BookOpen className="h-4 w-4" />
                <span className="font-semibold">{formatNumber(author.works_count)}</span> obras
              </span>
            </div>
            
            {/* Enhanced action buttons */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/profile/${author.id}`)}
                className="text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
              >
                <User className="h-3 w-3 mr-1" />
                Ver perfil
              </Button>
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={() => onFollow(author.id)}
                className={`text-xs transition-all ${
                  isFollowing 
                    ? "text-gray-700 hover:text-red-600 hover:border-red-200" 
                    : "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {isFollowing ? (
                  <>
                    <Users className="h-3 w-3 mr-1" />
                    Siguiendo
                  </>
                ) : (
                  <>
                    <Users className="h-3 w-3 mr-1" />
                    Seguir
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Genre Result Card Component
function GenreResultCard({ genre }: { genre: GenreResult }) {
  const router = useRouter()
  
  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }
  
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 border-l-purple-500 group"
      onClick={() => router.push(`/explore?tag=${encodeURIComponent(genre.name)}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-purple-100 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Tag className="h-6 w-6 text-red-600 group-hover:text-purple-600 transition-colors" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors duration-200">
              {genre.name}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {formatNumber(genre.works_count)} obra{genre.works_count !== 1 ? 's' : ''} disponible{genre.works_count !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                Género
              </Badge>
              {genre.works_count > 100 && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  Popular
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-gray-400 group-hover:text-red-600 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        {/* Progress bar showing relative popularity */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-red-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((genre.works_count / Math.max(genre.works_count, 50)) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
