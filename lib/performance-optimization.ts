// Performance Optimization Utilities
// Centralized optimization helpers to improve performance across the app

export const performanceConfig = {
  // Database query limits
  DEFAULT_LIMIT: 20,
  MAX_BATCH_SIZE: 5,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // UI timeouts
  DEBOUNCE_DELAY: 300,
  LOADING_TIMEOUT: 10000,
  
  // Features to skip for performance
  SKIP_EXPENSIVE_COUNTS: true,
  SKIP_REAL_TIME: true,
  USE_CACHE_FIRST: true,
}

// Optimized database query wrapper
export function createOptimizedQuery<T>(
  queryFn: () => Promise<{ data: T[] | null; error: any }>,
  fallback: T[] = []
) {
  return async (): Promise<T[]> => {
    try {
      const { data, error } = await queryFn()
      if (error) {
        console.warn('Query error (using fallback):', error)
        return fallback
      }
      return data || fallback
    } catch (error) {
      console.warn('Query exception (using fallback):', error)
      return fallback
    }
  }
}

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>()

export function getCached<T>(key: string, defaultValue: T): T {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < performanceConfig.CACHE_DURATION) {
    return cached.data
  }
  return defaultValue
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = performanceConfig.DEBOUNCE_DELAY
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Simplified error handling
export function handleError(error: any, fallback?: any): any {
  console.warn('Handled error:', error)
  return fallback
}

// Fast loading states
export const loadingStates = {
  profile: {
    name: 'Cargando...',
    username: 'usuario',
    bio: 'Cargando perfil...',
    avatar: '/api/placeholder/112/112',
    banner: '',
  },
  works: [] as any[],
  stats: { works: 0, followers: 0, following: 0 },
}

// Performance monitoring
export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  return fn().finally(() => {
    const duration = performance.now() - start
    console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`)
  })
}

