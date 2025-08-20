'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Type, 
  Palette, 
  BookOpen, 
  Moon, 
  Sun, 
  Plus, 
  Minus, 
  AlignCenter, 
  AlignLeft,
  Users,
  Bookmark,
  RotateCcw,
  Timer,
  Volume2,
  Eye,
  Highlighter,
  Share2,
  Edit3,
  Trash2,
  Check,
  X
} from 'lucide-react'

// Interfaces para las preferencias de lectura
interface ReadingPreferences {
  fontSize: number
  fontFamily: string
  theme: 'light' | 'dark' | 'sepia'
  lineHeight: number
  textAlign: 'left' | 'center' | 'justify'
  columnWidth: 'narrow' | 'normal' | 'wide'
  showProgress: boolean
}

interface ReadingToolbarProps {
  genre: string
  currentChapter?: number
  totalChapters?: number
  readingProgress?: number
  content?: string
  onPreferencesChange?: (preferences: ReadingPreferences) => void
  onChapterChange?: (chapter: number) => void
  onBookmark?: () => void
  onShare?: () => void
}

const GENRE_TOOLS = {
  novela: {
    name: 'Novela',
    icon: BookOpen,
    tools: ['progress', 'chapters', 'bookmarks', 'notes', 'word-count']
  },
  cuento: {
    name: 'Cuento',
    icon: BookOpen,
    tools: ['reading-time', 'bookmarks', 'share', 'word-count']
  },
  poesia: {
    name: 'Poesía',
    icon: Volume2,
    tools: ['center-text', 'verse-spacing', 'recitation', 'line-numbers']
  },
  teatro: {
    name: 'Teatro',
    icon: Users,
    tools: ['characters', 'dialogue-format', 'stage-directions', 'acts-scenes']
  },
  articulo: {
    name: 'Artículo',
    icon: Highlighter,
    tools: ['highlights', 'notes', 'references', 'outline']
  },
  newsletter: {
    name: 'Newsletter',
    icon: Highlighter,
    tools: ['highlights', 'notes', 'references', 'sections']
  }
}

const DEFAULT_PREFERENCES: ReadingPreferences = {
  fontSize: 18,
  fontFamily: '"Times New Roman", Times, serif',
  theme: 'light',
  lineHeight: 1.75,
  textAlign: 'left',
  columnWidth: 'normal',
  showProgress: true
}

// Componente para mostrar y editar una nota individual
function NoteItem({ 
  note, 
  onEdit, 
  onDelete 
}: { 
  note: { id: string; content: string; timestamp: number; position?: string }
  onEdit: (id: string, content: string) => void
  onDelete: (id: string) => void 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSave = () => {
    if (editContent.trim()) {
      onEdit(note.id, editContent.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditContent(note.content)
    setIsEditing(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-2">
      <div className="flex items-start justify-between mb-2">
        <div className="text-xs text-gray-500">
          {note.position} • {formatDate(note.timestamp)}
        </div>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Guardar"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                title="Cancelar"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Editar"
              >
                <Edit3 className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Eliminar"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full text-xs border border-gray-300 rounded p-2 resize-none"
          rows={3}
          autoFocus
        />
      ) : (
        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
          {note.content}
        </p>
      )}
    </div>
  )
}

export default function ReadingToolbar({ 
  genre, 
  currentChapter = 0, 
  totalChapters = 1,
  readingProgress = 0,
  content = '',
  onPreferencesChange,
  onChapterChange,
  onBookmark,
  onShare 
}: ReadingToolbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'genre'>('general')
  const [preferences, setPreferences] = useState<ReadingPreferences>(DEFAULT_PREFERENCES)
  const [showCharacters, setShowCharacters] = useState(false)
  const [showOutline, setShowOutline] = useState(false)
  const [highlightedText, setHighlightedText] = useState<string[]>([])
  const [verseSpacing, setVerseSpacing] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [notes, setNotes] = useState<Array<{id: string, content: string, timestamp: number, position?: string}>>([])
  const [newNote, setNewNote] = useState('')
  
  const genreConfig = GENRE_TOOLS[genre.toLowerCase() as keyof typeof GENRE_TOOLS] || GENRE_TOOLS.cuento

  // Calcular estadísticas del contenido
  const wordCount = useMemo(() => {
    if (!content) return 0
    return content.split(/\s+/).filter(word => word.length > 0).length
  }, [content])

  const readingTime = useMemo(() => {
    // Promedio de 200 palabras por minuto
    return Math.ceil(wordCount / 200)
  }, [wordCount])

  const characterList = useMemo(() => {
    if (genre.toLowerCase() !== 'teatro') return []
    // Extraer personajes de obras de teatro (buscar líneas que empiecen con nombre en mayúsculas)
    const lines = content.split('\n')
    const characters = new Set<string>()
    lines.forEach(line => {
      const match = line.match(/^([A-ZÁÉÍÓÚ][A-ZÁÉÍÓÚ\s]+):/)
      if (match) {
        characters.add(match[1].trim())
      }
    })
    return Array.from(characters)
  }, [content, genre])

  // Cargar preferencias del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('palabreo-reading-preferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
      } catch (error) {
        console.warn('Error loading reading preferences:', error)
      }
    }
  }, [])

  // Cargar notas del localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`palabreo-notes-${genre}-${currentChapter}`)
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes)
        setNotes(parsed)
      } catch (error) {
        console.warn('Error loading notes:', error)
      }
    }
  }, [genre, currentChapter])

  // Guardar notas cuando cambien
  useEffect(() => {
    localStorage.setItem(`palabreo-notes-${genre}-${currentChapter}`, JSON.stringify(notes))
  }, [notes, genre, currentChapter])

  // Funciones para manejar notas
  const addNote = () => {
    if (!newNote.trim()) return
    
    const note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: Date.now(),
      position: `Capítulo ${currentChapter + 1}`
    }
    
    setNotes(prev => [...prev, note])
    setNewNote('')
  }

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
  }

  const editNote = (noteId: string, newContent: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, content: newContent, timestamp: Date.now() }
        : note
    ))
  }

  // Guardar preferencias cuando cambien
  useEffect(() => {
    localStorage.setItem('palabreo-reading-preferences', JSON.stringify(preferences))
    onPreferencesChange?.(preferences)
    
    // Disparar evento personalizado para sincronizar con otros componentes
    window.dispatchEvent(new CustomEvent('reading-preferences-changed', {
      detail: preferences
    }))
  }, [preferences, onPreferencesChange])

  const updatePreference = <K extends keyof ReadingPreferences>(
    key: K, 
    value: ReadingPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const renderGeneralTools = () => (
    <div className="space-y-4">
      {/* Tamaño de fuente */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Tamaño de fuente</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePreference('fontSize', Math.max(12, preferences.fontSize - 2))}
            disabled={preferences.fontSize <= 12}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[3rem] text-center">{preferences.fontSize}px</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePreference('fontSize', Math.min(24, preferences.fontSize + 2))}
            disabled={preferences.fontSize >= 24}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tema */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Tema</span>
        <div className="flex gap-2">
          {[
            { key: 'light' as const, icon: Sun, label: 'Claro' },
            { key: 'dark' as const, icon: Moon, label: 'Oscuro' },
            { key: 'sepia' as const, icon: Palette, label: 'Sepia' }
          ].map(({ key, icon: Icon, label }) => (
            <Button
              key={key}
              variant={preferences.theme === key ? "default" : "outline"}
              size="sm"
              onClick={() => updatePreference('theme', key)}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Alineación de texto */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Alineación</span>
        <div className="flex gap-2">
          <Button
            variant={preferences.textAlign === 'left' ? "default" : "outline"}
            size="sm"
            onClick={() => updatePreference('textAlign', 'left')}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={preferences.textAlign === 'center' ? "default" : "outline"}
            size="sm"
            onClick={() => updatePreference('textAlign', 'center')}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Familia de fuente */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Fuente</span>
        <select
          value={preferences.fontFamily}
          onChange={(e) => updatePreference('fontFamily', e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 max-w-[120px]"
        >
          <option value='"Times New Roman", Times, serif'>Times New Roman</option>
          <option value='Georgia, serif'>Georgia</option>
          <option value='"Merriweather", serif'>Merriweather</option>
          <option value='"Playfair Display", serif'>Playfair Display</option>
        </select>
      </div>

      {/* Ancho de columna */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Ancho</span>
        <select
          value={preferences.columnWidth}
          onChange={(e) => updatePreference('columnWidth', e.target.value as any)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="narrow">Estrecho</option>
          <option value="normal">Normal</option>
          <option value="wide">Amplio</option>
        </select>
      </div>
    </div>
  )

  const renderGenreSpecificTools = () => {
    const tools = genreConfig.tools

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <genreConfig.icon className="h-5 w-5 text-red-600" />
          <span className="font-medium text-gray-900">Herramientas para {genreConfig.name}</span>
        </div>

        {/* Herramientas específicas por género */}
        {tools.includes('progress') && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Progreso de lectura</span>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${readingProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{Math.round(readingProgress)}% completado</span>
          </div>
        )}

        {tools.includes('chapters') && totalChapters > 1 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Navegación de capítulos</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChapterChange?.(Math.max(0, currentChapter - 1))}
                disabled={currentChapter <= 0}
              >
                ←
              </Button>
              <span className="text-sm min-w-[5rem] text-center">
                {currentChapter + 1} / {totalChapters}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChapterChange?.(Math.min(totalChapters - 1, currentChapter + 1))}
                disabled={currentChapter >= totalChapters - 1}
              >
                →
              </Button>
            </div>
          </div>
        )}

        {tools.includes('center-text') && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Centrar versos</span>
            <Button
              variant={preferences.textAlign === 'center' ? "default" : "outline"}
              size="sm"
              onClick={() => updatePreference('textAlign', preferences.textAlign === 'center' ? 'left' : 'center')}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
          </div>
        )}

        {tools.includes('reading-time') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                Tiempo estimado: {readingTime} min
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {wordCount.toLocaleString()} palabras
            </div>
          </div>
        )}

        {tools.includes('word-count') && (
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              {wordCount.toLocaleString()} palabras • {readingTime} min
            </span>
          </div>
        )}

        {tools.includes('characters') && characterList.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCharacters(!showCharacters)}
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              {showCharacters ? 'Ocultar' : 'Mostrar'} personajes ({characterList.length})
            </Button>
            {showCharacters && (
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {characterList.map((character, index) => (
                    <div key={index} className="text-xs font-medium text-gray-700">
                      {character}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tools.includes('verse-spacing') && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Espaciado de versos</span>
            <Button
              variant={verseSpacing ? "default" : "outline"}
              size="sm"
              onClick={() => setVerseSpacing(!verseSpacing)}
            >
              {verseSpacing ? 'Activado' : 'Desactivado'}
            </Button>
          </div>
        )}

        {tools.includes('line-numbers') && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Números de línea</span>
            <Button
              variant={showLineNumbers ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLineNumbers(!showLineNumbers)}
            >
              {showLineNumbers ? 'Activado' : 'Desactivado'}
            </Button>
          </div>
        )}

        {tools.includes('recitation') && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Modo recitación
          </Button>
        )}

        {tools.includes('highlights') && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Highlighter className="h-4 w-4 mr-2" />
              Resaltar texto
            </Button>
            {highlightedText.length > 0 && (
              <div className="text-xs text-gray-500">
                {highlightedText.length} fragmento{highlightedText.length !== 1 ? 's' : ''} resaltado{highlightedText.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {tools.includes('notes') && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotesPanel(!showNotesPanel)}
              className="w-full"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {showNotesPanel ? 'Ocultar' : 'Mostrar'} notas ({notes.length})
            </Button>
            
            {showNotesPanel && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-3 max-h-80 overflow-y-auto">
                {/* Añadir nueva nota */}
                <div className="space-y-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escribe tu nota aquí..."
                    className="w-full text-xs border border-gray-300 rounded p-2 resize-none"
                    rows={3}
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={addNote}
                    disabled={!newNote.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Añadir nota
                  </Button>
                </div>
                
                {/* Lista de notas existentes */}
                {notes.length === 0 ? (
                  <div className="text-center py-4">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No hay notas aún</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <NoteItem
                        key={note.id}
                        note={note}
                        onEdit={editNote}
                        onDelete={deleteNote}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tools.includes('outline') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOutline(!showOutline)}
            className="w-full"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {showOutline ? 'Ocultar' : 'Mostrar'} esquema
          </Button>
        )}

        {tools.includes('acts-scenes') && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Estructura teatral</span>
            <div className="text-xs text-gray-500">
              Actos y escenas detectadas automáticamente
            </div>
          </div>
        )}

        {tools.includes('dialogue-format') && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Formato de diálogos</span>
            <Button
              variant="outline"
              size="sm"
            >
              Mejorar
            </Button>
          </div>
        )}

        {tools.includes('bookmarks') && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBookmark}
            className="w-full"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Marcar página
          </Button>
        )}

        {tools.includes('share') && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="w-full"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        )}
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-lg rounded-full h-12 w-12 p-0"
          title="Herramientas de lectura"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-white border border-gray-300 rounded-lg shadow-xl w-80 max-h-[80vh] overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Herramientas de lectura</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            ×
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
              activeTab === 'general' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
              activeTab === 'genre' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('genre')}
          >
            {genreConfig.name}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'general' ? renderGeneralTools() : renderGenreSpecificTools()}
      </div>
    </div>
  )
}

// Hook para aplicar las preferencias de lectura
export function useReadingPreferences() {
  const [preferences, setPreferences] = useState<ReadingPreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    const saved = localStorage.getItem('palabreo-reading-preferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
      } catch (error) {
        console.warn('Error loading reading preferences:', error)
      }
    }

    // Escuchar cambios en localStorage y eventos personalizados para sincronizar
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'palabreo-reading-preferences' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
        } catch (error) {
          console.warn('Error parsing reading preferences:', error)
        }
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      setPreferences({ ...DEFAULT_PREFERENCES, ...e.detail })
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('reading-preferences-changed', handleCustomEvent as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('reading-preferences-changed', handleCustomEvent as EventListener)
    }
  }, [])

  const getReadingStyles = () => {
    const themeStyles = {
      light: {
        backgroundColor: '#ffffff',
        color: '#1f2937',
      },
      dark: {
        backgroundColor: '#1f2937',
        color: '#f9fafb',
      },
      sepia: {
        backgroundColor: '#f7f3e9',
        color: '#5d4e37',
      }
    }

    const widthStyles = {
      narrow: '65ch',
      normal: '75ch', 
      wide: '85ch'
    }

    return {
      fontSize: `${preferences.fontSize}px`,
      fontFamily: preferences.fontFamily,
      lineHeight: preferences.lineHeight,
      textAlign: preferences.textAlign,
      maxWidth: widthStyles[preferences.columnWidth],
      margin: '0 auto',
      padding: '0 1rem',
      transition: 'all 0.3s ease',
      ...themeStyles[preferences.theme]
    }
  }

  return { preferences, setPreferences, getReadingStyles }
}
