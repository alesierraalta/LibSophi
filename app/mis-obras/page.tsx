'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Edit3, Eye, Plus, Home, Compass, PenTool } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import AppHeader from '@/components/AppHeader'

type Work = {
  id: string
  title: string
  type: string
  reads: string
  cover: string
  updatedAt?: string
}

const defaultWorks: Work[] = [
  { id: '1', title: 'El susurro del viento', type: 'Novela', reads: '12.5k', cover: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=640&h=360&fit=crop', updatedAt: 'hoy' },
  { id: '2', title: 'Versos de medianoche', type: 'Poesía', reads: '8.1k', cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop', updatedAt: 'ayer' },
  { id: '3', title: 'Crónicas del andén', type: 'Relato', reads: '5.7k', cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop', updatedAt: 'hace 3 días' },
]

export default function MisObrasPage() {
  const router = useRouter()
  const [works, setWorks] = useState<Work[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-stories')

  useEffect(() => {
    const loadWorks = async () => {
      setIsLoading(true)
      
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        
        if (userData?.user) {
          // User is authenticated - load their actual works
          console.log('🔍 Loading works for authenticated user:', userData.user.id)
          const { data: dbWorks, error: worksError } = await supabase
            .from('works')
            .select('id,title,genre,cover_url,updated_at,views')
            .eq('author_id', userData.user.id)
            .order('updated_at', { ascending: false })
          
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
              reads: w.views ? `${w.views}` : '0',
              cover: w.cover_url || '/api/placeholder/640/360',
              updatedAt: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : undefined,
            }))
            setWorks(formattedWorks)
          } else {
            // User is authenticated but has no works
            setWorks([])
          }
        } else {
          // User not authenticated - load works from demo user for demonstration
          console.log('👤 No authenticated user, loading demo works')
          const demoUserId = '9f8ff736-aec0-458f-83ae-309b923c5556'
          const { data: dbWorks, error: demoError } = await supabase
            .from('works')
            .select('id,title,genre,cover_url,updated_at,views')
            .eq('author_id', demoUserId)
            .order('updated_at', { ascending: false })
            .limit(6) // Limit to show a reasonable amount
          
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
              reads: w.views ? `${w.views}` : '0',
              cover: w.cover_url || '/api/placeholder/640/360',
              updatedAt: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : undefined,
            }))
            setWorks(formattedWorks)
          } else {
            // Fallback to default works if no demo data
            setWorks(defaultWorks)
          }
        }
      } catch (error) {
        console.error('Error loading works:', error)
        // Fallback to default works on error
        setWorks(defaultWorks)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadWorks()
  }, [])

  const stats = useMemo(() => ({
    total: works.length,
    reads: works.reduce((acc, w) => acc + (Number((w.reads || '0').replace(/[^0-9.]/g, '')) || 0), 0),
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Obras</h1>
              <p className="text-sm text-gray-600 mt-1">Administra y edita tus obras publicadas y borradores.</p>
              <div className="flex gap-2 mt-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700">
                  <strong className="text-gray-900">{stats.total}</strong> obras
                </span>
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
              <Card key={w.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative h-36 w-full">
                  <img src={w.cover} alt={w.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-base font-semibold text-gray-900 truncate">{w.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <div className="text-xs text-gray-600 flex items-center justify-between">
                    <span>{w.type}</span>
                    <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {w.reads} lecturas</span>
                  </div>
                  {w.updatedAt && (
                    <div className="text-[11px] text-gray-500 mt-1">Actualizado {w.updatedAt}</div>
                  )}
                </CardContent>
                <CardFooter className="p-3 pt-0 flex items-center justify-between">
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push(`/writer?edit=${w.id}`)}>
                    <Edit3 className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push(`/work/${w.id}`)}>
                    <Eye className="h-4 w-4 mr-1" /> Ver
                  </Button>
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



