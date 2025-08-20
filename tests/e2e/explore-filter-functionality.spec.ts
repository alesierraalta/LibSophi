import { test, expect } from '@playwright/test'

test.describe('Explore Page - Filter Logic Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore')
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(3000)
  })

  test('Period Filter Logic Works - Today vs Week', async ({ page }) => {
    const todayButton = page.locator('button:has-text("Hoy")')
    const weekButton = page.locator('button:has-text("Semana")')
    
    // Start with week filter (default)
    await weekButton.click()
    await page.waitForTimeout(1000)
    
    // Get initial count
    const weekCount = await page.locator('[data-testid="work-card"]').count()
    const weekEmptyState = await page.locator('text=¡Eres pionero!').isVisible()
    
    // Switch to today filter
    await todayButton.click()
    await page.waitForTimeout(1000)
    
    // Get today count
    const todayCount = await page.locator('[data-testid="work-card"]').count()
    const todayEmptyState = await page.locator('text=¡Eres pionero!').isVisible()
    
    // Today filter should show same or fewer results than week
    // (since today is a subset of week)
    if (!weekEmptyState && !todayEmptyState) {
      expect(todayCount).toBeLessThanOrEqual(weekCount)
    }
    
    // Verify the filter is visually active
    await expect(todayButton).toHaveClass(/bg-red-600/)
  })

  test('Search Filter Logic Works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    
    // Get initial count without search
    const initialCount = await page.locator('[data-testid="work-card"]').count()
    const initialEmptyState = await page.locator('text=¡Eres pionero!').isVisible()
    
    // Apply a search filter
    await searchInput.fill('xyz123nonexistent')
    await page.waitForTimeout(1000)
    
    // Should show fewer or equal results
    const filteredCount = await page.locator('[data-testid="work-card"]').count()
    const filteredEmptyState = await page.locator('text=¡Eres pionero!').isVisible()
    
    if (!initialEmptyState) {
      // If we had content initially, filtering should reduce or maintain count
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
    }
    
    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(1000)
    
    // Should return to original state
    const clearedCount = await page.locator('[data-testid="work-card"]').count()
    const clearedEmptyState = await page.locator('text=¡Eres pionero!').isVisible()
    
    // After clearing, should have same state as initial
    expect(clearedCount).toBe(initialCount)
    expect(clearedEmptyState).toBe(initialEmptyState)
  })

  test('Type Filter Logic Works', async ({ page }) => {
    const todoButton = page.locator('button:has-text("Todo")')
    const ficcionButton = page.locator('button:has-text("Ficción")')
    
    // Start with "Todo" (all types)
    await todoButton.click()
    await page.waitForTimeout(1000)
    
    const allTypesCount = await page.locator('[data-testid="work-card"]').count()
    const allTypesEmptyState = await page.locator('text=¡Eres pionero!').isVisible()
    
    // Switch to "Ficción" only
    await ficcionButton.click()
    await page.waitForTimeout(1000)
    
    const fictionCount = await page.locator('[data-testid="work-card"]').count()
    const fictionEmptyState = await page.locator('text=¡Eres pionero!').isVisible()
    
    // Fiction filter should show same or fewer results than all types
    if (!allTypesEmptyState && !fictionEmptyState) {
      expect(fictionCount).toBeLessThanOrEqual(allTypesCount)
    }
    
    // Verify the filter is visually active
    await expect(ficcionButton).toHaveClass(/bg-red-600/)
  })

  test('Combined Filters Work Together', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    const ficcionButton = page.locator('button:has-text("Ficción")')
    const todayButton = page.locator('button:has-text("Hoy")')
    
    // Get baseline count
    const baselineCount = await page.locator('[data-testid="work-card"]').count()
    
    // Apply search filter
    await searchInput.fill('test')
    await page.waitForTimeout(500)
    
    const searchCount = await page.locator('[data-testid="work-card"]').count()
    
    // Apply type filter
    await ficcionButton.click()
    await page.waitForTimeout(500)
    
    const searchAndTypeCount = await page.locator('[data-testid="work-card"]').count()
    
    // Apply period filter
    await todayButton.click()
    await page.waitForTimeout(500)
    
    const allFiltersCount = await page.locator('[data-testid="work-card"]').count()
    
    // Each additional filter should reduce or maintain the count
    // (unless we're in empty state from the beginning)
    if (baselineCount > 0) {
      expect(allFiltersCount).toBeLessThanOrEqual(searchAndTypeCount)
      expect(searchAndTypeCount).toBeLessThanOrEqual(searchCount)
      expect(searchCount).toBeLessThanOrEqual(baselineCount)
    }
    
    // All filters should be visually active
    expect(await searchInput.inputValue()).toBe('test')
    await expect(ficcionButton).toHaveClass(/bg-red-600/)
    await expect(todayButton).toHaveClass(/bg-red-600/)
  })

  test('Filter Reset Restores Original State', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    const ficcionButton = page.locator('button:has-text("Ficción")')
    const todoButton = page.locator('button:has-text("Todo")')
    const weekButton = page.locator('button:has-text("Semana")')
    
    // Get original state
    const originalCount = await page.locator('[data-testid="work-card"]').count()
    const originalEmptyState = await page.locator('text=¡Eres pionero!').isVisible()
    
    // Apply multiple filters
    await searchInput.fill('search term')
    await ficcionButton.click()
    await page.waitForTimeout(1000)
    
    // Verify filters are applied
    expect(await searchInput.inputValue()).toBe('search term')
    await expect(ficcionButton).toHaveClass(/bg-red-600/)
    
    // Reset filters
    await searchInput.clear()
    await todoButton.click()
    await weekButton.click() // Default period
    await page.waitForTimeout(1000)
    
    // Verify reset
    expect(await searchInput.inputValue()).toBe('')
    await expect(todoButton).toHaveClass(/bg-red-600/)
    await expect(weekButton).toHaveClass(/bg-red-600/)
    
    // Should return to original state
    const resetCount = await page.locator('[data-testid="work-card"]').count()
    const resetEmptyState = await page.locator('text=¡Eres pionero!').isVisible()
    
    expect(resetCount).toBe(originalCount)
    expect(resetEmptyState).toBe(originalEmptyState)
  })

  test('Trending Tags Click Updates Search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    
    // Wait for trending tags to potentially load
    await page.waitForTimeout(2000)
    
    const trendingTags = page.locator('[role="listitem"]')
    const tagCount = await trendingTags.count()
    
    if (tagCount > 0) {
      // Click first trending tag
      await trendingTags.first().click()
      await page.waitForTimeout(500)
      
      // Search input should be populated
      const searchValue = await searchInput.inputValue()
      expect(searchValue.length).toBeGreaterThan(0)
      
      // Should not contain the # symbol (it gets removed)
      expect(searchValue.startsWith('#')).toBe(false)
    } else {
      console.log('No trending tags available - test skipped')
    }
  })

  test('Empty State Message Is Appropriate', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    
    // Apply a filter that should return no results
    await searchInput.fill('xyz123definitely-nonexistent-search-term-12345')
    await page.waitForTimeout(1000)
    
    const hasContent = await page.locator('[data-testid="work-card"]').count() > 0
    
    if (!hasContent) {
      // Should show appropriate empty state
      const hasEmptyMessage = await page.locator('text=¡Eres pionero!').isVisible() ||
                             await page.locator('text=No hay obras').isVisible()
      
      expect(hasEmptyMessage).toBe(true)
      
      // If it's the pioneer message, should have action buttons
      const pioneerMessage = await page.locator('text=¡Eres pionero!').isVisible()
      if (pioneerMessage) {
        const createButton = page.locator('button:has-text("Crear Nueva Obra")')
        const feedButton = page.locator('button:has-text("Ver Mi Feed")')
        
        await expect(createButton).toBeVisible()
        await expect(feedButton).toBeVisible()
      }
    }
  })
})
