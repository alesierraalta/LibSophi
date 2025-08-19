'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User, Settings } from 'lucide-react'
import { useState } from 'react'

export default function AuthHeader() {
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  if (!user) return null

  return (
    <header className="bg-white backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/main" className="flex items-center space-x-3">
            <div className="h-10 w-10 overflow-hidden rounded-md flex items-center justify-center bg-transparent">
              <div className="relative h-[200%] w-[200%] -m-[50%]">
                <Image
                  src="/1.png"
                  alt="Palabreo logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Palabreo
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/main" className="text-gray-600 hover:text-primary transition-colors">
              Feed
            </Link>
            <Link href="/writer" className="text-gray-600 hover:text-primary transition-colors">
              Escribir
            </Link>
            <Link href="/mis-obras" className="text-gray-600 hover:text-primary transition-colors">
              Mis Obras
            </Link>
            <Link href="/explore" className="text-gray-600 hover:text-primary transition-colors">
              Explorar
            </Link>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden md:block text-gray-700 text-sm">
                {user.email}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  Mi Perfil
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Configuración
                </Link>
                <hr className="my-2" />
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    signOut()
                  }}
                  className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}
