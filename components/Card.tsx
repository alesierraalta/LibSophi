'use client'

import React, { useState } from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  gradient?: boolean
  onClick?: () => void
  as?: keyof JSX.IntrinsicElements
}

export default function Card({
  children,
  className = '',
  hover = true,
  glow = false,
  gradient = false,
  onClick,
  as: Component = 'div',
}: CardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!glow) return
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  const baseClasses = `
    relative rounded-2xl backdrop-blur-sm transition-all duration-500 ease-out
    ${hover ? 'hover:-translate-y-2 hover:shadow-2xl' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-white'}
    ${glow && isHovering ? 'shadow-2xl' : 'shadow-lg'}
  `

  return (
    <Component
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Glow Effect */}
      {glow && (
        <div
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 51, 102, 0.1) 0%, transparent 50%)`,
            opacity: isHovering ? 1 : 0,
          }}
        />
      )}

      {/* Border Gradient */}
      {hover && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  )
}

// Specialized card variants
export function FeatureCard({ 
  icon, 
  title, 
  description, 
  className = '' 
}: {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}) {
  return (
    <Card hover glow className={`p-6 group ${className}`}>
      <div className="flex flex-col items-start space-y-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 group-hover:from-primary/30 group-hover:to-secondary/25 transition-all duration-300 shadow-lg group-hover:shadow-primary/20">
          <div className="text-primary text-3xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
            {icon}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  )
}

export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  className = ''
}: {
  quote: string
  author: string
  role: string
  avatar?: React.ReactNode
  className?: string
}) {
  return (
    <Card hover className={`p-6 ${className}`}>
      <div className="space-y-4">
        <blockquote className="text-gray-700 italic leading-relaxed">
          "{quote}"
        </blockquote>
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
            {avatar || author.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{author}</p>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}