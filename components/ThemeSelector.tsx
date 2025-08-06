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
  const [currentTheme, setCurrentTheme] = useState<string>('variant-2')
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
    <div className="fixed top-20 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform touch-manipulation"
        aria-label="Selector de temas rojos"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5z" />
        </svg>
      </button>

      {/* Theme Panel - Simplified */}
      {isOpen && (
        <div className="absolute top-14 right-0 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64">
          <h3 className="font-bold text-sm mb-3 text-gray-900">🔴 Tonos de Rojo</h3>
          
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
            <span className="text-xs font-medium text-gray-700">Oscuro</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                isDarkMode ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Theme Options - Compact */}
          <div className="space-y-2">
            {redThemes.map((theme) => (
              <div
                key={theme.id}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  currentTheme === theme.id
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentTheme(theme.id)}
              >
                <div className="flex items-center space-x-2">
                  {/* Color Preview */}
                  <div className="flex space-x-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.secondary }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-xs text-gray-900">{theme.name}</h4>
                  </div>
                  
                  {currentTheme === theme.id && (
                    <div className="text-red-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}