import { test, expect } from '@playwright/test'

test.describe('Main Page Debug', () => {
  
  test('should load main page and show console logs', async ({ page }) => {
    // Listen to console messages
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`)
      }
    })

    // Listen to page errors
    page.on('pageerror', error => {
      console.log(`BROWSER ERROR: ${error.message}`)
    })

    console.log('Navigating to /main...')
    await page.goto('/main')
    
    console.log('Waiting for page to load...')
    await page.waitForLoadState('networkidle')
    
    // Wait a bit more for data loading
    await page.waitForTimeout(5000)
    
    console.log('Checking page content...')
    
    // Check if header is present
    const header = page.locator('header')
    const headerVisible = await header.isVisible()
    console.log(`Header visible: ${headerVisible}`)
    
    // Check if posts container exists
    const postsContainer = page.locator('.bg-white.border.border-gray-200')
    const postsCount = await postsContainer.count()
    console.log(`Posts found: ${postsCount}`)
    
    // Check if loading indicator is present
    const loadingIndicator = page.locator('.animate-spin, text=Cargando')
    const isLoading = await loadingIndicator.isVisible().catch(() => false)
    console.log(`Still loading: ${isLoading}`)
    
    // Check page title
    const title = await page.title()
    console.log(`Page title: "${title}"`)
    
    // Check if there are any error messages
    const errorMessages = page.locator('text=Error, text=error, text=Failed, text=failed')
    const errorCount = await errorMessages.count()
    console.log(`Error messages found: ${errorCount}`)
    
    // Check for empty state
    const emptyState = page.locator('text=No hay publicaciones, text=Sin publicaciones, text=No posts')
    const emptyStateVisible = await emptyState.isVisible().catch(() => false)
    console.log(`Empty state visible: ${emptyStateVisible}`)
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-main-page.png', fullPage: true })
    console.log('Screenshot saved as debug-main-page.png')
  })

})

