'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Edit3, Eye, Plus } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

type Work = {
  id: string
  title: string
  type: string
  reads: string
  cover: string
  updatedAt?: string
}

const defaultWorks: Work[] = [
  { id: 1, title: 'El susurro del viento', type: 'Novela', reads: '12.5k', cover: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=640&h=360&fit=crop', updatedAt: 'hoy' },
  { id: 2, title: 'Versos de medianoche', type: 'Poesía', reads: '8.1k', cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop', updatedAt: 'ayer' },
  { id: 3, title: 'Crónicas del andén', type: 'Relato', reads: '5.7k', cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop', updatedAt: 'hace 3 días' },
]

export default function MisObrasPage() {
  const router = useRouter()
  const [works, setWorks] = useState<Work[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('palabreo-works')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setWorks(parsed as Work[])
        }
      }
    } catch {}
    ;(async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user) return
        const { data: dbWorks } = await supabase
          .from('works')
          .select('id,title,genre,cover_url,updated_at')
          .eq('author_id', userData.user.id)
          .order('updated_at', { ascending: false })
        if (dbWorks) {
          setWorks(dbWorks.map((w: any) => ({
            id: w.id,
            title: w.title,
            type: w.genre || 'Obra',
            reads: '0',
            cover: w.cover_url || '/api/placeholder/640/360',
            updatedAt: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : undefined,
          })))
        }
      } catch {}
    })()
  }, [])

  const stats = useMemo(() => ({
    total: works.length,
    reads: works.reduce((acc, w) => acc + (Number((w.reads || '0').replace(/[^0-9.]/g, '')) || 0), 0),
  }), [works])

  return (
    <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <button onClick={() => router.push('/main')} className="flex items-center space-x-3 group" aria-label="Ir al inicio">
              <div className="h-10 w-10 overflow-hidden rounded-md flex items-center justify-center bg-transparent">
                <img src="/1.png" alt="Palabreo" className="h-10 w-10 object-contain" />
              </div>
              <span className="text-xl font-bold text-red-600 group-hover:text-red-700 transition-colors">Palabreo</span>
            </button>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs" onClick={() => router.push('/writer')}>
                Escribir
              </Button>
            </div>
          </div>
        </div>
      </header>

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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24">
        {works.length === 0 ? (
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
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push(`/writer`)}>
                    <Edit3 className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push(`/main`)}>
                    <Eye className="h-4 w-4 mr-1" /> Ver
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}



