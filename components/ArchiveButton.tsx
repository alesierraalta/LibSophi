'use client'

import { useState } from 'react'
import { Archive, ArchiveRestore } from 'lucide-react'
import { Button } from './ui/button'

interface ArchiveButtonProps {
  workId: string
  isArchived: boolean
  onToggle: (archived: boolean) => void
  className?: string
  variant?: 'default' | 'ghost' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ArchiveButton({ 
  workId, 
  isArchived, 
  onToggle, 
  className = '',
  variant = 'ghost',
  size = 'sm'
}: ArchiveButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/works/${workId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archived: !isArchived })
      })

      if (!response.ok) {
        throw new Error('Failed to update archive status')
      }

      const result = await response.json()
      onToggle(result.archived)
      
    } catch (error) {
      console.error('Error toggling archive status:', error)
      // You could add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={className}
      title={isArchived ? 'Desarchivar obra' : 'Archivar obra'}
    >
      {isArchived ? (
        <ArchiveRestore className="h-4 w-4" />
      ) : (
        <Archive className="h-4 w-4" />
      )}
      {size !== 'icon' && (
        <span className="ml-2">
          {isArchived ? 'Desarchivar' : 'Archivar'}
        </span>
      )}
    </Button>
  )
}
