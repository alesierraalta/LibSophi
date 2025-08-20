import { getSupabaseServerClient } from '@/lib/supabase/server'

async function globalTeardown() {
  console.log('🧹 Starting E2E Test Global Teardown...')

  try {
    // Clean up all test data
    await cleanupAllTestData()

    // Reset database state
    await resetDatabaseState()

    console.log('✅ E2E Test Global Teardown completed successfully')
  } catch (error) {
    console.error('❌ E2E Test Global Teardown failed:', error)
    // Don't throw here to avoid masking test failures
  }
}

async function cleanupAllTestData() {
  console.log('🗑️ Cleaning up all test data...')
  
  const supabase = getSupabaseServerClient()
  
  try {
    // Delete test data in correct order (respecting foreign key constraints)
    
    // 1. Comments (if they reference works or users)
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .or('content.ilike.%e2e-test%,content.ilike.%E2E Test%')
    
    if (commentsError && !commentsError.message.includes('relation "comments" does not exist')) {
      console.warn('Comments cleanup warning:', commentsError)
    }

    // 2. Works (reference users)
    const { error: worksError } = await supabase
      .from('works')
      .delete()
      .or('title.ilike.%E2E Test%,content.ilike.%e2e-test%')
    
    if (worksError && !worksError.message.includes('relation "works" does not exist')) {
      console.warn('Works cleanup warning:', worksError)
    }

    // 3. User sessions and auth data
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .like('user_email', '%@palabreo-e2e.test')
    
    if (sessionsError && !sessionsError.message.includes('relation "sessions" does not exist')) {
      console.warn('Sessions cleanup warning:', sessionsError)
    }

    // 4. Users (base table)
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .like('email', '%@palabreo-e2e.test')
    
    if (usersError && !usersError.message.includes('relation "users" does not exist')) {
      console.warn('Users cleanup warning:', usersError)
    }

    console.log('✅ Test data cleanup completed')
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error)
    // Continue with other cleanup tasks
  }
}

async function resetDatabaseState() {
  console.log('🔄 Resetting database state...')
  
  const supabase = getSupabaseServerClient()
  
  try {
    // Reset auto-increment sequences if needed
    // This is database-specific (PostgreSQL example)
    
    // Note: In production, you might want to reset sequences
    // For now, we'll just verify the cleanup worked
    
    const { count: worksCount } = await supabase
      .from('works')
      .select('*', { count: 'exact', head: true })
      .like('title', '%E2E Test%')
    
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .like('email', '%@palabreo-e2e.test')
    
    if (worksCount && worksCount > 0) {
      console.warn(`⚠️ ${worksCount} test works still remain in database`)
    }
    
    if (usersCount && usersCount > 0) {
      console.warn(`⚠️ ${usersCount} test users still remain in database`)
    }
    
    console.log('✅ Database state reset completed')
  } catch (error) {
    console.error('❌ Database state reset failed:', error)
  }
}

export default globalTeardown
