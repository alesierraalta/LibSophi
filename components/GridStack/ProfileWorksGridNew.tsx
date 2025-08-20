'use client'

import React, { useState } from 'react'
import { WorkType } from '@/lib/validations'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Repeat2, Share2, Bookmark, Edit3, Eye, MoreHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProfileWorksGridProps {
  works: WorkType[]
  onWorkClick?: (work: WorkType) => void
  onLayoutChange?: (layout: any[]) => void
  editable?: boolean
  savedLayout?: any[]
}

const getCoverImage = (work: WorkType): string => {
  if (work.coverUrl) return work.coverUrl
  if (work.cover) return work.cover
  return `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000) + 1544620000}-c4fd4a3d5957?w=800&h=600&fit=crop`
}

export default function ProfileWorksGridNew({ 
  works, 
  onWorkClick, 
  onLayoutChange, 
  editable = false,
  savedLayout = [] 
}: ProfileWorksGridProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [worksList, setWorksList] = useState<WorkType[]>(works)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)



  React.useEffect(() => {
    setWorksList(works)
  }, [works])

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
      setDraggedItem(work.id)
    } else if (draggedIndex === index) {
      // Click same card - deselect
      setDraggedIndex(null)
      setDraggedItem(null)
    } else {
      // Second click - move card to this position
      const newWorksList = [...worksList]
      const [draggedWork] = newWorksList.splice(draggedIndex, 1)
      newWorksList.splice(index, 0, draggedWork)
      
      setWorksList(newWorksList)
      setDraggedIndex(null)
      setDraggedItem(null)
      
      // Call layout change callback
      if (onLayoutChange) {
        onLayoutChange(newWorksList.map((w, i) => ({ id: w.id, order: i })))
      }
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        duration: 0.4
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  }

  const editModeVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      y: -20
    },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Edit Mode Toggle */}
      {editable && works.length > 0 && (
        <motion.div 
          className="flex justify-between items-center"
          variants={cardVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900">Mis Obras</h3>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={toggleEditMode}
              variant={isEditMode ? "default" : "outline"}
              className={isEditMode ? "bg-red-600 hover:bg-red-700 text-white" : ""}
            >
              {isEditMode ? "Guardar" : "Reorganizar"}
            </Button>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {isEditMode && (
          <motion.div 
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center overflow-hidden"
            variants={editModeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.p 
              className="text-sm text-blue-700 font-medium mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              🎯 Modo de reorganización activado
            </motion.p>
            <motion.p 
              className="text-xs text-blue-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {draggedItem ? 
                "Haz clic en otra tarjeta para intercambiar posiciones" : 
                "Haz clic en una tarjeta para seleccionarla y luego en otra para intercambiar"
              }
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Works Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {worksList.map((work, index) => (
          <div
            key={work.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
          >
              <Card 
                className={`relative bg-white border-gray-200 shadow-sm rounded-lg overflow-hidden transition-all duration-300 ${
                  isEditMode ? 'cursor-pointer' : 'cursor-pointer'
                } ${draggedItem === work.id ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'}`}
                onClick={() => handleCardClick(work, index)}
              >
                <AnimatePresence>
                  {isEditMode && (
                    <motion.div 
                      className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,1)" }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <motion.svg 
                        className="h-4 w-4 text-gray-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        animate={{ rotate: draggedItem === work.id ? 90 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        <circle cx="4" cy="8" r="1" fill="currentColor" />
                        <circle cx="4" cy="16" r="1" fill="currentColor" />
                        <circle cx="8" cy="8" r="1" fill="currentColor" />
                        <circle cx="8" cy="16" r="1" fill="currentColor" />
                        <circle cx="12" cy="8" r="1" fill="currentColor" />
                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                      </motion.svg>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Selection indicator */}
                <AnimatePresence>
                  {draggedItem === work.id && (
                    <motion.div 
                      className="absolute inset-0 border-2 border-blue-500 bg-blue-50/20 rounded-lg pointer-events-none"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                {/* Drop target indicator */}
                <AnimatePresence>
                  {isEditMode && draggedItem && draggedItem !== work.id && (
                    <motion.div 
                      className="absolute inset-0 border-2 border-dashed border-green-400 bg-green-50/30 rounded-lg pointer-events-none"
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

            <CardContent className="p-0">
              {/* Work Image - Moved to top for better visual impact */}
              <div className="relative">
                <img 
                  src={getCoverImage(work)}
                  alt={work.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Genre Badge on Image */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 border border-white/50">
                    {work.genre}
                  </span>
                </div>
              </div>

              {/* Work Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">
                      {work.updatedAt ? new Date(work.updatedAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short'
                      }) : 'Reciente'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Publicado</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-red-700 transition-colors duration-200 line-clamp-2">
                  {work.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                  {work.description}
                </p>
              </div>

              {/* Work Actions */}
              <motion.div 
                className="px-4 pb-4 pt-3 border-t border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.button 
                      className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Heart className="h-4 w-4" />
                      </motion.div>
                      <span className="text-xs font-medium">{Math.floor(work.views * 0.1)}</span>
                    </motion.button>
                    <motion.button 
                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </motion.div>
                      <span className="text-xs font-medium">{Math.floor(work.views * 0.05)}</span>
                    </motion.button>
                    <motion.button 
                      className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Repeat2 className="h-4 w-4" />
                      </motion.div>
                      <span className="text-xs font-medium">{Math.floor(work.views * 0.02)}</span>
                    </motion.button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button 
                      className="text-gray-500 hover:text-yellow-600 transition-colors duration-200" 
                      aria-label="Guardar"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Bookmark className="h-4 w-4" />
                    </motion.button>
                    <motion.button 
                      className="text-gray-500 hover:text-gray-700 transition-colors duration-200" 
                      aria-label="Compartir"
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="h-4 w-4" />
                    </motion.button>
                    {editable && (
                      <>
                        <motion.button 
                          className="text-gray-500 hover:text-blue-600 transition-colors duration-200" 
                          aria-label="Editar"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </motion.button>
                        <motion.button 
                          className="text-gray-500 hover:text-green-600 transition-colors duration-200" 
                          aria-label="Ver"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
          </div>
        ))}
      </motion.div>

      {/* Empty State */}
      <AnimatePresence>
        {worksList.length === 0 && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-12 text-center">
                <motion.div 
                  className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.2 
                  }}
                >
                  <motion.svg 
                    className="w-8 h-8 text-red-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </motion.svg>
                </motion.div>
                <motion.h3 
                  className="text-lg font-semibold text-gray-900 mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Aún no tienes obras
                </motion.h3>
                <motion.p 
                  className="text-gray-600 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Crea tu primera obra para comenzar a compartir tus historias con el mundo.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <motion.svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                    </motion.svg>
                    Crear primera obra
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
