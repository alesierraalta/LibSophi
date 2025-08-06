'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share2, Bookmark, Plus, Search, Bell, User, Home, Compass, PenTool, Library, Settings } from 'lucide-react'

export default function MainPage() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: "María González",
        username: "@mariagonzalez",
        avatar: "/api/placeholder/40/40"
      },
      title: "El susurro del viento - Capítulo 3",
      content: "En las montañas de los Andes, donde el viento susurra secretos ancestrales, una joven escritora descubre que las palabras tienen el poder de cambiar el destino. El manuscrito que había encontrado en la biblioteca de su abuela no era solo una colección de cuentos, sino un grimorio de historias que cobraban vida cuando eran leídas en voz alta. Cada página que pasaba, cada palabra que pronunciaba, tejía la realidad de maneras que jamás había imaginado posible...",
      genre: "Fantasía",
      readTime: "12 min",
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      timestamp: "hace 2 horas"
    },
    {
      id: 2,
      author: {
        name: "Carlos Mendoza",
        username: "@carlosm_writer",
        avatar: "/api/placeholder/40/40"
      },
      title: "Reflexiones sobre el proceso creativo: La soledad del escritor",
      content: "La ciudad nunca duerme, y en sus calles vacías encuentro las palabras que durante el día se esconden entre el ruido y la prisa. Esta es mi carta de amor a la soledad urbana, pero también una reflexión profunda sobre lo que significa escribir en una era de constante distracción. Como escritores, navegamos entre dos mundos: el bullicio exterior que nos nutre de experiencias, y el silencio interior donde nacen las historias. He descubierto que mis mejores ideas surgen en esos momentos de quietud, cuando la ciudad finalmente se aquieta y mi mente puede vagar libremente por los laberintos de la imaginación...",
      genre: "Ensayo Literario",
      readTime: "8 min",
      likes: 42,
      comments: 15,
      shares: 7,
      isLiked: true,
      timestamp: "hace 4 horas"
    },
    {
      id: 3,
      author: {
        name: "Ana Sofía Torres",
        username: "@anasofiat",
        avatar: "/api/placeholder/40/40"
      },
      title: "Nueva Tierra - Capítulo 1: El despertar",
      content: "Cuando Elena abrió los ojos esa mañana, no sabía que sería el último día de su vida tal como la conocía. El mundo había cambiado mientras dormía, y ahora las pantallas que antes mostraban noticias mundanas proyectaban un mensaje que helaba la sangre: 'Protocolo de Evacuación Planetaria Activado'. Los científicos habían detectado una anomalía en el núcleo terrestre que amenazaba con desintegrar el campo magnético en menos de seis meses. La humanidad tenía que elegir: quedarse y enfrentar la extinción, o embarcarse en la mayor migración espacial de la historia. Elena, como ingeniera aeroespacial, sabía que su decisión no solo afectaría su futuro, sino el de millones de personas que confiaban en su expertise...",
      genre: "Ciencia Ficción",
      readTime: "15 min",
      likes: 67,
      comments: 23,
      shares: 12,
      isLiked: false,
      timestamp: "hace 6 horas"
    },
    {
      id: 4,
      author: {
        name: "Alejandra Ruiz",
        username: "@aleruiz_writer",
        avatar: "/api/placeholder/40/40"
      },
      title: "Newsletter Semanal: El Arte de la Escritura #47",
      content: "Esta semana quiero hablar sobre algo que he estado observando en mi proceso creativo: la importancia del silencio en la escritura. No me refiero solo al silencio literal, sino a esos espacios en blanco entre las palabras, esas pausas que permiten al lector respirar y reflexionar. Como escritores, a menudo nos enfocamos tanto en llenar la página con palabras que olvidamos el poder de lo que no se dice. En mi nueva novela, he estado experimentando con diálogos más espaciados, descripciones que sugieren más de lo que explican, y capítulos que terminan en suspenso, no por dramático, sino por contemplativo. Te invito a reflexionar: ¿cuándo fue la última vez que dejaste que el silencio hablara en tu escritura?",
      genre: "Newsletter",
      readTime: "6 min",
      likes: 89,
      comments: 34,
      shares: 18,
      isLiked: false,
      timestamp: "hace 1 día",
      isNewsletter: true,
      subscribers: "2.3k"
    }
  ])

  const [activeTab, setActiveTab] = useState('feed')

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50/30">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-red-100/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-gradient-to-br from-primary to-red-700 text-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 shadow-lg">
                <PenTool className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary via-red-600 to-red-700 bg-clip-text text-transparent">
                Palabreo
              </h1>
            </div>

            {/* Search Bar - Hidden on mobile, visible on desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar obras, autores, géneros literarios..."
                  className="w-full pl-10 pr-4 py-2.5 border border-red-200/50 rounded-full focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white/70 backdrop-blur-sm shadow-sm"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Button */}
              <Button variant="ghost" size="sm" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs">
                  3
                </span>
              </Button>
              
              {/* Write Button */}
              <Button className="bg-gradient-to-r from-primary to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base px-3 sm:px-4">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Escribir</span>
              </Button>
              
              {/* Avatar */}
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback className="text-xs sm:text-sm">TU</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Sidebar - Mobile: Horizontal scroll, Desktop: Vertical */}
          <div className="lg:col-span-1 order-1 lg:order-none">
            <Card className="bg-white/80 backdrop-blur-md border border-red-100/30 shadow-xl rounded-xl lg:rounded-2xl">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                  <Button
                    variant={activeTab === 'feed' ? 'default' : 'ghost'}
                    className={`flex-shrink-0 w-auto lg:w-full justify-center lg:justify-start rounded-xl transition-all duration-300 px-3 lg:px-4 ${activeTab === 'feed' ? 'bg-gradient-to-r from-primary to-red-700 text-white shadow-lg' : 'hover:bg-red-50/50'}`}
                    onClick={() => setActiveTab('feed')}
                  >
                    <Home className="h-4 w-4 lg:mr-3" />
                    <span className="hidden lg:inline">Inicio</span>
                  </Button>
                  <Button
                    variant={activeTab === 'explore' ? 'default' : 'ghost'}
                    className={`flex-shrink-0 w-auto lg:w-full justify-center lg:justify-start rounded-xl transition-all duration-300 px-3 lg:px-4 ${activeTab === 'explore' ? 'bg-gradient-to-r from-primary to-red-700 text-white shadow-lg' : 'hover:bg-red-50/50'}`}
                    onClick={() => setActiveTab('explore')}
                  >
                    <Compass className="h-4 w-4 lg:mr-3" />
                    <span className="hidden lg:inline">Explorar</span>
                  </Button>
                  <Button
                    variant={activeTab === 'my-stories' ? 'default' : 'ghost'}
                    className={`flex-shrink-0 w-auto lg:w-full justify-center lg:justify-start rounded-xl transition-all duration-300 px-3 lg:px-4 ${activeTab === 'my-stories' ? 'bg-gradient-to-r from-primary to-red-700 text-white shadow-lg' : 'hover:bg-red-50/50'}`}
                    onClick={() => setActiveTab('my-stories')}
                  >
                    <PenTool className="h-4 w-4 lg:mr-3" />
                    <span className="hidden lg:inline">Mis Obras</span>
                  </Button>
                  <Button
                    variant={activeTab === 'library' ? 'default' : 'ghost'}
                    className={`flex-shrink-0 w-auto lg:w-full justify-center lg:justify-start rounded-xl transition-all duration-300 px-3 lg:px-4 ${activeTab === 'library' ? 'bg-gradient-to-r from-primary to-red-700 text-white shadow-lg' : 'hover:bg-red-50/50'}`}
                    onClick={() => setActiveTab('library')}
                  >
                    <Library className="h-4 w-4 lg:mr-3" />
                    <span className="hidden lg:inline">Biblioteca</span>
                  </Button>
                  <Button
                    variant={activeTab === 'saved' ? 'default' : 'ghost'}
                    className={`flex-shrink-0 w-auto lg:w-full justify-center lg:justify-start rounded-xl transition-all duration-300 px-3 lg:px-4 ${activeTab === 'saved' ? 'bg-gradient-to-r from-primary to-red-700 text-white shadow-lg' : 'hover:bg-red-50/50'}`}
                    onClick={() => setActiveTab('saved')}
                  >
                    <Bookmark className="h-4 w-4 lg:mr-3" />
                    <span className="hidden lg:inline">Favoritos</span>
                  </Button>
                  <Button
                    variant={activeTab === 'newsletters' ? 'default' : 'ghost'}
                    className={`flex-shrink-0 w-auto lg:w-full justify-center lg:justify-start rounded-xl transition-all duration-300 px-3 lg:px-4 ${activeTab === 'newsletters' ? 'bg-gradient-to-r from-primary to-red-700 text-white shadow-lg' : 'hover:bg-red-50/50'}`}
                    onClick={() => setActiveTab('newsletters')}
                  >
                    <span className="text-lg lg:mr-3">📧</span>
                    <span className="hidden lg:inline">Newsletters</span>
                  </Button>
                  <Button
                    variant={activeTab === 'settings' ? 'default' : 'ghost'}
                    className={`flex-shrink-0 w-auto lg:w-full justify-center lg:justify-start rounded-xl transition-all duration-300 px-3 lg:px-4 ${activeTab === 'settings' ? 'bg-gradient-to-r from-primary to-red-700 text-white shadow-lg' : 'hover:bg-red-50/50'}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="h-4 w-4 lg:mr-3" />
                    <span className="hidden lg:inline">Config</span>
                  </Button>
                </nav>
              </CardContent>
            </Card>

            {/* Trending Topics - Hidden on mobile */}
            <Card className="hidden lg:block bg-white/80 backdrop-blur-md border border-red-100/30 shadow-xl rounded-2xl mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Tendencias</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-red-100/50 text-primary border-primary/20 rounded-full px-3 py-1">
                      #NovelasLargas
                    </Badge>
                    <span className="text-sm text-gray-600 font-medium">2.1k obras</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-gradient-to-r from-red-100/50 to-red-200/30 text-red-700 border-red-200/40 rounded-full px-3 py-1">
                      #EnsayosLiterarios
                    </Badge>
                    <span className="text-sm text-gray-600 font-medium">1.8k ensayos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-gradient-to-r from-primary/15 to-red-100/60 text-primary border-primary/25 rounded-full px-3 py-1">
                      #CuentosCortos
                    </Badge>
                    <span className="text-sm text-gray-600 font-medium">3.2k cuentos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-100/50 to-blue-200/30 text-blue-700 border-blue-200/40 rounded-full px-3 py-1">
                      #NewslettersSemanales
                    </Badge>
                    <span className="text-sm text-gray-600 font-medium">850 newsletters</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-gradient-to-r from-red-100/60 to-red-200/40 text-red-700 border-red-200/50 rounded-full px-3 py-1">
                      #PoesíaNarrativa
                    </Badge>
                    <span className="text-sm text-gray-600 font-medium">1.5k poemas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 order-2 lg:order-none">
            <div className="space-y-4 sm:space-y-6">
              {/* Create Post Card */}
              <Card className="bg-white/90 backdrop-blur-lg border border-red-100/30 shadow-xl rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage src="/api/placeholder/40/40" />
                      <AvatarFallback className="text-xs sm:text-sm">TU</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <textarea
                        placeholder="Comparte un fragmento de tu historia, un capítulo nuevo, o reflexiona sobre tu proceso creativo..."
                        className="w-full p-3 sm:p-4 border border-red-200/50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none h-20 sm:h-24 text-sm sm:text-base leading-relaxed bg-red-50/20 backdrop-blur-sm transition-all duration-300"
                        maxLength={2000}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 space-y-3 sm:space-y-0">
                    <div className="flex space-x-2 flex-wrap gap-2 overflow-x-auto pb-2 sm:pb-0">
                      <Button variant="ghost" size="sm" className="text-xs flex-shrink-0 px-2 sm:px-3">
                        📧 Newsletter
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs flex-shrink-0 px-2 sm:px-3">
                        📖 Capítulo
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs flex-shrink-0 px-2 sm:px-3">
                        ✍️ Cuento
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs flex-shrink-0 px-2 sm:px-3 hidden sm:inline-flex">
                        📝 Ensayo
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs flex-shrink-0 px-2 sm:px-3 hidden sm:inline-flex">
                        💭 Reflexión
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs flex-shrink-0 px-2 sm:px-3 hidden lg:inline-flex">
                        🎙️ Podcast
                      </Button>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-sm sm:text-base px-4 sm:px-6 w-full sm:w-auto">
                      <span className="sm:hidden">Publicar</span>
                      <span className="hidden sm:inline">Publicar Obra</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              {posts.map((post) => (
                <Card key={post.id} className="bg-white/90 backdrop-blur-lg border border-red-100/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl sm:rounded-2xl hover:border-red-200/50">
                  <CardContent className="p-4 sm:p-6">
                    {/* Post Header */}
                    <div className="flex items-start space-x-3 mb-4">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="text-xs sm:text-sm">{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{post.author.name}</h4>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <span className="text-gray-500 truncate">{post.author.username}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">{post.timestamp}</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-1">
                          <Badge variant="outline" className={`text-xs w-fit ${post.isNewsletter ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}>
                            {post.genre}
                          </Badge>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <span className="text-gray-500">{post.readTime} de lectura</span>
                            {post.isNewsletter && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-blue-600 font-medium">{post.subscribers} suscriptores</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">{post.title}</h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{post.content}</p>
                    </div>

                    {/* Post Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-4 sm:space-x-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center space-x-1 sm:space-x-2 ${post.isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 text-sm`}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span className="text-xs sm:text-sm">{post.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-blue-500 text-sm">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs sm:text-sm">{post.comments}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-green-500 text-sm">
                          <Share2 className="h-4 w-4" />
                          <span className="text-xs sm:text-sm">{post.shares}</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-500">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        {post.isNewsletter && (
                          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-3 py-1">
                            📧 Suscribirse
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Hidden on mobile and tablet */}
          <div className="hidden lg:block lg:col-span-1 order-3">
            {/* Suggested Authors */}
            <Card className="bg-white/80 backdrop-blur-md border border-red-100/30 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Autores Sugeridos</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {[
                    { name: "Isabella Ruiz", username: "@isabellaruiz", followers: "2.1k", avatar: "/api/placeholder/40/40" },
                    { name: "Diego Morales", username: "@diegom", followers: "1.8k", avatar: "/api/placeholder/40/40" },
                    { name: "Camila Vega", username: "@camilavega", followers: "3.2k", avatar: "/api/placeholder/40/40" },
                  ].map((author, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={author.avatar} />
                          <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{author.name}</p>
                          <p className="text-gray-500 text-xs">{author.username}</p>
                          <p className="text-gray-400 text-xs">{author.followers} seguidores</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        Seguir
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Spotlight */}
            <Card className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 backdrop-blur-md border border-blue-200/30 shadow-xl rounded-2xl mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <span className="mr-2">📧</span>
                  Newsletters Destacados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {[
                    { title: "El Arte de la Escritura", author: "Alejandra Ruiz", subscribers: "2.3k", frequency: "Semanal", genre: "Escritura Creativa" },
                    { title: "Ficción y Realidad", author: "Miguel Santos", subscribers: "1.8k", frequency: "Quincenal", genre: "Análisis Literario" },
                    { title: "Cuentos de Medianoche", author: "Carmen López", subscribers: "3.1k", frequency: "Mensual", genre: "Cuentos Originales" },
                  ].map((newsletter, index) => (
                    <div key={index} className="border-b border-blue-200/30 pb-3 last:border-b-0">
                      <h4 className="font-medium text-sm mb-1">{newsletter.title}</h4>
                      <p className="text-gray-500 text-xs mb-2">por {newsletter.author}</p>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {newsletter.genre}
                        </Badge>
                        <span className="text-blue-600 text-xs font-medium">{newsletter.frequency}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">{newsletter.subscribers} suscriptores</span>
                        <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-6 text-blue-600 border-blue-200 hover:bg-blue-50">
                          Suscribirse
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Stories */}
            <Card className="bg-white/80 backdrop-blur-md border border-red-100/30 shadow-xl rounded-2xl mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Obras Destacadas</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {[
                    { title: "El último guardián - Novela completa", author: "Laura Martín", reads: "12.5k", genre: "Fantasía Épica" },
                    { title: "Códigos del futuro - Serie", author: "Roberto Silva", reads: "8.3k", genre: "Ciencia Ficción" },
                    { title: "Memorias de una generación perdida", author: "Elena García", reads: "15.2k", genre: "Ensayo Autobiográfico" },
                  ].map((story, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <h4 className="font-medium text-sm mb-1">{story.title}</h4>
                      <p className="text-gray-500 text-xs mb-2">por {story.author}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {story.genre}
                        </Badge>
                        <span className="text-gray-400 text-xs">{story.reads} lecturas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}