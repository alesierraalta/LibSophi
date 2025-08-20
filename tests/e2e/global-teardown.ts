import { test as teardown } from '@playwright/test'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

teardown('cleanup test data', async () => {
  console.log('🧹 Starting test database cleanup...')
  
  try {
    const supabase = getSupabaseBrowserClient()
    
    // Clean up test data based on specific patterns
    // This is a comprehensive cleanup that removes test artifacts
    
    // 1. Clean up test works (those with test-specific titles or content)
    const { data: testWorks, error: worksError } = await supabase
      .from('works')
      .delete()
      .or('title.ilike.%test%,title.ilike.%playwright%,title.ilike.%automation%,content.ilike.%test%')
    
    if (worksError && worksError.code !== 'PGRST116') { // PGRST116 = no rows deleted
      console.warn('⚠️ Warning cleaning test works:', worksError.message)
    } else {
      console.log('✅ Cleaned up test works')
    }
    
    // 2. Clean up test profiles (those with test usernames or emails)
    const { data: testProfiles, error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .or('username.ilike.%test%,username.ilike.%playwright%,email.ilike.%test%')
    
    if (profilesError && profilesError.code !== 'PGRST116') {
      console.warn('⚠️ Warning cleaning test profiles:', profilesError.message)
    } else {
      console.log('✅ Cleaned up test profiles')
    }
    
    // 3. Clean up test bookmarks (orphaned bookmarks from deleted users/works)
    const { data: testBookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .delete()
      .is('user_id', null)
      .or('work_id.is.null')
    
    if (bookmarksError && bookmarksError.code !== 'PGRST116') {
      console.warn('⚠️ Warning cleaning test bookmarks:', bookmarksError.message)
    } else {
      console.log('✅ Cleaned up orphaned bookmarks')
    }
    
    // 4. Clean up test follows (orphaned follows from deleted users)
    const { data: testFollows, error: followsError } = await supabase
      .from('follows')
      .delete()
      .or('follower_id.is.null,followee_id.is.null')
    
    if (followsError && followsError.code !== 'PGRST116') {
      console.warn('⚠️ Warning cleaning test follows:', followsError.message)
    } else {
      console.log('✅ Cleaned up orphaned follows')
    }
    
    // 5. Reset any auto-increment sequences if needed
    // Note: Supabase uses UUIDs by default, so this is typically not needed
    // But we can clean up any test data that might affect future tests
    
    console.log('✅ Test database cleanup completed successfully')
    
  } catch (error) {
    console.error('❌ Error during test database cleanup:', error)
    // Don't throw here - we don't want cleanup failures to fail the entire test suite
  }
})

// Additional cleanup for specific test scenarios
teardown('reset test environment state', async () => {
  console.log('🔄 Resetting test environment state...')
  
  try {
    // Clear any local storage or session data that might persist between test runs
    // This is handled automatically by Playwright's browser context isolation
    
    // Log final cleanup status
    console.log('✅ Test environment state reset completed')
    
  } catch (error) {
    console.error('❌ Error resetting test environment:', error)
  }
})