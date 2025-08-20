'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bookmark, BookOpen, ArrowLeft } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import AppHeader from '@/components/AppHeader'

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

// Se cargará desde Supabase en runtime

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<Post[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          const { data: bm } = await supabase
            .from('bookmarks')
            .select('work_id')
            .eq('user_id', userData.user.id)
          const workIds = (bm || []).map((r: any) => r.work_id)
          if (workIds.length === 0) { setFavorites([]); return }
          const { data: works } = await supabase
            .from('works')
            .select('id,title,genre,cover_url,chapters,content,author_id')
            .in('id', workIds)
          const authorIds = Array.from(new Set((works || []).map((w: any) => w.author_id)))
          let profilesMap: Record<string, any> = {}
          if (authorIds.length > 0) {
            const { data: profs } = await supabase
              .from('profiles')
              .select('id,username,name,avatar_url')
              .in('id', authorIds)
            profilesMap = (profs || []).reduce((acc: any, p: any) => { acc[p.id] = p; return acc }, {})
          }
          const mapped: Post[] = (works || []).map((w: any) => {
            const author = profilesMap[w.author_id] || {}
            const body = w.chapters && Array.isArray(w.chapters) && w.chapters.length > 0 ? (w.chapters[0]?.content || '') : (w.content || '')
            return {
              id: w.id,
              author: { name: author.name || 'Autor', username: author.username ? `@${author.username}` : '@autor', avatar: author.avatar_url || '/api/placeholder/40/40' },
              title: w.title,
              content: body,
              genre: w.genre || 'Obra',
              readTime: '—',
              image: w.cover_url || undefined,
            }
          })
          setFavorites(mapped)
        } else {
          // Fallback local
          const raw = localStorage.getItem('palabreo-bookmarks')
          const ids: any[] = raw ? JSON.parse(raw) : []
          setFavorites([]) // no dataset local; dejamos vacío
        }
      } catch { setFavorites([]) }
    })()
  }, [])

  const removeFromFavorites = async (postId: number) => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        await supabase.from('bookmarks').delete().eq('user_id', userData.user.id).eq('work_id', postId)
      } else {
        const raw = localStorage.getItem('palabreo-bookmarks')
        let ids: any[] = raw ? JSON.parse(raw) : []
        ids = ids.filter((id: any) => id !== postId)
        localStorage.setItem('palabreo-bookmarks', JSON.stringify(ids))
      }
      setFavorites(prev => prev.filter(p => p.id !== postId))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader />

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


