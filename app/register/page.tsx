'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
          <div className="w-20 h-20 overflow-hidden rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl bg-white border border-gray-100">
            <div className="relative h-[150%] w-[150%] -m-[25%]">
              <Image
                src="/1.png"
                alt="Palabreo logo"
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Únete a Palabreo</h1>
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
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
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
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
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
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
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
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
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
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                  Crear mi cuenta
                </div>
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
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-gray-700 [font-family:var(--font-rubik)]">Continuar con Google</span>
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
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Escribe sin límites</h3>
                <p className="text-sm text-gray-600">Comparte tus historias con el mundo</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
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