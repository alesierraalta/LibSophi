import { getSupabaseBrowserClient } from './supabase/browser'

export type NotificationType = 'comment' | 'follow' | 'like' | 'mention'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  body: string
  workId?: string
  fromUserId?: string
}

/**
 * Creates a notification in the database
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  workId,
  fromUserId
}: CreateNotificationParams): Promise<boolean> {
  try {
    const supabase = getSupabaseBrowserClient()
    
    // Don't send notifications to yourself
    if (fromUserId === userId) {
      return true
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        work_id: workId,
        from_user_id: fromUserId,
        read: false
      })

    return !error
  } catch (error) {
    console.error('Error creating notification:', error)
    return false
  }
}

/**
 * Creates a notification when someone likes a work
 */
export async function createLikeNotification(workId: string, workTitle: string, authorId: string, fromUserId: string, fromUserName: string) {
  return createNotification({
    userId: authorId,
    type: 'like',
    title: 'Nuevo like',
    body: `${fromUserName} le gustó tu obra "${workTitle}"`,
    workId,
    fromUserId
  })
}

/**
 * Creates a notification when someone comments on a work
 */
export async function createCommentNotification(workId: string, workTitle: string, authorId: string, fromUserId: string, fromUserName: string) {
  return createNotification({
    userId: authorId,
    type: 'comment',
    title: 'Nuevo comentario',
    body: `${fromUserName} comentó tu obra "${workTitle}"`,
    workId,
    fromUserId
  })
}

/**
 * Creates a notification when someone follows you
 */
export async function createFollowNotification(followedUserId: string, fromUserId: string, fromUserName: string) {
  return createNotification({
    userId: followedUserId,
    type: 'follow',
    title: 'Nuevo seguidor',
    body: `${fromUserName} empezó a seguirte`,
    fromUserId
  })
}

/**
 * Creates a notification when someone mentions you in a work or comment
 */
export async function createMentionNotification(mentionedUserId: string, workId: string, workTitle: string, fromUserId: string, fromUserName: string) {
  return createNotification({
    userId: mentionedUserId,
    type: 'mention',
    title: 'Mención',
    body: `${fromUserName} te mencionó en "${workTitle}"`,
    workId,
    fromUserId
  })
}

/**
 * Gets the count of unread notifications for a user
 */
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    return count || 0
  } catch (error) {
    console.error('Error getting unread notifications count:', error)
    return 0
  }
}





