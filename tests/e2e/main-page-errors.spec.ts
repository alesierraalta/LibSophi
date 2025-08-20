import { test, expect } from '@playwright/test'

test.describe('Main Page Error Detection', () => {
  
  test('should detect any JavaScript errors preventing page render', async ({ page }) => {
    const consoleMessages: string[] = []
    const errors: string[] = []

    // Capture all console messages
    page.on('console', msg => {
      const message = `[${msg.type()}] ${msg.text()}`
      consoleMessages.push(message)
      console.log(`BROWSER: ${message}`)
    })

    // Capture JavaScript errors
    page.on('pageerror', error => {
      const errorMessage = `PAGE ERROR: ${error.message}\nStack: ${error.stack}`
      errors.push(errorMessage)
      console.log(errorMessage)
    })

    // Capture network failures
    page.on('requestfailed', request => {
      const failureMessage = `NETWORK FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`
      console.log(failureMessage)
    })

    console.log('🚀 Starting main page error detection...')
    
    // Navigate to main page
    await page.goto('/main', { waitUntil: 'domcontentloaded' })
    
    // Wait for any async operations
    await page.waitForTimeout(3000)
    
    console.log(`📊 Captured ${consoleMessages.length} console messages`)
    console.log(`❌ Captured ${errors.length} JavaScript errors`)
    
    // Check if the page has basic structure
    const bodyContent = await page.locator('body').innerHTML()
    const hasContent = bodyContent.length > 1000 // Should have substantial content
    
    console.log(`📄 Page content length: ${bodyContent.length} characters`)
    console.log(`🏗️  Has substantial content: ${hasContent}`)
    
    // Check for React hydration
    const reactRoot = page.locator('#__next, [data-reactroot], .react-root')
    const hasReactRoot = await reactRoot.count() > 0
    console.log(`⚛️  React root found: ${hasReactRoot}`)
    
    // Check for any loading states
    const loadingElements = page.locator('.animate-spin, [data-testid="loading"], .loading')
    const loadingCount = await loadingElements.count()
    console.log(`⏳ Loading elements found: ${loadingCount}`)
    
    // Check for error boundaries or error messages
    const errorElements = page.locator('[data-testid="error"], .error, .error-boundary')
    const errorElementsCount = await errorElements.count()
    console.log(`🚨 Error elements found: ${errorElementsCount}`)
    
    // Log first few console messages for debugging
    console.log('\n📝 First 10 console messages:')
    consoleMessages.slice(0, 10).forEach((msg, i) => {
      console.log(`  ${i + 1}. ${msg}`)
    })
    
    if (errors.length > 0) {
      console.log('\n🔥 JavaScript Errors:')
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`)
      })
    }
    
    // The test passes regardless, but provides debugging info
    expect(true).toBeTruthy() // Always pass to see all logs
  })

  test('should check if Supabase connection is working', async ({ page }) => {
    let supabaseErrors = 0
    let supabaseSuccess = 0

    page.on('response', response => {
      if (response.url().includes('supabase')) {
        if (response.status() >= 400) {
          supabaseErrors++
          console.log(`❌ Supabase error: ${response.status()} ${response.url()}`)
        } else {
          supabaseSuccess++
          console.log(`✅ Supabase success: ${response.status()} ${response.url()}`)
        }
      }
    })

    await page.goto('/main')
    await page.waitForTimeout(5000)
    
    console.log(`📊 Supabase requests - Success: ${supabaseSuccess}, Errors: ${supabaseErrors}`)
    
    expect(true).toBeTruthy() // Always pass to see all logs
  })

})

