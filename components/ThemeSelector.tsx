'use client'

import { useState, useEffect } from 'react'

interface RedTheme {
  name: string
  id: string
  primary: string
  secondary: string
  dark: string
  bg: string
  description: string
}

const redThemes: RedTheme[] = [
  {
    name: "Rojo Clásico",
    id: "variant-1",
    primary: "#B91C1C",
    secondary: "#DC2626", 
    dark: "#7F1D1D",
    bg: "#1C1917",
    description: "Rojo intenso y profundo"
  },
  {
    name: "Rojo Actual",
    id: "variant-2", 
    primary: "#DC2626",
    secondary: "#EF4444",
    dark: "#991B1B", 
    bg: "#0C0A09",
    description: "Rojo equilibrado"
  },
  {
    name: "Rojo Vibrante", 
    id: "variant-3",
    primary: "#EF4444",
    secondary: "#F87171",
    dark: "#B91C1C",
    bg: "#1F1917", 
    description: "Rojo brillante y moderno"
  },
  {
    name: "Rojo Suave",
    id: "variant-4",
    primary: "#F87171", 
    secondary: "#FCA5A5",
    dark: "#DC2626",
    bg: "#292524",
    description: "Rojo cálido y amigable"
  }
]

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<string>('variant-1')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    const theme = redThemes.find(t => t.id === currentTheme)
    if (theme) {
      const root = document.documentElement
      
      // Apply theme colors directly to Tailwind CSS custom properties
      root.style.setProperty('--color-primary', theme.primary)
      root.style.setProperty('--color-secondary', theme.secondary)
      
      // Override Tailwind's primary and secondary colors
      const style = document.createElement('style')
      style.id = 'dynamic-red-theme'
      
      // Remove existing dynamic theme
      const existing = document.getElementById('dynamic-red-theme')
      if (existing) existing.remove()
      
      const css = `
        :root {
          --tw-color-primary: ${theme.primary};
          --tw-color-secondary: ${theme.secondary};
        }
        
        /* Primary color backgrounds */
        .bg-primary {
          background-color: ${theme.primary} !important;
        }
        
        /* Primary color text */
        .text-primary {
          color: ${theme.primary} !important;
        }
        
        /* Primary color borders */
        .border-primary, .border-primary\\/10 {
          border-color: ${theme.primary} !important;
        }
        
        /* Hover states */
        .hover\\:text-primary:hover {
          color: ${theme.primary} !important;
        }
        
        .hover\\:border-primary:hover {
          border-color: ${theme.primary} !important;
        }
        
        /* Background gradients for non-text elements */
        .bg-gradient-to-r.from-primary.to-secondary:not(.bg-clip-text) {
          background: linear-gradient(to right, ${theme.primary}, ${theme.secondary}) !important;
        }
        
        .bg-gradient-to-br.from-primary.to-secondary:not(.bg-clip-text) {
          background: linear-gradient(to bottom right, ${theme.primary}, ${theme.secondary}) !important;
        }
        
        /* Text gradients - only for elements with bg-clip-text */
        .bg-gradient-to-r.from-primary.to-secondary.bg-clip-text {
          background: linear-gradient(to right, ${theme.primary}, ${theme.secondary}) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
        }
        
        .bg-gradient-to-br.from-primary.to-secondary.bg-clip-text {
          background: linear-gradient(to bottom right, ${theme.primary}, ${theme.secondary}) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
        }
        
        /* Ensure text transparency is maintained for gradients */
        .bg-gradient-to-r.from-primary.to-secondary.bg-clip-text.text-transparent,
        .bg-gradient-to-br.from-primary.to-secondary.bg-clip-text.text-transparent {
          color: transparent !important;
          -webkit-text-fill-color: transparent !important;
          background: linear-gradient(to right, ${theme.primary}, ${theme.secondary}) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
        }
        
        /* Specific fixes for gradient text elements */
        h1.bg-gradient-to-r.from-primary.to-secondary.bg-clip-text.text-transparent,
        h2 span.bg-gradient-to-r.from-primary.to-secondary.bg-clip-text.text-transparent {
          background: linear-gradient(to right, ${theme.primary}, ${theme.secondary}) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          color: transparent !important;
          -webkit-text-fill-color: transparent !important;
        }
        
        .bg-primary\\/10 {
          background-color: ${theme.primary}1a !important;
        }
        
        .text-secondary {
          color: ${theme.secondary} !important;
        }
        
        ${isDarkMode ? `
          body {
            background-color: ${theme.bg} !important;
            color: #F5F5F4 !important;
          }
          
          header {
            background-color: rgba(0, 0, 0, 0.9) !important;
            border-bottom-color: ${theme.primary}33 !important;
          }
          
          .bg-white {
            background-color: rgba(28, 25, 23, 0.9) !important;
          }
          
          .bg-pastel {
            background-color: rgba(31, 25, 23, 0.9) !important;
          }
          
          .text-gray-900 {
            color: #F5F5F4 !important;
          }
          
          .text-gray-600 {
            color: #D6D3D1 !important;
          }
          
          .text-gray-500 {
            color: #A8A29E !important;
          }
          
          footer {
            background-color: rgba(12, 10, 9, 0.95) !important;
            border-top-color: ${theme.primary}33 !important;
          }
        ` : ''}
      `
      
      style.textContent = css
      document.head.appendChild(style)
    }
  }, [currentTheme, isDarkMode])

  return (
    <div style={{ display: 'none' }}>
      {/* Hidden - Theme automatically applied */}
    </div>
  )
}