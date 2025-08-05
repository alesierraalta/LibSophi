'use client'

import React, { useState } from 'react'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
  href?: string
  className?: string
  'data-analytics'?: string
  'aria-label'?: string
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  className = '',
  'data-analytics': dataAnalytics,
  'aria-label': ariaLabel,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled || loading) return
    
    setIsPressed(true)
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newRipple = { id: Date.now(), x, y }
    
    setRipples(prev => [...prev, newRipple])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group'
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-red-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/25 focus:ring-primary active:scale-95',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/25 focus:ring-primary active:scale-95',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 hover:text-primary focus:ring-primary active:scale-95',
    gradient: 'bg-gradient-to-r from-primary to-secondary text-white hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/25 focus:ring-primary active:scale-95'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
    xl: 'px-10 py-5 text-xl gap-3'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
    isPressed ? 'scale-95' : ''
  }`
  
  const buttonContent = (
    <>
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
          }}
        >
          <span className="block w-10 h-10 bg-white/30 rounded-full animate-ping" />
        </span>
      ))}

      {/* Background gradient overlay for hover effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-inherit">
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        
        {icon && iconPosition === 'left' && !loading && (
          <span className="flex items-center">{icon}</span>
        )}
        
        <span>{children}</span>
        
        {icon && iconPosition === 'right' && !loading && (
          <span className="flex items-center">{icon}</span>
        )}
      </span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        data-analytics={dataAnalytics}
        aria-label={ariaLabel}
        role="button"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {buttonContent}
      </a>
    )
  }
  
  return (
    <button
      onClick={onClick}
      className={classes}
      data-analytics={dataAnalytics}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      type="button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {buttonContent}
    </button>
  )
}