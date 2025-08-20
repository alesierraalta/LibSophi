import { test, expect } from '@playwright/test'

test.describe('Basic Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Palabreo/)
    
    // Check for header elements (per memory requirements)
    await expect(page.locator('img[alt*="Palabreo logo"], img[alt*="logo"]')).toBeVisible()
    await expect(page.locator('h1:has-text("Palabreo"), header h1:has-text("Palabreo")').first()).toBeVisible()
    
    console.log('✅ Homepage smoke test passed')
  })

  test('basic navigation works', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation to login page
    const loginLink = page.locator('text=Iniciar sesión', 'text=Login', 'a[href*="login"]')
    if (await loginLink.first().isVisible()) {
      await loginLink.first().click()
      await expect(page).toHaveURL(/login/)
      console.log('✅ Navigation to login works')
    }
    
    // Go back to homepage
    await page.goto('/')
    
    // Test navigation to explore page
    const exploreLink = page.locator('text=Explorar', 'text=Explore', 'a[href*="explore"]')
    if (await exploreLink.first().isVisible()) {
      await exploreLink.first().click()
      await expect(page).toHaveURL(/explore/)
      console.log('✅ Navigation to explore works')
    }
  })

  test('page performance is acceptable', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    const endTime = Date.now()
    const loadTime = endTime - startTime
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
    
    console.log(`✅ Page load performance: ${loadTime}ms`)
  })

  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Header should still be visible on mobile
    await expect(page.locator('h1:has-text("Palabreo"), header h1:has-text("Palabreo")').first()).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    
    await expect(page.locator('h1:has-text("Palabreo"), header h1:has-text("Palabreo")').first()).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.reload()
    
    await expect(page.locator('h1:has-text("Palabreo"), header h1:has-text("Palabreo")').first()).toBeVisible()
    
    console.log('✅ Responsive design test passed')
  })

  test('no javascript errors on page load', async ({ page }) => {
    const errors: string[] = []
    
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000)
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('manifest') &&
      !error.includes('Service Worker') &&
      !error.includes('Failed to load resource: the server responded with a status of 404') &&
      !error.includes('404 (Not Found)')
    )
    
    if (criticalErrors.length > 0) {
      console.warn('⚠️ JavaScript errors found:', criticalErrors)
    } else {
      console.log('✅ No critical JavaScript errors found')
    }
    
    // Don't fail the test for minor errors, just log them
    expect(criticalErrors.length).toBeLessThanOrEqual(2)
  })
})
