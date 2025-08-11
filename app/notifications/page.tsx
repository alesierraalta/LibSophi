'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, UserPlus, AtSign, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function NotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'comments' | 'follows' | 'mentions'>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const notifications = useMemo(() => ([
    { id: 'n1', type: 'comment' as const, title: 'Nuevo comentario', body: 'Ana comentó tu capítulo “El último tren”.', time: 'hace 5 min' },
    { id: 'n2', type: 'follow' as const, title: 'Nuevo seguidor', body: 'Carlos empezó a seguirte.', time: 'hace 20 min' },
    { id: 'n3', type: 'mention' as const, title: 'Mención', body: 'Te mencionaron en “Versos al amanecer”.', time: 'hace 1 h' },
  ]), [])

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'comments') return n.type === 'comment'
    if (filter === 'follows') return n.type === 'follow'
    if (filter === 'mentions') return n.type === 'mention'
    return true
  })

  const Icon = ({ type }: { type: 'comment' | 'follow' | 'mention' }) => {
    if (type === 'comment') return <MessageCircle className="h-5 w-5 text-blue-600" />
    if (type === 'follow') return <UserPlus className="h-5 w-5 text-green-600" />
    return <AtSign className="h-5 w-5 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="h-12 w-12 overflow-hidden rounded-md flex items-center justify-center bg-transparent cursor-pointer"
              onClick={() => router.push('/main')}
              role="link"
              aria-label="Ir al inicio"
              title="Ir al inicio"
              tabIndex={0}
            >
              <div className="relative h-[200%] w-[200%] -m-[50%]">
                <Image src="/1.png" alt="Palabreo logo" fill sizes="56px" className="object-cover" priority />
              </div>
            </div>
            <h1
              onClick={() => router.push('/main')}
              className="text-xl md:text-2xl font-bold text-red-600 [font-family:var(--font-poppins)] cursor-pointer"
              title="Ir al inicio"
              aria-label="Ir al inicio"
              role="link"
              tabIndex={0}
            >
              Palabreo
            </h1>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => router.push('/main')}>Volver al feed</Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Bell className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
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
                  {filter === 'comments' && <MessageCircle className="h-4 w-4 text-blue-600" />}
                  {filter === 'follows' && <UserPlus className="h-4 w-4 text-green-600" />}
                  {filter === 'mentions' && <AtSign className="h-4 w-4 text-red-600" />}
                  <span>
                    {filter === 'all' ? 'Todas' : filter === 'comments' ? 'Comentarios' : filter === 'follows' ? 'Seguidores' : 'Menciones'}
                  </span>
                </button>
                {showFilterMenu && (
                  <div role="menu" className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-md z-10">
                    <button onClick={() => { setFilter('all'); setShowFilterMenu(false) }} className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 ${filter === 'all' ? 'text-red-600' : 'text-gray-700'}`}>
                      <Bell className="h-4 w-4" /> Todas
                    </button>
                    <button onClick={() => { setFilter('comments'); setShowFilterMenu(false) }} className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 ${filter === 'comments' ? 'text-red-600' : 'text-gray-700'}`}>
                      <MessageCircle className="h-4 w-4 text-blue-600" /> Comentarios
                    </button>
                    <button onClick={() => { setFilter('follows'); setShowFilterMenu(false) }} className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 ${filter === 'follows' ? 'text-red-600' : 'text-gray-700'}`}>
                      <UserPlus className="h-4 w-4 text-green-600" /> Seguidores
                    </button>
                    <button onClick={() => { setFilter('mentions'); setShowFilterMenu(false) }} className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 ${filter === 'mentions' ? 'text-red-600' : 'text-gray-700'}`}>
                      <AtSign className="h-4 w-4 text-red-600" /> Menciones
                    </button>
                  </div>
                )}
              </div>
              {/* Desktop: segmented controls */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-full p-1">
                <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${filter === 'all' ? 'bg-red-600 text-white' : 'text-gray-700 hover:text-red-700'}`} aria-pressed={filter === 'all'}>
                  <Bell className="h-4 w-4" /> Todas
                </button>
                <button onClick={() => setFilter('comments')} className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${filter === 'comments' ? 'bg-red-600 text-white' : 'text-gray-700 hover:text-red-700'}`} aria-pressed={filter === 'comments'}>
                  <MessageCircle className="h-4 w-4" /> Comentarios
                </button>
                <button onClick={() => setFilter('follows')} className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${filter === 'follows' ? 'bg-red-600 text-white' : 'text-gray-700 hover:text-red-700'}`} aria-pressed={filter === 'follows'}>
                  <UserPlus className="h-4 w-4" /> Seguidores
                </button>
                <button onClick={() => setFilter('mentions')} className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${filter === 'mentions' ? 'bg-red-600 text-white' : 'text-gray-700 hover:text-red-700'}`} aria-pressed={filter === 'mentions'}>
                  <AtSign className="h-4 w-4" /> Menciones
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-gray-600">No hay notificaciones para este filtro.</div>
            ) : (
              <ul className="divide-y divide-gray-100" role="list">
                {filtered.map(n => (
                  <li key={n.id} className="px-3 sm:px-6 py-3 hover:bg-gray-50 touch-manipulation">
                    <div className="flex items-start gap-2">
                      <Icon type={n.type} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-gray-900 text-sm flex-1 truncate">{n.title}</div>
                          <div className="text-xs text-gray-500 shrink-0 ml-1">{n.time}</div>
                        </div>
                        <div className="text-xs text-gray-700 mt-0.5">{n.body}</div>
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


