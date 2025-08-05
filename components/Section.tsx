import React from 'react'

interface SectionProps {
  children: React.ReactNode
  id?: string
  className?: string
  background?: 'white' | 'pastel'
  'aria-labelledby'?: string
}

export default function Section({
  children,
  id,
  className = '',
  background = 'white',
  'aria-labelledby': ariaLabelledBy,
}: SectionProps) {
  const backgroundClasses = {
    white: 'bg-white',
    pastel: 'bg-pastel'
  }
  
  return (
    <section
      id={id}
      className={`section-padding ${backgroundClasses[background]} ${className}`}
      aria-labelledby={ariaLabelledBy}
    >
      <div className="container-max">
        {children}
      </div>
    </section>
  )
}