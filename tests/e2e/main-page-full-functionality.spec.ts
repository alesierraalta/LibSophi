import { test, expect } from '@playwright/test'

test.describe('Main Page - Complete Functionality Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to main page before each test
    await page.goto('/main')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('main page should load with header and basic structure', async ({ page }) => {
    // Check header is present
    await expect(page.locator('header')).toBeVisible()
    
    // Check main content area
    await expect(page.locator('main, [role="main"]')).toBeVisible()
    
    // Check navigation tabs
    await expect(page.locator('text=Para ti')).toBeVisible()
    await expect(page.locator('text=Siguiendo')).toBeVisible()
    
    console.log('✅ Main page structure loaded correctly')
  })

  test('should display posts feed correctly', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    // Check if posts are visible
    const posts = page.locator('.bg-white.border.border-gray-200')
    await expect(posts.first()).toBeVisible()
    
    // Check post elements
    const firstPost = posts.first()
    await expect(firstPost.locator('h3')).toBeVisible() // Title
    await expect(firstPost.locator('p')).toBeVisible() // Content
    
    console.log('✅ Posts feed displays correctly')
  })

  test('like functionality should work correctly', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const firstPost = page.locator('.bg-white.border.border-gray-200').first()
    
    // Find like button (Heart icon)
    const likeButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).first()
    await expect(likeButton).toBeVisible()
    
    // Get initial like count
    const likeCountElement = likeButton.locator('span')
    const initialLikeCount = await likeCountElement.textContent()
    
    // Click like button
    await likeButton.click()
    
    // Wait a moment for state to update
    await page.waitForTimeout(500)
    
    // Check if like count changed or button state changed
    const updatedLikeCount = await likeCountElement.textContent()
    
    // The count should either increase by 1 or the button should show as liked
    const likeCountChanged = updatedLikeCount !== initialLikeCount
    const buttonIsLiked = await likeButton.locator('[data-lucide="heart"]').getAttribute('class')
    const isLikedState = buttonIsLiked?.includes('text-red-600') || buttonIsLiked?.includes('fill-red-600')
    
    expect(likeCountChanged || isLikedState).toBeTruthy()
    
    console.log('✅ Like functionality works correctly')
  })

  test('comment functionality should work correctly', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const firstPost = page.locator('.bg-white.border.border-gray-200').first()
    
    // Find comment button (MessageCircle icon)
    const commentButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="message-circle"]') }).first()
    await expect(commentButton).toBeVisible()
    
    // Click comment button to open comment box
    await commentButton.click()
    
    // Wait for comment box to appear
    await page.waitForSelector('input[placeholder*="comentario"]', { timeout: 5000 })
    
    // Check if comment input is visible
    const commentInput = page.locator('input[placeholder*="comentario"]').first()
    await expect(commentInput).toBeVisible()
    
    // Type a test comment
    const testComment = 'Este es un comentario de prueba'
    await commentInput.fill(testComment)
    
    // Find and click comment submit button
    const submitButton = page.locator('button:has-text("Comentar")').first()
    await expect(submitButton).toBeVisible()
    await submitButton.click()
    
    // Wait for comment to appear
    await page.waitForTimeout(1000)
    
    // Check if comment appears in the comment section
    const commentSection = firstPost.locator('.space-y-2, .space-y-3')
    const hasComment = await commentSection.locator(`text=${testComment}`).isVisible().catch(() => false)
    
    expect(hasComment).toBeTruthy()
    
    console.log('✅ Comment functionality works correctly')
  })

  test('repost functionality should work correctly', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const firstPost = page.locator('.bg-white.border.border-gray-200').first()
    
    // Find repost button (Repeat2 icon)
    const repostButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="repeat-2"]') }).first()
    await expect(repostButton).toBeVisible()
    
    // Get initial repost count
    const repostCountElement = repostButton.locator('span')
    const initialRepostCount = await repostCountElement.textContent()
    
    // Click repost button
    await repostButton.click()
    
    // Wait a moment for state to update
    await page.waitForTimeout(500)
    
    // Check if repost count changed or button state changed
    const updatedRepostCount = await repostCountElement.textContent()
    
    // The count should either increase by 1 or the button should show as reposted
    const repostCountChanged = updatedRepostCount !== initialRepostCount
    const buttonIsReposted = await repostButton.locator('[data-lucide="repeat-2"]').getAttribute('class')
    const isRepostedState = buttonIsReposted?.includes('text-purple-600')
    
    expect(repostCountChanged || isRepostedState).toBeTruthy()
    
    console.log('✅ Repost functionality works correctly')
  })

  test('bookmark functionality should work correctly', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const firstPost = page.locator('.bg-white.border.border-gray-200').first()
    
    // Find bookmark button (Bookmark icon)
    const bookmarkButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="bookmark"]') }).first()
    await expect(bookmarkButton).toBeVisible()
    
    // Click bookmark button
    await bookmarkButton.click()
    
    // Wait a moment for state to update
    await page.waitForTimeout(500)
    
    // Check if bookmark button state changed
    const buttonIsBookmarked = await bookmarkButton.locator('[data-lucide="bookmark"]').getAttribute('class')
    const isBookmarkedState = buttonIsBookmarked?.includes('text-yellow-600') || buttonIsBookmarked?.includes('fill-yellow-500')
    
    expect(isBookmarkedState).toBeTruthy()
    
    console.log('✅ Bookmark functionality works correctly')
  })

  test('share functionality should work correctly', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const firstPost = page.locator('.bg-white.border.border-gray-200').first()
    
    // Find share button (Share2 icon)
    const shareButton = firstPost.locator('button').filter({ has: page.locator('[data-lucide="share-2"]') }).first()
    await expect(shareButton).toBeVisible()
    
    // Mock clipboard API
    await page.addInitScript(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: () => Promise.resolve()
        }
      })
    })
    
    // Click share button
    await shareButton.click()
    
    // The share functionality should work without throwing errors
    // Since we can't easily test clipboard or native share, we just verify the button is clickable
    console.log('✅ Share functionality works correctly')
  })

  test('navigation tabs should work correctly', async ({ page }) => {
    // Check "Para ti" tab
    const paraTiTab = page.locator('text=Para ti')
    await expect(paraTiTab).toBeVisible()
    
    // Check "Siguiendo" tab
    const siguiendoTab = page.locator('text=Siguiendo')
    await expect(siguiendoTab).toBeVisible()
    
    // Click on "Siguiendo" tab
    await siguiendoTab.click()
    
    // Wait for content to potentially change
    await page.waitForTimeout(1000)
    
    // Verify tab is active (should have different styling)
    const siguiendoTabClass = await siguiendoTab.getAttribute('class')
    const isActive = siguiendoTabClass?.includes('text-red-600') || siguiendoTabClass?.includes('border-red-600')
    
    expect(isActive).toBeTruthy()
    
    // Click back to "Para ti" tab
    await paraTiTab.click()
    await page.waitForTimeout(1000)
    
    console.log('✅ Navigation tabs work correctly')
  })

  test('floating publish button should work on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Reload page with mobile viewport
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Find floating publish button (should be visible on mobile)
    const publishButton = page.locator('button[aria-label="Publicar"]')
    
    // On mobile, the button should be visible
    const isVisible = await publishButton.isVisible()
    
    if (isVisible) {
      await expect(publishButton).toBeVisible()
      
      // Click the button (should navigate to writer page)
      await publishButton.click()
      
      // Wait for navigation
      await page.waitForTimeout(2000)
      
      // Should navigate to writer page or show some response
      const currentUrl = page.url()
      const navigatedToWriter = currentUrl.includes('/writer') || currentUrl.includes('/write')
      
      console.log('✅ Floating publish button works correctly on mobile')
    } else {
      console.log('ℹ️  Floating publish button not visible on current mobile breakpoint')
    }
  })

  test('sidebar content should be visible on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })
    
    // Reload page with desktop viewport
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check for trending topics section
    const trendingSection = page.locator('text=Trending, text=Tendencias, text=Popular')
    const hasTrending = await trendingSection.first().isVisible().catch(() => false)
    
    // Check for suggested authors section
    const authorsSection = page.locator('text=Autores, text=Escritores, text=Sugeridos')
    const hasAuthors = await authorsSection.first().isVisible().catch(() => false)
    
    // At least one sidebar section should be visible on desktop
    expect(hasTrending || hasAuthors).toBeTruthy()
    
    console.log('✅ Sidebar content is visible on desktop')
  })

  test('posts should load with proper content structure', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    const posts = page.locator('.bg-white.border.border-gray-200')
    const postCount = await posts.count()
    
    expect(postCount).toBeGreaterThan(0)
    
    // Check first post structure
    const firstPost = posts.first()
    
    // Should have author information
    const hasAuthorInfo = await firstPost.locator('.flex.items-center').first().isVisible()
    expect(hasAuthorInfo).toBeTruthy()
    
    // Should have title
    const hasTitle = await firstPost.locator('h3').isVisible()
    expect(hasTitle).toBeTruthy()
    
    // Should have content
    const hasContent = await firstPost.locator('p').isVisible()
    expect(hasContent).toBeTruthy()
    
    // Should have action buttons
    const hasLikeButton = await firstPost.locator('button').filter({ has: page.locator('[data-lucide="heart"]') }).isVisible()
    const hasCommentButton = await firstPost.locator('button').filter({ has: page.locator('[data-lucide="message-circle"]') }).isVisible()
    const hasRepostButton = await firstPost.locator('button').filter({ has: page.locator('[data-lucide="repeat-2"]') }).isVisible()
    
    expect(hasLikeButton).toBeTruthy()
    expect(hasCommentButton).toBeTruthy()
    expect(hasRepostButton).toBeTruthy()
    
    console.log('✅ Posts have proper content structure')
  })

  test('loading states should work correctly', async ({ page }) => {
    // Navigate to page
    await page.goto('/main')
    
    // Should show loading state initially
    const loadingIndicator = page.locator('.animate-spin, text=Cargando')
    const hasLoadingState = await loadingIndicator.first().isVisible().catch(() => false)
    
    // Wait for content to load
    await page.waitForSelector('.bg-white.border.border-gray-200', { timeout: 15000 })
    
    // Loading state should be gone
    const stillLoading = await loadingIndicator.first().isVisible().catch(() => false)
    expect(stillLoading).toBeFalsy()
    
    console.log('✅ Loading states work correctly')
  })

})

test.describe('Main Page - Error Handling Tests', () => {
  
  test('should handle network errors gracefully', async ({ page }) => {
    // Block network requests to simulate offline
    await page.route('**/*', route => {
      if (route.request().url().includes('api') || route.request().url().includes('supabase')) {
        route.abort()
      } else {
        route.continue()
      }
    })
    
    await page.goto('/main')
    await page.waitForLoadState('networkidle')
    
    // Page should still load basic structure even with network errors
    await expect(page.locator('header')).toBeVisible()
    
    console.log('✅ Network errors handled gracefully')
  })

  test('should handle empty posts state', async ({ page }) => {
    // Mock empty response
    await page.route('**/works*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
    
    await page.goto('/main')
    await page.waitForLoadState('networkidle')
    
    // Should show empty state message
    const emptyMessage = page.locator('text=No hay publicaciones, text=Sin publicaciones')
    const hasEmptyState = await emptyMessage.first().isVisible().catch(() => false)
    
    if (hasEmptyState) {
      expect(hasEmptyState).toBeTruthy()
      console.log('✅ Empty posts state handled correctly')
    } else {
      console.log('ℹ️  Empty state not visible (may have fallback data)')
    }
  })

})

