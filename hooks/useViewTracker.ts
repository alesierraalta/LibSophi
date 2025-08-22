'use client'

import { useEffect, useRef } from 'react'
import { trackView } from '@/lib/supabase/views-tracker'

// Custom hook to track views automatically
export function useViewTracker(workId: string, userId?: string, enabled: boolean = true) {
  const hasTracked = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!enabled || !workId || hasTracked.current) {
      return
    }

    // Track view after a short delay to ensure user actually viewed the content
    timeoutRef.current = setTimeout(async () => {
      if (!hasTracked.current) {
        const success = await trackView(workId, userId)
        if (success) {
          hasTracked.current = true
          console.log(`View tracked for work: ${workId}`)
        }
      }
    }, 2000) // 2 second delay to ensure genuine view

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [workId, userId, enabled])

  // Reset tracking when workId changes
  useEffect(() => {
    hasTracked.current = false
  }, [workId])
}

// Hook for intersection observer based view tracking
export function useIntersectionViewTracker(
  workId: string, 
  userId?: string, 
  threshold: number = 0.5,
  minViewTime: number = 3000 // 3 seconds
) {
  const hasTracked = useRef(false)
  const viewStartTime = useRef<number>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  const trackViewRef = useRef<HTMLElement>()

  useEffect(() => {
    const element = trackViewRef.current
    if (!element || !workId || hasTracked.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start tracking view time
            viewStartTime.current = Date.now()
            
            // Set timeout to track view after minimum time
            timeoutRef.current = setTimeout(async () => {
              if (!hasTracked.current && viewStartTime.current) {
                const success = await trackView(workId, userId)
                if (success) {
                  hasTracked.current = true
                  console.log(`Intersection view tracked for work: ${workId}`)
                }
              }
            }, minViewTime)
          } else {
            // Stop tracking if element is no longer visible
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
            }
            viewStartTime.current = undefined
          }
        })
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [workId, userId, threshold, minViewTime])

  // Reset tracking when workId changes
  useEffect(() => {
    hasTracked.current = false
  }, [workId])

  return trackViewRef
}

