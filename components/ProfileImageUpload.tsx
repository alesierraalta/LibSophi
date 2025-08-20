'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Upload, X, Camera } from 'lucide-react'
import { uploadProfileImage, validateImageFile } from '@/lib/supabase/storage'

interface ProfileImageUploadProps {
  currentImageUrl?: string
  userId: string
  type: 'avatar' | 'banner'
  onImageUploaded: (imageUrl: string) => void
  className?: string
}

export default function ProfileImageUpload({
  currentImageUrl,
  userId,
  type,
  onImageUploaded,
  className = ''
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    handleFileUpload(file)
  }

  const handleFileUpload = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setUploadError(validation.error || 'Archivo inválido')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setPreviewUrl(previewUrl)

    try {
      const { data: imageUrl, error } = await uploadProfileImage(file, userId, type)
      
      if (error) {
        setUploadError('Error al subir la imagen. Inténtalo de nuevo.')
        console.error('Upload error:', error)
        return
      }

      if (imageUrl) {
        onImageUploaded(imageUrl)
        setUploadError(null)
      }
    } catch (error) {
      console.error('Upload exception:', error)
      setUploadError('Error inesperado al subir la imagen.')
    } finally {
      setIsUploading(false)
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const clearError = () => {
    setUploadError(null)
  }

  const displayImageUrl = previewUrl || currentImageUrl

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {type === 'avatar' ? 'Foto de perfil' : 'Imagen de banner'}
        </label>
        {uploadError && (
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          relative border-2 border-dashed border-gray-300 rounded-lg
          hover:border-gray-400 transition-colors cursor-pointer
          ${type === 'avatar' ? 'aspect-square max-w-32' : 'aspect-[3/1] max-w-96'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={openFileDialog}
      >
        {displayImageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={displayImageUrl}
              alt={type === 'avatar' ? 'Avatar' : 'Banner'}
              fill
              className="object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
            <Upload className="h-8 w-8 mb-2" />
            <p className="text-sm text-center">
              {type === 'avatar' ? 'Subir foto de perfil' : 'Subir imagen de banner'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Arrastra una imagen o haz clic
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
              <span className="text-sm text-gray-600">Subiendo...</span>
            </div>
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {uploadError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {uploadError}
        </div>
      )}

      {/* Upload Button */}
      {!displayImageUrl && !isUploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Seleccionar imagen
        </Button>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        {type === 'avatar' 
          ? 'Recomendado: imagen cuadrada, máximo 5MB'
          : 'Recomendado: imagen horizontal, máximo 5MB'
        }
      </p>
    </div>
  )
}
