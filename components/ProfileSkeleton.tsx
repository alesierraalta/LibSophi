import React from 'react'

export default function ProfileSkeleton() {
  return (
    <section className="bg-white animate-pulse">
      <div className="relative overflow-hidden">
        {/* Banner skeleton */}
        <div className="relative h-32 sm:h-48 md:h-56 border-b border-gray-100">
          <div className="absolute inset-0 bg-gray-200" />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-5">
          <div className="flex items-start gap-4">
            {/* Avatar skeleton */}
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gray-200 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="min-w-0 flex-1">
                  {/* Name skeleton */}
                  <div className="h-6 bg-gray-200 rounded-md w-48 mb-2" />
                  {/* Username skeleton */}
                  <div className="h-4 bg-gray-200 rounded-md w-24" />
                </div>
                <div className="flex items-center gap-2">
                  {/* Button skeleton */}
                  <div className="h-8 w-20 bg-gray-200 rounded-md" />
                </div>
              </div>
              
              {/* Bio skeleton */}
              <div className="space-y-2 mt-3">
                <div className="h-4 bg-gray-200 rounded-md w-full" />
                <div className="h-4 bg-gray-200 rounded-md w-3/4" />
              </div>
              
              {/* Stats skeleton */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="h-7 w-16 bg-gray-200 rounded-full" />
                <div className="h-7 w-20 bg-gray-200 rounded-full" />
                <div className="h-7 w-18 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

