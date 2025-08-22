'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Bell, PenTool, MessageCircle, UserPlus, AtSign, Heart, User, Settings, LogOut } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { getUnreadNotificationsCount } from '@/lib/notifications'
import { useAuth } from '@/hooks/useAuth'
import SearchBar from '@/components/SearchBar'

interface AppHeaderProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
  className?: string
}

export default function AppHeader({ 
  searchValue: externalSearchValue = '', 
  onSearchChange, 
  showSearch = true,
  className = ''
}: AppHeaderProps) {
  const router = useRouter()
  const { signOut } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [internalSearchValue, setInternalSearchValue] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Use external search value if provided, otherwise use internal state
  const searchValue = externalSearchValue || internalSearchValue
  const handleSearchChange = onSearchChange || setInternalSearchValue

  // Load user ID and unread count
  useEffect(() => {
    const abortController = new AbortController()
    
    const loadUser = async () => {
      try {
        if (abortController.signal.aborted) return
        
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        
        if (abortController.signal.aborted) return
        
        if (userData?.user) {
          setUserId(userData.user.id)
          const count = await getUnreadNotificationsCount(userData.user.id)
          if (!abortController.signal.aborted) {
            setUnreadCount(count)
          }
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error loading user data:', error)
        }
      }
    }
    
    loadUser()
    
    // Refresh notification count when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        getUnreadNotificationsCount(userId).then(count => {
          setUnreadCount(count)
        })
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      abortController.abort()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userId])

  // Set up real-time subscription for notification updates
  useEffect(() => {
    if (!userId) return

    const supabase = getSupabaseBrowserClient()
    
    const subscription = supabase
      .channel('notification_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Reload unread count when notifications change
          const count = await getUnreadNotificationsCount(userId)
          setUnreadCount(count)
          // Also reload notifications if dropdown is open
          if (showNotifications) {
            loadRecentNotifications()
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, showNotifications])

  // Load recent notifications when dropdown opens
  useEffect(() => {
    const abortController = new AbortController()
    
    if (showNotifications && userId && notifications.length === 0) {
      loadRecentNotifications(abortController.signal)
    }
    
    return () => {
      abortController.abort()
    }
  }, [showNotifications, userId])

  const loadRecentNotifications = async (abortSignal?: AbortSignal) => {
    if (!userId) return
    
    setLoadingNotifications(true)
    try {
      if (abortSignal?.aborted) return
      
      const supabase = getSupabaseBrowserClient()
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5) // Only show recent 5 notifications in header
        .abortSignal(abortSignal)

      if (abortSignal?.aborted) return
      
      if (rawNotifications) {
        const formattedNotifications = rawNotifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          read: n.read,
          work_id: n.work_id,
          from_user_id: n.from_user_id,
          from_user_name: (n.from_profiles as any)?.name || (n.from_profiles as any)?.username || 'Usuario',
          work_title: (n.works as any)?.title || 'Obra',
          created_at: n.created_at,
          time: formatTimeAgo(n.created_at)
        }))
        
        if (!abortSignal?.aborted) {
          setNotifications(formattedNotifications)
        }
      }
    } catch (error) {
      if (!abortSignal?.aborted) {
        console.error('Error loading notifications:', error)
      }
    } finally {
      if (!abortSignal?.aborted) {
        setLoadingNotifications(false)
      }
    }
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-600 mt-0.5" />
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-600 mt-0.5" />
      case 'mention':
        return <AtSign className="h-4 w-4 text-red-600 mt-0.5" />
      case 'like':
        return <Heart className="h-4 w-4 text-pink-600 mt-0.5" />
      default:
        return <Bell className="h-4 w-4 text-gray-600 mt-0.5" />
    }
  }

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if unread
    if (!notification.read && userId) {
      try {
        const supabase = getSupabaseBrowserClient()
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id)
        
        // Update local state
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }

    // Navigate to relevant page
    setShowNotifications(false)
    if (notification.work_id) {
      router.push(`/work/${notification.work_id}`)
    } else if (notification.type === 'follow' && notification.from_user_id) {
      router.push(`/profile/${notification.from_user_id}`)
    }
  }

  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-full mx-auto px-10 sm:px-16 lg:px-24 xl:px-32">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clickable to go to /main */}
          <button 
            onClick={() => router.push('/main')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg p-1 -m-1"
            aria-label="Ir a página principal"
          >
            <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 overflow-hidden rounded-md flex items-center justify-center bg-transparent">
              <div className="relative h-[200%] w-[200%] -m-[50%]">
                <Image src="/1.png" alt="Palabreo logo" fill sizes="56px" className="object-cover" priority />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-red-600 [font-family:var(--font-poppins)]">
              Palabreo
            </h1>
          </button>

          {/* Search Bar */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar
                placeholder="Buscar obras, autores..."
                value={searchValue}
                onChange={handleSearchChange}
                onSearch={(query) => {
                  router.push(`/search?q=${encodeURIComponent(query)}`)
                }}
                className="w-full"
                showHistory={true}
                maxHistoryItems={8}
              />
            </div>
          )}

          {/* Header Actions */}
          <div className="flex items-center space-x-3 relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => router.push('/search')}
              aria-label="Abrir búsqueda"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-600 hover:text-red-600 hover:bg-red-50"
              onClick={() => setShowNotifications((v) => !v)}
              aria-expanded={showNotifications}
              aria-haspopup="menu"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
            
            <Button 
              className="hidden md:inline-flex bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm" 
              onClick={() => router.push('/writer')}
            >
              <PenTool className="h-4 w-4 mr-2" />
              Publicar
            </Button>
            
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="Menú de usuario" 
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 hover:ring-2 hover:ring-red-200 transition-all"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback className="text-xs bg-red-100 text-red-700">TU</AvatarFallback>
                </Avatar>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/profile')
                    }}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Ver Perfil
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/notifications')
                    }}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Configuración
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      signOut()
                    }}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {showNotifications && (
              <div
                role="menu"
                aria-label="Notificaciones recientes"
                className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-sm font-semibold text-red-800 flex items-center justify-between">
                  <span>Recientes</span>
                  <button 
                    onClick={() => router.push('/notifications')}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Ver todas
                  </button>
                </div>
                <ul className="max-h-80 overflow-auto divide-y divide-gray-100">
                  {loadingNotifications ? (
                    <li className="px-4 py-6 text-center text-sm text-gray-500">
                      Cargando notificaciones...
                    </li>
                  ) : notifications.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-gray-500">
                      No tienes notificaciones recientes
                    </li>
                  ) : (
                    notifications.map(notification => (
                      <li 
                        key={notification.id}
                        className={`px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className={`font-medium text-gray-900 text-sm truncate ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </div>
                              <div className="text-xs text-gray-500 shrink-0">{notification.time}</div>
                            </div>
                            <div className={`text-xs mt-0.5 text-gray-600 line-clamp-2 ${!notification.read ? 'text-gray-800' : ''}`}>
                              {notification.body}
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}
