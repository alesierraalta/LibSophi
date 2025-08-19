'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User is not authenticated, redirect to login
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else if (!requireAuth && user) {
        // User is authenticated but trying to access public auth pages
        router.push('/main');
      }
    }
  }, [user, loading, requireAuth, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary via-red-500 to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-gray-600 mt-2">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // If requireAuth is true and user is not authenticated, don't render children
  // (redirect will happen in useEffect)
  if (requireAuth && !user) {
    return null;
  }

  // If requireAuth is false and user is authenticated, don't render children
  // (redirect will happen in useEffect)  
  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}
