'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import Image from 'next/image'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { createFollowNotification } from '@/lib/notifications'

export type ProfileHoverAuthor = {
  name: string
  username: string
  avatar: string
}

type ProfileHoverCardProps = {
  author: ProfileHoverAuthor
  position?: 'right' | 'left' | 'bottom'
  className?: string
}

export default function ProfileHoverCard({ author, position = 'right', className = '' }: ProfileHoverCardProps) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('palabreo-following')
      const ids: string[] = raw ? JSON.parse(raw) : []
      setIsFollowing(ids.includes(author.username))
    } catch {}
  }, [author.username])

  const toggleFollow = async () => {
    setIsFollowing(prev => {
      const next = !prev
      try {
        const raw = localStorage.getItem('palabreo-following')
        let ids: string[] = raw ? JSON.parse(raw) : []
        if (next) {
          if (!ids.includes(author.username)) ids.push(author.username)
        } else {
          ids = ids.filter(id => id !== author.username)
        }
        localStorage.setItem('palabreo-following', JSON.stringify(ids))
      } catch {}
      return next
    })

    // Handle Supabase follow/unfollow and notifications
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: userData } = await supabase.auth.getUser()
      
      if (userData?.user && !isFollowing) {
        // Get the followed user's ID by username
        const { data: followedUser } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('username', author.username.replace('@', ''))
          .single()
        
        if (followedUser) {
          // Insert follow record
          await supabase
            .from('follows')
            .insert({ follower_id: userData.user.id, followed_id: followedUser.id })
          
          // Create notification
          const currentUserName = userData.user.user_metadata?.name || userData.user.email || 'Alguien'
          createFollowNotification(followedUser.id, userData.user.id, currentUserName)
        }
      } else if (userData?.user && isFollowing) {
        // Get the followed user's ID and unfollow
        const { data: followedUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', author.username.replace('@', ''))
          .single()
        
        if (followedUser) {
          await supabase
            .from('follows')
            .delete()
            .eq('follower_id', userData.user.id)
            .eq('followed_id', followedUser.id)
        }
      }
    } catch (error) {
      console.error('Error handling follow:', error)
    }
  }

  const positionClasses = position === 'left'
    ? 'right-14 top-0'
    : position === 'bottom'
      ? 'left-0 top-12'
      : 'left-14 top-0'

  return (
    <div
      className={`absolute ${positionClasses} z-50 w-72 transition-all duration-150 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto ${className}`}
      role="dialog"
      aria-label={`Previsualización de ${author.name}`}
    >
      <Card className="bg-[#ffffff] shadow-xl border border-gray-200 rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-red-100 flex-shrink-0">
              <Image src={author.avatar || '/api/placeholder/48/48'} alt={author.name} width={48} height={48} className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 truncate">{author.name}</div>
              <div className="text-xs text-gray-500 truncate">{author.username}</div>
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">Escritor(a) en Palabreo. Perfil en construcción.</p>
              <div className="flex items-center gap-3 text-[11px] text-gray-600 mt-3">
                <span><strong className="text-gray-900">18</strong> obras</span>
                <span><strong className="text-gray-900">2.4k</strong> seguidores</span>
                <span><strong className="text-gray-900">312</strong> siguiendo</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <Button onClick={toggleFollow} size="sm" variant={isFollowing ? 'default' : 'outline'} className={`text-xs ${isFollowing ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-300 text-red-600 hover:bg-red-100 hover:text-red-900 hover:border-red-400'}`}>
              <UserPlus className="h-4 w-4 mr-1" /> {isFollowing ? 'Siguiendo' : 'Seguir'}
            </Button>
            <Button size="sm" variant="ghost" className="text-xs text-blue-600 hover:text-blue-700">
              Ver perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


