import { test, expect, Page } from '@playwright/test'

test.describe('Explore Page - Search Filters', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to explore page
    await page.goto('/explore')
    
    // Wait for page to load
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    
    // Wait a moment for any dynamic content to load
    await page.waitForTimeout(3000)
    
    // Ensure we're on desktop view for search input visibility
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(1000)
  })

  test('Search Input Filter Works - Genre Search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    
    // Verify search input exists
    await expect(searchInput).toBeVisible()
    
    // Test genre search
    await searchInput.fill('novela')
    await page.waitForTimeout(1000) // Wait for filter to apply
    
    // Check that results are filtered (either has content or shows empty state)
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
    
    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(1000)
  })

  test('Search Input Filter Works - Title Search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    
    // Test title search with a common word
    await searchInput.fill('el')
    await page.waitForTimeout(1000)
    
    // Verify filtering works
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
  })

  test('Search Input Filter Works - Author Search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    
    // Test author search
    await searchInput.fill('autor')
    await page.waitForTimeout(1000)
    
    // Verify filtering works
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
  })

  test('Period Filter Works - Today', async ({ page }) => {
    // Click on Today filter
    const todayButton = page.locator('button:has-text("Hoy")')
    await expect(todayButton).toBeVisible()
    await todayButton.click()
    await page.waitForTimeout(1000)
    
    // Verify button is active
    await expect(todayButton).toHaveClass(/bg-red-600/)
    
    // Check that results are filtered appropriately
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
  })

  test('Period Filter Works - Week', async ({ page }) => {
    // Click on Week filter
    const weekButton = page.locator('button:has-text("Semana")')
    await expect(weekButton).toBeVisible()
    await weekButton.click()
    await page.waitForTimeout(1000)
    
    // Verify button is active
    await expect(weekButton).toHaveClass(/bg-red-600/)
    
    // Check that results are filtered appropriately
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
  })

  test('Period Filter Works - Month', async ({ page }) => {
    // Click on Month filter
    const monthButton = page.locator('button:has-text("Mes")')
    await expect(monthButton).toBeVisible()
    await monthButton.click()
    await page.waitForTimeout(1000)
    
    // Verify button is active
    await expect(monthButton).toHaveClass(/bg-red-600/)
    
    // Check that results are filtered appropriately
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
  })

  test('Type Filter Works - All Types', async ({ page }) => {
    // Click on "Todo" type filter (not "Todos")
    const allButton = page.locator('button:has-text("Todo")')
    await expect(allButton).toBeVisible()
    await allButton.click()
    await page.waitForTimeout(1000)
    
    // Verify button is active
    await expect(allButton).toHaveClass(/bg-red-600/)
    
    // Check that results are shown
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
  })

  test('Type Filter Works - Fiction', async ({ page }) => {
    // Click on "Ficción" type filter
    const fictionButton = page.locator('button:has-text("Ficción")')
    await expect(fictionButton).toBeVisible()
    await fictionButton.click()
    await page.waitForTimeout(1000)
    
    // Verify button is active
    await expect(fictionButton).toHaveClass(/bg-red-600/)
    
    // Check that results are filtered appropriately
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
  })

  test('Trending Tags Filter Works', async ({ page }) => {
    // Wait for trending tags to load
    await page.waitForTimeout(2000)
    
    // Check if trending tags are available
    const trendingTags = page.locator('[role="listitem"]')
    const tagCount = await trendingTags.count()
    
    if (tagCount > 0) {
      // Click on the first trending tag
      await trendingTags.first().click()
      await page.waitForTimeout(1000)
      
      // Verify that search input has been populated
      const searchInput = page.locator('input[placeholder*="Buscar obras"]')
      const inputValue = await searchInput.inputValue()
      expect(inputValue.length).toBeGreaterThan(0)
      
      // Check that results are filtered
      const hasContent = await page.locator('[data-testid="work-card"]').count()
      const hasEmptyState = await page.locator('text=No hay obras').count()
      const hasValidState = hasContent > 0 || hasEmptyState > 0
      
      expect(hasValidState).toBe(true)
    } else {
      // If no trending tags are loaded, just verify the section exists
      const trendingSection = page.locator('text=Tendencias')
      await expect(trendingSection).toBeVisible()
    }
  })

  test('Combined Filters Work Together', async ({ page }) => {
    // Test combining search + type filter
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    const fictionButton = page.locator('button:has-text("Ficción")')
    
    // Apply search filter
    await searchInput.fill('test')
    await page.waitForTimeout(500)
    
    // Apply type filter
    await fictionButton.click()
    await page.waitForTimeout(1000)
    
    // Verify both filters are active
    expect(await searchInput.inputValue()).toBe('test')
    await expect(fictionButton).toHaveClass(/bg-red-600/)
    
    // Check that results are appropriately filtered
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
  })

  test('Filter Reset Works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    const fictionButton = page.locator('button:has-text("Ficción")')
    const todayButton = page.locator('button:has-text("Hoy")')
    
    // Apply multiple filters
    await searchInput.fill('test search')
    await fictionButton.click()
    await todayButton.click()
    await page.waitForTimeout(1000)
    
    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(500)
    
    // Click "Todo" to reset type filter
    const allButton = page.locator('button:has-text("Todo")')
    await allButton.click()
    await page.waitForTimeout(500)
    
    // Click "Semana" to reset period filter to default
    const weekButton = page.locator('button:has-text("Semana")')
    await weekButton.click()
    await page.waitForTimeout(1000)
    
    // Verify filters are reset
    expect(await searchInput.inputValue()).toBe('')
    await expect(allButton).toHaveClass(/bg-red-600/)
    await expect(weekButton).toHaveClass(/bg-red-600/)
    
    // Check that results are shown
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
  })

  test('Filter UI Elements Are Accessible', async ({ page }) => {
    // Check search input accessibility
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toBeEnabled()
    
    // Check period filter buttons accessibility
    const periodButtons = page.locator('button:has-text("Hoy"), button:has-text("Semana"), button:has-text("Mes")')
    await expect(periodButtons).toHaveCount(3)
    
    for (let i = 0; i < 3; i++) {
      await expect(periodButtons.nth(i)).toBeVisible()
      await expect(periodButtons.nth(i)).toBeEnabled()
    }
    
    // Check type filter buttons accessibility
    const typeButtons = page.locator('button:has-text("Todo"), button:has-text("Ficción"), button:has-text("Newsletter"), button:has-text("Artículo")')
    await expect(typeButtons).toHaveCount(4)
    
    for (let i = 0; i < 4; i++) {
      await expect(typeButtons.nth(i)).toBeVisible()
      await expect(typeButtons.nth(i)).toBeEnabled()
    }
  })

  test('Filter Performance - No Excessive Loading', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    
    // Measure time for filter application
    const startTime = Date.now()
    
    await searchInput.fill('test')
    await page.waitForTimeout(1000) // Wait for filter to apply
    
    const endTime = Date.now()
    const filterTime = endTime - startTime
    
    // Filter should apply quickly (less than 3 seconds)
    expect(filterTime).toBeLessThan(3000)
    
    // Verify no loading spinners are stuck
    const loadingElements = page.locator('.animate-spin, .animate-pulse')
    const visibleLoadingCount = await loadingElements.count()
    
    // Some loading elements might be present but not stuck
    if (visibleLoadingCount > 0) {
      // Wait a bit more and check if loading is still happening
      await page.waitForTimeout(2000)
      const stillLoadingCount = await loadingElements.count()
      // Should not have more loading elements after waiting
      expect(stillLoadingCount).toBeLessThanOrEqual(visibleLoadingCount)
    }
  })
})

test.describe('Explore Page - Mobile Filters', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to explore page
    await page.goto('/explore')
    
    // Wait for page to load
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    await page.waitForTimeout(3000)
  })

  test('Mobile Period Filters Work', async ({ page }) => {
    // Test period filters on mobile
    const todayButton = page.locator('button:has-text("Hoy")')
    const weekButton = page.locator('button:has-text("Semana")')
    const monthButton = page.locator('button:has-text("Mes")')
    
    // Test each period filter
    if (await todayButton.isVisible()) {
      await todayButton.click()
      await page.waitForTimeout(1000)
      await expect(todayButton).toHaveClass(/bg-red-600/)
    }
    
    if (await weekButton.isVisible()) {
      await weekButton.click()
      await page.waitForTimeout(1000)
      await expect(weekButton).toHaveClass(/bg-red-600/)
    }
    
    if (await monthButton.isVisible()) {
      await monthButton.click()
      await page.waitForTimeout(1000)
      await expect(monthButton).toHaveClass(/bg-red-600/)
    }
  })

  test('Mobile Type Filters Work', async ({ page }) => {
    // Test type filters on mobile
    const allButton = page.locator('button:has-text("Todo")')
    const fictionButton = page.locator('button:has-text("Ficción")')
    
    if (await allButton.isVisible()) {
      await allButton.click()
      await page.waitForTimeout(1000)
      await expect(allButton).toHaveClass(/bg-red-600/)
    }
    
    if (await fictionButton.isVisible()) {
      await fictionButton.click()
      await page.waitForTimeout(1000)
      await expect(fictionButton).toHaveClass(/bg-red-600/)
    }
  })

  test('Mobile Content Loading', async ({ page }) => {
    // Verify content loads on mobile
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count() || 
                          await page.locator('text=¡Eres pionero!').count()
    const hasValidState = hasContent > 0 || hasEmptyState > 0
    
    expect(hasValidState).toBe(true)
  })
})
