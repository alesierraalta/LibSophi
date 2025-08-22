'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Edit3, Eye, Plus, Home, Compass, PenTool, Heart, FileText, Archive, ArchiveRestore, MoreHorizontal, Trash2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import AppHeader from '@/components/AppHeader'

type Work = {
  id: string
  title: string
  type: string
  reads: number
  likes: number
  cover: string
  updatedAt?: string
  createdAt?: string
  published: boolean
  archived?: boolean
  wordCount?: number
}

// Removed defaultWorks - now always shows real database data or empty state

export default function MisObrasPage() {
  const router = useRouter()
  const [works, setWorks] = useState<Work[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-stories')
  const [showArchived, setShowArchived] = useState(false)
  const [showMenu, setShowMenu] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()
    
    const loadWorks = async () => {
      setIsLoading(true)
      
      try {
        if (abortController.signal.aborted) return
        
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        
        if (abortController.signal.aborted) return
        
        if (userData?.user) {
          // User is authenticated - load their actual works
          console.log('🔍 Loading works for authenticated user:', userData.user.id)
          const { data: dbWorks, error: worksError } = await supabase
            .from('works')
            .select(`
              id,
              title,
              genre,
              cover_url,
              updated_at,
              created_at,
              views,
              likes,
              published,
              archived,
              content
            `)
            .eq('author_id', userData.user.id)
            .eq('archived', showArchived)
            .order('updated_at', { ascending: false })
            .abortSignal(abortController.signal)
          
          if (abortController.signal.aborted) return
          
          if (worksError) {
            console.error('❌ Error loading user works:', worksError)
          } else {
            console.log('📚 Loaded works from database:', dbWorks?.length || 0, 'works')
          }
            
          if (dbWorks && dbWorks.length > 0) {
            const formattedWorks = dbWorks.map((w: any) => ({
              id: w.id,
              title: w.title,
              type: w.genre || 'Obra',
              reads: w.views || 0,
              likes: w.likes || 0,
              cover: w.cover_url || '/api/placeholder/640/360',
              updatedAt: w.updated_at ? new Date(w.updated_at).toLocaleDateString('es-ES') : undefined,
              createdAt: w.created_at ? new Date(w.created_at).toLocaleDateString('es-ES') : undefined,
              published: w.published || false,
              wordCount: w.content ? w.content.split(' ').length : undefined,
            }))
            if (!abortController.signal.aborted) {
              setWorks(formattedWorks)
            }
          } else {
            // User is authenticated but has no works
            if (!abortController.signal.aborted) {
              setWorks([])
            }
          }
        } else {
          // User not authenticated - load works from demo user for demonstration
          console.log('👤 No authenticated user, loading demo works')
          const demoUserId = '9f8ff736-aec0-458f-83ae-309b923c5556'
          
          if (abortController.signal.aborted) return
          
          const { data: dbWorks, error: demoError } = await supabase
            .from('works')
            .select(`
              id,
              title,
              genre,
              cover_url,
              updated_at,
              created_at,
              views,
              likes,
              published,
              content
            `)
            .eq('author_id', demoUserId)
            .order('updated_at', { ascending: false })
            .limit(6) // Limit to show a reasonable amount
            .abortSignal(abortController.signal)
          
          if (abortController.signal.aborted) return
          
          if (demoError) {
            console.error('❌ Error loading demo works:', demoError)
          } else {
            console.log('📚 Loaded demo works from database:', dbWorks?.length || 0, 'works')
          }
            
          if (dbWorks && dbWorks.length > 0) {
            const formattedWorks = dbWorks.map((w: any) => ({
              id: w.id,
              title: w.title,
              type: w.genre || 'Obra',
              reads: w.views || 0,
              likes: w.likes || 0,
              cover: w.cover_url || '/api/placeholder/640/360',
              updatedAt: w.updated_at ? new Date(w.updated_at).toLocaleDateString('es-ES') : undefined,
              createdAt: w.created_at ? new Date(w.created_at).toLocaleDateString('es-ES') : undefined,
              published: w.published || false,
              wordCount: w.content ? w.content.split(' ').length : undefined,
            }))
            if (!abortController.signal.aborted) {
              setWorks(formattedWorks)
            }
          } else {
            // No demo data found - show empty state
            if (!abortController.signal.aborted) {
              setWorks([])
            }
          }
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error loading works:', error)
          // Show empty state on error instead of static fallback data
          setWorks([])
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }
    
    loadWorks()
    
    return () => {
      abortController.abort()
    }
  }, [showArchived])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(null)
    }

    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const stats = useMemo(() => ({
    total: works.length,
    reads: works.reduce((acc, w) => acc + (w.reads || 0), 0),
    likes: works.reduce((acc, w) => acc + (w.likes || 0), 0),
    published: works.filter(w => w.published).length,
    drafts: works.filter(w => !w.published).length,
  }), [works])

  // Navigation items
  const navigationItems = useMemo(() => [
    { icon: Home, label: 'Inicio', id: 'feed' },
    { icon: Compass, label: 'Explorar', id: 'explore' },
    { icon: PenTool, label: 'Mis Obras', id: 'my-stories' }
  ], [])

  // Navigation button component
  const NavigationButton = React.useMemo(() => {
    return ({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => {
      const Icon = item.icon
      return (
        <Button
          variant={isActive ? 'default' : 'ghost'}
          className={`w-full justify-start text-sm transition-all duration-200 ${
            isActive 
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'text-gray-700 hover:text-red-700 hover:bg-red-50'
          }`}
          onClick={onClick}
        >
          <Icon className="h-4 w-4 mr-3" />
          {item.label}
        </Button>
      )
    }
  }, [])

  // Archive toggle function
  const toggleWorkArchive = async (workId: string, archived: boolean) => {
    try {
      const response = await fetch(`/api/works/${workId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archived })
      })

      if (!response.ok) {
        throw new Error('Failed to update archive status')
      }

      // Update the work in the current works list
      setWorks(prevWorks => 
        prevWorks.map(work => 
          work.id === workId 
            ? { ...work, archived } 
            : work
        ).filter(work => work.archived === showArchived)
      )
    } catch (error) {
      console.error('Error toggling archive status:', error)
    }
  }

  // Handle navigation
  const handleTabChange = (tabId: string) => {
    if (tabId === 'explore') {
      router.push('/explore')
      return
    }
    if (tabId === 'feed') {
      router.push('/main')
      return
    }
    if (tabId === 'my-stories') {
      // Already on this page
      setActiveTab('my-stories')
      return
    }
    setActiveTab(tabId)
  }

  return (
    <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
      {/* Header */}
      <AppHeader />

      {/* Page header */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {showArchived ? 'Obras Archivadas' : 'Mis Obras'}
                </h1>
                <Button
                  size="sm"
                  variant={showArchived ? "default" : "outline"}
                  onClick={() => setShowArchived(!showArchived)}
                  className="text-xs"
                >
                  {showArchived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-1" />
                      Ver Activas
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-1" />
                      Ver Archivadas
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {showArchived 
                  ? 'Gestiona tus obras archivadas.' 
                  : 'Administra y edita tus obras publicadas y borradores.'
                }
              </p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700">
                  <strong className="text-gray-900">{stats.total}</strong> obras
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700">
                  <Eye className="h-3 w-3 inline mr-1" />
                  <strong className="text-gray-900">{formatNumber(stats.reads)}</strong> vistas
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700">
                  <Heart className="h-3 w-3 inline mr-1" />
                  <strong className="text-gray-900">{formatNumber(stats.likes)}</strong> likes
                </span>
                {stats.published > 0 && (
                  <span className="px-3 py-1 rounded-full bg-green-50 border border-green-200 shadow-sm text-green-700">
                    <strong className="text-green-800">{stats.published}</strong> publicadas
                  </span>
                )}
                {stats.drafts > 0 && (
                  <span className="px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 shadow-sm text-yellow-700">
                    <strong className="text-yellow-800">{stats.drafts}</strong> borradores
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => router.push('/writer')}>
                <Plus className="h-4 w-4 mr-2" /> Nueva obra
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-full mx-auto px-8 sm:px-16 lg:px-24 xl:px-32 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {/* Desktop Navigation */}
            <Card className="hidden lg:block bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden">
              <CardContent className="p-6 pt-6">
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <NavigationButton
                      key={item.id}
                      item={item}
                      isActive={activeTab === item.id}
                      onClick={() => handleTabChange(item.id)}
                    />
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <main className="lg:col-span-3 order-1 lg:order-2">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="loading">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="relative h-36 w-full bg-gray-200" />
                <CardHeader className="p-3 pb-0">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-24 mt-1" />
                </CardContent>
                <CardFooter className="p-3 pt-0 flex items-center justify-between">
                  <div className="h-8 bg-gray-200 rounded w-16" />
                  <div className="h-8 bg-gray-200 rounded w-12" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : works.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-base font-semibold text-gray-900">Aún no tienes obras</h3>
              <p className="text-sm text-gray-600 mt-1">Crea tu primera obra para comenzar a compartir tus historias.</p>
              <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white" onClick={() => router.push('/writer')}>
                <Plus className="h-4 w-4 mr-2" /> Crear obra
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map((w) => (
              <Card key={w.id} data-testid="work-card" className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative h-36 w-full">
                  <img src={w.cover} alt={w.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-base font-semibold text-gray-900 truncate">{w.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <div className="text-xs text-gray-600 flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {w.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      w.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {w.published ? 'Publicada' : 'Borrador'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {formatNumber(w.reads)} vistas
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {formatNumber(w.likes)} likes
                    </span>
                    {w.wordCount && (
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {formatNumber(w.wordCount)} palabras
                      </span>
                    )}
                  </div>
                  
                  {w.updatedAt && (
                    <div className="text-[11px] text-gray-400 mt-1">Actualizado {w.updatedAt}</div>
                  )}
                </CardContent>
                <CardFooter className="p-3 pt-0 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push(`/writer?edit=${w.id}`)}>
                      <Edit3 className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push(`/work/${w.id}`)}>
                      <Eye className="h-4 w-4 mr-1" /> Ver
                    </Button>
                  </div>
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(showMenu === w.id ? null : w.id)
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>

                    {/* Dropdown menu */}
                    {showMenu === w.id && (
                      <div className="absolute right-0 top-9 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWorkArchive(w.id, !w.archived)
                            setShowMenu(null)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          {w.archived ? (
                            <>
                              <ArchiveRestore className="h-3 w-3" />
                              Desarchivar
                            </>
                          ) : (
                            <>
                              <Archive className="h-3 w-3" />
                              Archivar
                            </>
                          )}
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Add delete functionality here if needed
                            setShowMenu(null)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
          </main>
        </div>
      </div>
    </div>
  )
}



