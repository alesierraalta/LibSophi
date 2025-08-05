import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate a simple blur placeholder if none provided
  const defaultBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#FFE6E6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#FF3366" font-family="system-ui" font-size="14">
        InkFusion
      </text>
    </svg>`
  ).toString('base64')}`

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-pastel text-primary ${className}`}
        style={{ width, height }}
      >
        <span className="text-sm font-medium">Imagen no disponible</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {isLoading && (
        <div 
          className="absolute inset-0 bg-pastel animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-primary text-sm font-medium">Cargando...</div>
        </div>
      )}
    </div>
  )
}