'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookOpen, Heart, Bookmark, MessageCircle, Share2, ChevronLeft } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { createLikeNotification, createCommentNotification } from '@/lib/notifications'
import AppHeader from '@/components/AppHeader'

type Chapter = { title?: string; content?: string }

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
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [activeChapterIndex, setActiveChapterIndex] = useState(0)

  useEffect(() => {
    if (!workId) return
    ;(async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) setCurrentUserId(userData.user.id)

        const { data: w } = await supabase
          .from('works')
          .select('id,title,genre,cover_url,chapters,content,author_id,created_at,updated_at')
          .eq('id', workId)
          .single()
        if (!w) { setLoading(false); return }
        setWork(w)

        const { data: p } = await supabase
          .from('profiles')
          .select('id,username,name,avatar_url')
          .eq('id', w.author_id)
          .single()
        setAuthor(p || null)

        // counts
        const [{ count: likesC }, { count: commentsC }] = await Promise.all([
          supabase.from('likes').select('id', { count: 'exact', head: true }).eq('work_id', workId),
          supabase.from('comments').select('id', { count: 'exact', head: true }).eq('work_id', workId),
        ])
        setLikesCount(likesC || 0)
        setCommentsCount(commentsC || 0)

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

        // comments list (latest 50)
        const { data: comms } = await supabase
          .from('comments')
          .select('id, text, author_id, created_at')
          .eq('work_id', workId)
          .order('created_at', { ascending: true })
          .limit(50)
        setComments(comms || [])

        // record a read event (no await)
        supabase.from('reads').insert({ user_id: userData?.user?.id || null, work_id: workId }).then(() => {}).catch(() => {})
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
      }
    } catch {}
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {work.cover_url && (
            <div className="relative w-full h-48 sm:h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={work.cover_url} alt={work.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          )}
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-gray-900">{work.title}</CardTitle>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {work.genre || 'Obra'}</span>
              <span>•</span>
              <span>{new Date(work.created_at).toLocaleString()}</span>
            </div>
            {author && (
              <div className="mt-4 flex items-center gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-red-100">
                  <AvatarImage src={author.avatar_url || '/api/placeholder/40/40'} />
                  <AvatarFallback className="text-xs bg-red-50 text-red-700">{(author.name || 'A').split(' ').map((n:string)=>n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{author.name || 'Autor'}</div>
                  <div className="text-xs text-gray-600">{author.username ? `@${author.username}` : '@autor'}</div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {chapters && chapters.length > 1 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {chapters.map((ch, i) => (
                  <button key={i} onClick={() => setActiveChapterIndex(i)} className={`px-2.5 py-1 text-xs rounded-full border ${i===activeChapterIndex ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    {i+1}. {ch.title || 'Capítulo'}
                  </button>
                ))}
              </div>
            )}
            <article className="prose prose-sm sm:prose max-w-none text-gray-900" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <pre className="whitespace-pre-wrap break-words text-[15px] leading-7" style={{ fontFamily: 'inherit' }}>{activeContent}</pre>
            </article>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex items-center gap-5">
                <button onClick={toggleLike} className={`flex items-center gap-2 text-sm ${isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-700'}`}>
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} /> {likesCount}
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageCircle className="h-5 w-5" /> {commentsCount}
                </div>
              </div>
              <button onClick={async () => { try { const url = typeof window !== 'undefined' ? window.location.href : ''; if (navigator.share) await navigator.share({ url, title: work.title }); else await navigator.clipboard.writeText(url) } catch {} }} className="text-gray-600 hover:text-gray-800 text-sm">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            <section className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Comentarios</h3>
              {comments.length === 0 ? (
                <div className="text-sm text-gray-600">Sé el primero en comentar.</div>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li key={c.id} className="flex items-start gap-2">
                      <div className="h-8 w-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">{(c.author_id || 'U').toString().slice(0,2).toUpperCase()}</div>
                      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 max-w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">{c.text}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex items-center gap-2">
                <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribe un comentario..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
                <Button onClick={addComment} className="bg-red-600 hover:bg-red-700 text-white text-sm">Comentar</Button>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}



