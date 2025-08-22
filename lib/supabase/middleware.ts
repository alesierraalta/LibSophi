import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              request.cookies.set({ name, value, ...options as CookieOptions })
            } catch {}
          })
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options as CookieOptions })
          })
        },
      },
    }
  )

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Define protected routes that require authentication
  const protectedRoutes = [
    // '/writer', // Temporarily removed for testing - allows testing writer functionality
    // '/profile', // Temporarily removed - allow limited public access like Twitter
    '/favorites',
    '/notifications',
    '/work',
    '/demo',
    '/gridstack-demo'
  ]

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/main',
    '/explore',
    '/writer', // Added - allow access without authentication for testing
    '/profile', // Added - allow limited public access like Twitter (read-only for non-auth users)
    '/mis-obras', // Added - allow access without authentication, will show demo data
    '/login',
    '/register',
    '/auth',
    '/landing',
    '/terms',
    '/privacy'
  ]

  const pathname = request.nextUrl.pathname

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to main
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/main', request.url))
  }

  // If user is authenticated and on landing page, redirect to main
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/main', request.url))
  }

  return response
}





