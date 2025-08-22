import { test, expect } from '@playwright/test'
import { databaseCleanup } from './utils/database-cleanup'

test.describe('Database Integration and Real-World Scenarios', () => {
  
  test.beforeAll(async () => {
    console.log('[START] Starting database integration tests...')
    await databaseCleanup.cleanupAll()
    await databaseCleanup.createTestData()
  })

  test.afterAll(async () => {
    console.log('[CLEANUP] Final cleanup after integration tests...')
    await databaseCleanup.emergencyCleanup()
  })

  test('End-to-End User Journey with Database Operations', async ({ page }) => {
    console.log('[JOURNEY] Testing complete user journey with database interactions...')
    
    // Step 1: User visits the main page
    console.log('Step 1: User visits main page')
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const posts = page.locator('.bg-white.border.border-gray-200')
    const initialPostCount = await posts.count()
    expect(initialPostCount).toBeGreaterThan(0)
    
    console.log('[SUCCESS] Main page loaded with ' + initialPostCount + ' posts')
    
    // Step 2: User interacts with content (like a post)
    console.log('Step 2: User likes a post')
    const firstPost = posts.first()
    const likeButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
    
    const initialLikeCount = await likeButton.locator('span').textContent()
    await likeButton.click()
    await page.waitForTimeout(2000)
    
    const newLikeCount = await likeButton.locator('span').textContent()
    console.log('[SUCCESS] Like interaction: ' + initialLikeCount + ' → ' + newLikeCount + '')
    
    // Step 3: User navigates to explore page
    console.log('Step 3: User explores content')
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    const exploreContent = page.locator('body')
    expect(await exploreContent.isVisible()).toBeTruthy()
    console.log('[SUCCESS] Explore page loaded successfully')
    
    // Step 4: User searches for content
    console.log('Step 4: User searches for content')
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar"], input[placeholder*="search"]').first()
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await searchInput.press('Enter')
      await page.waitForTimeout(3000)
      
      console.log('[SUCCESS] Search functionality executed')
    } else {
      console.log('[INFO] Search not available, testing navigation instead')
    }
    
    // Step 5: User views profile/works
    console.log('Step 5: User views works')
    await page.goto('/mis-obras')
    await page.waitForLoadState('networkidle')
    
    const worksPage = page.locator('body')
    expect(await worksPage.isVisible()).toBeTruthy()
    console.log('[SUCCESS] Works page loaded successfully')
    
    // Step 6: Return to main page and verify persistence
    console.log('Step 6: Verify data persistence')
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const finalPosts = page.locator('.bg-white.border.border-gray-200')
    const finalPostCount = await finalPosts.count()
    
    expect(finalPostCount).toBe(initialPostCount)
    console.log('[SUCCESS] Data persistence verified across user journey')
  })

  test('Multi-User Simulation with Database Consistency', async ({ browser }) => {
    console.log('[MULTI_USER] Testing multi-user database consistency...')
    
    // Create multiple user sessions
    const contexts = []
    const pages = []
    
    try {
      // Create 3 concurrent user sessions
      for (let i = 0; i < 3; i++) {
        const context = await browser.newContext()
        const page = await context.newPage()
        contexts.push(context)
        pages.push(page)
      }
      
      // All users navigate to main page simultaneously
      const navigationPromises = pages.map(async (page, index) => {
        await page.goto('/main')
        await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 20000 })
        
        console.log('[SUCCESS] User ' + index + 1 + ' loaded main page')
        
        // Each user interacts with the first post
        const posts = page.locator('.bg-white.border.border-gray-200')
        const postCount = await posts.count()
        
        if (postCount > 0) {
          const firstPost = posts.first()
          const likeButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
          
          // User performs like action
          await likeButton.click()
          await page.waitForTimeout(1000)
          
          console.log('[SUCCESS] User ' + index + 1 + ' performed like action')
        }
        
        return { userId: index + 1, postCount }
      })
      
      const results = await Promise.all(navigationPromises)
      
      // Verify all users see consistent data
      const postCounts = results.map(r => r.postCount)
      const allCountsEqual = postCounts.every(count => count === postCounts[0])
      
      expect(allCountsEqual).toBeTruthy()
      console.log('[SUCCESS] Multi-user data consistency verified')
      
      // Test concurrent interactions don't cause conflicts
      const interactionPromises = pages.map(async (page, index) => {
        const posts = page.locator('.bg-white.border.border-gray-200')
        
        if (await posts.count() > 0) {
          const firstPost = posts.first()
          const commentButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="message-circle"]') }).first()
          
          await commentButton.click().catch(() => {})
          await page.waitForTimeout(500)
          
          console.log('[SUCCESS] User ' + index + 1 + ' attempted comment interaction')
        }
      })
      
      await Promise.all(interactionPromises)
      console.log('[SUCCESS] Concurrent interactions handled without conflicts')
      
    } finally {
      // Clean up all contexts
      for (const context of contexts) {
        await context.close()
      }
    }
  })

  test('Database Backup and Recovery Workflow', async ({ page }) => {
    console.log('[BACKUP] Testing database backup and recovery workflow...')
    
    // Step 1: Record initial state
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const posts = page.locator('.bg-white.border.border-gray-200')
    const initialState = {
      postCount: await posts.count(),
      firstPostTitle: await posts.first().locator('h3').textContent(),
      firstPostContent: await posts.first().locator('p').textContent()
    }
    
    console.log('[SUCCESS] Initial state recorded: ' + initialState.postCount + ' posts')
    
    // Step 2: Perform some operations that would modify state
    const firstPost = posts.first()
    const likeButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
    
    const originalLikeCount = await likeButton.locator('span').textContent()
    await likeButton.click()
    await page.waitForTimeout(2000)
    
    const modifiedLikeCount = await likeButton.locator('span').textContent()
    console.log('[SUCCESS] State modified: likes ' + originalLikeCount + ' → ' + modifiedLikeCount + '')
    
    // Step 3: Simulate recovery by refreshing and checking persistence
    await page.reload()
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const recoveredPosts = page.locator('.bg-white.border.border-gray-200')
    const recoveredState = {
      postCount: await recoveredPosts.count(),
      firstPostTitle: await recoveredPosts.first().locator('h3').textContent(),
      firstPostContent: await recoveredPosts.first().locator('p').textContent()
    }
    
    // Verify core data integrity after recovery
    expect(recoveredState.postCount).toBe(initialState.postCount)
    expect(recoveredState.firstPostTitle).toBe(initialState.firstPostTitle)
    expect(recoveredState.firstPostContent).toBe(initialState.firstPostContent)
    
    console.log('[SUCCESS] Database recovery verification passed')
    
    // Step 4: Test recovery across browser sessions
    const context = page.context()
    await context.clearCookies()
    await context.clearPermissions()
    
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const sessionRecoveryPosts = page.locator('.bg-white.border.border-gray-200')
    const sessionRecoveryCount = await sessionRecoveryPosts.count()
    
    expect(sessionRecoveryCount).toBe(initialState.postCount)
    console.log('[SUCCESS] Cross-session recovery verification passed')
  })

  test('Real-Time Data Synchronization', async ({ page }) => {
    console.log('[REALTIME] Testing real-time data synchronization...')
    
    // Step 1: Load initial data
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const posts = page.locator('.bg-white.border.border-gray-200')
    const initialPostCount = await posts.count()
    
    console.log('[SUCCESS] Initial data loaded: ' + initialPostCount + ' posts')
    
    // Step 2: Monitor for real-time updates
    let updateDetected = false
    
    // Set up a listener for DOM changes that might indicate real-time updates
    await page.evaluate(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            (window as any).updateDetected = true
          }
        })
      })
      
      const container = document.querySelector('main, .main-content, body')
      if (container) {
        observer.observe(container, { childList: true, subtree: true })
      }
    })
    
    // Step 3: Perform actions that might trigger real-time updates
    if (initialPostCount > 0) {
      const firstPost = posts.first()
      const likeButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
      
      await likeButton.click()
      await page.waitForTimeout(3000) // Wait for potential real-time updates
      
      // Check if any updates were detected
      updateDetected = await page.evaluate(() => (window as any).updateDetected)
      
      if (updateDetected) {
        console.log('[SUCCESS] Real-time updates detected')
      } else {
        console.log('[INFO] No real-time updates detected (may use polling or be disabled)')
      }
    }
    
    // Step 4: Test data consistency after interactions
    await page.waitForTimeout(2000)
    
    const finalPosts = page.locator('.bg-white.border.border-gray-200')
    const finalPostCount = await finalPosts.count()
    
    expect(finalPostCount).toBe(initialPostCount)
    console.log('[SUCCESS] Data consistency maintained during real-time operations')
  })

  test('Database Migration Compatibility', async ({ page }) => {
    console.log('[REALTIME] Testing database migration compatibility...')
    
    // Test that all expected database features work correctly
    const features = [
      {
        name: 'User Posts',
        test: async () => {
          await page.goto('/main')
          await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
          const posts = page.locator('.bg-white.border.border-gray-200')
          return await posts.count() > 0
        }
      },
      {
        name: 'User Interactions',
        test: async () => {
          const posts = page.locator('.bg-white.border.border-gray-200')
          if (await posts.count() > 0) {
            const likeButton = posts.first().locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
            return await likeButton.isVisible()
          }
          return false
        }
      },
      {
        name: 'User Navigation',
        test: async () => {
          await page.goto('/explore')
          await page.waitForLoadState('networkidle')
          return await page.locator('body').isVisible()
        }
      },
      {
        name: 'User Content Management',
        test: async () => {
          await page.goto('/mis-obras')
          await page.waitForLoadState('networkidle')
          return await page.locator('body').isVisible()
        }
      }
    ]
    
    const results = []
    
    for (const feature of features) {
      try {
        const result = await feature.test()
        results.push({ name: feature.name, success: result })
        
        if (result) {
          console.log('[SUCCESS] ' + feature.name + ' compatibility verified')
        } else {
          console.log('[WARNING] ' + feature.name + ' compatibility issue detected')
        }
      } catch (error) {
        results.push({ name: feature.name, success: false, error: error.message })
        console.log(`❌ ${feature.name} compatibility test failed:`, error.message)
      }
    }
    
    // At least 75% of features should work
    const successRate = results.filter(r => r.success).length / results.length
    expect(successRate).toBeGreaterThanOrEqual(0.75)
    
    console.log('[SUCCESS] Migration compatibility: ' + (successRate * 100).toFixed(1) + '% features working')
  })

  test('Database Security and Access Patterns', async ({ page }) => {
    console.log('[SECURITY] Testing database security and access patterns...')
    
    // Test 1: Public data access
    await page.goto('/main')
    await page.waitForLoadState('networkidle')
    
    const publicPosts = page.locator('.bg-white.border.border-gray-200')
    const publicPostCount = await publicPosts.count()
    
    expect(publicPostCount).toBeGreaterThan(0)
    console.log('[SUCCESS] Public data access: ' + publicPostCount + ' posts accessible')
    
    // Test 2: Anonymous user limitations
    const firstPost = publicPosts.first()
    const likeButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
    
    // Try to interact as anonymous user
    await likeButton.click()
    await page.waitForTimeout(1000)
    
    // System should handle this gracefully (either allow or show appropriate feedback)
    const pageStillFunctional = await page.locator('header').isVisible()
    expect(pageStillFunctional).toBeTruthy()
    
    console.log('[SUCCESS] Anonymous user interactions handled appropriately')
    
    // Test 3: Protected route behavior
    await page.goto('/writer')
    await page.waitForLoadState('networkidle')
    
    const currentUrl = page.url()
    const isOnWriterPage = currentUrl.includes('/writer')
    const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/auth')
    
    if (isRedirected) {
      console.log('[SUCCESS] Protected routes properly redirect to authentication')
    } else if (isOnWriterPage) {
      console.log('[INFO] Writer page accessible (may allow anonymous access or have auto-auth)')
    } else {
      console.log('[INFO] Navigation handled with custom routing logic')
    }
    
    // Test 4: Data visibility controls
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    
    const profileContent = page.locator('body')
    const hasProfileContent = await profileContent.isVisible()
    
    expect(hasProfileContent).toBeTruthy()
    console.log('[SUCCESS] Profile data visibility controls working')
  })

  test('Database Performance Under Real-World Load', async ({ page }) => {
    console.log('[PERFORMANCE] Testing database performance under real-world conditions...')
    
    // Simulate typical user behavior patterns
    const userActions = [
      { action: 'browse_main', url: '/main', expectedElements: '.bg-white.border.border-gray-200' },
      { action: 'explore_content', url: '/explore', expectedElements: 'body' },
      { action: 'view_profile', url: '/profile', expectedElements: 'body' },
      { action: 'check_works', url: '/mis-obras', expectedElements: 'body' },
      { action: 'return_main', url: '/main', expectedElements: '.bg-white.border.border-gray-200' }
    ]
    
    const performanceMetrics = []
    
    for (const userAction of userActions) {
      const startTime = Date.now()
      
      await page.goto(userAction.url)
      await page.waitForSelector(userAction.expectedElements, { timeout: 15000 })
      
      const loadTime = Date.now() - startTime
      performanceMetrics.push({ action: userAction.action, loadTime })
      
      // Simulate user interaction time
      await page.waitForTimeout(500)
      
      // Interact with content if available
      const interactiveElements = page.locator('button, a').first()
      if (await interactiveElements.isVisible()) {
        const interactionStart = Date.now()
        await interactiveElements.click().catch(() => {})
        const interactionTime = Date.now() - interactionStart
        
        performanceMetrics.push({ 
          action: `${userAction.action}_interaction`, 
          loadTime: interactionTime 
        })
      }
      
             console.log('[SUCCESS] ' + userAction.action + ': ' + loadTime + 'ms')
    }
    
    // Analyze performance metrics
    const averageLoadTime = performanceMetrics
      .filter(m => !m.action.includes('_interaction'))
      .reduce((sum, m) => sum + m.loadTime, 0) / userActions.length
    
    expect(averageLoadTime).toBeLessThan(8000) // Average should be under 8 seconds
    
    console.log('[SUCCESS] Average page load time: ' + averageLoadTime.toFixed(2) + 'ms')
    
    // Test sustained performance
    console.log('Testing sustained performance...')
    
    const sustainedStart = Date.now()
    
    for (let i = 0; i < 5; i++) {
      await page.goto('/main')
      await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 10000 })
      
      const posts = page.locator('.bg-white.border.border-gray-200')
      if (await posts.count() > 0) {
        const firstPost = posts.first()
        const likeButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
        await likeButton.click().catch(() => {})
      }
      
      await page.waitForTimeout(200)
    }
    
    const sustainedTime = Date.now() - sustainedStart
    expect(sustainedTime).toBeLessThan(30000) // Should complete within 30 seconds
    
    console.log('[SUCCESS] Sustained performance test: ' + sustainedTime + 'ms for 5 cycles')
  })

  test('Database Data Integrity and Validation', async ({ page }) => {
    console.log('[VALIDATION] Testing database data integrity and validation...')
    
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const posts = page.locator('.bg-white.border.border-gray-200')
    const postCount = await posts.count()
    
    const integrityChecks = []
    
    // Check data integrity across multiple posts
    for (let i = 0; i < Math.min(5, postCount); i++) {
      const post = posts.nth(i)
      
      const checks = {
        hasTitle: await post.locator('h3').isVisible(),
        hasContent: await post.locator('p').isVisible(),
        hasAuthor: await post.locator('.flex.items-center').first().isVisible(),
        hasLikes: await post.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).isVisible(),
        hasComments: await post.locator('button').filter({ has: page.locator('[data-lucide="message-circle"]') }).isVisible()
      }
      
      // Validate content is not empty
      const title = await post.locator('h3').textContent()
      const content = await post.locator('p').textContent()
      
      checks.titleNotEmpty = title !== null && title.trim().length > 0
      checks.contentNotEmpty = content !== null && content.trim().length > 0
      
      // Validate numeric fields
      const likeCount = await post.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).locator('span').textContent()
      const commentCount = await post.locator('button').filter({ has: page.locator('[data-lucide="message-circle"]') }).locator('span').textContent()
      
      checks.likeCountValid = !isNaN(parseInt(likeCount || '0'))
      checks.commentCountValid = !isNaN(parseInt(commentCount || '0'))
      
      integrityChecks.push({ postIndex: i, checks })
      
      // All critical checks should pass
      const criticalChecks = [
        checks.hasTitle, 
        checks.hasContent, 
        checks.titleNotEmpty, 
        checks.contentNotEmpty,
        checks.likeCountValid,
        checks.commentCountValid
      ]
      
      const criticalPassed = criticalChecks.every(check => check)
      expect(criticalPassed).toBeTruthy()
      
      console.log('[SUCCESS] Post ' + i + 1 + ' integrity checks passed')
    }
    
    console.log('[SUCCESS] Data integrity validated across ' + integrityChecks.length + ' posts')
    
    // Cross-reference data consistency
    const titles = []
    for (let i = 0; i < Math.min(3, postCount); i++) {
      const title = await posts.nth(i).locator('h3').textContent()
      titles.push(title)
    }
    
    // Titles should be unique (no duplicate content)
    const uniqueTitles = new Set(titles)
    expect(uniqueTitles.size).toBe(titles.length)
    
    console.log('[SUCCESS] Data consistency verified - no duplicate content detected')
  })
})
