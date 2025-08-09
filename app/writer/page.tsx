'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Quote, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Eye, Maximize, Minimize, Undo, Redo, BookPlus, BookOpen, Plus, Trash2, ChevronUp, ChevronDown, Code, Code2, SeparatorHorizontal, Eraser, IndentIncrease, IndentDecrease } from 'lucide-react'

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
  const [focusMode, setFocusMode] = useState(false)
  const [undoStack, setUndoStack] = useState<{ title: string; content: string }[]>([])
  const [redoStack, setRedoStack] = useState<{ title: string; content: string }[]>([])

  const editorRef = useRef<HTMLTextAreaElement | null>(null)

  // Capítulos y obras
  type Chapter = { id: string; title: string; content: string }
  type Work = { id: string; title: string; genre: string; coverUrl?: string; tags: string[]; chapters: Chapter[]; createdAt: number; updatedAt: number }

  const [chapters, setChapters] = useState<Chapter[]>([{ id: `${Date.now()}-1`, title: 'Capítulo 1', content: '' }])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [hasSelectedWork, setHasSelectedWork] = useState(false)
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
    // Para formatos sin capítulos, no pedir selección de obra ni mostrar UI de capítulos
    if (!useChapters) {
      setHasSelectedWork(true)
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
      const pos = start + prefix.length + (selected ? selected.length + finalSuffix.length : 0)
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
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
  const refreshWorks = () => {
    try {
      const worksRaw = localStorage.getItem('palabreo-works')
      if (worksRaw) setExistingWorks(JSON.parse(worksRaw) as Work[])
    } catch {}
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

  const handlePublish = () => {
    // TODO: Integrar con backend/API de publicaciones
    const finalChapters: Chapter[] = useChapters
      ? chapters
      : [{ id: currentWorkId ?? `${Date.now()}`, title: title || 'Contenido', content }]
    const work: Work = {
      id: currentWorkId ?? `${Date.now()}`,
      title,
      genre,
      coverUrl,
      tags,
      chapters: finalChapters,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    saveWorkToStorage(work)
    console.log('Publicando...', work)
    router.push('/main')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl md:text-2xl font-bold text-red-600">Modo Escritor</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center text-xs text-gray-500">
                {isSaving ? (
                  <span className="flex items-center gap-1">Guardando…</span>
                ) : lastSavedAt ? (
                  <span className="flex items-center gap-1">Guardado a las {lastSavedAt.toLocaleTimeString()}</span>
                ) : (
                  <span className="flex items-center gap-1">Listo para escribir</span>
                )}
              </div>
              <Button variant="outline" onClick={() => router.push('/main')} className="text-sm">Cancelar</Button>
              <Button disabled={isPublishDisabled} onClick={handlePublish} className="bg-red-600 hover:bg-red-700 text-white text-sm">
                🚀 Publicar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 grid grid-cols-1 ${focusMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-5 sm:gap-6`}>
        <section className={`${focusMode ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-4`}>
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Cover image */}
              {coverUrl && (
                <div className="relative group rounded-lg overflow-hidden border border-gray-200">
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
                className="w-full text-2xl md:text-3xl font-bold text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
              />
              {/* Chapter title (solo si usa capítulos) */}
              {useChapters ? (
                <input
                  type="text"
                  value={chapters[currentChapterIndex]?.title ?? ''}
                  onChange={(e) => updateChapterTitle(currentChapterIndex, e.target.value)}
                  placeholder={`Título del capítulo ${currentChapterIndex + 1}`}
                  className="w-full text-base md:text-lg font-semibold text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
                />
              ) : null}
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 border border-gray-200 rounded-md p-2 bg-gray-50">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Negrita (Ctrl+B)" onClick={() => wrapSelection('**')}><Bold className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Cursiva (Ctrl+I)" onClick={() => wrapSelection('*')}><Italic className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Subrayado (Ctrl+Shift+U)" onClick={() => wrapSelection('<u>', '</u>')}><Underline className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Tachado (Ctrl+Shift+S)" onClick={() => wrapSelection('~~')}><Strikethrough className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1"/>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Encabezado 1" onClick={() => insertHeading(1)}><Heading1 className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Encabezado 2" onClick={() => insertHeading(2)}><Heading2 className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1"/>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Cita" onClick={() => toggleLinePrefix('> ')}><Quote className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Lista" onClick={() => toggleLinePrefix('- ')}><List className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Lista ordenada" onClick={() => toggleLinePrefix('1. ')}><ListOrdered className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1"/>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Enlace" onClick={insertLink}><LinkIcon className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Imagen" onClick={() => editorRef.current && wrapSelection('![alt](', ')')}><ImageIcon className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Código en línea (Ctrl+Alt+C)" onClick={insertInlineCode}><Code className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Bloque de código (Ctrl+Alt+B)" onClick={insertCodeBlock}><Code2 className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1"/>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Regla horizontal (Ctrl+Alt+H)" onClick={insertHorizontalRule}><SeparatorHorizontal className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Limpiar formato" onClick={clearFormatting}><Eraser className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1"/>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Aumentar sangría (Tab)" onClick={() => indentSelection(false)}><IndentIncrease className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Reducir sangría (Shift+Tab)" onClick={() => indentSelection(true)}><IndentDecrease className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Deshacer" onClick={handleUndo}><Undo className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700" aria-label="Rehacer" onClick={handleRedo}><Redo className="h-4 w-4"/></Button>
                <div className="w-px h-6 bg-gray-200 mx-1 ml-auto"/>
                <Button variant="outline" size="sm" className="h-8 px-2" aria-label="Vista previa" onClick={() => setIsPreview((v) => !v)}>
                  <Eye className="h-4 w-4 mr-1"/>
                  {isPreview ? 'Editar' : 'Vista previa'}
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2" aria-label="Modo enfoque" onClick={() => setFocusMode((v) => !v)}>
                  {focusMode ? (<><Minimize className="h-4 w-4 mr-1"/>Salir enfoque</>) : (<><Maximize className="h-4 w-4 mr-1"/>Enfoque</>)}
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
                    className="w-full min-h-[240px] sm:min-h-[300px] bg-white text-gray-800 leading-relaxed outline-none resize-none text-[15px] sm:text-base"
                    style={{ fontFamily: '"Times New Roman", Times, serif' }}
                  />
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Preview mode toggle */}
                  <div className="flex items-center justify-end gap-2">
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
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
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

      {/* Overlay de selección de obra */}
      {!hasSelectedWork && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full grid grid-cols-1 gap-4">
            {!selectingContinuation ? (
              <Card className="bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="p-6 border-b border-gray-100">
                  <CardTitle className="text-lg">¿Qué vas a escribir hoy?</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="p-6 border-b border-gray-100">
                  <CardTitle className="text-lg">Elige una obra para continuar</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {existingWorks.length === 0 && (
                    <div className="text-sm text-gray-600">No tienes obras guardadas aún. Crea una nueva.</div>
                  )}
                  <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-auto pr-1">
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
    </div>
  )
}


