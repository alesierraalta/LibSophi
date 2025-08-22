'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Edit3, Eye, Archive, ArchiveRestore, MoreHorizontal, Trash2, FileText, Heart } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import AppHeader from '@/components/AppHeader'

type ArchivedWork = {
  id: string
  title: string
  type: string
  reads: number
  likes: number
  cover: string
  updatedAt?: string
  createdAt?: string
  published: boolean
  archived: boolean
  wordCount?: number
}

export default function ArchivadosPage() {
  const router = useRouter()
  const [works, setWorks] = useState<ArchivedWork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMenu, setShowMenu] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()
    
    const loadArchivedWorks = async () => {
      setIsLoading(true)
      
      try {
        if (abortController.signal.aborted) return
        
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        
        if (abortController.signal.aborted) return
        
        if (userData?.user) {
          // Get works that are published but archived (hidden from public)
          const { data: dbWorks, error } = await supabase
            .from('works')
            .select(`
              id,
              title,
              genre,
              views,
              likes,
              cover_url,
              updated_at,
              created_at,
              published,
              archived,
              content
            `)
            .eq('author_id', userData.user.id)
            .eq('published', true) // Must be published
            .eq('archived', true)   // But archived (hidden)
            .order('updated_at', { ascending: false })
            .abortSignal(abortController.signal)
          
          if (abortController.signal.aborted) return
          
          if (error) {
            console.error('Error loading archived works:', error)
          } else if (dbWorks && dbWorks.length > 0) {
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
              archived: w.archived || false,
              wordCount: w.content ? w.content.split(' ').length : undefined,
            }))
            if (!abortController.signal.aborted) {
              setWorks(formattedWorks)
            }
          } else {
            if (!abortController.signal.aborted) {
              setWorks([])
            }
          }
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error loading archived works:', error)
          setWorks([])
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadArchivedWorks()
    
    return () => {
      abortController.abort()
    }
  }, [])

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
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  // Restore work function (make it visible to public again)
  const restoreWork = async (workId: string) => {
    try {
      const response = await fetch(`/api/works/${workId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archived: false })
      })

      if (!response.ok) {
        throw new Error('Failed to restore work')
      }

      // Remove the work from the archived list
      setWorks(prevWorks => prevWorks.filter(work => work.id !== workId))
    } catch (error) {
      console.error('Error restoring work:', error)
    }
  }

  // Calculate stats
  const stats = {
    total: works.length,
    reads: works.reduce((sum, work) => sum + work.reads, 0),
    likes: works.reduce((sum, work) => sum + work.likes, 0),
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
                  Obras Archivadas
                </h1>
                <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                  <Archive className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Obras que publicaste pero decidiste ocultar al público. Puedes restaurarlas cuando quieras.
              </p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700">
                  <strong className="text-gray-900">{stats.total}</strong> archivadas
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700">
                  <Eye className="h-3 w-3 inline mr-1" />
                  <strong className="text-gray-900">{formatNumber(stats.reads)}</strong> vistas totales
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700">
                  <Heart className="h-3 w-3 inline mr-1" />
                  <strong className="text-gray-900">{formatNumber(stats.likes)}</strong> likes totales
                </span>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/mis-obras')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Ver Mis Obras
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes obras archivadas</h3>
              <p className="text-sm text-gray-600 mb-4">
                Las obras archivadas son publicaciones que decidiste ocultar al público pero que no has eliminado.
              </p>
              <Button 
                onClick={() => router.push('/mis-obras')} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Ver Mis Obras
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map((work) => (
              <Card key={work.id} data-testid="archived-work-card" className="bg-white border border-gray-200 rounded-lg overflow-hidden relative">
                {/* Archived indicator */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Archive className="h-3 w-3" />
                    Archivada
                  </div>
                </div>

                <div className="relative h-36 w-full">
                  <img src={work.cover} alt={work.title} className="absolute inset-0 w-full h-full object-cover opacity-75" />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>
                
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-base font-semibold text-gray-900 truncate">{work.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="p-3 pt-1">
                  <div className="text-xs text-gray-600 flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {work.type}
                    </span>
                    <span className="text-xs text-amber-600 font-medium">
                      Oculta al público
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {formatNumber(work.reads)} vistas
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {formatNumber(work.likes)} likes
                    </span>
                    {work.wordCount && (
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {formatNumber(work.wordCount)} palabras
                      </span>
                    )}
                  </div>
                  
                  {work.updatedAt && (
                    <div className="text-[11px] text-gray-400 mt-1">Archivada {work.updatedAt}</div>
                  )}
                </CardContent>
                
                <CardFooter className="p-3 pt-0 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs" 
                      onClick={() => restoreWork(work.id)}
                    >
                      <ArchiveRestore className="h-4 w-4 mr-1" /> 
                      Restaurar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs" 
                      onClick={() => router.push(`/work/${work.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> 
                      Ver
                    </Button>
                  </div>
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(showMenu === work.id ? null : work.id)
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>

                    {/* Dropdown menu */}
                    {showMenu === work.id && (
                      <div className="absolute right-0 top-9 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/writer?edit=${work.id}`)
                            setShowMenu(null)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit3 className="h-3 w-3" />
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            restoreWork(work.id)
                            setShowMenu(null)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ArchiveRestore className="h-3 w-3" />
                          Restaurar obra
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
                          Eliminar definitivamente
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
  )
}
