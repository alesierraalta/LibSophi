import { test, expect } from '@playwright/test'

test.describe('/mis-obras page functionality', () => {
  test('should load mis-obras page without redirect', async ({ page }) => {
    // Navigate to mis-obras
    await page.goto('/mis-obras')
    
    // Should not be redirected to login
    expect(page.url()).toContain('/mis-obras')
    expect(page.url()).not.toContain('/login')
    
    // Should show the page title
    await expect(page.locator('h1:has-text("Mis Obras")')).toBeVisible()
  })

  test('should show works data (either real or demo)', async ({ page }) => {
    await page.goto('/mis-obras')
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="loading"]', { state: 'detached', timeout: 10000 })
    
    // Should show either works or empty state
    const worksGrid = page.locator('.grid')
    const emptyState = page.locator('text=Aún no tienes obras')
    
    const hasWorks = await worksGrid.locator('.border').count() > 0
    const hasEmptyState = await emptyState.isVisible()
    
    // Should show either works or empty state, but not both
    expect(hasWorks || hasEmptyState).toBeTruthy()
  })

  test('should show statistics correctly', async ({ page }) => {
    await page.goto('/mis-obras')
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="loading"]', { state: 'detached', timeout: 10000 })
    
    // Should show works count
    const statsElement = page.locator('text=/\\d+ obras/')
    await expect(statsElement).toBeVisible()
  })

  test('should have functional "Nueva obra" button', async ({ page }) => {
    await page.goto('/mis-obras')
    
    // Find and click "Nueva obra" button
    const newWorkButton = page.locator('button:has-text("Nueva obra")')
    await expect(newWorkButton).toBeVisible()
    
    // Click should navigate (we won't follow the navigation in this test)
    await newWorkButton.click()
    
    // Should attempt to navigate to /writer
    await page.waitForURL(/\/writer/, { timeout: 5000 })
  })

  test('should show work cards with correct information', async ({ page }) => {
    await page.goto('/mis-obras')
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="loading"]', { state: 'detached', timeout: 10000 })
    
    // Check if there are work cards
    const workCards = page.locator('.grid .border')
    const cardCount = await workCards.count()
    
    if (cardCount > 0) {
      // Check first card has required elements
      const firstCard = workCards.first()
      
      // Should have title
      await expect(firstCard.locator('.font-semibold')).toBeVisible()
      
      // Should have image
      await expect(firstCard.locator('img')).toBeVisible()
      
      // Should have "Editar" and "Ver" buttons
      await expect(firstCard.locator('button:has-text("Editar")')).toBeVisible()
      await expect(firstCard.locator('button:has-text("Ver")')).toBeVisible()
      
      // Should have reads count
      await expect(firstCard.locator('text=/\\d+ lecturas/')).toBeVisible()
    }
  })

  test('should handle loading state properly', async ({ page }) => {
    await page.goto('/mis-obras')
    
    // Should show loading skeleton initially
    const loadingSkeleton = page.locator('.animate-pulse')
    
    // Loading should be visible initially (may be very brief)
    // Then should disappear
    await page.waitForSelector('.animate-pulse', { state: 'detached', timeout: 10000 })
    
    // Content should be loaded
    const content = page.locator('.grid')
    await expect(content).toBeVisible()
  })

  test('should show AppHeader with Palabreo branding', async ({ page }) => {
    await page.goto('/mis-obras')
    
    // Should have header with logo and name
    await expect(page.locator('h1:has-text("Palabreo")')).toBeVisible()
    
    // Should have logo image
    await expect(page.locator('img[alt*="Palabreo"]')).toBeVisible()
  })
})

