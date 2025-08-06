'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '../../components/Button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulación de login
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Login attempt:', { email, password })
    
    // Redirect to main page
    router.push('/main')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary via-red-500 to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de vuelta!</h1>
          <p className="text-gray-600">Inicia sesión en tu cuenta de Palabreo</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors placeholder-gray-400"
                  placeholder="tu@email.com"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-400">📧</span>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors placeholder-gray-400"
                  placeholder="Tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-600">Recordarme</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              disabled={isLoading}
              className="w-full py-3 text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                '🚀 Iniciar sesión'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 bg-white">o continúa con</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="mr-3">🔍</span>
              <span className="font-medium text-gray-700">Continuar con Google</span>
            </button>
            
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="mr-3">🐙</span>
              <span className="font-medium text-gray-700">Continuar con GitHub</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Al continuar, aceptas nuestros{' '}
            <Link href="/terms" className="text-primary hover:text-primary/80">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-primary hover:text-primary/80">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}