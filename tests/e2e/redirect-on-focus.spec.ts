import { test, expect, type Page, type BrowserContext } from '@playwright/test'

test.describe('Redirect on Focus Bug', () => {
  let context: BrowserContext
  let page: Page

  test.beforeEach(async ({ browser }) => {
    // Create a new browser context for each test
    context = await browser.newContext()
    page = await context.newPage()
    
    // Set up console logging to catch any redirect-related logs
    page.on('console', msg => {
      if (msg.text().includes('redirect') || msg.text().includes('navigation')) {
        console.log('Browser console:', msg.text())
      }
    })
  })

  test.afterEach(async () => {
    await context.close()
  })

  test('should not redirect to /main when returning focus to a different route', async () => {
    // Navigate to a non-main route
    await page.goto('/writer')
    await page.waitForLoadState('networkidle')
    
    // Verify we're on the writer page
    await expect(page).toHaveURL(/\/writer/)
    await expect(page.locator('text=Nueva obra')).toBeVisible()
    
    // Simulate losing focus by creating a new tab and switching to it
    const newPage = await context.newPage()
    await newPage.goto('about:blank')
    await newPage.bringToFront()
    
    // Wait a moment to simulate user being away
    await page.waitForTimeout(1000)
    
    // Simulate regaining focus by switching back to original page
    await page.bringToFront()
    
    // Wait for any potential redirects to occur
    await page.waitForTimeout(2000)
    
    // Assert that we're still on the writer page, not redirected to /main
    await expect(page).toHaveURL(/\/writer/)
    await expect(page.locator('text=Nueva obra')).toBeVisible()
    
    await newPage.close()
  })

  test('should not redirect to /main when using visibilitychange event', async () => {
    // Navigate to explore page
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    // Verify we're on the explore page
    await expect(page).toHaveURL(/\/explore/)
    
    // Simulate tab becoming hidden (user switches to another app)
    await page.evaluate(() => {
      // Dispatch visibilitychange event to simulate tab becoming hidden
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true
      })
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    
    await page.waitForTimeout(500)
    
    // Simulate tab becoming visible again (user returns to the app)
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true
      })
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    
    // Wait for any potential redirects
    await page.waitForTimeout(2000)
    
    // Assert we're still on explore page
    await expect(page).toHaveURL(/\/explore/)
  })

  test('should not redirect to /main when using focus/blur events', async () => {
    // Navigate to explore page (public route)
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    // Verify we're on the explore page
    await expect(page).toHaveURL(/\/explore/)
    
    // Simulate window losing focus
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'))
    })
    
    await page.waitForTimeout(500)
    
    // Simulate window regaining focus
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'))
    })
    
    // Wait for any potential redirects
    await page.waitForTimeout(2000)
    
    // Assert we're still on explore page
    await expect(page).toHaveURL(/\/explore/)
  })

  test('should not redirect when switching between multiple tabs rapidly', async () => {
    // Navigate to mis-obras page
    await page.goto('/mis-obras')
    await page.waitForLoadState('networkidle')
    
    // Verify we're on the mis-obras page
    await expect(page).toHaveURL(/\/mis-obras/)
    
    // Create multiple tabs and switch between them rapidly
    const tabs = []
    for (let i = 0; i < 3; i++) {
      const newTab = await context.newPage()
      await newTab.goto('about:blank')
      tabs.push(newTab)
    }
    
    // Rapidly switch between tabs
    for (let i = 0; i < 5; i++) {
      await tabs[i % tabs.length].bringToFront()
      await page.waitForTimeout(200)
      await page.bringToFront()
      await page.waitForTimeout(200)
    }
    
    // Wait for any potential redirects
    await page.waitForTimeout(2000)
    
    // Assert we're still on mis-obras page
    await expect(page).toHaveURL(/\/mis-obras/)
    
    // Clean up tabs
    for (const tab of tabs) {
      await tab.close()
    }
  })

  test('should not redirect when authenticated user returns focus to public route', async () => {
    // First, let's create a test user and login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    
    // Mock successful login by intercepting the auth request
    await page.route('**/auth/v1/token*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' }
          }
        })
      })
    })
    
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)
    
    // Navigate to a public route like explore
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/explore/)
    
    // Simulate focus loss and regain
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'))
    })
    await page.waitForTimeout(500)
    
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'))
    })
    
    // Wait for any potential redirects
    await page.waitForTimeout(2000)
    
    // Should still be on explore, not redirected to /main
    await expect(page).toHaveURL(/\/explore/)
  })

  test('should handle multiple focus/blur cycles without redirecting', async () => {
    // Navigate to search page
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    
    // Verify we're on the search page
    await expect(page).toHaveURL(/\/search/)
    
    // Perform multiple focus/blur cycles
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => {
        // Simulate both visibility and focus events
        Object.defineProperty(document, 'visibilityState', {
          value: 'hidden',
          writable: true
        })
        document.dispatchEvent(new Event('visibilitychange'))
        window.dispatchEvent(new Event('blur'))
      })
      
      await page.waitForTimeout(100)
      
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          writable: true
        })
        document.dispatchEvent(new Event('visibilitychange'))
        window.dispatchEvent(new Event('focus'))
      })
      
      await page.waitForTimeout(100)
    }
    
    // Wait for any potential redirects
    await page.waitForTimeout(2000)
    
    // Should still be on search page
    await expect(page).toHaveURL(/\/search/)
  })

  test('should preserve query parameters when focus is regained', async () => {
    // Navigate to writer page with query parameters
    await page.goto('/writer?edit=123&chapter=2')
    await page.waitForLoadState('networkidle')
    
    // Verify we're on the writer page with correct params
    await expect(page).toHaveURL(/\/writer\?edit=123&chapter=2/)
    
    // Simulate focus loss and regain
    const newTab = await context.newPage()
    await newTab.goto('about:blank')
    await newTab.bringToFront()
    await page.waitForTimeout(1000)
    await page.bringToFront()
    
    // Wait for any potential redirects
    await page.waitForTimeout(2000)
    
    // Should still be on writer page with same query parameters
    await expect(page).toHaveURL(/\/writer\?edit=123&chapter=2/)
    
    await newTab.close()
  })

  test('should not redirect when page is loaded in background tab', async () => {
    // Create a new tab but don't bring it to front
    const backgroundPage = await context.newPage()
    
    // Navigate to writer page in background
    await backgroundPage.goto('/writer')
    await backgroundPage.waitForLoadState('networkidle')
    
    // Verify the page loaded correctly
    await expect(backgroundPage).toHaveURL(/\/writer/)
    
    // Wait some time to see if any redirects occur
    await page.waitForTimeout(3000)
    
    // Bring the background page to front
    await backgroundPage.bringToFront()
    
    // Should still be on writer page, not redirected
    await expect(backgroundPage).toHaveURL(/\/writer/)
    await expect(backgroundPage.locator('text=Nueva obra')).toBeVisible()
    
    await backgroundPage.close()
  })
})

// Test configuration for different browsers
test.describe.configure({ mode: 'parallel' })
