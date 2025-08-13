'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Bookmark, UserPlus, Edit3, Repeat2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'works' | 'saved' | 'reposts'>('works')
  const [reposts, setReposts] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  // Suponemos perfil propio por ahora (sin auth). Oculta Seguir.
  const isOwnProfile = true

  type Profile = {
    name: string
    username: string
    bio: string
    avatar: string
    banner: string
  }
  const [profile, setProfile] = useState<Profile>({
    name: 'María González',
    username: 'mariagonzalez',
    bio: 'Escritora de ficción contemporánea. Amante de las historias que transforman. Café, gatos y metáforas.',
    avatar: '/api/placeholder/112/112',
    banner: '',
  })
  const [editProfile, setEditProfile] = useState<Profile>(profile)
  const [showEdit, setShowEdit] = useState(false)
  const defaultProfile: Profile = {
    name: 'María González',
    username: 'mariagonzalez',
    bio: 'Escritora de ficción contemporánea. Amante de las historias que transforman. Café, gatos y metáforas.',
    avatar: '/api/placeholder/112/112',
    banner: '',
  }
  const maxBioLen = 280
  const [errors, setErrors] = useState<{ name?: string; username?: string; bio?: string; avatar?: string; banner?: string }>({})

  const defaultBanners: { title: string; url: string }[] = [
    { title: 'La noche estrellada (Van Gogh)', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
    { title: 'El nacimiento de Venus (Botticelli)', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg' },
    { title: 'La escuela de Atenas (Rafael)', url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/School_of_Athens_Raphael.jpg' },
    { title: 'La ronda de noche (Rembrandt)', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Rembrandt_van_Rijn-De_Nachtwacht-1642.jpg' },
    { title: 'La gran ola de Kanagawa (Hokusai)', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Great_Wave_off_Kanagawa2.jpg' },
    { title: 'El beso (Klimt)', url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg' },
  ]

  useEffect(() => {
    try {
      const raw = localStorage.getItem('palabreo-profile')
      if (raw) {
        const saved = JSON.parse(raw) as Profile
        if (saved && typeof saved === 'object') {
          setProfile({
            name: saved.name || defaultProfile.name,
            username: (saved.username || defaultProfile.username).replace(/^@+/, ''),
            bio: saved.bio ?? defaultProfile.bio,
            avatar: saved.avatar || defaultProfile.avatar,
            banner: saved.banner || '',
          })
        }
      }
      const rp = localStorage.getItem('palabreo-reposts')
      if (rp) {
        const list = JSON.parse(rp)
        if (Array.isArray(list)) setReposts(list.sort((a: any, b: any) => b.time - a.time))
      }
    } catch {}
  }, [])

  const openEdit = () => {
    setEditProfile(profile)
    setShowEdit(true)
  }

  const saveEdit = () => {
    const currentErrors = validate(editProfile)
    setErrors(currentErrors)
    const hasErrors = Object.keys(currentErrors).length > 0
    if (hasErrors) return
    const cleaned: Profile = {
      name: editProfile.name.trim(),
      username: editProfile.username.replace(/^@+/, '').trim(),
      bio: editProfile.bio.trim(),
      avatar: editProfile.avatar.trim(),
      banner: editProfile.banner.trim(),
    }
    setProfile(cleaned)
    try { localStorage.setItem('palabreo-profile', JSON.stringify(cleaned)) } catch {}
    setShowEdit(false)
  }

  const resetDefaults = () => {
    setEditProfile(defaultProfile)
    setErrors({})
  }

  const validate = (p: Profile) => {
    const e: { name?: string; username?: string; bio?: string; avatar?: string; banner?: string } = {}
    const name = (p.name || '').trim()
    const username = (p.username || '').replace(/^@+/, '').trim()
    const bio = (p.bio || '')
    const avatar = (p.avatar || '').trim()
    if (name.length < 2) e.name = 'El nombre debe tener al menos 2 caracteres.'
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) e.username = 'Usuario inválido. Usa 3-20 caracteres: letras, números o _.'
    if (bio.length > maxBioLen) e.bio = `Máximo ${maxBioLen} caracteres.`
    if (!(avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/'))) e.avatar = 'URL de avatar inválida. Usa http(s) o ruta absoluta.'
    const banner = (p.banner || '').trim()
    if (banner && !(banner.startsWith('http://') || banner.startsWith('https://') || banner.startsWith('/'))) e.banner = 'URL de banner inválida.'
    return e
  }

  useEffect(() => {
    setErrors(validate(editProfile))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editProfile.name, editProfile.username, editProfile.bio, editProfile.avatar])

  const stats = useMemo(() => ({
    works: 18,
    followers: '2.4k',
    following: 312,
  }), [])

  const works = useMemo(() => [
    { id: 1, title: 'El susurro del viento', type: 'Novela', reads: '12.5k', cover: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=640&h=360&fit=crop' },
    { id: 2, title: 'Versos de medianoche', type: 'Poesía', reads: '8.1k', cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop' },
    { id: 3, title: 'Crónicas del andén', type: 'Relato', reads: '5.7k', cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop' },
  ], [])

  return (
    <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
      {/* Header (brand) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div onClick={() => router.push('/main')} className="h-12 w-12 overflow-hidden rounded-md flex items-center justify-center bg-transparent cursor-pointer" title="Ir al inicio" aria-label="Ir al inicio" role="link">
                <div className="relative h-[200%] w-[200%] -m-[50%]">
                  <Image src="/1.png" alt="Palabreo logo" fill sizes="56px" className="object-cover" priority />
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-red-600 cursor-pointer" onClick={() => router.push('/main')}>
                Palabreo
              </h1>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs" onClick={() => router.push('/writer')}>
                Escribir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile cover + header */}
      <section className="bg-white">
        <div className="relative overflow-hidden">
          <div className="relative h-32 sm:h-48 md:h-56 border-b border-gray-100">
            {profile.banner ? (
              <img src={profile.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-white to-red-100" />
            )}
            <div className="absolute inset-0 bg-black/5" />
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-5">
            <div className="flex items-start gap-4">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden ring-2 ring-red-100 bg-white flex-shrink-0 shadow-sm">
                <Image src={profile.avatar || '/api/placeholder/112/112'} alt="Avatar" width={112} height={112} className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{profile.name}</h2>
                    <div className="text-xs text-gray-500 truncate">@{profile.username}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={openEdit}>
                      <Edit3 className="h-4 w-4 mr-1"/> Editar
                    </Button>
                    {!isOwnProfile && (
                      <Button size="sm" className={`${isFollowing ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-red-600 border-red-300 hover:bg-red-50'} text-xs`} onClick={() => setIsFollowing(v => !v)}>
                        <UserPlus className="h-4 w-4 mr-1"/>{isFollowing ? 'Siguiendo' : 'Seguir'}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{profile.bio}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700"><strong className="text-gray-900">{stats.works}</strong> obras</span>
                  <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700"><strong className="text-gray-900">{stats.followers}</strong> seguidores</span>
                  <span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700"><strong className="text-gray-900">{stats.following}</strong> siguiendo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs header */}
      <div className="max-w-full mx-auto px-0 sm:px-6 lg:px-8 bg-white border-b border-gray-200 sticky top-14 z-40">
        <div className="flex items-stretch">
          <button onClick={() => setActiveTab('works')} className={`flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm ${activeTab === 'works' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
            <BookOpen className="h-4 w-4"/> Obras
          </button>
          <button onClick={() => setActiveTab('saved')} className={`flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm ${activeTab === 'saved' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
            <Bookmark className="h-4 w-4"/> Guardados
          </button>
          <button onClick={() => setActiveTab('reposts')} className={`flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm ${activeTab === 'reposts' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
            <Repeat2 className="h-4 w-4"/> Reposts
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24">
        {activeTab === 'works' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map(w => (
              <Card key={w.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative h-48 sm:h-56 lg:h-64 w-full">
                  <img src={w.cover} alt={w.title} className="absolute inset-0 w-full h-full object-cover"/>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{w.title}</h3>
                  <div className="text-sm text-gray-600 flex items-center justify-between mt-1">
                    <span>{w.type}</span>
                    <span>{w.reads} lecturas</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="text-sm text-gray-600">Tus obras guardadas aparecerán aquí.</div>
        )}

        {activeTab === 'reposts' && (
          <div className="space-y-3">
            {reposts.length === 0 ? (
              <div className="text-sm text-gray-600">Aún no tienes reposts.</div>
            ) : (
              reposts.map((r) => (
                <Card key={r.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {r.image && (
                    <div className="relative h-36 w-full">
                      <img src={r.image} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Reposteado {new Date(r.time).toLocaleString()}</div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{r.title}</h3>
                    <div className="text-xs text-gray-600 mb-2 truncate">por {r.author?.name} {r.author?.username}</div>
                    <p className="text-sm text-gray-700 line-clamp-2">{r.excerpt}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Editar perfil</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-500 hover:text-gray-700 text-sm">Cerrar</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nombre</label>
                <input
                  value={editProfile.name}
                  onChange={(e) => setEditProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Usuario</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-sm text-gray-600">@</span>
                  <input
                    value={editProfile.username}
                    onChange={(e) => setEditProfile(p => ({ ...p, username: e.target.value }))}
                    className="w-full border border-gray-300 rounded-r-md px-3 py-2 text-sm"
                  />
                </div>
                {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Bio</label>
                <textarea
                  value={editProfile.bio}
                  onChange={(e) => setEditProfile(p => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className={errors.bio ? 'text-red-600' : 'text-gray-500'}>
                    {editProfile.bio.length}/{maxBioLen}
                  </span>
                  {errors.bio && <span className="text-red-600">{errors.bio}</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Avatar (URL)</label>
                <input
                  value={editProfile.avatar}
                  onChange={(e) => setEditProfile(p => ({ ...p, avatar: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                {errors.avatar && <p className="mt-1 text-xs text-red-600">{errors.avatar}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Banner (URL)</label>
                <input
                  value={editProfile.banner}
                  onChange={(e) => setEditProfile(p => ({ ...p, banner: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">O elige uno por defecto:</p>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-auto pr-1">
                  {defaultBanners.map((b) => (
                    <button key={b.url} type="button" onClick={() => setEditProfile(p => ({ ...p, banner: b.url }))} className="relative h-16 rounded-md overflow-hidden border border-gray-200 hover:ring-2 hover:ring-red-400">
                      <img src={b.url} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-1 py-0.5 truncate">{b.title}</span>
                    </button>
                  ))}
                </div>
                {errors.banner && <p className="mt-1 text-xs text-red-600">{errors.banner}</p>}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetDefaults}>Restablecer</Button>
              <Button variant="outline" size="sm" onClick={() => setShowEdit(false)}>Cancelar</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50" onClick={saveEdit} disabled={Object.keys(errors).length > 0}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


