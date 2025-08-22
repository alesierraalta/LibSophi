'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, UserPlus, AtSign, Bell, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import AppHeader from '@/components/AppHeader'

type NotificationType = 'comment' | 'follow' | 'mention' | 'like'

interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  time: string
  read: boolean
  work_id?: string
  from_user_id?: string
  from_user_name?: string
  work_title?: string
  created_at: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'comments' | 'follows' | 'mentions' | 'likes'>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        
        if (!userData?.user) {
          setLoading(false)
          return
        }
        
        setCurrentUserId(userData.user.id)

        // Fetch notifications with related data
        const { data: rawNotifications } = await supabase
          .from('notifications')
          .select(`
            id,
            type,
            title,
            body,
            read,
            work_id,
            from_user_id,
            created_at,
            works:work_id (title),
            from_profiles:from_user_id (name, username)
          `)
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (rawNotifications) {
          const formattedNotifications: Notification[] = rawNotifications.map(n => ({
            id: n.id,
            type: n.type as NotificationType,
            title: n.title,
            body: n.body,
            time: formatTimeAgo(n.created_at),
            read: n.read,
            work_id: n.work_id,
            from_user_id: n.from_user_id,
            from_user_name: (n.from_profiles as any)?.name || (n.from_profiles as any)?.username || 'Usuario',
            work_title: (n.works as any)?.title || 'Obra',
            created_at: n.created_at
          }))
          
          setNotifications(formattedNotifications)
          
          // Mark all notifications as read when the page loads
          const unreadNotifications = formattedNotifications.filter(n => !n.read)
          if (unreadNotifications.length > 0) {
            try {
              const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userData.user.id)
                .eq('read', false)
              
              if (!error) {
                // Update local state to reflect read status
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
              }
            } catch (error) {
              console.error('Error marking notifications as read:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error loading notifications:', error)
        // Fallback to mock data if there's an error
        setNotifications([
          { id: 'n1', type: 'comment', title: 'Nuevo comentario', body: 'Ana comentó tu capítulo "El último tren".', time: 'hace 5 min', read: false, created_at: new Date().toISOString() },
          { id: 'n2', type: 'follow', title: 'Nuevo seguidor', body: 'Carlos empezó a seguirte.', time: 'hace 20 min', read: false, created_at: new Date().toISOString() },
          { id: 'n3', type: 'mention', title: 'Mención', body: 'Te mencionaron en "Versos al amanecer".', time: 'hace 1 h', read: true, created_at: new Date().toISOString() },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'ahora'
    if (diffMins < 60) return `hace ${diffMins} min`
    if (diffHours < 24) return `hace ${diffHours} h`
    if (diffDays < 7) return `hace ${diffDays} d`
    return date.toLocaleDateString()
  }

  const markAsRead = async (notificationId: string) => {
    if (!currentUserId) return

    try {
      const supabase = getSupabaseBrowserClient()
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', currentUserId)

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!currentUserId) return

    try {
      const supabase = getSupabaseBrowserClient()
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', currentUserId)
        .eq('read', false)

      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'comments') return n.type === 'comment'
    if (filter === 'follows') return n.type === 'follow'
    if (filter === 'mentions') return n.type === 'mention'
    if (filter === 'likes') return n.type === 'like'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const Icon = ({ type }: { type: NotificationType }) => {
    if (type === 'comment') return <MessageCircle className="h-5 w-5 text-blue-600" />
    if (type === 'follow') return <UserPlus className="h-5 w-5 text-green-600" />
    if (type === 'like') return <Heart className="h-5 w-5 text-red-600" />
    return <AtSign className="h-5 w-5 text-orange-600" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
            {unreadCount > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="p-3 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base sm:text-lg">Recientes</CardTitle>
              {/* Mobile: dropdown button */}
              <div className="sm:hidden relative">
                <button
                  onClick={() => setShowFilterMenu(v => !v)}
                  aria-haspopup="menu"
                  aria-expanded={showFilterMenu}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white text-gray-700"
                >
                  {filter === 'all' && <Bell className="h-4 w-4" />}
                  {filter === 'follows' && <UserPlus className="h-4 w-4 text-green-600" />}
                  <span>
                    {filter === 'all' ? 'Todas' : 'Seguidores'}
                  </span>
                </button>
                {showFilterMenu && (
                  <div role="menu" className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-md z-10">
                    <button onClick={() => { setFilter('all'); setShowFilterMenu(false) }} className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 ${filter === 'all' ? 'text-red-600' : 'text-gray-700'}`}>
                      <Bell className="h-4 w-4" /> Todas
                    </button>
                    <button onClick={() => { setFilter('follows'); setShowFilterMenu(false) }} className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 ${filter === 'follows' ? 'text-red-600' : 'text-gray-700'}`}>
                      <UserPlus className="h-4 w-4 text-green-600" /> Seguidores
                    </button>
                  </div>
                )}
              </div>
              {/* Desktop: segmented controls */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-full p-1">
                <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${filter === 'all' ? 'bg-red-600 text-white' : 'text-gray-700 hover:text-red-700'}`} aria-pressed={filter === 'all'}>
                  <Bell className="h-4 w-4" /> Todas
                </button>
                <button onClick={() => setFilter('follows')} className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${filter === 'follows' ? 'bg-red-600 text-white' : 'text-gray-700 hover:text-red-700'}`} aria-pressed={filter === 'follows'}>
                  <UserPlus className="h-4 w-4" /> Seguidores
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-sm text-gray-600">Cargando notificaciones...</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-gray-600">No hay notificaciones para este filtro.</div>
            ) : (
              <ul className="divide-y divide-gray-100" role="list">
                {filtered.map(n => (
                  <li 
                    key={n.id} 
                    className={`px-3 sm:px-6 py-3 hover:bg-gray-50 touch-manipulation cursor-pointer ${!n.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id)
                      if (n.work_id) router.push(`/work/${n.work_id}`)
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Icon type={n.type} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className={`text-sm flex-1 truncate ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}`}>
                            {n.title}
                          </div>
                          <div className="text-xs text-gray-500 shrink-0 ml-1">{n.time}</div>
                        </div>
                        <div className={`text-xs mt-0.5 ${!n.read ? 'text-gray-800' : 'text-gray-700'}`}>
                          {n.body}
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 bg-red-600 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


