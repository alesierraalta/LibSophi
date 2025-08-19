'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '../../components/Button'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [usernameError, setUsernameError] = useState('')

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle')
      setUsernameError('')
      return
    }

    // Format username
    let formattedUsername = username.trim().toLowerCase()
    if (!formattedUsername.startsWith('@')) {
      formattedUsername = '@' + formattedUsername
    }

    // Validate format
    const usernameRegex = /^@[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(formattedUsername)) {
      setUsernameStatus('invalid')
      setUsernameError('El username debe tener entre 3-20 caracteres y solo letras, números y _')
      return
    }

    setUsernameStatus('checking')
    setUsernameError('')

    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.rpc('check_username_availability', {
        username_input: formattedUsername
      })

      if (error) {
        console.error('Error checking username:', error)
        setUsernameStatus('idle')
        return
      }

      if (data === true) {
        setUsernameStatus('available')
        setUsernameError('')
      } else {
        setUsernameStatus('taken')
        setUsernameError('Este username ya está en uso')
      }
    } catch (error) {
      console.error('Error checking username:', error)
      setUsernameStatus('idle')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Check username availability in real-time
    if (field === 'username') {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value)
      }, 500) // Debounce 500ms

      return () => clearTimeout(timeoutId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (usernameStatus !== 'available') {
      alert('Por favor, elige un username válido y disponible')
      return
    }

    setIsLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      
      // Format username
      let formattedUsername = formData.username.trim().toLowerCase()
      if (!formattedUsername.startsWith('@')) {
        formattedUsername = '@' + formattedUsername
      }

      const { data, error } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            username: formattedUsername
          }
        }
      })
      
      if (error) {
        alert(error.message)
        return
      }

      // If user is immediately confirmed (no email confirmation required)
      if (data.user && !data.user.email_confirmed_at) {
        alert('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta y poder iniciar sesión.')
      } else if (data.user) {
        alert('¡Bienvenido a Palabreo! Tu cuenta ha sido creada exitosamente.')
        router.push('/main')
        return
      }
      
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="auth-page min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4 [font-family:var(--font-poppins)]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary via-red-500 to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Únete a Palabreo</h1>
          <p className="text-gray-600 [font-family:var(--font-rubik)]">Crea tu cuenta y comienza a escribir tu historia</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 [font-family:var(--font-rubik)]">
                Nombre completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors placeholder-gray-400"
                  placeholder="Tu nombre completo"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-400">👤</span>
                </div>
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2 [font-family:var(--font-rubik)]">
                Nombre de usuario
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors placeholder-gray-400 ${
                    usernameStatus === 'available' ? 'border-green-300 focus:ring-green-500' :
                    usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-300 focus:ring-red-500' :
                    'border-gray-300 focus:ring-primary'
                  }`}
                  placeholder="tu_username (sin @)"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {usernameStatus === 'checking' && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {usernameStatus === 'available' && (
                    <span className="text-green-500">✓</span>
                  )}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                    <span className="text-red-500">✗</span>
                  )}
                  {usernameStatus === 'idle' && (
                    <span className="text-gray-400">@</span>
                  )}
                </div>
              </div>
              {usernameError && (
                <p className="text-sm text-red-600 mt-1">{usernameError}</p>
              )}
              {usernameStatus === 'available' && (
                <p className="text-sm text-green-600 mt-1">✓ Username disponible</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 [font-family:var(--font-rubik)]">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 [font-family:var(--font-rubik)]">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors placeholder-gray-400"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 [font-family:var(--font-rubik)]">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors placeholder-gray-400"
                  placeholder="Repite tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Terms acceptance */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary shadow-sm focus:ring-primary mt-1"
                required
              />
              <span className="ml-2 text-sm text-gray-600 [font-family:var(--font-rubik)]">
                Acepto los{' '}
                <Link href="/terms" className="text-primary hover:text-primary/80">
                  Términos de Servicio
                </Link>{' '}
                y la{' '}
                <Link href="/privacy" className="text-primary hover:text-primary/80">
                  Política de Privacidad
                </Link>
              </span>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              disabled={isLoading || (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) || usernameStatus !== 'available' || !formData.username}
              className="w-full py-3 text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creando cuenta...
                </div>
              ) : (
                '🚀 Crear mi cuenta'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 bg-white [font-family:var(--font-rubik)]">o regístrate con</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Register */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                const supabase = getSupabaseBrowserClient()
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/auth/callback?next=/main` },
                })
              }}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="mr-3">🔍</span>
              <span className="font-medium text-gray-700 [font-family:var(--font-rubik)]">Continuar con Google</span>
            </button>
            
            <button
              type="button"
              onClick={async () => {
                const supabase = getSupabaseBrowserClient()
                await supabase.auth.signInWithOAuth({
                  provider: 'github',
                  options: { redirectTo: `${window.location.origin}/auth/callback?next=/main` },
                })
              }}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="mr-3">🐙</span>
              <span className="font-medium text-gray-700 [font-family:var(--font-rubik)]">Continuar con GitHub</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 [font-family:var(--font-rubik)]">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✍️</span>
              <div>
                <h3 className="font-semibold text-gray-900">Escribe sin límites</h3>
                <p className="text-sm text-gray-600">Comparte tus historias con el mundo</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌟</span>
              <div>
                <h3 className="font-semibold text-gray-900">Conecta con lectores</h3>
                <p className="text-sm text-gray-600">Encuentra tu audiencia perfecta</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}