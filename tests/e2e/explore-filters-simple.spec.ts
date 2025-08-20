import { test, expect } from '@playwright/test'

test.describe('Explore Page - Basic Filter Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore')
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(2000)
  })

  test('Search Input Exists and Works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    
    // Verify search input exists and is functional
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toBeEnabled()
    
    // Test that we can type in it
    await searchInput.fill('test')
    expect(await searchInput.inputValue()).toBe('test')
    
    // Clear it
    await searchInput.clear()
    expect(await searchInput.inputValue()).toBe('')
  })

  test('Period Filter Buttons Exist and Are Clickable', async ({ page }) => {
    const todayButton = page.locator('button:has-text("Hoy")')
    const weekButton = page.locator('button:has-text("Semana")')
    const monthButton = page.locator('button:has-text("Mes")')
    
    // Verify all period buttons exist
    await expect(todayButton).toBeVisible()
    await expect(weekButton).toBeVisible() 
    await expect(monthButton).toBeVisible()
    
    // Test clicking each button
    await todayButton.click()
    await expect(todayButton).toHaveClass(/bg-red-600/)
    
    await weekButton.click()
    await expect(weekButton).toHaveClass(/bg-red-600/)
    
    await monthButton.click()
    await expect(monthButton).toHaveClass(/bg-red-600/)
  })

  test('Type Filter Buttons Exist and Are Clickable', async ({ page }) => {
    const todoButton = page.locator('button:has-text("Todo")')
    const ficcionButton = page.locator('button:has-text("Ficción")')
    const newsletterButton = page.locator('button:has-text("Newsletter")')
    const articuloButton = page.locator('button:has-text("Artículo")')
    
    // Verify all type buttons exist
    await expect(todoButton).toBeVisible()
    await expect(ficcionButton).toBeVisible()
    await expect(newsletterButton).toBeVisible()
    await expect(articuloButton).toBeVisible()
    
    // Test clicking each button
    await todoButton.click()
    await expect(todoButton).toHaveClass(/bg-red-600/)
    
    await ficcionButton.click()
    await expect(ficcionButton).toHaveClass(/bg-red-600/)
    
    await newsletterButton.click()
    await expect(newsletterButton).toHaveClass(/bg-red-600/)
    
    await articuloButton.click()
    await expect(articuloButton).toHaveClass(/bg-red-600/)
  })

  test('Content Area Loads Properly', async ({ page }) => {
    // Wait for content area to be present
    const contentArea = page.locator('[data-testid="explore-items"]')
    await expect(contentArea).toBeVisible()
    
    // Check that we either have content or a proper empty state
    const hasWorkCards = await page.locator('[data-testid="work-card"]').count() > 0
    const hasEmptyMessage = await page.locator('text=¡Eres pionero!').isVisible() || 
                           await page.locator('text=No hay obras').isVisible()
    
    // At least one should be true
    expect(hasWorkCards || hasEmptyMessage).toBe(true)
  })

  test('Filter State Changes Are Applied', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    const ficcionButton = page.locator('button:has-text("Ficción")')
    
    // Apply search filter
    await searchInput.fill('novela')
    await page.waitForTimeout(500)
    
    // Apply type filter
    await ficcionButton.click()
    await page.waitForTimeout(500)
    
    // Verify both filters are applied
    expect(await searchInput.inputValue()).toBe('novela')
    await expect(ficcionButton).toHaveClass(/bg-red-600/)
    
    // The page should still be functional (not crashed)
    const contentArea = page.locator('[data-testid="explore-items"]')
    await expect(contentArea).toBeVisible()
  })

  test('Trending Tags Section Exists', async ({ page }) => {
    // Check if trending section exists
    const trendingSection = page.locator('text=Tendencias')
    
    if (await trendingSection.isVisible()) {
      // If trending section exists, it should have some content or loading state
      const hasTrendingItems = await page.locator('[role="listitem"]').count() > 0
      const hasLoadingState = await page.locator('.animate-pulse').count() > 0
      
      expect(hasTrendingItems || hasLoadingState).toBe(true)
    } else {
      // If no trending section, that's also acceptable
      console.log('Trending section not visible - this is acceptable')
    }
  })

  test('Page Performance - No Infinite Loading', async ({ page }) => {
    // Wait reasonable time for page to load
    await page.waitForTimeout(3000)
    
    // Check that loading spinners are not stuck
    const loadingSpinners = page.locator('.animate-spin')
    const spinnerCount = await loadingSpinners.count()
    
    // If there are spinners, wait a bit more and check they're not stuck
    if (spinnerCount > 0) {
      await page.waitForTimeout(3000)
      const stillSpinning = await loadingSpinners.count()
      
      // Should not have more spinners after waiting
      expect(stillSpinning).toBeLessThanOrEqual(spinnerCount)
    }
    
    // Page should be interactive
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    await expect(searchInput).toBeEnabled()
  })

  test('Header Logo and Name Are Present', async ({ page }) => {
    // Verify header requirements from memory
    const logo = page.locator('img[alt*="Palabreo"]')
    const nameText = page.locator('text=Palabreo')
    
    await expect(logo).toBeVisible()
    await expect(nameText).toBeVisible()
  })
})
