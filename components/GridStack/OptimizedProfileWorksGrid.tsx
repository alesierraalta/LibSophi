'use client'

import React, { useState, useMemo } from 'react'
import { WorkType } from '@/lib/validations'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Edit3, Eye, MoreHorizontal, Copy, Trash2, Image as ImageIcon, FileText, Plus, Filter, Archive, ArchiveRestore } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OptimizedProfileWorksGridProps {
  works: WorkType[]
  onWorkClick?: (work: WorkType) => void
  onLayoutChange?: (layout: any[]) => void
  editable?: boolean
  onWorkEdit?: (work: WorkType) => void
  onWorkDelete?: (workId: string) => void
  onWorkShare?: (work: WorkType) => void
  onWorkDuplicate?: (work: WorkType) => void
  onWorkCoverChange?: (work: WorkType) => void
  onWorkArchive?: (workId: string, archived: boolean) => void
  isLoading?: boolean
}

// Optimized cover image function
const getCoverImage = (work: WorkType): string => {
  return work.cover_image_url || '/api/placeholder/400/300'
}

// Simplified work card component
const WorkCard = React.memo(React.forwardRef<HTMLDivElement, { 
  work: WorkType
  onWorkClick?: (work: WorkType) => void
  onWorkEdit?: (work: WorkType) => void
  onWorkDelete?: (workId: string) => void
  onWorkShare?: (work: WorkType) => void
  onWorkDuplicate?: (work: WorkType) => void
  onWorkArchive?: (workId: string, archived: boolean) => void
  index: number
  isEditMode?: boolean
  isDragged?: boolean
  onCardClick?: (work: WorkType, index: number) => void
}>(({ 
  work, 
  onWorkClick, 
  onWorkEdit, 
  onWorkDelete, 
  onWorkShare, 
  onWorkDuplicate,
  onWorkArchive,
  index,
  isEditMode,
  isDragged,
  onCardClick
}, ref) => {



  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isDragged ? 1.05 : 1,
        zIndex: isDragged ? 50 : 1
      }}
      transition={{ 
        layout: { duration: 0.3, ease: "easeInOut" },
        scale: { duration: 0.2 },
        opacity: { delay: index * 0.02, duration: 0.3 }
      }}
      className="group"
    >
      <Card 
        className={`bg-white border border-gray-200 rounded-lg transition-all duration-200 ${
          isEditMode ? 'cursor-pointer hover:border-red-300' : 'hover:shadow-lg hover:border-red-200'
        } ${
          isDragged ? 'ring-2 ring-red-500 shadow-xl border-red-300' : ''
        }`}
        onClick={() => {
          if (isEditMode) {
            onCardClick?.(work, index)
          } else {
            onWorkClick?.(work)
          }
        }}
      >
        {/* Cover Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={getCoverImage(work)}
            alt={work.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${!isEditMode ? 'group-hover:scale-105' : ''}`}
            loading="lazy"
          />
          
          {/* Overlay con iconos de acciones - Nuevo UX optimizado */}
          <div className={`absolute inset-0 bg-black/0 ${!isEditMode ? 'group-hover:bg-black/40' : ''} backdrop-blur-sm transition-all duration-300`}>
            <div className={`absolute inset-0 opacity-0 ${!isEditMode ? 'group-hover:opacity-100' : ''} transition-opacity duration-300 flex items-center justify-center gap-3`}>
              
              <button onClick={(e) => { e.stopPropagation(); onWorkEdit?.(work) }} title="Editar" className="w-10 h-10 bg-white/90 hover:bg-blue-500 hover:text-white text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                <Edit3 className="w-4 h-4" />
              </button>
              
              <button onClick={(e) => { e.stopPropagation(); onWorkDuplicate?.(work) }} title="Duplicar" className="w-10 h-10 bg-white/90 hover:bg-green-500 hover:text-white text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                <Copy className="w-4 h-4" />
              </button>
              
              <button onClick={(e) => { e.stopPropagation(); onWorkShare?.(work) }} title="Compartir" className="w-10 h-10 bg-white/90 hover:bg-purple-500 hover:text-white text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                <Share2 className="w-4 h-4" />
              </button>
              
              {onWorkArchive && (
                <button onClick={(e) => { e.stopPropagation(); onWorkArchive(work.id, !(work as any).archived) }} title={(work as any).archived ? 'Desarchivar' : 'Archivar'} className="w-10 h-10 bg-white/90 hover:bg-orange-500 hover:text-white text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                  {(work as any).archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                </button>
              )}
              
              <button onClick={(e) => { e.stopPropagation(); onWorkDelete?.(work.id) }} title="Eliminar" className="w-10 h-10 bg-white/90 hover:bg-red-500 hover:text-white text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                <Trash2 className="w-4 h-4" />
              </button>
              
            </div>
          </div>

          {/* Status badge */}
          <div className="absolute bottom-2 left-2">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              work.published 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {work.published ? 'Publicado' : 'Borrador'}
            </span>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
              {work.title || 'Sin título'}
            </h3>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
            {work.description || 'Sin descripción'}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {work.views || 0} {(work.views || 0) === 1 ? 'vista' : 'vistas'}
              </span>
              <span>{work.genre || 'General'}</span>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation()
                onWorkClick?.(work)
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
          </div>
        </CardContent>
      </Card>

    </motion.div>
  )
}))

WorkCard.displayName = 'WorkCard'

export default function OptimizedProfileWorksGrid({
  works,
  onWorkClick,
  onLayoutChange,
  editable = false,
  onWorkEdit,
  onWorkDelete,
  onWorkShare,
  onWorkDuplicate,
  onWorkCoverChange,
  onWorkArchive,
  isLoading = false
}: OptimizedProfileWorksGridProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'title'>('recent')
  const [filterBy, setFilterBy] = useState<'all' | 'published' | 'draft'>('all')
  const [isEditMode, setIsEditMode] = useState(false)
  const [worksList, setWorksList] = useState<WorkType[]>(works)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Update worksList when works prop changes, but preserve order during edit mode
  React.useEffect(() => {
    if (!isEditMode) {
      setWorksList(works)
    }
  }, [works, isEditMode])

  // Drag and drop functionality
  const toggleEditMode = () => {
    if (isEditMode) {
      // Save changes when exiting edit mode
      if (onLayoutChange) {
        onLayoutChange(worksList.map((work, index) => ({ id: work.id, order: index })))
      }
    }
    setIsEditMode(!isEditMode)
  }

  const handleCardClick = (work: WorkType, index: number) => {
    if (!isEditMode) {
      onWorkClick?.(work)
      return
    }

    if (draggedIndex === null) {
      // First click - select card to move
      setDraggedIndex(index)
    } else if (draggedIndex === index) {
      // Click same card - deselect
      setDraggedIndex(null)
    } else {
      // Second click - move card to this position
      const newWorksList = [...worksList]
      const [draggedWork] = newWorksList.splice(draggedIndex, 1)
      newWorksList.splice(index, 0, draggedWork)
      
      setWorksList(newWorksList)
      setDraggedIndex(null)
      
      // Call layout change callback
      if (onLayoutChange) {
        onLayoutChange(newWorksList.map((w, i) => ({ id: w.id, order: i })))
      }
    }
  }

  // Optimized sorting and filtering
  const filteredAndSortedWorks = useMemo(() => {
    let filtered = isEditMode ? worksList : works

    // Filter
    if (filterBy === 'published') {
      filtered = filtered.filter(work => work.published)
    } else if (filterBy === 'draft') {
      filtered = filtered.filter(work => !work.published)
    }

    // Sort (only when not in edit mode)
    if (!isEditMode) {
      return filtered.sort((a, b) => {
        switch (sortBy) {
          case 'views':
            return (b.views || 0) - (a.views || 0)
          case 'title':
            return (a.title || '').localeCompare(b.title || '')
          case 'recent':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })
    }

    return filtered
  }, [works, worksList, sortBy, filterBy, isEditMode])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Mis Obras ({works.length})
          </h3>
          
          {/* Quick stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{works.filter(w => w.published).length} publicadas</span>
            <span>{works.filter(w => !w.published).length} borradores</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Todas</option>
            <option value="published">Publicadas</option>
            <option value="draft">Borradores</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="recent">Más recientes</option>
            <option value="views">Más vistas</option>
            <option value="title">Por título</option>
          </select>

          {/* Edit mode toggle */}
          {editable && filteredAndSortedWorks.length > 0 && (
            <Button
              size="sm"
              variant={isEditMode ? "default" : "outline"}
              className={isEditMode ? "bg-red-600 hover:bg-red-700 text-white" : ""}
              onClick={toggleEditMode}
            >
              {isEditMode ? 'Guardar orden' : 'Reorganizar'}
            </Button>
          )}

          {/* Create new work button */}
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => window.location.href = '/writer'}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva obra
          </Button>
        </div>
      </div>

      {/* Edit mode indicator */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center gap-2 text-red-800">
              <motion.svg 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={{ rotate: draggedIndex !== null ? 15 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 14a1 1 0 001 1h12a1 1 0 001-1L17 4M9 9v8m6-8v8" />
              </motion.svg>
              <span className="font-medium">Modo de reorganización</span>
            </div>
            <motion.p 
              className="text-sm text-red-600 mt-1"
              key={draggedIndex !== null ? 'dragging' : 'idle'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {draggedIndex !== null 
                ? 'Haz clic en otra obra para moverla ahí'
                : 'Haz clic en una obra para seleccionarla y luego en otra posición para moverla'
              }
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Works grid */}
      {filteredAndSortedWorks.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          layout
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.03 }
            }
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedWorks.map((work, index) => (
              <WorkCard
                key={work.id}
                work={work}
                index={index}
                isEditMode={isEditMode}
                isDragged={draggedIndex === index}
                onWorkClick={onWorkClick}
                onWorkEdit={onWorkEdit}
                onWorkDelete={onWorkDelete}
                onWorkShare={onWorkShare}
                onWorkDuplicate={onWorkDuplicate}
                onWorkArchive={onWorkArchive}
                onCardClick={handleCardClick}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <FileText className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterBy === 'published' ? 'No tienes obras publicadas' : 
             filterBy === 'draft' ? 'No tienes borradores' : 
             'No tienes obras aún'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {filterBy === 'published' ? 'Publica tus primeras obras para que otros las descubran.' :
             filterBy === 'draft' ? 'Todos tus borradores aparecerán aquí.' :
             'Comienza tu viaje literario creando tu primera obra.'}
          </p>
          <Button
            onClick={() => window.location.href = '/writer'}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {filterBy === 'published' ? 'Crear y publicar obra' : 'Crear nueva obra'}
          </Button>
        </div>
      )}
    </div>
  )
}
