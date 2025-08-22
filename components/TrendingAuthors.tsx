'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Crown, Users, BookOpen, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import FollowButton from '@/components/FollowButton'
import { getOptimizedSupabaseClient } from '@/lib/supabase/optimized-client'

interface TrendingAuthor {
  id: string
  username: string
  name: string
  bio?: string
  avatar_url?: string
  followers_count: number
  following_count: number
  works?: { count: number }
}

interface TrendingAuthorsProps {
  limit?: number
  className?: string
  title?: string
  showFollowButton?: boolean
  currentUserId?: string | null
}

export default function TrendingAuthors({
  limit = 8,
  className = '',
  title = 'Autores Destacados',
  showFollowButton = false,
  currentUserId = null
}: TrendingAuthorsProps) {
  const router = useRouter()
  const client = getOptimizedSupabaseClient()
  const [authors, setAuthors] = useState<TrendingAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTrendingAuthors()
  }, [])

  const loadTrendingAuthors = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const trendingAuthors = await client.getTrendingAuthors(limit)
      setAuthors(trendingAuthors)
    } catch (error) {
      console.error('Error loading trending authors:', error)
      setError('Error al cargar autores destacados')
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Crown className="h-6 w-6 text-yellow-600" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="text-center">
                <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-3" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 text-center">
          <div className="text-yellow-600 mb-2">
            <Crown className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadTrendingAuthors} variant="outline">
            Reintentar
          </Button>
        </Card>
      )}

      {/* Authors Grid */}
      {!isLoading && !error && (
        <>
          {authors.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Crown className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay autores destacados
              </h3>
              <p className="text-gray-600">
                Los autores más populares aparecerán aquí.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {authors.map((author, index) => (
                <Card 
                  key={author.id} 
                  className="p-4 text-center hover:shadow-md transition-shadow"
                >
                  {/* Ranking Badge */}
                  {index < 3 && (
                    <div className="absolute top-2 left-2">
                      <div className={`
                        h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                        ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}
                      `}>
                        {index + 1}
                      </div>
                    </div>
                  )}
                  
                  {/* Author Avatar */}
                  <button
                    onClick={() => router.push(`/user/${author.username}`)}
                    className="block mx-auto mb-3"
                  >
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 mx-auto">
                      <Image
                        src={author.avatar_url || '/api/placeholder/64/64'}
                        alt={author.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  </button>
                  
                  {/* Author Info */}
                  <button
                    onClick={() => router.push(`/user/${author.username}`)}
                    className="block w-full text-center mb-3"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {author.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      @{author.username}
                    </p>
                  </button>
                  
                  {/* Stats */}
                  <div className="flex justify-center gap-4 mb-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{formatNumber(author.followers_count)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{author.works?.count || 0}</span>
                    </div>
                  </div>
                  
                  {/* Follow Button */}
                  {showFollowButton && currentUserId && (
                    <FollowButton
                      currentUserId={currentUserId}
                      targetUserId={author.id}
                      size="sm"
                      className="w-full"
                    />
                  )}
                  
                  {!showFollowButton && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/user/${author.username}`)}
                    >
                      Ver perfil
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
