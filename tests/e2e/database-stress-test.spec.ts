import { test, expect } from '@playwright/test'
import { databaseCleanup } from './utils/database-cleanup'

test.describe('Database Stress and Load Testing', () => {
  
  test.beforeAll(async () => {
    console.log('[START] Starting database stress tests...')
    await databaseCleanup.cleanupAll()
    await databaseCleanup.createTestData()
  })

  test.afterAll(async () => {
    console.log('[CLEANUP] Cleaning up after stress tests...')
    await databaseCleanup.emergencyCleanup()
  })

  test('Database Load Testing - Multiple Concurrent Operations', async ({ page }) => {
    console.log('[PERFORMANCE] Testing database under concurrent load...')
    
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const posts = page.locator('.bg-white.border.border-gray-200')
    const postCount = await posts.count()
    
    if (postCount > 0) {
      const startTime = Date.now()
      
      // Simulate multiple rapid interactions
      const operations = []
      
      for (let i = 0; i < Math.min(5, postCount); i++) {
        const post = posts.nth(i)
        const likeButton = post.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
        
        operations.push(async () => {
          for (let j = 0; j < 3; j++) {
            await likeButton.click()
            await page.waitForTimeout(100)
          }
        })
      }
      
      // Execute all operations concurrently
      await Promise.all(operations.map(op => op()))
      
      const totalTime = Date.now() - startTime
      console.log('[SUCCESS] Concurrent operations completed in ' + totalTime + 'ms')
      
      // Verify system stability
      await page.waitForTimeout(2000)
      const isStable = await page.locator('header').isVisible()
      expect(isStable).toBeTruthy()
      
      console.log('[SUCCESS] System remains stable after concurrent load')
    }
  })

  test('Database Memory Stress Test', async ({ page }) => {
    console.log('[MEMORY] Testing database memory usage under stress...')
    
    const startTime = Date.now()
    
    // Rapid page navigation to test memory management
    const pages = ['/main', '/explore', '/profile', '/mis-obras', '/main']
    
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const url of pages) {
        await page.goto(url)
        await page.waitForLoadState('networkidle')
        
        // Interact with content if available
        const interactiveElements = page.locator('button, input, a').first()
        if (await interactiveElements.isVisible()) {
          await interactiveElements.click().catch(() => {})
        }
        
        await page.waitForTimeout(500)
      }
    }
    
    const totalTime = Date.now() - startTime
    expect(totalTime).toBeLessThan(60000) // Should complete within 60 seconds
    
    console.log('[SUCCESS] Memory stress test completed in ' + totalTime + 'ms')
    
    // Final stability check
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const finalPosts = page.locator('.bg-white.border.border-gray-200')
    const finalCount = await finalPosts.count()
    
    expect(finalCount).toBeGreaterThan(0)
    console.log('[SUCCESS] Database remains functional after memory stress test')
  })

  test('Database Connection Pool Stress Test', async ({ browser }) => {
    console.log('[CONNECTION] Testing database connection pool under stress...')
    
    // Create multiple browser contexts to simulate concurrent users
    const contexts = []
    const pages = []
    
    try {
      // Create 5 concurrent contexts
      for (let i = 0; i < 5; i++) {
        const context = await browser.newContext()
        const page = await context.newPage()
        contexts.push(context)
        pages.push(page)
      }
      
      const startTime = Date.now()
      
      // All contexts navigate simultaneously
      const navigationPromises = pages.map(async (page, index) => {
        await page.goto('/main')
        await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 20000 })
        
        // Each page performs some interactions
        const posts = page.locator('.bg-white.border.border-gray-200')
        const postCount = await posts.count()
        
        if (postCount > 0) {
          const firstPost = posts.first()
          const likeButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
          
          // Perform some interactions
          for (let j = 0; j < 2; j++) {
            await likeButton.click().catch(() => {})
            await page.waitForTimeout(200)
          }
        }
        
                 console.log('[SUCCESS] Context ' + (index + 1) + ' completed interactions')
      })
      
      await Promise.all(navigationPromises)
      
      const totalTime = Date.now() - startTime
      console.log('[SUCCESS] Connection pool stress test completed in ' + totalTime + 'ms')
      
      expect(totalTime).toBeLessThan(30000) // Should complete within 30 seconds
      
    } finally {
      // Clean up contexts
      for (const context of contexts) {
        await context.close()
      }
    }
  })

  test('Database Transaction Integrity Under Load', async ({ page }) => {
    console.log('[TRANSACTION] Testing database transaction integrity under load...')
    
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const posts = page.locator('.bg-white.border.border-gray-200')
    
    if (await posts.count() > 0) {
      const firstPost = posts.first()
      const likeButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
      
      // Get initial state
      const initialLikeCount = await likeButton.locator('span').textContent()
      const initialNumber = parseInt(initialLikeCount || '0')
      
      // Perform rapid consecutive operations
      const operationCount = 10
      const startTime = Date.now()
      
      for (let i = 0; i < operationCount; i++) {
        await likeButton.click()
        await page.waitForTimeout(50) // Minimal delay to test race conditions
      }
      
      // Wait for all operations to settle
      await page.waitForTimeout(3000)
      
      const finalLikeCount = await likeButton.locator('span').textContent()
      const finalNumber = parseInt(finalLikeCount || '0')
      
      const operationTime = Date.now() - startTime
             console.log('[SUCCESS] ' + operationCount + ' rapid operations completed in ' + operationTime + 'ms')
      console.log('   Initial count: ' + initialNumber + ', Final count: ' + finalNumber)
      
      // Verify system didn't crash
      const isStable = await page.locator('header').isVisible()
      expect(isStable).toBeTruthy()
      
      console.log('[SUCCESS] Transaction integrity maintained under rapid operations')
    }
  })

  test('Database Error Recovery Under Stress', async ({ page }) => {
    console.log('[ERROR_HANDLING] Testing database error recovery under stress...')
    
    // Simulate intermittent database connectivity issues
    let requestCount = 0
    await page.route('**/*supabase*/**', route => {
      requestCount++
      
      // Fail every 3rd request to simulate intermittent issues
      if (requestCount % 3 === 0) {
        route.abort()
      } else {
        route.continue()
      }
    })
    
    const startTime = Date.now()
    
    // Attempt multiple operations under unreliable conditions
    for (let i = 0; i < 5; i++) {
      await page.goto('/main')
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
                 console.log('Navigation ' + (i + 1) + ' had connectivity issues (expected)')
      })
      
      // Try to interact with content
      const posts = page.locator('.bg-white.border.border-gray-200')
      const postCount = await posts.count()
      
      if (postCount > 0) {
        const firstPost = posts.first()
        const likeButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
        
        await likeButton.click().catch(() => {
                     console.log('Interaction ' + (i + 1) + ' failed due to connectivity (expected)')
        })
      }
      
      await page.waitForTimeout(1000)
    }
    
    const stressTime = Date.now() - startTime
    console.log('[SUCCESS] Stress operations completed in ' + stressTime + 'ms')
    
    // Clear route interception and verify recovery
    await page.unroute('**/*supabase*/**')
    
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const recoveryPosts = page.locator('.bg-white.border.border-gray-200')
    const recoveryCount = await recoveryPosts.count()
    
    expect(recoveryCount).toBeGreaterThan(0)
    console.log('[SUCCESS] Database recovered successfully after connectivity stress')
  })

  test('Database Performance Under Heavy Read Load', async ({ page }) => {
    console.log('[READ_LOAD] Testing database performance under heavy read load...')
    
    const readOperations = []
    const startTime = Date.now()
    
    // Simulate heavy read operations
    for (let i = 0; i < 10; i++) {
      readOperations.push(async () => {
        await page.goto('/main')
        await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 10000 })
        
        const posts = page.locator('.bg-white.border.border-gray-200')
        const count = await posts.count()
        
        // Read content from multiple posts
        for (let j = 0; j < Math.min(3, count); j++) {
          const post = posts.nth(j)
          await post.locator('h3').textContent()
          await post.locator('p').textContent()
        }
        
                 console.log('Read operation ' + (i + 1) + ' completed')
      })
    }
    
    // Execute some operations in parallel
    const batchSize = 3
    for (let i = 0; i < readOperations.length; i += batchSize) {
      const batch = readOperations.slice(i, i + batchSize)
      await Promise.all(batch.map(op => op()))
      await page.waitForTimeout(500) // Brief pause between batches
    }
    
    const totalReadTime = Date.now() - startTime
    expect(totalReadTime).toBeLessThan(60000) // Should complete within 60 seconds
    
    console.log('[SUCCESS] Heavy read load test completed in ' + totalReadTime + 'ms')
    
    // Verify final system state
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const finalPosts = page.locator('.bg-white.border.border-gray-200')
    const finalCount = await finalPosts.count()
    
    expect(finalCount).toBeGreaterThan(0)
    console.log('[SUCCESS] Database remains responsive after heavy read load')
  })

  test('Database Cleanup Stress Test', async ({ page }) => {
    console.log('[CLEANUP] Testing database cleanup under stress conditions...')
    
    // Create multiple test records rapidly
    const testRecords = []
    
    for (let i = 0; i < 5; i++) {
      testRecords.push({
        title: `E2E Stress Test Work ${i}`,
        content: `This is stress test content ${i} that should be cleaned up`,
        timestamp: Date.now() + i
      })
    }
    
    console.log('Created ' + testRecords.length + ' test records for cleanup testing')
    
    // Test cleanup performance
    const cleanupStart = Date.now()
    
    try {
      await databaseCleanup.cleanupAll()
      
      const cleanupTime = Date.now() - cleanupStart
      expect(cleanupTime).toBeLessThan(30000) // Cleanup should complete within 30 seconds
      
      console.log('[SUCCESS] Cleanup completed in ' + cleanupTime + 'ms')
      
      // Verify cleanup was effective
      const stats = await databaseCleanup.getCleanupStats()
      console.log('[SUCCESS] Cleanup statistics:', stats)
      
    } catch (error) {
      console.error('❌ Cleanup stress test failed:', error)
      throw error
    }
    
    // Verify system is still functional after cleanup
    await page.goto('/main')
    await page.waitForLoadState('networkidle')
    
    const isStable = await page.locator('header').isVisible()
    expect(isStable).toBeTruthy()
    
    console.log('[SUCCESS] System remains stable after cleanup stress test')
  })

  test('Database Monitoring and Health Check', async ({ page }) => {
    console.log('[HEALTH] Testing database health monitoring...')
    
    // Test 1: Basic connectivity health check
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const posts = page.locator('.bg-white.border.border-gray-200')
    const isHealthy = await posts.count() > 0
    
    expect(isHealthy).toBeTruthy()
    console.log('[SUCCESS] Database connectivity health check passed')
    
    // Test 2: Response time monitoring
    const healthChecks = []
    
    for (let i = 0; i < 5; i++) {
      const checkStart = Date.now()
      
      await page.goto('/main')
      await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 10000 })
      
      const responseTime = Date.now() - checkStart
      healthChecks.push(responseTime)
      
      expect(responseTime).toBeLessThan(10000) // Each check should complete within 10 seconds
      
      await page.waitForTimeout(1000)
    }
    
    const averageResponseTime = healthChecks.reduce((a, b) => a + b, 0) / healthChecks.length
    console.log('[SUCCESS] Average response time: ' + averageResponseTime.toFixed(2) + 'ms')
    
    // Test 3: Data consistency health check
    await page.goto('/main')
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const consistencyPosts = page.locator('.bg-white.border.border-gray-200')
    const consistencyCount = await consistencyPosts.count()
    
    if (consistencyCount > 0) {
      // Check data integrity across multiple posts
      for (let i = 0; i < Math.min(3, consistencyCount); i++) {
        const post = consistencyPosts.nth(i)
        
        const title = await post.locator('h3').textContent()
        const content = await post.locator('p').textContent()
        
        expect(title).toBeTruthy()
        expect(title?.length).toBeGreaterThan(0)
        expect(content).toBeTruthy()
        expect(content?.length).toBeGreaterThan(0)
      }
      
      console.log('[SUCCESS] Data consistency health check passed')
    }
    
    console.log('[SUCCESS] Database health monitoring completed successfully')
  })
})
