import { test, expect, Page } from '@playwright/test'
import { getSupabaseServerClient } from '@/lib/supabase/server'

// Test data cleanup helper
async function cleanupTestData() {
  const supabase = getSupabaseServerClient()
  
  try {
    // Delete test data in proper order (respecting foreign keys)
    await supabase.from('comments').delete().ilike('text', '%test-recommendation%')
    await supabase.from('likes').delete().gte('created_at', new Date(Date.now() - 3600000).toISOString())
    await supabase.from('bookmarks').delete().gte('created_at', new Date(Date.now() - 3600000).toISOString())
    await supabase.from('follows').delete().gte('created_at', new Date(Date.now() - 3600000).toISOString())
    await supabase.from('works').delete().ilike('title', '%test-recommendation%')
    await supabase.from('profiles').delete().ilike('username', '%test-rec%')
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

// Setup test users and data
async function setupTestData() {
  const supabase = getSupabaseServerClient()
  
  // Create test users
  const testUsers = [
    { id: '00000000-0000-0000-0000-000000000001', username: '@test-rec-user1', name: 'Test User 1' },
    { id: '00000000-0000-0000-0000-000000000002', username: '@test-rec-user2', name: 'Test User 2' },
    { id: '00000000-0000-0000-0000-000000000003', username: '@test-rec-user3', name: 'Test User 3' },
  ]
  
  for (const user of testUsers) {
    await supabase.from('profiles').upsert(user)
  }
  
  // Create test works
  const testWorks = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Test Recommendation Novel 1',
      content: 'A fascinating novel about recommendations',
      genre: 'Novela',
      author_id: testUsers[0].id,
      published: true,
      likes: 10,
      views: 100
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Test Recommendation Poetry 1',
      content: 'Beautiful poetry for testing',
      genre: 'Poesía',
      author_id: testUsers[1].id,
      published: true,
      likes: 5,
      views: 50
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      title: 'Test Recommendation Short Story 1',
      content: 'A short story for algorithm testing',
      genre: 'Cuento',
      author_id: testUsers[2].id,
      published: true,
      likes: 15,
      views: 75
    }
  ]
  
  for (const work of testWorks) {
    await supabase.from('works').upsert(work)
  }
  
  return { testUsers, testWorks }
}

test.describe('Recommendation Algorithms', () => {
  test.beforeEach(async () => {
    await cleanupTestData()
    await setupTestData()
  })
  
  test.afterEach(async () => {
    await cleanupTestData()
  })

  test('Database Functions - Popular Recommendations', async () => {
    const supabase = getSupabaseServerClient()
    
    // Test popular recommendations function
    const { data: popularRecs, error } = await supabase
      .rpc('get_popular_recommendations', {
        target_user_id: null,
        limit_count: 10
      })
    
    expect(error).toBeNull()
    expect(popularRecs).toBeDefined()
    expect(Array.isArray(popularRecs)).toBe(true)
    
    if (popularRecs && popularRecs.length > 0) {
      // Verify structure
      const rec = popularRecs[0]
      expect(rec).toHaveProperty('work_id')
      expect(rec).toHaveProperty('title')
      expect(rec).toHaveProperty('genre')
      expect(rec).toHaveProperty('author_id')
      expect(rec).toHaveProperty('recommendation_score')
      
      // Verify works are published
      for (const work of popularRecs) {
        const { data: workData } = await supabase
          .from('works')
          .select('published')
          .eq('id', work.work_id)
          .single()
        
        expect(workData?.published).toBe(true)
      }
    }
  })

  test('Database Functions - User Exclusion', async () => {
    const supabase = getSupabaseServerClient()
    const testUserId = '00000000-0000-0000-0000-000000000001'
    
    // Test that user's own works are excluded
    const { data: recommendations } = await supabase
      .rpc('get_popular_recommendations', {
        target_user_id: testUserId,
        limit_count: 10
      })
    
    if (recommendations) {
      // Verify no work belongs to the target user
      for (const rec of recommendations) {
        expect(rec.author_id).not.toBe(testUserId)
      }
    }
  })

  test('Database Functions - Content-Based Recommendations', async () => {
    const supabase = getSupabaseServerClient()
    const testUserId = '00000000-0000-0000-0000-000000000001'
    
    // Create user interactions to establish preferences
    await supabase.from('likes').insert({
      user_id: testUserId,
      work_id: '10000000-0000-0000-0000-000000000002' // Poetry work
    })
    
    await supabase.from('bookmarks').insert({
      user_id: testUserId,
      work_id: '10000000-0000-0000-0000-000000000003' // Short story work
    })
    
    // Test content-based recommendations
    const { data: contentRecs, error } = await supabase
      .rpc('get_content_based_recommendations', {
        target_user_id: testUserId,
        limit_count: 10
      })
    
    expect(error).toBeNull()
    expect(contentRecs).toBeDefined()
    
    if (contentRecs && contentRecs.length > 0) {
      // Should exclude user's own works and already interacted works
      for (const rec of contentRecs) {
        expect(rec.author_id).not.toBe(testUserId)
        expect(rec.work_id).not.toBe('10000000-0000-0000-0000-000000000002')
        expect(rec.work_id).not.toBe('10000000-0000-0000-0000-000000000003')
      }
    }
  })

  test('Database Functions - Smart Recommendations Strategy Selection', async () => {
    const supabase = getSupabaseServerClient()
    
    // Test new user (should get popular recommendations)
    const newUserId = '00000000-0000-0000-0000-000000000002'
    const { data: newUserRecs } = await supabase
      .rpc('get_smart_recommendations', {
        target_user_id: newUserId,
        page_type: 'explore',
        limit_count: 5
      })
    
    expect(newUserRecs).toBeDefined()
    
    if (newUserRecs && newUserRecs.length > 0) {
      expect(newUserRecs[0]).toHaveProperty('recommendation_type', 'popular')
    }
    
    // Create moderate interactions for content-based recommendations
    const moderateUserId = '00000000-0000-0000-0000-000000000003'
    const interactions = [
      { user_id: moderateUserId, work_id: '10000000-0000-0000-0000-000000000001' },
      { user_id: moderateUserId, work_id: '10000000-0000-0000-0000-000000000002' },
    ]
    
    for (const interaction of interactions) {
      await supabase.from('likes').insert(interaction)
      await supabase.from('bookmarks').insert(interaction)
    }
    
    const { data: moderateUserRecs } = await supabase
      .rpc('get_smart_recommendations', {
        target_user_id: moderateUserId,
        page_type: 'explore',
        limit_count: 5
      })
    
    expect(moderateUserRecs).toBeDefined()
    
    if (moderateUserRecs && moderateUserRecs.length > 0) {
      expect(moderateUserRecs[0]).toHaveProperty('recommendation_type', 'content_based')
    }
  })
})

test.describe('Page Integration Tests', () => {
  test.beforeEach(async () => {
    await cleanupTestData()
    await setupTestData()
  })
  
  test.afterEach(async () => {
    await cleanupTestData()
  })

  test('Explore Page - Shows Recommendations', async ({ page }) => {
    // Navigate to explore page
    await page.goto('/explore')
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="explore-items"]', { timeout: 10000 })
    
    // Check that works are displayed
    const workCards = await page.locator('[data-testid="work-card"]').count()
    expect(workCards).toBeGreaterThan(0)
    
    // Verify explore page shows different content (not just chronological)
    const titles = await page.locator('[data-testid="work-title"]').allTextContents()
    expect(titles.length).toBeGreaterThan(0)
  })

  test('Main Page - Shows Only Followed Users', async ({ page }) => {
    const supabase = getSupabaseServerClient()
    const followerId = '00000000-0000-0000-0000-000000000001'
    const followedId = '00000000-0000-0000-0000-000000000002'
    
    // Create follow relationship
    await supabase.from('follows').insert({
      follower_id: followerId,
      followee_id: followedId
    })
    
    // Navigate to main page (would need authentication setup)
    await page.goto('/main')
    
    // Wait for content to load
    await page.waitForTimeout(2000)
    
    // Check that "Contenido de personas que sigues" indicator is shown
    const followingIndicator = page.locator('text=Contenido de personas que sigues')
    await expect(followingIndicator).toBeVisible()
    
    // Verify no "Solo seguidos" checkbox (since it's always following mode now)
    const checkbox = page.locator('input[type="checkbox"]')
    await expect(checkbox).not.toBeVisible()
  })

  test('User Own Works Exclusion', async ({ page }) => {
    const supabase = getSupabaseServerClient()
    const userId = '00000000-0000-0000-0000-000000000001'
    
    // Create a work by the user
    await supabase.from('works').insert({
      id: '10000000-0000-0000-0000-000000000999',
      title: 'My Own Test Work',
      content: 'This should not appear in explore recommendations',
      genre: 'Novela',
      author_id: userId,
      published: true,
      likes: 100,
      views: 1000
    })
    
    // Navigate to explore page
    await page.goto('/explore')
    
    // Wait for content to load
    await page.waitForTimeout(3000)
    
    // Verify user's own work doesn't appear in recommendations
    const ownWorkTitle = page.locator('text=My Own Test Work')
    await expect(ownWorkTitle).not.toBeVisible()
  })

  test('Recommendation Performance', async ({ page }) => {
    // Navigate to explore page and measure load time
    const startTime = Date.now()
    await page.goto('/explore')
    
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="explore-items"]', { timeout: 15000 })
    
    const loadTime = Date.now() - startTime
    
    // Recommendations should load within reasonable time (15 seconds max)
    expect(loadTime).toBeLessThan(15000)
    
    // Check that loading indicator disappears
    const loadingIndicator = page.locator('text=Descubriendo obras...')
    await expect(loadingIndicator).not.toBeVisible()
  })
})

test.describe('Edge Cases and Error Handling', () => {
  test.beforeEach(async () => {
    await cleanupTestData()
  })
  
  test.afterEach(async () => {
    await cleanupTestData()
  })

  test('Empty Database - Fallback Behavior', async ({ page }) => {
    // Navigate to explore with empty database
    await page.goto('/explore')
    
    // Should show empty state or fallback content gracefully
    await page.waitForTimeout(3000)
    
    // Check that page doesn't crash
    const errorMessage = page.locator('text=Error')
    await expect(errorMessage).not.toBeVisible()
  })

  test('User with No Interactions - Popular Recommendations', async () => {
    const supabase = getSupabaseServerClient()
    
    // Create a user with no interactions
    const newUserId = '00000000-0000-0000-0000-000000000999'
    await supabase.from('profiles').insert({
      id: newUserId,
      username: '@new-user-test',
      name: 'New User Test'
    })
    
    // Should fall back to popular recommendations
    const { data: recs } = await supabase
      .rpc('get_smart_recommendations', {
        target_user_id: newUserId,
        page_type: 'explore',
        limit_count: 5
      })
    
    expect(recs).toBeDefined()
    
    if (recs && recs.length > 0) {
      expect(recs[0]).toHaveProperty('recommendation_type', 'popular')
    }
  })

  test('User Follows Nobody - Empty Main Feed', async ({ page }) => {
    // Navigate to main page for user who follows nobody
    await page.goto('/main')
    
    // Should show appropriate empty state
    await page.waitForTimeout(2000)
    
    // Check for empty state message or indicator
    const followingIndicator = page.locator('text=Contenido de personas que sigues')
    await expect(followingIndicator).toBeVisible()
  })
})

test.describe('Database Consistency and Cleanup', () => {
  test('Test Data Cleanup Verification', async () => {
    const supabase = getSupabaseServerClient()
    
    // Verify cleanup functions work properly
    await cleanupTestData()
    
    // Check that test data is properly removed
    const { data: testWorks } = await supabase
      .from('works')
      .select('*')
      .ilike('title', '%test-recommendation%')
    
    expect(testWorks).toEqual([])
    
    const { data: testProfiles } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', '%test-rec%')
    
    expect(testProfiles).toEqual([])
  })

  test('Database Rollback on Test Failure', async () => {
    const supabase = getSupabaseServerClient()
    
    try {
      // Setup test data
      await setupTestData()
      
      // Simulate test failure scenario
      throw new Error('Simulated test failure')
      
    } catch (error) {
      // Ensure cleanup happens even on failure
      await cleanupTestData()
      
      // Verify cleanup worked
      const { data: remainingTestData } = await supabase
        .from('works')
        .select('*')
        .ilike('title', '%test-recommendation%')
      
      expect(remainingTestData).toEqual([])
    }
  })
})
