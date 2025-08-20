'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Quote, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Eye, Maximize, Minimize, Undo, Redo, BookPlus, BookOpen, Plus, Trash2, ChevronUp, ChevronDown, Code, Code2, SeparatorHorizontal, Eraser, IndentIncrease, IndentDecrease, HelpCircle } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import AppHeader from '@/components/AppHeader'

export default function WriterPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [genre, setGenre] = useState('cuento')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [coverUrl, setCoverUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [previewWholeWork, setPreviewWholeWork] = useState(false)
  const [useChapters, setUseChapters] = useState<boolean>(genre === 'novela')
  const [editorFont, setEditorFont] = useState<'times' | 'serif' | 'poppins' | 'rubik' | 'merri' | 'lora' | 'robotoslab' | 'playfair' | 'mono'>('times')
  const [focusMode, setFocusMode] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [undoStack, setUndoStack] = useState<{ title: string; content: string }[]>([])
  const [redoStack, setRedoStack] = useState<{ title: string; content: string }[]>([])
  // Guided tour state
  const [showTutorial, setShowTutorial] = useState(false)
  const [tourStepIndex, setTourStepIndex] = useState(0)
  const [highlightRect, setHighlightRect] = useState<{
    top: number; left: number; width: number; height: number
  } | null>(null)
  const [autoTour, setAutoTour] = useState(false)

  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  // Toolbar refs (desktop)
  const boldBtnRef = useRef<HTMLButtonElement | null>(null)
  const italicBtnRef = useRef<HTMLButtonElement | null>(null)
  const underlineBtnRef = useRef<HTMLButtonElement | null>(null)
  const strikeBtnRef = useRef<HTMLButtonElement | null>(null)
  const h1BtnRef = useRef<HTMLButtonElement | null>(null)
  const h2BtnRef = useRef<HTMLButtonElement | null>(null)
  const quoteBtnRef = useRef<HTMLButtonElement | null>(null)
  const listBtnRef = useRef<HTMLButtonElement | null>(null)
  const listOrderedBtnRef = useRef<HTMLButtonElement | null>(null)
  const linkBtnRef = useRef<HTMLButtonElement | null>(null)
  const imageBtnRef = useRef<HTMLButtonElement | null>(null)
  const inlineCodeBtnRef = useRef<HTMLButtonElement | null>(null)
  const codeBlockBtnRef = useRef<HTMLButtonElement | null>(null)
  const hrBtnRef = useRef<HTMLButtonElement | null>(null)
  const eraserBtnRef = useRef<HTMLButtonElement | null>(null)
  const indentIncBtnRef = useRef<HTMLButtonElement | null>(null)
  const indentDecBtnRef = useRef<HTMLButtonElement | null>(null)
  const undoBtnRef = useRef<HTMLButtonElement | null>(null)
  const redoBtnRef = useRef<HTMLButtonElement | null>(null)
  const previewBtnRef = useRef<HTMLButtonElement | null>(null)
  const focusBtnRef = useRef<HTMLButtonElement | null>(null)
  const publishBtnRef = useRef<HTMLButtonElement | null>(null)
  // Toolbar refs (mobile)
  const mBoldBtnRef = useRef<HTMLButtonElement | null>(null)
  const mItalicBtnRef = useRef<HTMLButtonElement | null>(null)
  const mH1BtnRef = useRef<HTMLButtonElement | null>(null)
  const mListBtnRef = useRef<HTMLButtonElement | null>(null)
  const mLinkBtnRef = useRef<HTMLButtonElement | null>(null)
  const mImageBtnRef = useRef<HTMLButtonElement | null>(null)
  const mPreviewBtnRef = useRef<HTMLButtonElement | null>(null)
  const mPublishBtnRef = useRef<HTMLButtonElement | null>(null)

  // Capítulos y obras
  type Chapter = { id: string; title: string; content: string }
  type Work = { id: string; title: string; genre: string; coverUrl?: string; tags: string[]; chapters: Chapter[]; createdAt: number; updatedAt: number }

  const [chapters, setChapters] = useState<Chapter[]>([{ id: `${Date.now()}-1`, title: 'Capítulo 1', content: '' }])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [hasSelectedWork, setHasSelectedWork] = useState(false)
  const [draftAvailable, setDraftAvailable] = useState(false)
  const [selectingContinuation, setSelectingContinuation] = useState(false)
  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null)
  const [existingWorks, setExistingWorks] = useState<Work[]>([])

  const isPublishDisabled = useMemo(() => title.trim().length === 0 || content.trim().length < 50, [title, content])

  const wordCount = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean)
    return words.length
  }, [content])

  const readingTimeMinutes = useMemo(() => {
    return Math.max(1, Math.round(wordCount / 200))
  }, [wordCount])

  const totalWordCount = useMemo(() => {
    return chapters.reduce((sum, ch) => sum + ch.content.trim().split(/\s+/).filter(Boolean).length, 0)
  }, [chapters])

  const editorFontFamily = useMemo(() => {
    switch (editorFont) {
      case 'times':
        return '"Times New Roman", Times, serif'
      case 'serif':
        return 'Georgia, Cambria, "Times New Roman", Times, serif'
      case 'poppins':
        return 'var(--font-poppins)'
      case 'rubik':
        return 'var(--font-rubik)'
      case 'merri':
        return 'var(--font-merriweather)'
      case 'lora':
        return 'var(--font-lora)'
      case 'robotoslab':
        return 'var(--font-robotoslab)'
      case 'playfair':
        return 'var(--font-playfair)'
      case 'mono':
        return 'var(--font-jetbrains-mono)'
      default:
        return 'serif'
    }
  }, [editorFont])

  useEffect(() => {
    if (title.length === 0 && content.length === 0) return
    setIsSaving(true)
    const id = setTimeout(() => {
      // TODO: Persistir en draft local o backend
      setIsSaving(false)
      setLastSavedAt(new Date())
      try {
        const draft = { title, content, genre, coverUrl, tags, chapters, currentWorkId, currentChapterIndex, useChapters }
        localStorage.setItem('palabreo-writer-draft', JSON.stringify(draft))
      } catch {}
    }, 800)
    return () => clearTimeout(id)
  }, [title, content, genre, coverUrl, tags, chapters, currentWorkId, currentChapterIndex])

  // Detect mobile viewport to tune UX for a native-app-like feel
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (isMobile) setFocusMode(true)
  }, [isMobile])

  useEffect(() => {
    // Restaurar borrador
    try {
      const raw = localStorage.getItem('palabreo-writer-draft')
      if (raw) {
        const saved = JSON.parse(raw) as { title?: string; content?: string; genre?: string; coverUrl?: string; tags?: string[]; chapters?: any; currentWorkId?: string | null; currentChapterIndex?: number; useChapters?: boolean }
        if (saved.title) setTitle(saved.title)
        if (saved.content) setContent(saved.content)
        if (saved.genre) setGenre(saved.genre)
        if (saved.coverUrl) setCoverUrl(saved.coverUrl)
        if (Array.isArray(saved.tags)) setTags(saved.tags)
        if (Array.isArray(saved.chapters)) setChapters(saved.chapters as any)
        if (typeof saved.currentWorkId !== 'undefined') setCurrentWorkId(saved.currentWorkId ?? null)
        if (typeof saved.currentChapterIndex === 'number') setCurrentChapterIndex(saved.currentChapterIndex)
        if (typeof saved.useChapters === 'boolean') setUseChapters(saved.useChapters)
        const hadSelection = (
          (saved.currentWorkId && saved.currentWorkId.length > 0) ||
          (saved.title && saved.title.trim().length > 0) ||
          (Array.isArray(saved.chapters) && saved.chapters.some((ch: any) => ch && typeof ch.content === 'string' && ch.content.trim().length > 0))
        )
        setDraftAvailable(!!hadSelection)
        // Siempre pedir selección al abrir
        setHasSelectedWork(false)
      }
      const worksRaw = localStorage.getItem('palabreo-works')
      if (worksRaw) {
        const works = JSON.parse(worksRaw) as Work[]
        setExistingWorks(works)
      }
    } catch {}
  }, [])

  useEffect(() => {
    // sincronizar contenido con capítulo activo
    setChapters((prev) => {
      const copy = [...prev]
      if (!copy[currentChapterIndex]) return prev
      if (copy[currentChapterIndex].content !== content) {
        copy[currentChapterIndex] = { ...copy[currentChapterIndex], content }
        return copy
      }
      return prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  useEffect(() => {
    // Ajuste de capítulos según modo (no forzar selección de obra)
    if (!useChapters) {
      setPreviewWholeWork(false)
    } else {
      setChapters((prev) => {
        if (prev.length === 0) {
          return [{ id: `${Date.now()}-1`, title: 'Capítulo 1', content }]
        }
        return prev
      })
      setCurrentChapterIndex(0)
    }
  }, [useChapters])

  // Guided tour helpers
  const startTour = () => {
    setTourStepIndex(0)
    setShowTutorial(true)
    setAutoTour(true)
  }
  const endTour = () => {
    setShowTutorial(false)
    setAutoTour(false)
    try { localStorage.setItem('palabreo-writer-tour-complete', '1') } catch {}
  }
  const nextTour = () => {
    setAutoTour(false)
    setTourStepIndex((i) => Math.min(i + 1, getTourSteps().length - 1))
  }
  const prevTour = () => {
    setAutoTour(false)
    setTourStepIndex((i) => Math.max(i - 1, 0))
  }

  type TourStep = {
    id: string
    title: string
    description: string
    getTarget: () => HTMLElement | null
  }
  const getTourSteps = (): TourStep[] => {
    if (isMobile) {
      return [
        { id: 'bold', title: 'Negrita', description: 'Aplica negrita al texto seleccionado.', getTarget: () => mBoldBtnRef.current },
        { id: 'italic', title: 'Cursiva', description: 'Aplica cursiva al texto seleccionado.', getTarget: () => mItalicBtnRef.current },
        { id: 'h1', title: 'Título (H1)', description: 'Convierte la línea actual en título principal.', getTarget: () => mH1BtnRef.current },
        { id: 'list', title: 'Lista', description: 'Crea una lista con viñetas.', getTarget: () => mListBtnRef.current },
        { id: 'link', title: 'Enlace', description: 'Inserta un enlace en el texto.', getTarget: () => mLinkBtnRef.current },
        { id: 'image', title: 'Imagen', description: 'Inserta una imagen por URL.', getTarget: () => mImageBtnRef.current },
        { id: 'preview', title: 'Vista previa', description: 'Alterna para ver el resultado final.', getTarget: () => mPreviewBtnRef.current },
        { id: 'publish', title: 'Publicar', description: 'Publica tu obra cuando esté lista.', getTarget: () => mPublishBtnRef.current },
      ]
    }
    return [
      { id: 'bold', title: 'Negrita', description: 'Aplica negrita al texto seleccionado.', getTarget: () => boldBtnRef.current },
      { id: 'italic', title: 'Cursiva', description: 'Aplica cursiva al texto seleccionado.', getTarget: () => italicBtnRef.current },
      { id: 'underline', title: 'Subrayado', description: 'Subraya el texto seleccionado.', getTarget: () => underlineBtnRef.current },
      { id: 'strikethrough', title: 'Tachado', description: 'Tacha el texto seleccionado.', getTarget: () => strikeBtnRef.current },
      { id: 'h1', title: 'Título (H1)', description: 'Convierte la línea actual en título principal.', getTarget: () => h1BtnRef.current },
      { id: 'h2', title: 'Subtítulo (H2)', description: 'Convierte la línea actual en subtítulo.', getTarget: () => h2BtnRef.current },
      { id: 'quote', title: 'Cita', description: 'Formatea el párrafo como cita.', getTarget: () => quoteBtnRef.current },
      { id: 'list', title: 'Lista', description: 'Crea una lista con viñetas.', getTarget: () => listBtnRef.current },
      { id: 'listOrdered', title: 'Lista numerada', description: 'Crea una lista numerada.', getTarget: () => listOrderedBtnRef.current },
      { id: 'link', title: 'Enlace', description: 'Inserta un enlace en el texto.', getTarget: () => linkBtnRef.current },
      { id: 'image', title: 'Imagen', description: 'Inserta una imagen por URL.', getTarget: () => imageBtnRef.current },
      { id: 'inlineCode', title: 'Código en línea', description: 'Formatea como código en línea.', getTarget: () => inlineCodeBtnRef.current },
      { id: 'codeBlock', title: 'Bloque de código', description: 'Inserta un bloque de código.', getTarget: () => codeBlockBtnRef.current },
      { id: 'hr', title: 'Separador', description: 'Inserta una línea horizontal para separar secciones.', getTarget: () => hrBtnRef.current },
      { id: 'eraser', title: 'Limpiar formato', description: 'Quita negrita, cursiva, etc. del texto seleccionado.', getTarget: () => eraserBtnRef.current },
      { id: 'indentIncrease', title: 'Aumentar sangría', description: 'Incrementa la sangría de las líneas seleccionadas.', getTarget: () => indentIncBtnRef.current },
      { id: 'indentDecrease', title: 'Reducir sangría', description: 'Reduce la sangría de las líneas seleccionadas.', getTarget: () => indentDecBtnRef.current },
      { id: 'undo', title: 'Deshacer', description: 'Deshace el último cambio.', getTarget: () => undoBtnRef.current },
      { id: 'redo', title: 'Rehacer', description: 'Rehace el cambio deshecho.', getTarget: () => redoBtnRef.current },
      { id: 'preview', title: 'Vista previa', description: 'Alterna para ver el resultado final.', getTarget: () => previewBtnRef.current },
      { id: 'focus', title: 'Modo enfoque', description: 'Oculta la barra lateral para escribir sin distracciones.', getTarget: () => focusBtnRef.current },
      { id: 'publish', title: 'Publicar', description: 'Publica tu obra cuando esté lista.', getTarget: () => publishBtnRef.current },
    ]
  }

  const getTourPreviewHtml = (id: string): string => {
    switch (id) {
      case 'bold':
        return '<p>Ejemplo: <strong>negrita</strong></p>'
      case 'italic':
        return '<p>Ejemplo: <em>cursiva</em></p>'
      case 'underline':
        return '<p>Ejemplo: <u>subrayado</u></p>'
      case 'strikethrough':
        return '<p>Ejemplo: <del>tachado</del></p>'
      case 'h1':
        return '<h1 class="text-xl font-bold">Título H1</h1>'
      case 'h2':
        return '<h2 class="text-lg font-semibold">Subtítulo H2</h2>'
      case 'quote':
        return '<blockquote class="border-l-4 border-gray-300 pl-3 italic">Una cita breve</blockquote>'
      case 'list':
        return '<ul class="list-disc pl-5"><li>Elemento 1</li><li>Elemento 2</li></ul>'
      case 'listOrdered':
        return '<ol class="list-decimal pl-5"><li>Primero</li><li>Segundo</li></ol>'
      case 'link':
        return '<p>Visita <a href="#" class="text-blue-600 underline">un enlace</a></p>'
      case 'image':
        return '<div class="relative h-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">Imagen (URL)</div>'
      case 'inlineCode':
        return '<p>Usa <code>codigo</code> en línea</p>'
      case 'codeBlock':
        return '<pre class="bg-gray-50 border border-gray-200 rounded p-2 text-xs"><code>console.log("hola");</code></pre>'
      case 'hr':
        return '<hr class="my-2 border-gray-300" />'
      case 'eraser':
        return '<p><span class="line-through">Texto con formato</span> ➜ <span>limpiado</span></p>'
      case 'indentIncrease':
        return '<pre class="text-xs">línea\n  línea con sangría</pre>'
      case 'indentDecrease':
        return '<pre class="text-xs">  línea con sangría\nlínea sin sangría</pre>'
      case 'undo':
        return '<p>Revierte el último cambio realizado.</p>'
      case 'redo':
        return '<p>Reaplica el cambio deshecho.</p>'
      case 'preview':
        return '<p>Muestra el contenido renderizado.</p>'
      case 'focus':
        return '<p>Escribe sin distracciones ocultando la barra lateral.</p>'
      case 'publish':
        return '<p>Publica tu obra cuando esté lista.</p>'
      default:
        return ''
    }
  }

  useEffect(() => {
    if (!showTutorial) return
    const steps = getTourSteps()
    const target = steps[tourStepIndex]?.getTarget()
    const updateRect = () => {
      const element = steps[tourStepIndex]?.getTarget()
      if (element) {
        const rect = element.getBoundingClientRect()
        setHighlightRect({
          top: Math.max(8, rect.top - 8),
          left: Math.max(8, rect.left - 8),
          width: rect.width + 16,
          height: rect.height + 16,
        })
      } else {
        setHighlightRect(null)
      }
    }
    // Initial update (after a tick to ensure layout is stable)
    const id = window.setTimeout(updateRect, 0)
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial, tourStepIndex, isMobile, isPreview, focusMode])

  // Auto-advance tour and auto-exit at the end
  useEffect(() => {
    if (!showTutorial || !autoTour) return
    const steps = getTourSteps()
    if (tourStepIndex >= steps.length - 1) {
      const endId = window.setTimeout(() => endTour(), 1500)
      return () => window.clearTimeout(endId)
    }
    const id = window.setTimeout(() => {
      setTourStepIndex((i) => Math.min(i + 1, steps.length - 1))
    }, 1800)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial, autoTour, tourStepIndex, isMobile])

  // Historial simple de deshacer/rehacer
  const pushUndoState = (next: { title: string; content: string }) => {
    setUndoStack((prev) => [...prev.slice(-20), next])
    setRedoStack([])
  }

  const handleTitleChange = (value: string) => {
    pushUndoState({ title, content })
    setTitle(value)
  }

  const handleContentChange = (value: string) => {
    pushUndoState({ title, content })
    setContent(value)
  }

  const handleUndo = () => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setRedoStack((r) => [...r, { title, content }])
      setTitle(last.title)
      setContent(last.content)
      return prev.slice(0, -1)
    })
  }

  const handleRedo = () => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setUndoStack((u) => [...u, { title, content }])
      setTitle(last.title)
      setContent(last.content)
      return prev.slice(0, -1)
    })
  }

  // Utilidades de formato
  const wrapSelection = (prefix: string, suffix?: string) => {
    const textarea = editorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = content.slice(0, start)
    const selected = content.slice(start, end)
    const after = content.slice(end)
    const finalSuffix = suffix ?? prefix
    const next = `${before}${prefix}${selected || ''}${finalSuffix}${after}`
    handleContentChange(next)
    requestAnimationFrame(() => {
      const selectionStart = start + prefix.length
      const selectionEnd = selectionStart + (selected ? selected.length : 0)
      textarea.focus()
      textarea.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  const toggleLinePrefix = (marker: string) => {
    const textarea = editorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = content.slice(0, start)
    const selected = content.slice(start, end)
    const after = content.slice(end)
    const lines = selected.split('\n')
    const toggled = lines
      .map((line) => {
        const trimmed = line.trimStart()
        const leading = line.slice(0, line.length - trimmed.length)
        if (trimmed.startsWith(marker)) {
          return leading + trimmed.slice(marker.length)
        }
        return leading + marker + trimmed
      })
      .join('\n')
    const next = `${before}${toggled}${after}`
    handleContentChange(next)
    requestAnimationFrame(() => {
      const delta = toggled.length - selected.length
      const newStart = start
      const newEnd = end + delta
      textarea.focus()
      textarea.setSelectionRange(newStart, newEnd)
    })
  }

  const insertLink = () => {
    const textarea = editorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = content.slice(0, start)
    const selected = content.slice(start, end) || 'texto'
    const after = content.slice(end)
    const next = `${before}[${selected}](https://)`
    handleContentChange(next + after)
    requestAnimationFrame(() => {
      const cursor = (before + `[${selected}](https://`).length
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const insertInlineCode = () => wrapSelection('`')

  const insertCodeBlock = () => {
    const textarea = editorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = content.slice(0, start)
    const selected = content.slice(start, end) || '// tu código'
    const after = content.slice(end)
    const block = `\n\n\`\`\`\n${selected}\n\`\`\`\n\n`
    const next = before + block + after
    handleContentChange(next)
    requestAnimationFrame(() => {
      const pos = (before + '\n\n```\n').length + selected.length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  const insertHorizontalRule = () => {
    const textarea = editorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = content.slice(0, start)
    const after = content.slice(end)
    const next = `${before}\n\n---\n\n${after}`
    handleContentChange(next)
    requestAnimationFrame(() => {
      const pos = (before + '\n\n---\n\n').length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  const clearFormatting = () => {
    const textarea = editorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = content.slice(0, start)
    const selected = content.slice(start, end)
    const after = content.slice(end)
    const cleaned = (selected || '').
      replace(/\*\*([\s\S]+?)\*\*/g, '$1').
      replace(/\*([\s\S]+?)\*/g, '$1').
      replace(/~~([\s\S]+?)~~/g, '$1').
      replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1').
      replace(/^\s{0,3}#{1,6}\s+/gm, '').
      replace(/^\s{0,3}>\s?/gm, '').
      replace(/^\s{0,3}[-*+]\s+/gm, '').
      replace(/^\s{0,3}\d+\.\s+/gm, '').
      replace(/<\/?u>/g, '')
    const next = before + cleaned + after
    handleContentChange(next)
    requestAnimationFrame(() => {
      const pos = before.length + cleaned.length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  const indentSelection = (outdent = false) => {
    const textarea = editorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = content.slice(0, start)
    const selected = content.slice(start, end)
    const after = content.slice(end)
    const lines = selected.split('\n')
    const changed = lines.map((line) => {
      if (outdent) {
        if (line.startsWith('  ')) return line.slice(2)
        if (line.startsWith('\t')) return line.slice(1)
        return line
      }
      return '  ' + line
    }).join('\n')
    const next = before + changed + after
    handleContentChange(next)
    requestAnimationFrame(() => {
      const delta = changed.length - selected.length
      const newStart = start
      const newEnd = end + delta
      textarea.focus()
      textarea.setSelectionRange(newStart, newEnd)
    })
  }

  const insertHeading = (level: 1 | 2) => {
    const textarea = editorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = content.slice(0, start)
    const selected = content.slice(start, end)
    const after = content.slice(end)
    const prefix = level === 1 ? '# ' : '## '
    const lineStart = before.lastIndexOf('\n') + 1
    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart)
    handleContentChange(next)
    requestAnimationFrame(() => {
      const newPos = (lineStart + prefix.length) + (selected ? selected.length : 0)
      textarea.focus()
      textarea.setSelectionRange(newPos, newPos)
    })
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      wrapSelection('**')
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      wrapSelection('*')
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'u') {
      e.preventDefault()
      wrapSelection('<u>', '</u>')
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
      e.preventDefault()
      wrapSelection('~~')
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      insertLink()
    }
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'c') {
      e.preventDefault()
      insertInlineCode()
    }
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      insertCodeBlock()
    }
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'h') {
      e.preventDefault()
      insertHorizontalRule()
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      setIsSaving(true)
      setTimeout(() => {
        setIsSaving(false)
        setLastSavedAt(new Date())
      }, 300)
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!isPublishDisabled) handlePublish()
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      indentSelection(e.shiftKey)
    }
  }

  // Vista previa mínima (parcialmente compatible con Markdown básico)
  const renderPreviewHtml = (raw: string) => {
    const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const lines = raw.split('\n')
    const htmlLines: string[] = []
    let inList = false
    let inCodeBlock = false
    let codeLang: string | null = null
    for (const line of lines) {
      if (/^\s*```/.test(line)) {
        if (!inCodeBlock) {
          inCodeBlock = true
          const m = line.match(/^\s*```\s*(\w+)?/)
          codeLang = m && m[1] ? m[1] : null
          htmlLines.push(`<pre class="bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto"><code${codeLang ? ` class=\"language-${codeLang}\"` : ''}>`)
        } else {
          inCodeBlock = false
          codeLang = null
          htmlLines.push('</code></pre>')
        }
        continue
      }
      if (inCodeBlock) {
        htmlLines.push((line || ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
        continue
      }
      if (/^\s*[-*]\s+/.test(line)) {
        if (!inList) {
          inList = true
          htmlLines.push('<ul class="list-disc pl-6 mb-2">')
        }
        const item = line.replace(/^\s*[-*]\s+/, '')
        htmlLines.push(`<li>${escapeHtml(item)}</li>`)
        continue
      }
      if (inList) {
        htmlLines.push('</ul>')
        inList = false
      }
      if (/^\s*[-*_]{3,}\s*$/.test(line)) {
        htmlLines.push('<hr class="my-4 border-gray-200"/>')
        continue
      }
      if (/^\s*#\s+/.test(line)) {
        htmlLines.push(`<h1 class="text-2xl font-bold mt-6 mb-2">${escapeHtml(line.replace(/^\s*#\s+/, ''))}</h1>`) 
        continue
      }
      if (/^\s*##\s+/.test(line)) {
        htmlLines.push(`<h2 class="text-xl font-semibold mt-5 mb-2">${escapeHtml(line.replace(/^\s*##\s+/, ''))}</h2>`) 
        continue
      }
      if (/^\s*>\s+/.test(line)) {
        htmlLines.push(`<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3">${escapeHtml(line.replace(/^\s*>\s+/, ''))}</blockquote>`) 
        continue
      }
      const withStrong = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      const withEm = withStrong.replace(/\*(.+?)\*/g, '<em>$1</em>')
      const withDel = withEm.replace(/~~(.+?)~~/g, '<del>$1</del>')
      const withInlineCode = withDel.replace(/`([^`]+?)`/g, '<code>$1</code>')
      if (withInlineCode.trim().length === 0) {
        htmlLines.push('<br/>')
      } else {
        const unescaped = escapeHtml(withInlineCode).replace(/&lt;(strong|em|del|code|u)&gt;|&lt;\/(strong|em|del|code|u)&gt;/g, (m) => ({'&lt;strong&gt;':'<strong>','&lt;/strong&gt;':'</strong>','&lt;em&gt;':'<em>','&lt;/em&gt;':'</em>','&lt;del&gt;':'<del>','&lt;/del&gt;':'</del>','&lt;code&gt;':'<code>','&lt;/code&gt;':'</code>','&lt;u&gt;':'<u>','&lt;/u&gt;':'</u>'}[m] as string))
        htmlLines.push(`<p class="leading-7 mb-3 text-gray-800">${unescaped}</p>`) 
      }
    }
    if (inList) htmlLines.push('</ul>')
    return { __html: htmlLines.join('\n') }
  }

  // Capítulos CRUD
  const addChapter = () => {
    const newChapter: Chapter = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: `Capítulo ${chapters.length + 1}`, content: '' }
    setChapters((prev) => [...prev, newChapter])
    setCurrentChapterIndex(chapters.length)
    setContent('')
  }

  const removeChapter = (index: number) => {
    if (chapters.length === 1) return
    const next = chapters.filter((_, i) => i !== index)
    setChapters(next)
    const newIndex = Math.max(0, index - 1)
    setCurrentChapterIndex(newIndex)
    setContent(next[newIndex]?.content ?? '')
  }

  const moveChapter = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= chapters.length) return
    const copy = [...chapters]
    const temp = copy[index]
    copy[index] = copy[target]
    copy[target] = temp
    setChapters(copy)
    setCurrentChapterIndex(target)
    setContent(copy[target].content)
  }

  const updateChapterTitle = (index: number, value: string) => {
    setChapters((prev) => prev.map((ch, i) => (i === index ? { ...ch, title: value } : ch)))
  }

  // Obras (continuación/nueva)
  const refreshWorks = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        // fallback local si no hay sesión
        const worksRaw = localStorage.getItem('palabreo-works')
        if (worksRaw) setExistingWorks(JSON.parse(worksRaw) as Work[])
        return
      }
      const { data: dbWorks } = await supabase
        .from('works')
        .select('id,title,genre,cover_url,chapters,updated_at')
        .eq('author_id', userData.user.id)
        .order('updated_at', { ascending: false })
      if (dbWorks) {
        setExistingWorks(dbWorks.map((w: any) => ({
          id: w.id,
          title: w.title,
          genre: w.genre || 'obra',
          coverUrl: w.cover_url || '',
          tags: [],
          chapters: Array.isArray(w.chapters) && w.chapters.length > 0 ? w.chapters : [{ id: `${Date.now()}-1`, title: 'Capítulo 1', content: '' }],
          createdAt: Date.now(),
          updatedAt: w.updated_at ? new Date(w.updated_at).getTime() : Date.now(),
        })))
      }
    } catch {
      try {
        const worksRaw = localStorage.getItem('palabreo-works')
        if (worksRaw) setExistingWorks(JSON.parse(worksRaw) as Work[])
      } catch {}
    }
  }

  const saveWorkToStorage = (work: Work) => {
    const list = [...existingWorks]
    const idx = list.findIndex((w) => w.id === work.id)
    if (idx >= 0) list[idx] = work
    else list.push(work)
    localStorage.setItem('palabreo-works', JSON.stringify(list))
    setExistingWorks(list)
  }

  const handleStartNewWork = () => {
    setHasSelectedWork(true)
    setSelectingContinuation(false)
    const id = `${Date.now()}`
    setCurrentWorkId(id)
    setTitle('')
    setContent('')
    setCoverUrl('')
    setTags([])
    setChapters([{ id: `${Date.now()}-1`, title: 'Capítulo 1', content: '' }])
    setCurrentChapterIndex(0)
  }

  const handleSelectExistingWork = (work: Work) => {
    setHasSelectedWork(true)
    setSelectingContinuation(false)
    setCurrentWorkId(work.id)
    setTitle(work.title)
    setGenre(work.genre)
    setCoverUrl(work.coverUrl ?? '')
    setTags(work.tags ?? [])
    setChapters(work.chapters.length ? work.chapters : [{ id: `${Date.now()}-1`, title: 'Capítulo 1', content: '' }])
    setCurrentChapterIndex(0)
    setContent(work.chapters[0]?.content ?? '')
  }

  const handlePublish = async () => {
    const supabase = getSupabaseBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      alert('Inicia sesión para publicar tu obra')
      router.push('/login')
      return
    }

    const finalChapters: { title: string; content: string }[] = (useChapters ? chapters : [{ id: currentWorkId ?? `${Date.now()}`, title: title || 'Contenido', content }])
      .map((ch) => ({ title: ch.title, content: ch.content }))

    // Insertar o actualizar obra
    let workId = currentWorkId || null
    if (!workId) {
      const { data, error } = await supabase
        .from('works')
        .insert({
          author_id: userData.user.id,
          title,
          content: useChapters ? null : content,
          genre,
          cover_url: coverUrl || null,
          tags: tags || [],
          chapters: finalChapters,
        })
        .select('id')
        .single()
      if (error) {
        alert(error.message)
        return
      }
      workId = data?.id
      setCurrentWorkId(workId)
    } else {
      const { error } = await supabase
        .from('works')
        .update({
          title,
          content: useChapters ? null : content,
          genre,
          cover_url: coverUrl || null,
          tags: tags || [],
          chapters: finalChapters,
        })
        .eq('id', workId)
        .eq('author_id', userData.user.id)
      if (error) {
        alert(error.message)
        return
      }
      
      // Sincronizar capítulos normalizados (borrado e inserción simple)
      await supabase.from('chapters').delete().eq('work_id', workId)
      const rows = finalChapters.map((ch, i) => ({ work_id: workId, index_in_work: i, title: ch.title, content: ch.content }))
      if (rows.length > 0) {
        await supabase.from('chapters').insert(rows)
      }
    }

    // Fallback: guardar copia local para overlay de continuación
    try {
      const work: Work = {
        id: workId || `${Date.now()}`,
        title,
        genre,
        coverUrl,
        tags,
        chapters: (useChapters ? chapters : [{ id: workId || `${Date.now()}`, title: title || 'Contenido', content }]),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      saveWorkToStorage(work)
    } catch {}

    router.push('/main')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        showSearch={false} 
        className={isMobile && focusMode ? 'hidden' : ''} 
      />

      {/* Mobile mini toolbar under header */}
      <div className={`sm:hidden sticky top-12 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 ${isMobile && focusMode ? 'hidden' : ''}` }>
        <div className="px-2 py-2 flex flex-wrap items-center gap-1">
          {/* Row 1: inline styles and headings */}
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => wrapSelection('**')} aria-label="Negrita"><Bold className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => wrapSelection('*')} aria-label="Cursiva"><Italic className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => wrapSelection('<u>', '</u>')} aria-label="Subrayado"><Underline className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => wrapSelection('~~')} aria-label="Tachado"><Strikethrough className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => insertHeading(1)} aria-label="Título H1"><Heading1 className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => insertHeading(2)} aria-label="Título H2"><Heading2 className="h-5 w-5"/></button>

          {/* Row 2: lists, quote, links, images */}
          <div className="w-full h-0" aria-hidden="true" />
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => toggleLinePrefix('- ')} aria-label="Lista con viñetas"><List className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => toggleLinePrefix('1. ')} aria-label="Lista numerada"><ListOrdered className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => toggleLinePrefix('> ')} aria-label="Cita"><Quote className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={insertLink} aria-label="Enlace"><LinkIcon className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => editorRef.current && wrapSelection('![alt](', ')')} aria-label="Imagen"><ImageIcon className="h-5 w-5"/></button>

          {/* Row 3: code, hr, clear, indent */}
          <div className="w-full h-0" aria-hidden="true" />
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={insertInlineCode} aria-label="Código en línea"><Code className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={insertCodeBlock} aria-label="Bloque de código"><Code2 className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={insertHorizontalRule} aria-label="Separador"><SeparatorHorizontal className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={clearFormatting} aria-label="Limpiar formato"><Eraser className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => indentSelection(false)} aria-label="Aumentar sangría"><IndentIncrease className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={() => indentSelection(true)} aria-label="Reducir sangría"><IndentDecrease className="h-5 w-5"/></button>
          
          {/* Row 4: undo/redo and actions */}
          <div className="w-full h-0" aria-hidden="true" />
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={handleUndo} aria-label="Deshacer"><Undo className="h-5 w-5"/></button>
          <button className="h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 flex items-center justify-center active:scale-95" onClick={handleRedo} aria-label="Rehacer"><Redo className="h-5 w-5"/></button>
          <div className="w-full h-0" aria-hidden="true" />
          <button className={`h-10 px-3 rounded-md border ${isPreview ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300 text-gray-700'} active:scale-95`} onClick={() => setIsPreview(v => !v)} aria-label="Vista previa">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5"/>
              <span className="text-sm">{isPreview ? 'Editar' : 'Previsualizar'}</span>
            </div>
          </button>
          <button className={`h-10 px-3 rounded-md border bg-white border-gray-300 text-gray-700 active:scale-95`} onClick={() => setFocusMode(v => !v)} aria-label="Modo enfoque">
            <div className="flex items-center gap-2">
              {focusMode ? <Minimize className="h-5 w-5"/> : <Maximize className="h-5 w-5"/>}
              <span className="text-sm">{focusMode ? 'Salir enfoque' : 'Enfoque'}</span>
            </div>
          </button>
          <button className={`h-10 px-3 rounded-md border ${isPublishDisabled ? 'bg-gray-200 border-gray-300 text-gray-500' : 'bg-red-600 border-red-600 text-white active:scale-95'}`} onClick={handlePublish} aria-label="Publicar" disabled={isPublishDisabled}>
            <span className="text-sm">Publicar</span>
          </button>

          {/* Row 5: font select (full width) */}
          <div className="w-full h-0" aria-hidden="true" />
          <div className="w-full flex items-center gap-2">
            <label className="text-xs text-gray-600">Fuente</label>
            <select
              aria-label="Elegir fuente del editor (móvil)"
              value={editorFont}
              onChange={(e) => setEditorFont(e.target.value as any)}
              className="flex-1 h-10 px-2 rounded-md border border-gray-300 text-sm text-gray-700 bg-white"
            >
              <option value="times">Times New Roman</option>
              <option value="serif">Serif clásica</option>
              <option value="poppins">Poppins</option>
              <option value="rubik">Rubik</option>
              <option value="merri">Merriweather</option>
              <option value="lora">Lora</option>
              <option value="robotoslab">Roboto Slab</option>
              <option value="playfair">Playfair Display</option>
              <option value="mono">JetBrains Mono</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating exit focus button on mobile */}
      {isMobile && focusMode && (
        <button
          onClick={() => setFocusMode(false)}
          aria-label="Salir del modo enfoque"
          className="sm:hidden fixed top-2 right-2 z-[60] h-10 px-3 rounded-full bg-black/60 text-white backdrop-blur flex items-center gap-2 active:scale-95"
        >
          <Minimize className="h-5 w-5" />
          <span className="text-sm">Salir</span>
        </button>
      )}

      <main className={`w-full max-w-none px-0 sm:px-6 lg:px-8 pt-0 sm:pt-8 pb-24 sm:pb-8 grid grid-cols-1 ${focusMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-0 sm:gap-6`}>
        <section className={`${focusMode ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-4`}>
          <Card className="bg-white border-none shadow-none rounded-none sm:border sm:shadow-sm sm:rounded-lg overflow-hidden">
            <CardContent className="p-0 sm:p-6 space-y-4">
              {/* Cover image */}
              {coverUrl && (
                <div className="relative group rounded-none sm:rounded-lg overflow-hidden border-0 sm:border sm:border-gray-200">
                  <img src={coverUrl} alt="Cover" className="w-full h-48 object-cover"/>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="sm" variant="outline" className="bg-white/80 backdrop-blur" onClick={() => setCoverUrl('')}>Quitar</Button>
                  </div>
                </div>
              )}
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título de tu obra"
                className="w-full px-4 sm:px-0 pt-4 sm:pt-0 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
              />
              {/* Chapter title (solo si usa capítulos) */}
              {useChapters ? (
                <input
                  type="text"
                  value={chapters[currentChapterIndex]?.title ?? ''}
                  onChange={(e) => updateChapterTitle(currentChapterIndex, e.target.value)}
                  placeholder={`Título del capítulo ${currentChapterIndex + 1}`}
                  className="hidden sm:block w-full text-base md:text-lg font-semibold text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
                />
              ) : null}
              {/* Toolbar */}
              <div className="hidden sm:flex flex-wrap items-center gap-1.5 border border-gray-200 rounded-md p-2 bg-gray-50">
                <Button ref={boldBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Negrita (Ctrl+B)" title="Aplica negrita al texto seleccionado (Ctrl+B). Puedes combinarla con cursiva, subrayado, etc." onClick={() => wrapSelection('**')}><Bold className="h-4 w-4"/></Button>
                <Button ref={italicBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Cursiva (Ctrl+I)" title="Aplica cursiva al texto seleccionado (Ctrl+I). Combínala con otras opciones." onClick={() => wrapSelection('*')}><Italic className="h-4 w-4"/></Button>
                <Button ref={underlineBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Subrayado (Ctrl+Shift+U)" title="Subraya el texto seleccionado (Ctrl+Shift+U)." onClick={() => wrapSelection('<u>', '</u>')}><Underline className="h-4 w-4"/></Button>
                <Button ref={strikeBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Tachado (Ctrl+Shift+S)" title="Tacha el texto seleccionado (Ctrl+Shift+S)." onClick={() => wrapSelection('~~')}><Strikethrough className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1"/>
                <Button ref={h1BtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Encabezado 1" title="Convierte la línea actual en título principal (H1)." onClick={() => insertHeading(1)}><Heading1 className="h-4 w-4"/></Button>
                <Button ref={h2BtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Encabezado 2" title="Convierte la línea actual en subtítulo (H2)." onClick={() => insertHeading(2)}><Heading2 className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1"/>
                <Button ref={quoteBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Cita" title="Formatea el párrafo como cita." onClick={() => toggleLinePrefix('> ')}><Quote className="h-4 w-4"/></Button>
                <Button ref={listBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Lista" title="Convierte líneas seleccionadas en lista con viñetas." onClick={() => toggleLinePrefix('- ')}><List className="h-4 w-4"/></Button>
                <Button ref={listOrderedBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Lista ordenada" title="Convierte líneas seleccionadas en lista numerada." onClick={() => toggleLinePrefix('1. ')}><ListOrdered className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1"/>
                <Button ref={linkBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Enlace" title="Inserta un enlace con el texto seleccionado." onClick={insertLink}><LinkIcon className="h-4 w-4"/></Button>
                <Button ref={imageBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Imagen" title="Inserta una imagen en formato Markdown (requiere URL pública)." onClick={() => editorRef.current && wrapSelection('![alt](', ')')}><ImageIcon className="h-4 w-4"/></Button>
                <Button ref={inlineCodeBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Código en línea (Ctrl+Alt+C)" title="Formatea como código en línea (Ctrl+Alt+C)." onClick={insertInlineCode}><Code className="h-4 w-4"/></Button>
                <Button ref={codeBlockBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Bloque de código (Ctrl+Alt+B)" title="Inserta un bloque de código (Ctrl+Alt+B)." onClick={insertCodeBlock}><Code2 className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1"/>
                <Button ref={hrBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Regla horizontal (Ctrl+Alt+H)" title="Inserta una separación horizontal (Ctrl+Alt+H)." onClick={insertHorizontalRule}><SeparatorHorizontal className="h-4 w-4"/></Button>
                <Button ref={eraserBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Limpiar formato" title="Elimina formatos del texto seleccionado (negrita, cursiva, etc.)." onClick={clearFormatting}><Eraser className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1"/>
                <Button ref={indentIncBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Aumentar sangría (Tab)" title="Aumenta la sangría de las líneas seleccionadas (Tab)." onClick={() => indentSelection(false)}><IndentIncrease className="h-4 w-4"/></Button>
                <Button ref={indentDecBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Reducir sangría (Shift+Tab)" title="Reduce la sangría de las líneas seleccionadas (Shift+Tab)." onClick={() => indentSelection(true)}><IndentDecrease className="h-4 w-4"/></Button>
                <Button ref={undoBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Deshacer" title="Deshace el último cambio." onClick={handleUndo}><Undo className="h-4 w-4"/></Button>
                <Button ref={redoBtnRef} variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Rehacer" title="Rehace el último cambio deshecho." onClick={handleRedo}><Redo className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1 ml-auto"/>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Fuente</label>
                  <select
                    aria-label="Elegir fuente del editor"
                    value={editorFont}
                    onChange={(e) => setEditorFont(e.target.value as any)}
                    className="h-8 px-2 border border-gray-200 rounded-md text-xs bg-white text-gray-700"
                  >
                    <option value="times">Times New Roman</option>
                    <option value="serif">Serif clásica</option>
                    <option value="poppins">Poppins</option>
                    <option value="rubik">Rubik</option>
                    <option value="merri">Merriweather</option>
                    <option value="lora">Lora</option>
                    <option value="robotoslab">Roboto Slab</option>
                    <option value="playfair">Playfair Display</option>
                    <option value="mono">JetBrains Mono</option>
                  </select>
                </div>
                <Button ref={previewBtnRef} variant="outline" size="sm" className="h-8 px-2" aria-label="Vista previa" title="Alterna entre edición y vista previa del contenido." onClick={() => setIsPreview((v) => !v)}>
                  <Eye className="h-4 w-4 mr-1"/>
                  {isPreview ? 'Editar' : 'Vista previa'}
                </Button>
                <Button ref={focusBtnRef} variant="outline" size="sm" className="h-8 px-2" aria-label="Modo enfoque" title="Oculta la barra lateral para escribir sin distracciones." onClick={() => setFocusMode((v) => !v)}>
                  {focusMode ? (<><Minimize className="h-4 w-4 mr-1"/>Salir enfoque</>) : (<><Maximize className="h-4 w-4 mr-1"/>Enfoque</>)}
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2" aria-label="Abrir tutorial" title="Inicia un recorrido guiado por las herramientas del editor." onClick={startTour}>
                  <HelpCircle className="h-4 w-4 mr-1"/>
                  Tutorial
                </Button>
              </div>

              {/* Editor / Preview */}
              {!isPreview ? (
                <div className="min-h-[240px] sm:min-h-[300px]">
                  <textarea
                    ref={editorRef}
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe aquí... Usa párrafos cortos, ritmo y voz propia."
                    className="w-full min-h-[240px] sm:min-h-[300px] bg-white text-gray-800 leading-[1.7] outline-none resize-none text-[18px] sm:text-base px-4 sm:px-0"
                    style={{ fontFamily: editorFontFamily }}
                    autoFocus={isMobile}
                  />
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Preview mode toggle */}
                  <div className="hidden sm:flex items-center justify-end gap-2">
                    <button
                      onClick={() => setPreviewWholeWork(false)}
                      className={`${!previewWholeWork ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'} px-2 py-1 rounded-md text-xs sm:text-sm border`}
                    >
                      Capítulo actual
                    </button>
                    <button
                      onClick={() => setPreviewWholeWork(true)}
                      className={`${previewWholeWork ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'} px-2 py-1 rounded-md text-xs sm:text-sm border`}
                    >
                      Obra completa
                    </button>
                  </div>
                  {/* Chapter structure preview */}
                  {useChapters && chapters.length > 1 ? (
                    <div className="p-3 sm:p-4 rounded-md border border-red-200 bg-red-50 text-red-800">
                      <div className="text-xs sm:text-sm font-semibold">Capítulos: {chapters.length}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {chapters.map((ch, i) => (
                          <span key={ch.id} className="px-2 py-1 rounded-full bg-white text-red-700 border border-red-200 text-[11px] sm:text-xs">
                            {i + 1}. {ch.title || `Capítulo ${i + 1}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : useChapters ? (
                    <div className="p-3 sm:p-4 rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-xs sm:text-sm">
                      Vista sin capítulos: esta obra se mostrará como una sola pieza
                    </div>
                  ) : null}
                  {/* Content preview */}
                  {!useChapters || !previewWholeWork ? (
                    <div className="min-h-[240px] sm:min-h-[300px] border border-gray-200 rounded-md p-3 sm:p-4 bg-white text-[15px] sm:text-base" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                      <div className="text-gray-900" dangerouslySetInnerHTML={renderPreviewHtml(content)} />
                    </div>
                  ) : (
                    <div className="min-h-[240px] sm:min-h-[300px] border border-gray-200 rounded-md p-3 sm:p-4 bg-white text-[15px] sm:text-base" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                      <div className="mb-6">
                        <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">{title || 'Sin título'}</h1>
                        <div className="text-xs text-gray-600">{genre} · {totalWordCount} palabras</div>
                      </div>
                      {chapters.map((ch, i) => (
                        <div key={ch.id} className="mb-6">
                          <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">{i + 1}. {ch.title || `Capítulo ${i + 1}`}</h2>
                          <div className="text-gray-900" dangerouslySetInnerHTML={renderPreviewHtml(ch.content)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Status bar */}
              <div className="hidden sm:flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
                <div className="flex gap-4">
                  <span>Palabras: <strong className="text-gray-900">{wordCount}</strong></span>
                  <span>Tiempo de lectura: <strong className="text-gray-900">{readingTimeMinutes} min</strong></span>
                  <span>Total obra: <strong className="text-gray-900">{totalWordCount}</strong></span>
                </div>
                <div className="hidden sm:block">
                  {isSaving ? (
                    <span className="text-gray-500">Guardando…</span>
                  ) : lastSavedAt ? (
                    <span className="text-gray-500">Guardado {lastSavedAt.toLocaleTimeString()}</span>
                  ) : null}
                </div>
              </div>

            </CardContent>
          </Card>
        </section>

        <aside className={`${focusMode ? 'hidden lg:block lg:opacity-0 lg:pointer-events-none' : 'space-y-4'}`}>
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base text-gray-900">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Usar capítulos</label>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={useChapters} onChange={(e) => setUseChapters(e.target.checked)} />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-red-500 transition-all relative">
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5" />
                  </div>
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Género</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="cuento">📝 Cuento</option>
                  <option value="novela">📖 Novela</option>
                  <option value="teatro">🎭 Teatro</option>
                  <option value="poesia">🎵 Poesía</option>
                  <option value="newsletter">📰 Newsletter</option>
                  <option value="articulo">✒️ Artículo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Portada (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={() => setCoverUrl('')}>Limpiar</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Etiquetas</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const t = tagInput.trim()
                        if (t && !tags.includes(t)) setTags([...tags, t])
                        setTagInput('')
                      }
                    }}
                    placeholder="Presiona Enter para agregar"
                    className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
                  />
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tags.map((t) => (
                      <button key={t} className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200" onClick={() => setTags(tags.filter((x) => x !== t))}>
                        #{t} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Consejos</label>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Título claro y evocador</li>
                  <li>Primer párrafo que atrape</li>
                  <li>Revisa ortografía y ritmo</li>
                </ul>
              </div>
              
            </CardContent>
          </Card>
          {/* Capítulos */}
          {useChapters && (
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base text-gray-900">Capítulos</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              <div className="space-y-2">
                {chapters.map((ch, index) => (
                  <div key={ch.id} className={`flex items-center gap-2 p-2 rounded-md border ${index === currentChapterIndex ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <button className="text-xs px-2 py-1 rounded bg-white border border-gray-200" onClick={() => moveChapter(index, -1)} disabled={index === 0}><ChevronUp className="h-4 w-4"/></button>
                    <button className="text-xs px-2 py-1 rounded bg-white border border-gray-200" onClick={() => moveChapter(index, 1)} disabled={index === chapters.length - 1}><ChevronDown className="h-4 w-4"/></button>
                    <button className={`flex-1 text-left text-sm ${index === currentChapterIndex ? 'font-semibold text-red-700' : 'text-gray-800'}`} onClick={() => { setCurrentChapterIndex(index); setContent(ch.content) }}>
                      {index + 1}. {ch.title}
                    </button>
                    <button className="text-xs px-2 py-1 rounded bg-white border border-gray-200 text-red-600" onClick={() => removeChapter(index)} disabled={chapters.length === 1}><Trash2 className="h-4 w-4"/></button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addChapter} className="w-full"><Plus className="h-4 w-4 mr-1"/>Agregar capítulo</Button>
            </CardContent>
          </Card>
          )}
        </aside>
      </main>

      {/* Mobile bottom toolbar removed to avoid duplication; unified in top mini toolbar */}

      {/* Overlay de selección de obra */}
      {!hasSelectedWork && (
        <div className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm p-0 sm:p-4 flex ${isMobile ? 'items-end' : 'items-center justify-center'}`}>
          <div className={`w-full ${isMobile ? '' : 'max-w-2xl'} grid grid-cols-1 gap-4`}>
            {!selectingContinuation ? (
              <Card className={`bg-white border border-gray-200 shadow-2xl ${isMobile ? 'rounded-t-2xl' : 'rounded-xl'} overflow-hidden`}>
                {isMobile && <div className="w-full flex items-center justify-center pt-2"><div className="h-1.5 w-12 rounded-full bg-gray-300"/></div>}
                <CardHeader className="p-4 sm:p-6 border-b border-gray-100">
                  <CardTitle className="text-lg">¿Qué vas a escribir hoy?</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <button onClick={handleStartNewWork} className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition text-left">
                    <div className="flex items-center gap-3">
                      <BookPlus className="h-5 w-5 text-red-600"/>
                      <div>
                        <div className="font-semibold text-gray-900">Nueva obra</div>
                        <div className="text-sm text-gray-600">Empieza desde cero con capítulos</div>
                      </div>
                    </div>
                  </button>
                  <button onClick={() => { setSelectingContinuation(true); refreshWorks() }} className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition text-left">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-red-600"/>
                      <div>
                        <div className="font-semibold text-gray-900">Continuación</div>
                        <div className="text-sm text-gray-600">Sigue escribiendo una obra existente</div>
                      </div>
                    </div>
                  </button>
                  {draftAvailable && (
                    <button onClick={() => setHasSelectedWork(true)} className="p-4 border border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-left md:col-span-2">
                      <div className="flex items-center gap-3">
                        <span className="h-5 w-5 rounded-full bg-blue-600 inline-block"/>
                        <div>
                          <div className="font-semibold text-gray-900">Continuar borrador</div>
                          <div className="text-sm text-gray-600">Abrir el borrador guardado recientemente</div>
                        </div>
                      </div>
                    </button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className={`bg-white border border-gray-200 shadow-2xl ${isMobile ? 'rounded-t-2xl' : 'rounded-xl'} overflow-hidden`}>
                {isMobile && <div className="w-full flex items-center justify-center pt-2"><div className="h-1.5 w-12 rounded-full bg-gray-300"/></div>}
                <CardHeader className="p-4 sm:p-6 border-b border-gray-100">
                  <CardTitle className="text-lg">Elige una obra para continuar</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3">
                  {existingWorks.length === 0 && (
                    <div className="text-sm text-gray-600">No tienes obras guardadas aún. Crea una nueva.</div>
                  )}
                  <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-auto pr-1">
                    {existingWorks.map((w) => (
                      <button key={w.id} onClick={() => handleSelectExistingWork(w)} className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition text-left">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{w.title}</div>
                            <div className="text-xs text-gray-600">{w.chapters.length} capítulos · {new Date(w.updatedAt).toLocaleDateString()}</div>
                          </div>
                          <BookOpen className="h-5 w-5 text-red-600"/>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" onClick={() => setSelectingContinuation(false)}>Volver</Button>
                    <Button variant="outline" onClick={handleStartNewWork}><BookPlus className="h-4 w-4 mr-1"/>Nueva obra</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Guided tour overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Recorrido guiado del editor">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          {/* Highlight box */}
          {highlightRect && (
            <>
              <div
                className="fixed border-2 border-red-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                style={{
                  top: highlightRect.top,
                  left: highlightRect.left,
                  width: highlightRect.width,
                  height: highlightRect.height,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0)',
                  background: 'transparent',
                }}
              />
              {/* Tooltip with inline preview */}
              <div
                className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
                style={{
                  top: Math.min((typeof window !== 'undefined' ? window.innerHeight : 0) - 180, highlightRect.top + highlightRect.height + 12),
                  left: Math.min((typeof window !== 'undefined' ? window.innerWidth : 0) - 340, Math.max(12, highlightRect.left)),
                  width: 320,
                }}
              >
                <div className="text-sm font-semibold text-gray-900 mb-1">{getTourSteps()[tourStepIndex]?.title}</div>
                <div className="text-sm text-gray-700 mb-3">{getTourSteps()[tourStepIndex]?.description}</div>
                {/* Preview area */}
                <div className="mb-3 border border-gray-200 rounded p-2 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-1">Vista previa</div>
                  <div className="prose prose-sm max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: getTourPreviewHtml(getTourSteps()[tourStepIndex]?.id || '') }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">Paso {tourStepIndex + 1} de {getTourSteps().length}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={endTour}>Saltar</Button>
                    <Button variant="outline" size="sm" onClick={prevTour} disabled={tourStepIndex === 0}>Anterior</Button>
                    {tourStepIndex < getTourSteps().length - 1 ? (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={nextTour}>Siguiente</Button>
                    ) : (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={endTour}>Terminar</Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}


