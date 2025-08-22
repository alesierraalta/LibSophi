'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { TrendingUp, Eye, Heart, Clock, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getOptimizedSupabaseClient } from '@/lib/supabase/optimized-client'

interface TrendingWork {
  id: string
  title: string
  description: string
  genre: string
  views: number
  likes: number
  created_at: Date
  coverUrl?: string
  reading_time: number
  tags: string[]
  trending_score: number
  author: {
    id: string
    username: string
    name: string
    avatar_url?: string
  }
}

interface TrendingWorksProps {
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all'
  limit?: number
  showTimeframeTabs?: boolean
  className?: string
  title?: string
}

export default function TrendingWorks({
  timeframe = 'all',
  limit = 10,
  showTimeframeTabs = true,
  className = '',
  title = 'Obras en Tendencia'
}: TrendingWorksProps) {
  const router = useRouter()
  const client = getOptimizedSupabaseClient()
  const [works, setWorks] = useState<TrendingWork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTimeframe, setActiveTimeframe] = useState(timeframe)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTrendingWorks()
  }, [activeTimeframe])

  const loadTrendingWorks = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const trendingWorks = await client.getTrendingWorks(activeTimeframe, limit)
      setWorks(trendingWorks)
    } catch (error) {
      console.error('Error loading trending works:', error)
      setError('Error al cargar obras en tendencia')
    } finally {
      setIsLoading(false)
    }
  }

  const timeframeTabs = [
    { key: 'daily' as const, label: 'Hoy' },
    { key: 'weekly' as const, label: 'Semana' },
    { key: 'monthly' as const, label: 'Mes' },
    { key: 'all' as const, label: 'Todo' }
  ]

  const formatTrendingScore = (score: number) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}k`
    return Math.round(score).toString()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        
        {showTimeframeTabs && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            {timeframeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTimeframe(tab.key)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${activeTimeframe === tab.key 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="flex gap-4">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                </div>
                <div className="h-6 w-12 bg-gray-200 rounded" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 text-center">
          <div className="text-red-600 mb-2">
            <TrendingUp className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadTrendingWorks} variant="outline">
            Reintentar
          </Button>
        </Card>
      )}

      {/* Works List */}
      {!isLoading && !error && (
        <>
          {works.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <TrendingUp className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay obras en tendencia
              </h3>
              <p className="text-gray-600">
                Las obras más populares aparecerán aquí.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {works.map((work, index) => (
                <Card 
                  key={work.id} 
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/work/${work.id}`)}
                >
                  <div className="flex gap-4">
                    {/* Ranking Number */}
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    
                    {/* Cover Image */}
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src={work.coverUrl || '/api/placeholder/64/64'}
                        alt={work.title}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Work Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {work.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        <span className="truncate">{work.author.name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                          {work.genre}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{work.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{work.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{work.reading_time} min</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Trending Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-red-600 font-medium">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">
                          {formatTrendingScore(work.trending_score)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        trending
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
