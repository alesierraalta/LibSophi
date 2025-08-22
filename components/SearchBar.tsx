'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, X, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getOptimizedSupabaseClient } from '@/lib/supabase/optimized-client'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  className?: string
  showHistory?: boolean
  maxHistoryItems?: number
}

interface SearchHistoryItem {
  id: string
  query: string
  search_type: 'search' | 'trending' | 'suggestion'
  created_at: string
  updated_at: string
}

export default function SearchBar({
  placeholder = 'Buscar obras, autores...',
  value = '',
  onChange,
  onSearch,
  className = '',
  showHistory = true,
  maxHistoryItems = 8
}: SearchBarProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [trendingSearches] = useState<string[]>([
    'Romance',
    'Fantasía',
    'Misterio',
    'Ciencia ficción',
    'Drama'
  ])
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const client = getOptimizedSupabaseClient()
  const supabase = getSupabaseBrowserClient()

  // Load current user and search history from database
  useEffect(() => {
    const loadUserAndHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)
        
        if (user && showHistory) {
          const history = await client.getSearchHistory(user.id, maxHistoryItems)
          setSearchHistory(history)
        }
      } catch (error) {
        console.error('Error loading user and search history:', error)
      }
    }

    loadUserAndHistory()
  }, [maxHistoryItems, showHistory])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync with external value prop
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const saveToHistory = useCallback(async (query: string, type: 'search' | 'trending' | 'suggestion' = 'search') => {
    if (!query.trim() || !showHistory || !currentUser) return

    try {
      const success = await client.saveSearchHistory(currentUser.id, query.trim(), type)
      
      if (success) {
        // Reload search history to get updated list
        const updatedHistory = await client.getSearchHistory(currentUser.id, maxHistoryItems)
        setSearchHistory(updatedHistory)
      }
    } catch (error) {
      console.error('Error saving search history:', error)
    }
  }, [maxHistoryItems, showHistory, currentUser])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    saveToHistory(trimmedQuery, 'search')
    setIsOpen(false)
    
    if (onSearch) {
      onSearch(trimmedQuery)
    } else {
      // Default behavior: navigate to search page
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(inputValue)
    }
  }

  const handleHistoryItemClick = (query: string) => {
    setInputValue(query)
    onChange?.(query)
    handleSearch(query)
  }

  const clearHistory = async () => {
    if (!currentUser) return

    try {
      const success = await client.clearSearchHistory(currentUser.id)
      if (success) {
        setSearchHistory([])
      }
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  }

  const removeHistoryItem = async (queryToRemove: string) => {
    if (!currentUser) return

    try {
      const success = await client.deleteSearchHistoryItem(currentUser.id, queryToRemove)
      if (success) {
        // Reload search history to get updated list
        const updatedHistory = await client.getSearchHistory(currentUser.id, maxHistoryItems)
        setSearchHistory(updatedHistory)
      }
    } catch (error) {
      console.error('Error removing search history item:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = Date.now()
    const timestamp = new Date(dateString).getTime()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return new Date(timestamp).toLocaleDateString()
  }

  const hasContent = searchHistory.length > 0 || trendingSearches.length > 0

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(showHistory)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white text-sm transition-colors"
        />
      </div>

      {/* Search History Dropdown */}
      {isOpen && showHistory && (
        <Card className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Búsquedas recientes</span>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
                <div className="space-y-1">
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer group"
                    >
                      <button
                        onClick={() => handleHistoryItemClick(item.query)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <Search className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{item.query}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {formatTimeAgo(item.updated_at)}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeHistoryItem(item.query)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches - Always show */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Búsquedas populares</span>
              </div>
              <div className="space-y-1">
                {trendingSearches.map((query, index) => (
                  <button
                    key={`trending-${index}`}
                    onClick={() => handleHistoryItemClick(query)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md text-left"
                  >
                    <TrendingUp className="h-3 w-3 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
