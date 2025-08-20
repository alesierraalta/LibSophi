import { getSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Comprehensive database cleanup utilities for E2E testing
 * CRITICAL: These functions ensure no test data pollutes the database
 */

export class DatabaseCleanup {
  private supabase = getSupabaseServerClient()
  private testDataPatterns = [
    'E2E Test%',
    '%e2e-test%',
    '%@palabreo-e2e.test',
    'Test User%',
    '%UniqueKeyword123%',
    '%E2E Performance%',
    '%Batch Work%'
  ]

  /**
   * Master cleanup function - runs all cleanup procedures
   */
  async cleanupAll(): Promise<void> {
    console.log('🧹 Starting comprehensive database cleanup...')
    
    try {
      await this.cleanupComments()
      await this.cleanupLikes()
      await this.cleanupFollows()
      await this.cleanupWorks()
      await this.cleanupUserSessions()
      await this.cleanupUsers()
      await this.resetSequences()
      await this.validateCleanup()
      
      console.log('✅ Comprehensive database cleanup completed successfully')
    } catch (error) {
      console.error('❌ Database cleanup failed:', error)
      throw error
    }
  }

  /**
   * Clean up comments (highest priority due to foreign key constraints)
   */
  async cleanupComments(): Promise<void> {
    console.log('🗑️ Cleaning up test comments...')
    
    try {
      for (const pattern of this.testDataPatterns) {
        const { error } = await this.supabase
          .from('comments')
          .delete()
          .ilike('content', pattern)
        
        if (error && !this.isTableNotExistError(error)) {
          console.warn(`Warning cleaning comments with pattern ${pattern}:`, error)
        }
      }
      
      // Clean comments by test user IDs
      const { error: userCommentsError } = await this.supabase
        .from('comments')
        .delete()
        .in('user_id', ['test-user-1', 'test-user-2'])
      
      if (userCommentsError && !this.isTableNotExistError(userCommentsError)) {
        console.warn('Warning cleaning user comments:', userCommentsError)
      }
      
      console.log('✅ Comments cleanup completed')
    } catch (error) {
      console.error('❌ Comments cleanup failed:', error)
      throw error
    }
  }

  /**
   * Clean up likes/reactions
   */
  async cleanupLikes(): Promise<void> {
    console.log('👍 Cleaning up test likes...')
    
    try {
      // Clean likes by test users
      const { error } = await this.supabase
        .from('likes')
        .delete()
        .in('user_id', ['test-user-1', 'test-user-2'])
      
      if (error && !this.isTableNotExistError(error)) {
        console.warn('Warning cleaning likes:', error)
      }
      
      console.log('✅ Likes cleanup completed')
    } catch (error) {
      console.error('❌ Likes cleanup failed:', error)
      // Don't throw - likes table might not exist
    }
  }

  /**
   * Clean up follow relationships
   */
  async cleanupFollows(): Promise<void> {
    console.log('👥 Cleaning up test follow relationships...')
    
    try {
      // Clean follows where test users are involved
      const { error: followerError } = await this.supabase
        .from('follows')
        .delete()
        .in('follower_id', ['test-user-1', 'test-user-2'])
      
      if (followerError && !this.isTableNotExistError(followerError)) {
        console.warn('Warning cleaning followers:', followerError)
      }
      
      const { error: followingError } = await this.supabase
        .from('follows')
        .delete()
        .in('following_id', ['test-user-1', 'test-user-2'])
      
      if (followingError && !this.isTableNotExistError(followingError)) {
        console.warn('Warning cleaning following:', followingError)
      }
      
      console.log('✅ Follow relationships cleanup completed')
    } catch (error) {
      console.error('❌ Follow relationships cleanup failed:', error)
      // Don't throw - follows table might not exist
    }
  }

  /**
   * Clean up works (second highest priority)
   */
  async cleanupWorks(): Promise<void> {
    console.log('📝 Cleaning up test works...')
    
    try {
      for (const pattern of this.testDataPatterns) {
        // Clean by title pattern
        const { error: titleError } = await this.supabase
          .from('works')
          .delete()
          .ilike('title', pattern)
        
        if (titleError && !this.isTableNotExistError(titleError)) {
          console.warn(`Warning cleaning works by title ${pattern}:`, titleError)
        }
        
        // Clean by content pattern
        const { error: contentError } = await this.supabase
          .from('works')
          .delete()
          .ilike('content', pattern)
        
        if (contentError && !this.isTableNotExistError(contentError)) {
          console.warn(`Warning cleaning works by content ${pattern}:`, contentError)
        }
      }
      
      // Clean works by test author IDs
      const { error: authorError } = await this.supabase
        .from('works')
        .delete()
        .in('author_id', ['test-user-1', 'test-user-2'])
      
      if (authorError && !this.isTableNotExistError(authorError)) {
        console.warn('Warning cleaning works by author:', authorError)
      }
      
      console.log('✅ Works cleanup completed')
    } catch (error) {
      console.error('❌ Works cleanup failed:', error)
      throw error
    }
  }

  /**
   * Clean up user sessions and auth data
   */
  async cleanupUserSessions(): Promise<void> {
    console.log('🔐 Cleaning up test user sessions...')
    
    try {
      // Clean sessions by test email patterns
      for (const pattern of this.testDataPatterns) {
        const { error } = await this.supabase
          .from('sessions')
          .delete()
          .ilike('user_email', pattern)
        
        if (error && !this.isTableNotExistError(error)) {
          console.warn(`Warning cleaning sessions ${pattern}:`, error)
        }
      }
      
      // Clean auth tokens if accessible
      const { error: tokensError } = await this.supabase
        .from('auth_tokens')
        .delete()
        .in('user_id', ['test-user-1', 'test-user-2'])
      
      if (tokensError && !this.isTableNotExistError(tokensError)) {
        console.warn('Warning cleaning auth tokens:', tokensError)
      }
      
      console.log('✅ User sessions cleanup completed')
    } catch (error) {
      console.error('❌ User sessions cleanup failed:', error)
      // Don't throw - session tables might not exist or be inaccessible
    }
  }

  /**
   * Clean up users (lowest priority - run last)
   */
  async cleanupUsers(): Promise<void> {
    console.log('👤 Cleaning up test users...')
    
    try {
      for (const pattern of this.testDataPatterns) {
        // Clean by email pattern
        const { error: emailError } = await this.supabase
          .from('users')
          .delete()
          .ilike('email', pattern)
        
        if (emailError && !this.isTableNotExistError(emailError)) {
          console.warn(`Warning cleaning users by email ${pattern}:`, emailError)
        }
        
        // Clean by name pattern
        const { error: nameError } = await this.supabase
          .from('users')
          .delete()
          .ilike('name', pattern)
        
        if (nameError && !this.isTableNotExistError(nameError)) {
          console.warn(`Warning cleaning users by name ${pattern}:`, nameError)
        }
      }
      
      // Clean specific test user IDs
      const { error: idError } = await this.supabase
        .from('users')
        .delete()
        .in('id', ['test-user-1', 'test-user-2'])
      
      if (idError && !this.isTableNotExistError(idError)) {
        console.warn('Warning cleaning users by ID:', idError)
      }
      
      console.log('✅ Users cleanup completed')
    } catch (error) {
      console.error('❌ Users cleanup failed:', error)
      throw error
    }
  }

  /**
   * Reset auto-increment sequences to prevent ID conflicts
   */
  async resetSequences(): Promise<void> {
    console.log('🔄 Resetting database sequences...')
    
    try {
      const tables = ['users', 'works', 'comments', 'likes', 'follows']
      
      for (const table of tables) {
        try {
          // PostgreSQL sequence reset
          const { error } = await this.supabase
            .rpc('reset_sequence', { table_name: table })
          
          if (error && !error.message.includes('function "reset_sequence" does not exist')) {
            console.warn(`Warning resetting sequence for ${table}:`, error)
          }
        } catch (error) {
          console.warn(`Sequence reset not available for ${table}`)
        }
      }
      
      console.log('✅ Sequences reset completed')
    } catch (error) {
      console.error('❌ Sequences reset failed:', error)
      // Don't throw - sequence reset is optional
    }
  }

  /**
   * Validate that cleanup was successful
   */
  async validateCleanup(): Promise<void> {
    console.log('🔍 Validating cleanup success...')
    
    try {
      // Check for remaining test data
      const validationResults = {
        users: 0,
        works: 0,
        comments: 0
      }
      
      // Count remaining test users
      for (const pattern of this.testDataPatterns) {
        const { count: userCount } = await this.supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .ilike('email', pattern)
        
        if (userCount) validationResults.users += userCount
        
        const { count: workCount } = await this.supabase
          .from('works')
          .select('*', { count: 'exact', head: true })
          .ilike('title', pattern)
        
        if (workCount) validationResults.works += workCount
        
        const { count: commentCount } = await this.supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .ilike('content', pattern)
        
        if (commentCount) validationResults.comments += commentCount
      }
      
      // Report results
      if (validationResults.users > 0) {
        console.warn(`⚠️ ${validationResults.users} test users still remain`)
      }
      
      if (validationResults.works > 0) {
        console.warn(`⚠️ ${validationResults.works} test works still remain`)
      }
      
      if (validationResults.comments > 0) {
        console.warn(`⚠️ ${validationResults.comments} test comments still remain`)
      }
      
      const totalRemaining = validationResults.users + validationResults.works + validationResults.comments
      
      if (totalRemaining === 0) {
        console.log('✅ Cleanup validation passed - no test data remains')
      } else {
        console.log(`⚠️ Cleanup validation: ${totalRemaining} test items still remain`)
      }
      
    } catch (error) {
      console.error('❌ Cleanup validation failed:', error)
      // Don't throw - validation is informational
    }
  }

  /**
   * Emergency cleanup - force delete all test data patterns
   */
  async emergencyCleanup(): Promise<void> {
    console.log('🚨 Starting emergency cleanup...')
    
    try {
      // More aggressive cleanup patterns
      const emergencyPatterns = [
        '%test%',
        '%Test%',
        '%e2e%',
        '%E2E%',
        '%playwright%',
        '%automation%'
      ]
      
      for (const pattern of emergencyPatterns) {
        // Delete from all tables with these patterns
        await this.supabase.from('comments').delete().ilike('content', pattern)
        await this.supabase.from('works').delete().ilike('title', pattern)
        await this.supabase.from('works').delete().ilike('content', pattern)
        await this.supabase.from('users').delete().ilike('email', pattern)
        await this.supabase.from('users').delete().ilike('name', pattern)
      }
      
      console.log('✅ Emergency cleanup completed')
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error)
      throw error
    }
  }

  /**
   * Create test data for E2E tests
   */
  async createTestData(): Promise<void> {
    console.log('📝 Creating test data for E2E tests...')
    
    try {
      // Create test users (if they don't exist)
      const testUsers = [
        {
          id: 'test-user-1',
          email: 'testuser1@palabreo-e2e.test',
          name: 'Test User One',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-user-2',
          email: 'testuser2@palabreo-e2e.test',
          name: 'Test User Two',
          created_at: new Date().toISOString()
        }
      ]
      
      for (const user of testUsers) {
        const { error } = await this.supabase
          .from('users')
          .upsert(user, { onConflict: 'email' })
        
        if (error && !error.message.includes('duplicate key')) {
          console.warn(`Warning creating test user ${user.email}:`, error)
        }
      }
      
      // Create test works
      const testWorks = [
        {
          id: 'test-work-1',
          title: 'E2E Test Story One',
          content: 'This is a test story for E2E testing purposes.',
          author_id: 'test-user-1',
          published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'test-work-2',
          title: 'E2E Test Story Two',
          content: 'This is another test story for E2E testing.',
          author_id: 'test-user-2',
          published: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      for (const work of testWorks) {
        const { error } = await this.supabase
          .from('works')
          .upsert(work, { onConflict: 'id' })
        
        if (error && !error.message.includes('duplicate key')) {
          console.warn(`Warning creating test work ${work.title}:`, error)
        }
      }
      
      console.log('✅ Test data creation completed')
    } catch (error) {
      console.error('❌ Test data creation failed:', error)
      throw error
    }
  }

  /**
   * Check if error is due to table not existing
   */
  private isTableNotExistError(error: any): boolean {
    return error.message.includes('relation') && error.message.includes('does not exist')
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats(): Promise<any> {
    const stats = {
      testUsers: 0,
      testWorks: 0,
      testComments: 0,
      timestamp: new Date().toISOString()
    }
    
    try {
      for (const pattern of this.testDataPatterns) {
        const { count: userCount } = await this.supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .ilike('email', pattern)
        
        if (userCount) stats.testUsers += userCount
        
        const { count: workCount } = await this.supabase
          .from('works')
          .select('*', { count: 'exact', head: true })
          .ilike('title', pattern)
        
        if (workCount) stats.testWorks += workCount
        
        const { count: commentCount } = await this.supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .ilike('content', pattern)
        
        if (commentCount) stats.testComments += commentCount
      }
    } catch (error) {
      console.warn('Warning getting cleanup stats:', error)
    }
    
    return stats
  }
}

// Export singleton instance
export const databaseCleanup = new DatabaseCleanup()
