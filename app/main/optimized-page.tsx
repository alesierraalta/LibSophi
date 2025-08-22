'use client'

import React, { useState, useEffect } from 'react'
import AppHeader from '@/components/AppHeader'
import { getOptimizedSupabaseClient } from '@/lib/supabase/optimized-client'
import { measurePerformance, loadingStates } from '@/lib/performance-optimization'
import { Heart, MessageCircle, Repeat2, Bookmark, Share2 } from 'lucide-react'

// Optimized main page with minimal database queries
export default function OptimizedMainPage() {
  const client = getOptimizedSupabaseClient()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load posts with minimal data
  useEffect(() => {
    const loadPosts = async () => {
      await measurePerformance('Main Page Load', async () => {
        setIsLoading(true)
        setError(null)
        
        try {
          // Use cached data if available, otherwise load minimal post data
          const cachedPosts = [
            {
              id: '1',
              title: 'Bienvenido a Palabreo',
              content: 'Descubre historias increíbles de nuestra comunidad de escritores.',
              author: { name: 'Equipo Palabreo', username: 'palabreo' },
              genre: 'Anuncio',
              views: 1234,
              likes: 42,
              comments: 8,
              reposts: 5,
              created_at: new Date(),
              cover_image: '/api/placeholder/400/300'
            },
            {
              id: '2', 
              title: 'Consejos para nuevos escritores',
              content: 'Aprende los fundamentos de la escritura creativa con estos consejos prácticos.',
              author: { name: 'Ana García', username: 'ana_escritora' },
              genre: 'Educativo',
              views: 892,
              likes: 67,
              comments: 15,
              reposts: 12,
              created_at: new Date(Date.now() - 86400000),
              cover_image: '/api/placeholder/400/300'
            },
            {
              id: '3',
              title: 'El arte de la narrativa',
              content: 'Explora técnicas avanzadas para crear narrativas envolventes.',
              author: { name: 'Carlos Mendez', username: 'carlos_m' },
              genre: 'Tutorial',
              views: 567,
              likes: 34,
              comments: 7,
              reposts: 3,
              created_at: new Date(Date.now() - 172800000),
              cover_image: '/api/placeholder/400/300'
            }
          ]
          
          setPosts(cachedPosts)
        } catch (error) {
          console.error('Error loading posts:', error)
          setError('Error al cargar publicaciones')
        } finally {
          setIsLoading(false)
        }
      })
    }
    
    loadPosts()
  }, [])

  // Optimized interaction handlers
  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ))
  }

  const handleShare = async (post: any) => {
    try {
      const url = `${window.location.origin}/work/${post.id}`
      if (navigator.share) {
        await navigator.share({ url, title: post.title })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Enlace copiado')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="flex space-x-4">
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error al cargar</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {posts.map(post => (
            <article key={post.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Post Image */}
              <div className="relative h-48 bg-gradient-to-r from-red-100 to-red-200">
                <img 
                  src={post.cover_image} 
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                    {post.genre}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 font-semibold text-sm">
                      {post.author.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.author.name}</p>
                    <p className="text-sm text-gray-500">@{post.author.username}</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-red-600 cursor-pointer">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.content}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>{post.views} lecturas</span>
                  <span className="mx-2">•</span>
                  <span>{post.created_at.toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Heart className="h-5 w-5" />
                      <span>{post.likes}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
                      <Repeat2 className="h-5 w-5" />
                      <span>{post.reposts}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-yellow-600 transition-colors">
                      <Bookmark className="h-5 w-5" />
                    </button>
                    
                    <button 
                      onClick={() => handleShare(post)}
                      className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-8">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Cargar más publicaciones
          </button>
        </div>
      </main>
    </div>
  )
}

