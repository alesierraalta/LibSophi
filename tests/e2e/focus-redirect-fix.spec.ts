import { test, expect, type Page, type BrowserContext } from '@playwright/test'

test.describe('Focus Redirect Fix - Verification', () => {
  let context: BrowserContext
  let page: Page

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext()
    page = await context.newPage()
    
    // Monitor navigation events
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        console.log('Navigation to:', frame.url())
      }
    })
  })

  test.afterEach(async () => {
    await context.close()
  })

  test('should stay on writer page when focus is regained', async () => {
    // Navigate to writer page
    await page.goto('/writer')
    await page.waitForLoadState('networkidle')
    
    // Verify we're on writer page
    await expect(page).toHaveURL(/\/writer/)
    
    // Create a new tab and switch to it (simulates Alt+Tab)
    const newTab = await context.newPage()
    await newTab.goto('about:blank')
    await newTab.bringToFront()
    
    // Wait for a moment (user is away)
    await page.waitForTimeout(1000)
    
    // Return to original tab (user returns to app)
    await page.bringToFront()
    
    // Wait for any potential redirects
    await page.waitForTimeout(3000)
    
    // Should still be on writer page
    await expect(page).toHaveURL(/\/writer/)
    
    await newTab.close()
  })

  test('should stay on explore page with visibility change events', async () => {
    // Navigate to explore page
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    // Verify we're on explore page
    await expect(page).toHaveURL(/\/explore/)
    
    // Simulate app losing focus (user switches to another app)
    await page.evaluate(() => {
      // Dispatch visibility change event
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    
    await page.waitForTimeout(500)
    
    // Simulate app regaining focus (user returns)
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    
    // Wait for any potential redirects
    await page.waitForTimeout(3000)
    
    // Should still be on explore page
    await expect(page).toHaveURL(/\/explore/)
  })

  test('should preserve query parameters after focus regain', async () => {
    // Navigate to writer with query params
    await page.goto('/writer?mode=edit&id=123')
    await page.waitForLoadState('networkidle')
    
    // Verify URL with params
    await expect(page).toHaveURL(/\/writer\?mode=edit&id=123/)
    
    // Simulate focus loss and regain
    const newTab = await context.newPage()
    await newTab.goto('about:blank')
    await newTab.bringToFront()
    await page.waitForTimeout(1000)
    await page.bringToFront()
    
    // Wait for potential redirects
    await page.waitForTimeout(3000)
    
    // Should preserve query parameters
    await expect(page).toHaveURL(/\/writer\?mode=edit&id=123/)
    
    await newTab.close()
  })

  test('should handle rapid focus changes without redirecting', async () => {
    // Navigate to main page
    await page.goto('/main')
    await page.waitForLoadState('networkidle')
    
    // Verify we're on main page
    await expect(page).toHaveURL(/\/main/)
    
    // Perform rapid focus changes
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.dispatchEvent(new Event('blur'))
      })
      await page.waitForTimeout(100)
      
      await page.evaluate(() => {
        window.dispatchEvent(new Event('focus'))
      })
      await page.waitForTimeout(100)
    }
    
    // Wait for any potential redirects
    await page.waitForTimeout(2000)
    
    // Should still be on main page
    await expect(page).toHaveURL(/\/main/)
  })

  test('should not redirect when page loads in background', async () => {
    // Create page but don't bring to front
    const backgroundPage = await context.newPage()
    
    // Navigate in background
    await backgroundPage.goto('/explore')
    await backgroundPage.waitForLoadState('networkidle')
    
    // Wait to see if any redirects occur
    await page.waitForTimeout(2000)
    
    // Bring to front
    await backgroundPage.bringToFront()
    
    // Should still be on explore page
    await expect(backgroundPage).toHaveURL(/\/explore/)
    
    await backgroundPage.close()
  })
})
