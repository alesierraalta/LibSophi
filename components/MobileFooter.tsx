'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Bell, Library, Bookmark } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: '/main', label: 'Feed', Icon: BookOpen },
  { href: '/main?tab=my-stories', label: 'Mis Libros', Icon: Library },
  { href: '/favorites', label: 'Favoritos', Icon: Bookmark },
  { href: '/notifications', label: 'Alertas', Icon: Bell },
]

export default function MobileFooter() {
  const pathname = usePathname()
  if (pathname === '/writer' || pathname.startsWith('/writer/')) return null

  return (
    <footer
      role="navigation"
      aria-label="Navegación principal móvil"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 pb-[env(safe-area-inset-bottom)]"
    >
      <nav className="max-w-5xl mx-auto">
        <ul className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, Icon }) => {
            const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'https://palabreo.com')
            const isActive = pathname === url.pathname && (url.search ? (typeof window !== 'undefined' ? window.location.search === url.search : false) : true)
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-col items-center gap-1 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md transition-colors ${
                    isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span className="text-[11px] leading-none">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </footer>
  )
}


