'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, PenTool, Bookmark, User, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type NavItem = {
  href: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: '/main', label: 'Inicio', Icon: Home },
  { href: '/favorites', label: 'Guardados', Icon: Bookmark },
  { href: '/notifications', label: 'Alertas', Icon: Bell },
  { href: '/profile', label: 'Perfil', Icon: User },
]

export default function MobileFooter() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Don't show footer on auth pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/') return null

  // Don't show footer if user is not authenticated
  if (!user) return null

  return (
    <footer
      role="navigation"
      aria-label="Navegación principal móvil"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 pb-[env(safe-area-inset-bottom)]"
    >
      <nav className="max-w-5xl mx-auto">
        <ul className="flex items-center justify-between px-4 py-2">
          {/* Primeros 2 elementos */}
          {navItems.slice(0, 2).map(({ href, label, Icon }) => {
            const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'https://palabreo.com')
            const isActive = pathname === url.pathname && (url.search ? (typeof window !== 'undefined' ? window.location.search === url.search : false) : true)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-col items-center gap-1 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md transition-colors ${
                    isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span className="text-[10px] leading-none text-center">{label}</span>
                </Link>
              </li>
            )
          })}
          
          {/* Botón de escribir centrado y prominente */}
          <li>
            <Link
              href="/writer"
              aria-label="Escribir"
              aria-current={pathname === '/writer' ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-xl transition-all ${
                pathname === '/writer' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg'
              }`}
            >
              <PenTool className="h-6 w-6 stroke-[2.5]" />
              <span className="text-[9px] leading-none font-medium">Escribir</span>
            </Link>
          </li>
          
          {/* Últimos 2 elementos */}
          {navItems.slice(2).map(({ href, label, Icon }) => {
            const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'https://palabreo.com')
            const isActive = pathname === url.pathname && (url.search ? (typeof window !== 'undefined' ? window.location.search === url.search : false) : true)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-col items-center gap-1 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md transition-colors ${
                    isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span className="text-[10px] leading-none text-center">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </footer>
  )
}


