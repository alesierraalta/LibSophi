'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bookmark, BookOpen, ArrowLeft } from 'lucide-react'

type Author = {
  name: string
  username: string
  avatar: string
}

type Post = {
  id: number
  author: Author
  title: string
  content: string
  genre: string
  readTime: string
  image?: string
}

// Dataset de ejemplo consistente con los IDs usados en /main
const allPosts: Post[] = [
  {
    id: 1,
    author: { name: 'María González', username: '@mariagonzalez', avatar: '/api/placeholder/40/40' },
    title: 'El susurro del viento - Capítulo 3',
    content:
      'En las montañas de los Andes, donde el viento susurra secretos ancestrales, una joven escritora descubre que las palabras tienen el poder de cambiar el destino...',
    genre: 'Fantasía',
    readTime: '12 min',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
  },
  {
    id: 2,
    author: { name: 'Carlos Mendoza', username: '@carlosmendoza', avatar: '/api/placeholder/40/40' },
    title: 'Versos al amanecer',
    content:
      'Cuando la luz toca las montañas y el silencio se vuelve canción, mi alma despierta entre las ramas de un sueño que no tiene razón...',
    genre: 'Poesía',
    readTime: '3 min',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
  },
  {
    id: 3,
    author: { name: 'Ana Rodríguez', username: '@anarodriguez', avatar: '/api/placeholder/40/40' },
    title: 'Capítulo 1: El último tren',
    content:
      'La estación estaba desierta a esa hora de la madrugada. Solo el eco de mis pasos resonaba entre los andenes vacíos, creando una sinfonía melancólica...',
    genre: 'Novela',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop',
  },
  {
    id: 4,
    author: { name: 'Diego Herrera', username: '@diegoherrera', avatar: '/api/placeholder/40/40' },
    title: 'Monólogo del tiempo perdido',
    content:
      '¿Cuántas veces hemos dejado que el tiempo se escurra entre nuestros dedos como arena? Yo he sido coleccionista de momentos perdidos...',
    genre: 'Teatro',
    readTime: '5 min',
  },
  {
    id: 5,
    author: { name: 'Sofía Martín', username: '@sofiamartin', avatar: '/api/placeholder/40/40' },
    title: 'Reflexiones semanales: El arte de la paciencia',
    content:
      'Queridos lectores, esta semana he estado reflexionando sobre algo que nuestra sociedad acelerada parece haber olvidado: el arte de la paciencia...',
    genre: 'Newsletter',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop',
  },
]

export default function FavoritesPage() {
  const router = useRouter()
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('palabreo-bookmarks')
      const ids: number[] = raw ? JSON.parse(raw) : []
      setFavoriteIds(ids)
    } catch {
      setFavoriteIds([])
    }
  }, [])

  const favorites = useMemo(() => {
    return allPosts.filter((p) => favoriteIds.includes(p.id))
  }, [favoriteIds])

  const removeFromFavorites = (postId: number) => {
    setFavoriteIds((prev) => {
      const next = prev.filter((id) => id !== postId)
      try {
        localStorage.setItem('palabreo-bookmarks', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/main')}
              className="h-12 w-12 overflow-hidden rounded-md flex items-center justify-center bg-transparent"
              aria-label="Ir al inicio"
            >
              <div className="relative h-[200%] w-[200%] -m-[50%]">
                <Image src="/1.png" alt="Palabreo logo" fill sizes="56px" className="object-cover" priority />
              </div>
            </button>
            <h1
              onClick={() => router.push('/main')}
              className="text-xl md:text-2xl font-bold text-red-600 cursor-pointer [font-family:var(--font-poppins)]"
            >
              Palabreo
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="hidden sm:inline-flex">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Atrás
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/main')}>
              Ir al feed
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Bookmark className="h-5 w-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900">Favoritos</h2>
        </div>

        {favorites.length === 0 ? (
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-2 text-gray-600">
                <Bookmark className="h-8 w-8 text-yellow-600" />
                <p className="text-sm">Aún no has guardado favoritos.</p>
                <Button onClick={() => router.push('/main')} size="sm" className="mt-2 bg-red-600 hover:bg-red-700 text-white">
                  Explorar contenidos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((post) => (
              <Card key={post.id} className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                {post.image && (
                  <div className="relative w-full h-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader className="p-4">
                  <CardTitle className="text-base line-clamp-2 text-gray-900">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="font-medium">{post.genre}</span>
                    <span className="inline-flex items-center gap-1 ml-auto">
                      <BookOpen className="h-3.5 w-3.5" /> {post.readTime}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3 mb-3" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-red-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.author.avatar} alt={post.author.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{post.author.name}</div>
                        <div className="text-xs text-gray-500 truncate">{post.author.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => removeFromFavorites(post.id)}
                        aria-label="Quitar de favoritos"
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


