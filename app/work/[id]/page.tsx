'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookOpen, Heart, Bookmark, MessageCircle, Share2, ChevronLeft } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { createLikeNotification, createCommentNotification } from '@/lib/notifications'
import { useViewTracker } from '@/hooks/useViewTracker'
import AppHeader from '@/components/AppHeader'
import ReadingToolbar, { useReadingPreferences } from '@/components/ReadingToolbar'

type Chapter = { title?: string; content?: string }

// Función para renderizar markdown básico
const renderMarkdownHtml = (raw: string) => {
  if (!raw) return { __html: '' }
  
  const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines = raw.split('\n')
  const htmlLines: string[] = []
  let inList = false
  let inCodeBlock = false
  
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      if (!inCodeBlock) {
        inCodeBlock = true
        htmlLines.push(`<pre class="bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto my-4"><code>`)
      } else {
        inCodeBlock = false
        htmlLines.push('</code></pre>')
      }
      continue
    }
    
    if (inCodeBlock) {
      htmlLines.push(escapeHtml(line || ' '))
      continue
    }
    
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        inList = true
        htmlLines.push('<ul class="list-disc pl-6 mb-4">')
      }
      const item = line.replace(/^\s*[-*]\s+/, '')
      htmlLines.push(`<li class="mb-1">${escapeHtml(item)}</li>`)
      continue
    }
    
    if (inList) {
      htmlLines.push('</ul>')
      inList = false
    }
    
    if (/^\s*[-*_]{3,}\s*$/.test(line)) {
      htmlLines.push('<hr class="my-6 border-gray-200"/>')
      continue
    }
    
    if (/^\s*#\s+/.test(line)) {
      htmlLines.push(`<h1 class="text-3xl font-bold mt-12 mb-6 text-gray-900" style="font-family: Georgia, serif; line-height: 1.2;">${escapeHtml(line.replace(/^\s*#\s+/, ''))}</h1>`) 
      continue
    }
    
    if (/^\s*##\s+/.test(line)) {
      htmlLines.push(`<h2 class="text-2xl font-semibold mt-10 mb-4 text-gray-900" style="font-family: Georgia, serif; line-height: 1.3;">${escapeHtml(line.replace(/^\s*##\s+/, ''))}</h2>`) 
      continue
    }
    
    if (/^\s*>\s+/.test(line)) {
      htmlLines.push(`<blockquote class="border-l-4 border-red-300 pl-6 italic text-gray-700 my-6 bg-red-50/30 py-4 rounded-r-lg" style="font-size: 1.1em; line-height: 1.6;">${escapeHtml(line.replace(/^\s*>\s+/, ''))}</blockquote>`) 
      continue
    }
    
    // Formateo en línea
    let processedLine = line
    processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    processedLine = processedLine.replace(/\*(.+?)\*/g, '<em>$1</em>')
    processedLine = processedLine.replace(/~~(.+?)~~/g, '<del>$1</del>')
    processedLine = processedLine.replace(/`([^`]+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
    
    if (processedLine.trim().length === 0) {
      htmlLines.push('<br class="my-2"/>')
    } else {
      const escaped = escapeHtml(processedLine).replace(/&lt;(strong|em|del|code)&gt;|&lt;\/(strong|em|del|code)&gt;/g, (m) => {
        const replacements: Record<string, string> = {
          '&lt;strong&gt;': '<strong>',
          '&lt;/strong&gt;': '</strong>',
          '&lt;em&gt;': '<em>',
          '&lt;/em&gt;': '</em>',
          '&lt;del&gt;': '<del>',
          '&lt;/del&gt;': '</del>',
          '&lt;code': '<code',
          '&lt;/code&gt;': '</code>'
        }
        return replacements[m] || m
      })
      htmlLines.push(`<p class="leading-8 mb-6 text-gray-800" style="font-size: inherit; line-height: inherit;">${escaped}</p>`) 
    }
  }
  
  if (inList) htmlLines.push('</ul>')
  return { __html: htmlLines.join('\n') }
}

export default function WorkDetailPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const workId = (params?.id || '').toString()

  const [loading, setLoading] = useState(true)
  const [work, setWork] = useState<any | null>(null)
  const [author, setAuthor] = useState<any | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [likesCount, setLikesCount] = useState<number>(0)
  const [commentsCount, setCommentsCount] = useState<number>(0)
  const [viewsCount, setViewsCount] = useState<number>(0)
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [activeChapterIndex, setActiveChapterIndex] = useState(0)
  const [readingProgress, setReadingProgress] = useState(0)

  // Track view automatically when work loads
  useViewTracker(workId, currentUserId, !!work && !loading)

  // Reading preferences hook
  const { preferences, getReadingStyles } = useReadingPreferences()

  // Aplicar tema de fondo al contenedor principal
  const getContainerStyles = () => {
    const themeStyles = {
      light: { backgroundColor: '#ffffff' },
      dark: { backgroundColor: '#1f2937' },
      sepia: { backgroundColor: '#f7f3e9' }
    }
    return themeStyles[preferences.theme]
  }

  useEffect(() => {
    if (!workId) return
    ;(async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) setCurrentUserId(userData.user.id)

        const { data: w } = await supabase
          .from('works')
          .select('id,title,genre,cover_url,chapters,content,author_id,created_at,updated_at,views')
          .eq('id', workId)
          .single()
        if (!w) { setLoading(false); return }
        setWork(w)
        setViewsCount(w.views || 0)

        try {
          const { data: p } = await supabase
            .from('profiles')
            .select('id,username,name,avatar_url')
            .eq('id', w.author_id)
            .single()
          setAuthor(p || null)
        } catch (error) {
          console.warn('Profiles table not available:', error)
          setAuthor(null)
        }

        // counts - using robust queries
        try {
          const { robustLikesCount, robustQuery } = await import('@/lib/database-validator')
          
          const [likesResult, commentsResult] = await Promise.all([
            robustLikesCount(workId),
            robustQuery(
              async () => {
                const result = await supabase.from('comments').select('id', { count: 'exact', head: true }).eq('work_id', workId)
                return { data: { count: result.count || 0 }, error: result.error }
              },
              { count: 0 },
              'comments count'
            )
          ])
          
          setLikesCount(likesResult.count)
          setCommentsCount(commentsResult.data?.count || 0)
          
          if (likesResult.fallback) console.log('📊 Using fallback for likes count')
          if (commentsResult.fallback) console.log('📊 Using fallback for comments count')
        } catch (error) {
          console.warn('Error loading counts:', error)
          setLikesCount(0)
          setCommentsCount(0)
        }

        // current user states
        if (userData?.user) {
          const [{ data: likedRow }, { data: bookmarkedRow }] = await Promise.all([
            supabase.from('likes').select('work_id').eq('user_id', userData.user.id).eq('work_id', workId).maybeSingle(),
            supabase.from('bookmarks').select('work_id').eq('user_id', userData.user.id).eq('work_id', workId).maybeSingle(),
          ])
          setIsLiked(!!likedRow)
          setIsBookmarked(!!bookmarkedRow)
        } else {
          try {
            const raw = localStorage.getItem('palabreo-bookmarks')
            const ids: any[] = raw ? JSON.parse(raw) : []
            setIsBookmarked(ids.includes(workId))
          } catch {}
        }

        // comments list (latest 50) with author info - using robust query
        try {
          const { robustCommentsQuery } = await import('@/lib/database-validator')
          const result = await robustCommentsQuery(workId)
          
          setComments(result.data || [])
          
          if (result.fallback) {
            console.log('📝 Using fallback for comments - some features may be limited')
          }
        } catch (error) {
          console.warn('Comments loading failed:', error)
          setComments([])
        }

        // record a read event (no await)
        void supabase.from('reads').insert({ user_id: userData?.user?.id || null, work_id: workId })
      } finally {
        setLoading(false)
      }
    })()
  }, [workId])

  const chapters: Chapter[] = useMemo(() => {
    if (!work) return []
    const ch = Array.isArray(work.chapters) && work.chapters.length > 0 ? work.chapters : (work.content ? [{ title: work.title, content: work.content }] : [])
    return ch
  }, [work])

  const activeContent = useMemo(() => {
    if (!chapters || chapters.length === 0) return ''
    const idx = Math.min(Math.max(0, activeChapterIndex), chapters.length - 1)
    return chapters[idx]?.content || ''
  }, [chapters, activeChapterIndex])

  // Calcular progreso de lectura
  useEffect(() => {
    if (chapters.length > 1) {
      const progress = ((activeChapterIndex + 1) / chapters.length) * 100
      setReadingProgress(progress)
    } else {
      // Para obras de un solo capítulo, simular progreso basado en scroll
      setReadingProgress(50) // Por ahora un valor fijo
    }
  }, [activeChapterIndex, chapters.length])

  const toggleLike = async () => {
    if (!workId) return
    const supabase = getSupabaseBrowserClient()
    if (!currentUserId) {
      setIsLiked((v) => !v)
      setLikesCount((c) => (isLiked ? Math.max(0, c - 1) : c + 1))
      return
    }
    try {
      if (!isLiked) {
        await supabase.from('likes').insert({ user_id: currentUserId, work_id: workId })
        setIsLiked(true)
        setLikesCount((c) => c + 1)
        
        // Create notification for the author
        if (work && author && currentUserId !== work.author_id) {
          const { data: userData } = await supabase.auth.getUser()
          const currentUserName = userData?.user?.user_metadata?.name || userData?.user?.email || 'Alguien'
          createLikeNotification(workId, work.title, work.author_id, currentUserId, currentUserName)
        }
      } else {
        await supabase.from('likes').delete().eq('user_id', currentUserId).eq('work_id', workId)
        setIsLiked(false)
        setLikesCount((c) => Math.max(0, c - 1))
      }
    } catch {}
  }

  const toggleBookmark = async () => {
    if (!workId) return
    const supabase = getSupabaseBrowserClient()
    setIsBookmarked((v) => !v)
    try {
      if (currentUserId) {
        if (!isBookmarked) {
          await supabase.from('bookmarks').insert({ user_id: currentUserId, work_id: workId })
        } else {
          await supabase.from('bookmarks').delete().eq('user_id', currentUserId).eq('work_id', workId)
        }
      } else {
        const raw = localStorage.getItem('palabreo-bookmarks')
        let ids: any[] = raw ? JSON.parse(raw) : []
        if (!isBookmarked) {
          if (!ids.includes(workId)) ids.push(workId)
        } else {
          ids = ids.filter((id: any) => id !== workId)
        }
        localStorage.setItem('palabreo-bookmarks', JSON.stringify(ids))
      }
    } catch {}
  }

  const addComment = async () => {
    const text = newComment.trim()
    if (!text) return
    if (!currentUserId) {
      alert('Inicia sesión para comentar')
      return
    }
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('comments')
        .insert({ work_id: workId, author_id: currentUserId, text })
        .select('id, text, author_id, created_at')
        .single()
      if (!error && data) {
        setComments((prev) => [...prev, data])
        setCommentsCount((c) => c + 1)
        setNewComment('')
        
        // Create notification for the author
        if (work && author && currentUserId !== work.author_id) {
          const { data: userData } = await supabase.auth.getUser()
          const currentUserName = userData?.user?.user_metadata?.name || userData?.user?.email || 'Alguien'
          createCommentNotification(workId, work.title, work.author_id, currentUserId, currentUserName)
        }
      } else {
        console.warn('Error adding comment:', error)
        // Alert user that comment couldn't be posted
        alert('No se pudo agregar el comentario. La función de comentarios no está disponible.')
      }
    } catch (error) {
      console.warn('Comments table not available:', error)
      alert('La función de comentarios no está disponible en este momento.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto p-4">Cargando…</div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto p-4">No se encontró la obra.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Área principal de lectura */}
      <main className="transition-colors duration-300" style={getContainerStyles()}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Navegación de regreso */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="text-gray-600 hover:text-gray-900 transition-colors"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          {/* Imagen de portada (si existe) */}
          {work.cover_url && (
            <div className="relative w-full h-64 sm:h-80 mb-8 rounded-lg overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={work.cover_url} alt={work.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}

          {/* Meta información del artículo */}
          <header className="text-center mb-8 sm:mb-12">
            <h1 
              className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 transition-colors duration-300" 
              style={{ 
                fontFamily: 'Georgia, serif',
                color: preferences.theme === 'dark' ? '#f9fafb' : (preferences.theme === 'sepia' ? '#5d4e37' : '#1f2937')
              }}
            >
              {work.title}
            </h1>
            
            {author && (
              <div className="flex items-center justify-center gap-4 mb-6">
                <Avatar className="h-12 w-12 ring-2 ring-red-100 shadow-sm">
                  <AvatarImage src={author.avatar_url || '/api/placeholder/48/48'} />
                  <AvatarFallback className="text-sm bg-red-50 text-red-700 font-semibold">
                    {(author.name || 'A').split(' ').map((n:string)=>n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div 
                    className="text-lg font-semibold transition-colors duration-300"
                    style={{ color: preferences.theme === 'dark' ? '#f9fafb' : (preferences.theme === 'sepia' ? '#5d4e37' : '#1f2937') }}
                  >
                    {author.name || 'Autor'}
                  </div>
                  <div 
                    className="text-sm transition-colors duration-300"
                    style={{ color: preferences.theme === 'dark' ? '#d1d5db' : (preferences.theme === 'sepia' ? '#8b7355' : '#6b7280') }}
                  >
                    {author.username ? (author.username.startsWith('@') ? author.username : `@${author.username}`) : '@autor'}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> 
                {work.genre || 'Obra'}
              </span>
              <span className="text-gray-400">•</span>
              <span>{new Date(work.created_at).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <span className="text-gray-400">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                {likesCount}
              </span>
              <span className="text-gray-400">•</span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {viewsCount} {viewsCount === 1 ? 'vista' : 'vistas'}
              </span>
            </div>
          </header>

          {/* Navegación de capítulos mejorada */}
          {chapters && chapters.length > 1 && (
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center justify-center mb-4">
                <span className="text-sm text-gray-500 font-medium">Capítulos</span>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-3">
                {chapters.map((ch, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveChapterIndex(i)} 
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                      i === activeChapterIndex 
                        ? 'bg-red-600 text-white border-red-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {i + 1}. {ch.title || `Capítulo ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contenido principal del artículo */}
          <article 
            className="prose prose-lg max-w-none transition-all duration-300" 
            style={getReadingStyles()}
          >
            <div 
              className="leading-inherit" 
              dangerouslySetInnerHTML={renderMarkdownHtml(activeContent)} 
            />
          </article>

          {/* Footer con acciones sociales mejorado */}
          <footer className="mt-12 sm:mt-16 border-t border-gray-200 pt-8">
            <div className="flex items-center justify-center gap-8 mb-8">
              <button 
                onClick={toggleLike} 
                className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{likesCount}</span>
                <span className="text-sm">{likesCount === 1 ? 'Me gusta' : 'Me gusta'}</span>
              </button>
              
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200 ${
                  isBookmarked 
                    ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                    : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span className="text-sm">{isBookmarked ? 'Guardado' : 'Guardar'}</span>
              </button>
              
              <button 
                onClick={async () => { 
                  try { 
                    const url = typeof window !== 'undefined' ? window.location.href : ''; 
                    if (navigator.share) {
                      await navigator.share({ url, title: work.title });
                    } else {
                      await navigator.clipboard.writeText(url);
                      // TODO: Mostrar toast de confirmación
                    }
                  } catch {} 
                }}
                className="flex items-center gap-3 px-4 py-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-sm">Compartir</span>
              </button>
            </div>
          </footer>

          {/* Sección de comentarios mejorada */}
          <section className="mt-12 sm:mt-16 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Comentarios ({commentsCount})
            </h3>
            
            {currentUserId && (
              <div className="mb-8 max-w-2xl mx-auto">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-red-50 text-red-700 text-sm font-semibold">
                      Tú
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      placeholder="Comparte tu opinión sobre esta obra..." 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      rows={3}
                    />
                    <div className="flex justify-end mt-3">
                      <Button 
                        onClick={addComment} 
                        disabled={!newComment.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Publicar comentario
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Sé el primero en comentar esta obra.</p>
                {!currentUserId && (
                  <p className="text-sm text-gray-500 mt-2">
                    <button className="text-red-600 hover:text-red-700 underline">Inicia sesión</button> para dejar un comentario.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl mx-auto">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-semibold">
                        {(c.profiles?.name || c.profiles?.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 text-sm">
                            {c.profiles?.name || c.profiles?.username || 'Usuario'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(c.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Reading Toolbar */}
      <ReadingToolbar
        genre={work.genre || 'cuento'}
        currentChapter={activeChapterIndex}
        totalChapters={chapters.length}
        readingProgress={readingProgress}
        content={activeContent}
        onChapterChange={(chapter) => setActiveChapterIndex(chapter)}
        onBookmark={() => setIsBookmarked(!isBookmarked)}
        onShare={async () => {
          try {
            const url = typeof window !== 'undefined' ? window.location.href : ''
            if (navigator.share) {
              await navigator.share({ url, title: work.title })
            } else {
              await navigator.clipboard.writeText(url)
            }
          } catch (error) {
            // Silently handle share errors
          }
        }}
      />
    </div>
  )
}



