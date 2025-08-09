'use client'

import React, { useState, useCallback, useMemo, memo, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share2, Bookmark, Plus, Search, Bell, Home, Compass, PenTool, Library, Settings, Edit3, BookOpen, Repeat } from 'lucide-react'

// Lazy load ThemeSelector for better performance
const ThemeSelector = lazy(() => import('@/components/ThemeSelector'))

// Memoized components for better performance
const MemoizedBadge = memo(Badge)
const MemoizedButton = memo(Button)
const MemoizedAvatar = memo(Avatar)

// Initial posts data - moved outside component to prevent recreation
const initialPosts = [
  {
    id: 1,
    author: { name: 'María González', username: '@mariagonzalez', avatar: '/api/placeholder/40/40' },
    title: 'El susurro del viento - Capítulo 3',
    content: 'En las montañas de los Andes, donde el viento susurra secretos ancestrales... ',
    genre: 'Fantasía',
    readTime: '12 min',
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    isBookmarked: false,
    timestamp: 'hace 2 horas',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop'
  },
  {
    id: 2,
    author: { name: 'Carlos Mendoza', username: '@carlosmendoza', avatar: '/api/placeholder/40/40' },
    title: 'Versos al amanecer',
    content: 'Cuando la luz toca las montañas y el silencio se vuelve canción... ',
    genre: 'Poesía',
    readTime: '3 min',
    likes: 18,
    comments: 5,
    shares: 2,
    isLiked: true,
    isBookmarked: false,
    timestamp: 'hace 4 horas',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'
  },
  {
    id: 3,
    author: { name: 'Ana Rodríguez', username: '@anarodriguez', avatar: '/api/placeholder/40/40' },
    title: 'Capítulo 1: El último tren',
    content: 'La estación estaba desierta a esa hora de la madrugada. Solo el eco de mis pasos... ',
    genre: 'Novela',
    readTime: '8 min',
    likes: 42,
    comments: 15,
    shares: 8,
    isLiked: false,
    isBookmarked: true,
    timestamp: 'hace 6 horas',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop'
  },
  {
    id: 4,
    author: { name: 'Diego Herrera', username: '@diegoherrera', avatar: '/api/placeholder/40/40' },
    title: 'Monólogo del tiempo perdido',
    content: '¿Cuántas veces hemos dejado que el tiempo se escurra entre nuestros dedos como arena?...',
    genre: 'Teatro',
    readTime: '5 min',
    likes: 31,
    comments: 12,
    shares: 6,
    isLiked: true,
    isBookmarked: false,
    timestamp: 'hace 8 horas'
  },
  {
    id: 5,
    author: { name: 'Sofía Martín', username: '@sofiamartin', avatar: '/api/placeholder/40/40' },
    title: 'Reflexiones semanales: El arte de la paciencia',
    content: 'Queridos lectores, esta semana he estado reflexionando sobre el arte de la paciencia... ',
    genre: 'Newsletter',
    readTime: '6 min',
    likes: 67,
    comments: 23,
    shares: 15,
    isLiked: false,
    isBookmarked: false,
    timestamp: 'hace 12 horas',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop'
  },
  {
    id: 6,
    author: { name: 'Laura Pérez', username: '@laurap', avatar: '/api/placeholder/40/40' },
    title: 'Cartas desde el sur',
    content: 'Hoy el mar tenía un color distinto, como si guardara un secreto... ',
    genre: 'Crónica',
    readTime: '4 min',
    likes: 12,
    comments: 3,
    shares: 1,
    isLiked: false,
    isBookmarked: false,
    timestamp: 'ayer',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop'
  },
  {
    id: 7,
    author: { name: 'Miguel Santos', username: '@miguels', avatar: '/api/placeholder/40/40' },
    title: 'Ciudad de neón',
    content: 'Las luces reflejaban promesas en los charcos, y nadie recordaba el nombre del último héroe...',
    genre: 'Ciencia Ficción',
    readTime: '10 min',
    likes: 54,
    comments: 11,
    shares: 7,
    isLiked: false,
    isBookmarked: false,
    timestamp: 'hace 1 día',
    image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&h=400&fit=crop'
  },
  {
    id: 8,
    author: { name: 'Elena García', username: '@egarcia', avatar: '/api/placeholder/40/40' },
    title: 'Memorias de una generación perdida',
    content: 'Nos prometieron un futuro brillante, pero olvidaron enseñarnos a encontrar la puerta...',
    genre: 'Ensayo',
    readTime: '7 min',
    likes: 76,
    comments: 18,
    shares: 9,
    isLiked: true,
    isBookmarked: true,
    timestamp: 'hace 2 días',
    image: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&h=400&fit=crop'
  },
  {
    id: 9,
    author: { name: 'Carmen López', username: '@clopez', avatar: '/api/placeholder/40/40' },
    title: 'Cuentos de medianoche',
    content: 'A esa hora, el mundo suspira más lento, y las palabras encuentran huecos insospechados...',
    genre: 'Cuento',
    readTime: '5 min',
    likes: 29,
    comments: 6,
    shares: 4,
    isLiked: false,
    isBookmarked: false,
    timestamp: 'hace 3 días'
  },
  {
    id: 10,
    author: { name: 'Roberto Silva', username: '@rsilva', avatar: '/api/placeholder/40/40' },
    title: 'Códigos del futuro - Serie',
    content: 'El algoritmo no fallaba: predecía deseos con precisión inquietante... ',
    genre: 'Serie',
    readTime: '9 min',
    likes: 33,
    comments: 9,
    shares: 5,
    isLiked: false,
    isBookmarked: false,
    timestamp: 'hace 4 días',
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&h=400&fit=crop'
  }
]

export default function MainPage() {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [activeTab, setActiveTab] = useState('feed')
  const [currentTheme, setCurrentTheme] = useState<string>('variant-1')

  // Memoized callback to prevent unnecessary re-renders
  const handleLike = useCallback((postId: number) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ))
  }, [])

  const handleBookmark = useCallback((postId: number) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ))
  }, [])

  const handleShare = useCallback((postId: number) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === postId 
        ? { ...post, shares: post.shares + 1 }
        : post
    ))
  }, [])

  // Memoized navigation items
  const navigationItems = useMemo(() => [
    { icon: Home, label: 'Inicio', id: 'feed' },
    { icon: Compass, label: 'Explorar', id: 'explore' },
    { icon: PenTool, label: 'Mis Obras', id: 'my-stories' },
    { icon: Library, label: 'Biblioteca', id: 'library' },
    { icon: Bookmark, label: 'Favoritos', id: 'saved' }
  ], [])

  // Memoized navigation button component
  const NavigationButton = memo(({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => {
    const Icon = item.icon
    return (
      <MemoizedButton
        variant={isActive ? 'default' : 'ghost'}
        className={`group w-full justify-start text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-red-500 ${
          isActive 
            ? 'bg-red-600 text-white hover:bg-red-700 border-l-4 border-red-700'
        : 'text-gray-700 hover:text-red-700 hover:bg-red-50 border-l-4 border-transparent hover:border-red-200'
        }`}
        onClick={onClick}
        title={item.label}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="h-5 w-5 mr-3 opacity-90 group-hover:opacity-100" />
        {item.label}
      </MemoizedButton>
    )
  })

  // Memoized callback for tab changes
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  // Memoized trending topics data
  const trendingTopics = useMemo(() => [
    { tag: '#NovelasLargas', count: '2.1k', bgClass: 'bg-red-50', textClass: 'text-red-700', hoverClass: 'group-hover:text-red-800', maxWidth: 'max-w-[160px]' },
    { tag: '#EnsayosLiterarios', count: '1.8k', bgClass: 'bg-red-50', textClass: 'text-red-700', hoverClass: 'group-hover:text-red-800', maxWidth: 'max-w-[160px]' },
    { tag: '#CuentosCortos', count: '3.2k', bgClass: 'bg-red-50', textClass: 'text-red-700', hoverClass: 'group-hover:text-red-800', maxWidth: 'max-w-[160px]' },
    { tag: '#NewslettersSemanales', count: '850', bgClass: 'bg-red-50', textClass: 'text-red-700', hoverClass: 'group-hover:text-red-800', maxWidth: 'max-w-[180px]' },
    { tag: '#PoesíaNarrativa', count: '1.5k', bgClass: 'bg-red-50', textClass: 'text-red-700', hoverClass: 'group-hover:text-red-800', maxWidth: 'max-w-[160px]' }
  ], [])

  // Memoized trending topic component
  const TrendingTopic = memo(({ topic }: { topic: any }) => (
    <div className="group p-3 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-red-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
          <MemoizedBadge 
            variant="outline" 
            className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5"
          >
            {topic.tag}
          </MemoizedBadge>
        </div>
        <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">{topic.count}</span>
      </div>
    </div>
  ))

  // Memoized posts data with expanded content
  const memoizedPosts = useMemo(() => [
    {
      id: 1,
      author: {
        name: "María González",
        username: "@mariagonzalez",
        avatar: "/api/placeholder/40/40"
      },
      title: "El susurro del viento - Capítulo 3",
      content: "En las montañas de los Andes, donde el viento susurra secretos ancestrales, una joven escritora descubre que las palabras tienen el poder de cambiar el destino. El manuscrito que había encontrado en la biblioteca de su abuela no era solo una colección de cuentos, sino un grimorio de historias que cobraban vida cuando eran leídas en voz alta...",
      genre: "Fantasía",
      readTime: "12 min",
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      timestamp: "hace 2 horas",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop"
    },
    {
      id: 2,
      author: {
        name: "Carlos Mendoza",
        username: "@carlosmendoza",
        avatar: "/api/placeholder/40/40"
      },
      title: "Versos al amanecer",
      content: "Cuando la luz toca las montañas / y el silencio se vuelve canción, / mi alma despierta entre las ramas / de un sueño que no tiene razón. / El viento susurra promesas / que solo el corazón puede entender, / mientras las estrellas se desvanecen / en el lienzo del amanecer...",
      genre: "Poesía",
      readTime: "3 min",
      likes: 18,
      comments: 5,
      shares: 2,
      isLiked: true,
      timestamp: "hace 4 horas",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop"
    },
    {
      id: 3,
      author: {
        name: "Ana Rodríguez",
        username: "@anarodriguez",
        avatar: "/api/placeholder/40/40"
      },
      title: "Capítulo 1: El último tren",
      content: "La estación estaba desierta a esa hora de la madrugada. Solo el eco de mis pasos resonaba entre los andenes vacíos, creando una sinfonía melancólica que parecía narrar todas las despedidas que habían ocurrido en ese lugar. El último tren de la noche se acercaba, y con él, la oportunidad de cambiar mi destino para siempre. Pero ¿estaba realmente preparada para dejar atrás todo lo que conocía?",
      genre: "Novela",
      readTime: "8 min",
      likes: 42,
      comments: 15,
      shares: 8,
      isLiked: false,
      timestamp: "hace 6 horas",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop"
    },
    {
      id: 4,
      author: {
        name: "Diego Herrera",
        username: "@diegoherrera",
        avatar: "/api/placeholder/40/40"
      },
      title: "Monólogo del tiempo perdido",
      content: "(El personaje camina lentamente por el escenario, con una maleta en la mano) / PERSONAJE: ¿Cuántas veces hemos dejado que el tiempo se escurra entre nuestros dedos como arena? Yo he sido coleccionista de momentos perdidos, archivero de oportunidades que nunca tomé. Esta maleta... (la levanta) está llena de todos los 'hubiera' que nunca se convirtieron en 'hice'.",
      genre: "Teatro",
      readTime: "5 min",
      likes: 31,
      comments: 12,
      shares: 6,
      isLiked: true,
      timestamp: "hace 8 horas"
    },
    {
      id: 5,
      author: {
        name: "Sofía Martín",
        username: "@sofiamartin",
        avatar: "/api/placeholder/40/40"
      },
      title: "Reflexiones semanales: El arte de la paciencia",
      content: "Queridos lectores, esta semana he estado reflexionando sobre algo que nuestra sociedad acelerada parece haber olvidado: el arte de la paciencia. En un mundo donde todo debe ser instantáneo, donde la gratificación inmediata es la norma, hemos perdido la capacidad de esperar, de saborear el proceso, de encontrar belleza en la lentitud. Les comparto tres ejercicios que he estado practicando...",
      genre: "Newsletter",
      readTime: "6 min",
      likes: 67,
      comments: 23,
      shares: 15,
      isLiked: false,
      timestamp: "hace 12 horas",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop"
    }
  ], [])

  // Memoized post card component
  const PostCard = memo(({ post, onLike, onBookmark, onShare }: { post: any, onLike: (id: number) => void, onBookmark: (id: number) => void, onShare: (id: number) => void }) => (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden mb-6">
      <CardContent className="p-4 sm:p-6 pt-6 sm:pt-8">
        {/* Post Header */}
        <div className="flex items-start space-x-4 mb-4 sm:mb-5">
          <div className="relative">
            <MemoizedAvatar className="h-12 w-12 ring-2 ring-red-100/60 hover:ring-red-200/80 transition-all duration-300">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="text-sm bg-red-50 text-red-700 font-semibold">{post.author.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </MemoizedAvatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm hover:text-red-700 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">{post.author.name}</h4>
                <span className="text-gray-500 text-xs hover:text-gray-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">{post.author.username}</span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 font-medium">{post.timestamp}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
            <MemoizedBadge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 font-medium">
                  {post.genre}
                </MemoizedBadge>
              </div>
              <span className="text-xs text-gray-500 flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{post.readTime} de lectura</span>
              </span>
            </div>
          </div>
        </div>
        {/* Post Content */}
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 hover:text-red-700 transition-colors duration-200 cursor-pointer">
            {post.title}
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3 text-[15px] sm:text-base" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {post.content}
          </p>
          {post.image && (
            <div className="relative rounded-xl overflow-hidden mb-4 group">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
        </div>
        
        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button className={`flex items-center space-x-2 transition-colors duration-200 group ${post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-500'}`} aria-label="Me gusta" aria-pressed={post.isLiked} onClick={() => onLike(post.id)}>
              <Heart className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" fill={post.isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors duration-200 group" aria-label="Comentarios">
              <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform duración-200" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors duration-200 group" aria-label="Compartidos" onClick={() => onShare(post.id)}>
              <Repeat className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">{post.shares}</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button className={`transition-colors duration-200 ${post.isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`} aria-label="Guardar" aria-pressed={post.isBookmarked} onClick={() => onBookmark(post.id)}>
              <Bookmark className="h-4 w-4" fill={post.isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200" aria-label="Compartir">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))

  // Memoized sidebar trends data
  const sidebarTrends = useMemo(() => [
    { tag: '#PoesíaContemporánea', posts: '2.1k' },
    { tag: '#CuentosCortos', posts: '1.8k' },
    { tag: '#NovelaNegra', posts: '1.5k' },
    { tag: '#EscrituraCreativa', posts: '1.2k' },
    { tag: '#TeatroIndependiente', posts: '890' }
  ], [])

  // Memoized suggested authors data
  const suggestedAuthors = useMemo(() => [
    { name: 'Elena Martínez', username: '@elena_writes', followers: '12.5k', genre: 'Poesía', verified: true },
    { name: 'Carlos Ruiz', username: '@carlos_stories', followers: '8.9k', genre: 'Narrativa', verified: false },
    { name: 'Ana García', username: '@ana_teatro', followers: '6.2k', genre: 'Teatro', verified: true }
  ], [])

  // Memoized sidebar trend component
  const SidebarTrend = memo(({ trend }: { trend: any }) => (
    <div className="group flex items-center justify-between p-2 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer">
      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
        <span className="w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-125 transition-transform duration-200 flex-shrink-0"></span>
        <span className="font-medium text-gray-900 group-hover:text-primary transition-colors duration-200 text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{trend.tag}</span>
      </div>
      <span className="text-xs text-gray-500 font-medium ml-2 flex-shrink-0">{trend.posts}</span>
    </div>
  ))

  // Memoized suggested author component
  const SuggestedAuthor = memo(({ author }: { author: any }) => (
    <div className="group p-3 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-red-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <MemoizedAvatar className="h-10 w-10 ring-2 ring-red-100/50 group-hover:ring-red-200/70 transition-all duration-300">
              <img src={`/api/placeholder/40/40`} alt={author.name} className="rounded-full" />
            </MemoizedAvatar>
            {author.verified && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-gray-900 text-sm group-hover:text-red-700 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">{author.name}</p>
              <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">{author.followers}</span>
            </div>
            <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap mb-1">{author.username}</p>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
          <MemoizedBadge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[160px]">
                {author.genre}
              </MemoizedBadge>
            </div>
          </div>
        </div>
        <MemoizedButton size="sm" variant="outline" className="text-xs px-3 py-1.5 border-red-300 text-red-600 hover:bg-red-100 hover:text-red-900 hover:border-red-400 transition-all duration-300 rounded-full font-medium flex-shrink-0 ml-3">
          Seguir
        </MemoizedButton>
      </div>
    </div>
  ))

  return (
    <div className="min-h-screen bg-gray-50 [font-family:var(--font-poppins)]">
      {/* Theme Selector for Red Palette */}
      <Suspense fallback={<div className="h-0" />}>
        <ThemeSelector />
      </Suspense>
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 overflow-hidden rounded-md flex items-center justify-center bg-transparent">
                <div className="relative h-[200%] w-[200%] -m-[50%]">
                  <Image
                    src="/1.png"
                    alt="Palabreo logo"
                    fill
                    sizes="56px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-red-600 [font-family:var(--font-poppins)]">
                Palabreo
              </h1>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar obras, autores..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white text-sm"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <MemoizedButton variant="ghost" size="sm" className="md:hidden">
                <Search className="h-4 w-4" />
              </MemoizedButton>
              
              <MemoizedButton variant="ghost" size="sm" className="relative text-gray-600 hover:text-red-600 hover:bg-red-50">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </MemoizedButton>
              
              <MemoizedButton className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm" onClick={() => router.push('/writer')}>
                <Plus className="h-4 w-4 mr-2" />
                Publicar
              </MemoizedButton>
              
              <MemoizedAvatar className="h-8 w-8">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback className="text-xs bg-red-100 text-red-700">TU</AvatarFallback>
              </MemoizedAvatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Sidebar - Mobile Navigation */}
          <div className="lg:col-span-2 xl:col-span-2 order-2 lg:order-1">
            {/* Mobile Navigation - Horizontal scroll */}
            <div className="lg:hidden mb-4">
              <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-red-600 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

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

            {/* Trending Topics - Hidden on mobile */}
            <Card className="hidden lg:block bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden mt-6">
          <CardHeader className="bg-red-50 border-b border-red-200 p-6">
            <CardTitle className="text-lg font-semibold text-red-800">Tendencias</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <TrendingTopic key={topic.tag} topic={topic} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-3 order-1 lg:order-2">
            <div className="space-y-4 sm:space-y-6">

              {/* Posts Feed */}
              <div className="mt-0">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onLike={handleLike} onBookmark={handleBookmark} onShare={handleShare} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Hidden on mobile, visible on tablet and desktop */}
          <div className="hidden md:block lg:col-span-1 xl:col-span-2 order-3">


            {/* Suggested Authors */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden mt-0">
              <CardHeader className="bg-red-50 border-b border-red-200 p-3 md:p-4 lg:p-6">
                <CardTitle className="text-sm md:text-base lg:text-lg font-semibold text-red-800">Autores Sugeridos</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 lg:p-6 pt-3 md:pt-4 lg:pt-6">
                <div className="space-y-3">
                  {suggestedAuthors.map((author, index) => (
                    <SuggestedAuthor key={index} author={author} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Spotlight */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden mt-4 md:mt-6">
              <CardHeader className="bg-red-50 border-b border-red-200 p-3 md:p-4 lg:p-6">
                <CardTitle className="text-sm md:text-base lg:text-lg font-semibold flex items-center text-red-800">
                  <span className="mr-2 text-lg md:text-xl">📧</span>
                  Newsletters Destacados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 lg:p-4 pt-3 md:pt-4 lg:pt-6">
                <div className="space-y-3">
                  {[
                    { title: "El Arte de la Escritura", author: "Alejandra Ruiz", subscribers: "2.3k", frequency: "Semanal", genre: "Escritura Creativa" },
                    { title: "Ficción y Realidad", author: "Miguel Santos", subscribers: "1.8k", frequency: "Quincenal", genre: "Análisis Literario" },
                    { title: "Cuentos de Medianoche", author: "Carmen López", subscribers: "3.1k", frequency: "Mensual", genre: "Cuentos Originales" },
                  ].map((newsletter, index) => (
                    <div key={index} className="group p-3 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-red-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 text-gray-900 group-hover:text-red-700 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">{newsletter.title}</h4>
                          <p className="text-gray-500 text-xs mb-2 group-hover:text-gray-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">por {newsletter.author}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs px-3 py-1.5 border-red-300 text-red-600 hover:bg-red-100 hover:text-red-900 hover:border-red-400 transition-all duration-300 rounded-full font-medium flex-shrink-0 ml-2">
                          Suscribirse
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[140px]">
                            {newsletter.genre}
                          </Badge>
                        </div>
                        <span className="text-gray-600 text-xs font-medium flex-shrink-0">{newsletter.frequency}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs font-medium">{newsletter.subscribers} suscriptores</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">Activo</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Stories */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden mt-4 md:mt-6">
              <CardHeader className="bg-red-50 border-b border-red-200 p-3 md:p-4 lg:p-6">
                <CardTitle className="text-sm md:text-base lg:text-lg font-semibold text-red-800">Obras Destacadas</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 lg:p-6 pt-3 md:pt-4 lg:pt-6">
                <div className="space-y-3">
                  {[
                    { title: "El último guardián - Novela completa", author: "Laura Martín", reads: "12.5k", genre: "Fantasía Épica" },
                    { title: "Códigos del futuro - Serie", author: "Roberto Silva", reads: "8.3k", genre: "Ciencia Ficción" },
                    { title: "Memorias de una generación perdida", author: "Elena García", reads: "15.2k", genre: "Ensayo Autobiográfico" },
                  ].map((story, index) => (
                    <div key={index} className="group p-3 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-red-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 text-gray-900 group-hover:text-red-700 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">{story.title}</h4>
                          <p className="text-gray-500 text-xs mb-2 group-hover:text-gray-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">por {story.author}</p>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-orange-600 font-medium">Popular</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[140px]">
                            {story.genre}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500 text-xs font-medium">{story.reads}</span>
                          <span className="text-gray-400 text-xs">👁️</span>
                        </div>
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