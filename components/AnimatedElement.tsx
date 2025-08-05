'use client'

import React from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

interface AnimatedElementProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
  delay?: number
  duration?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
  triggerOnce?: boolean
}

export default function AnimatedElement({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  className = '',
  as: Component = 'div',
  triggerOnce = true,
}: AnimatedElementProps) {
  const { ref, animationClasses } = useScrollReveal({
    direction,
    delay,
    duration,
    triggerOnce,
  })

  const elementProps = {
    className: `${animationClasses} ${className}`,
    ref: ref as React.RefObject<any>
  }

  return React.createElement(Component, elementProps, children)
}

// Componente especializado para listas con animación escalonada
interface StaggeredListProps {
  children: React.ReactNode[]
  staggerDelay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
  className?: string
  itemClassName?: string
}

export function StaggeredList({
  children,
  staggerDelay = 100,
  direction = 'up',
  className = '',
  itemClassName = '',
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedElement
          key={index}
          direction={direction}
          delay={index * staggerDelay}
          className={itemClassName}
        >
          {child}
        </AnimatedElement>
      ))}
    </div>
  )
}