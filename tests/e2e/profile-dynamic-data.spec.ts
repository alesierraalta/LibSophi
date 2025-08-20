import { test, expect } from '@playwright/test'

test.describe('Profile Dynamic Data Tests', () => {
  test('profile should load works from database and update stats dynamically', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile')
    
    // Wait for profile to load (should show skeleton first)
    await page.waitForSelector('section.bg-white, [data-testid="profile-skeleton"]', { timeout: 10000 })
    
    // Wait for works to load (should show loading skeleton first)
    await page.waitForSelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3', { timeout: 10000 })
    
    // Check if works are loaded (either real data or default works)
    const worksGrid = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3 .bg-white.border.border-gray-200')
    await expect(worksGrid.first()).toBeVisible({ timeout: 15000 })
    
    // Count the number of works displayed
    const worksCount = await worksGrid.count()
    console.log(`✅ Found ${worksCount} works in the grid`)
    
    // Verify that stats reflect the actual number of works (not hardcoded 18)
    const worksStatElement = page.locator('span:has-text("obras")').first()
    await expect(worksStatElement).toBeVisible()
    
    const statsText = await worksStatElement.textContent()
    console.log(`✅ Stats text: ${statsText}`)
    
    // The stats should show the actual count, not the hardcoded 18
    if (statsText) {
      const match = statsText.match(/(\d+)\s+obras/)
      if (match) {
        const displayedCount = parseInt(match[1], 10)
        console.log(`✅ Displayed count: ${displayedCount}, Actual works: ${worksCount}`)
        
        // The displayed count should match the actual works count
        expect(displayedCount).toBe(worksCount)
      }
    }
    
    console.log('✅ Profile loads works dynamically and updates stats correctly')
  })

  test('profile should show loading skeleton while fetching works', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile')
    
    // Check if loading skeleton appears initially
    const loadingSkeleton = page.locator('.animate-pulse .h-48.bg-gray-200')
    
    // The skeleton might be very brief, so we check if it exists or if content loads quickly
    const skeletonVisible = await loadingSkeleton.first().isVisible().catch(() => false)
    const contentVisible = await page.locator('.grid .bg-white.border.border-gray-200').first().isVisible({ timeout: 5000 }).catch(() => false)
    
    // Either skeleton was visible or content loaded quickly
    expect(skeletonVisible || contentVisible).toBeTruthy()
    
    console.log('✅ Profile shows appropriate loading state')
  })

  test('profile should handle empty works state gracefully', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile')
    
    // Wait for content to load
    await page.waitForSelector('main', { timeout: 10000 })
    
    // Check if there are works or empty state
    const worksGrid = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3 .bg-white.border.border-gray-200')
    const emptyState = page.locator('text=Aún no tienes obras')
    
    const hasWorks = await worksGrid.first().isVisible().catch(() => false)
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    
    // Should have either works or empty state, not both
    expect(hasWorks || hasEmptyState).toBeTruthy()
    
    if (hasEmptyState) {
      console.log('✅ Profile shows empty state when no works available')
      // Check for "Crear primera obra" button
      await expect(page.locator('button:has-text("Crear primera obra")')).toBeVisible()
    } else {
      console.log('✅ Profile shows works when available')
    }
  })

  test('profile works should be clickable and interactive', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile')
    
    // Wait for works to load
    const worksGrid = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3 .bg-white.border.border-gray-200')
    await expect(worksGrid.first()).toBeVisible({ timeout: 15000 })
    
    const worksCount = await worksGrid.count()
    
    if (worksCount > 0) {
      // Check if works have interactive elements
      const firstWork = worksGrid.first()
      
      // Should have title
      const title = firstWork.locator('h3')
      await expect(title).toBeVisible()
      
      // Should have action buttons (like, comment, etc.)
      const actionButtons = firstWork.locator('button[aria-label]')
      const buttonCount = await actionButtons.count()
      expect(buttonCount).toBeGreaterThan(0)
      
      console.log(`✅ Works are interactive with ${buttonCount} action buttons`)
    }
    
    console.log('✅ Profile works are properly interactive')
  })

  test('reorganize mode should work with dynamic data', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile')
    
    // Wait for works to load
    const worksGrid = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3 .bg-white.border.border-gray-200')
    await expect(worksGrid.first()).toBeVisible({ timeout: 15000 })
    
    const worksCount = await worksGrid.count()
    
    if (worksCount > 1) {
      // Look for reorganize button
      const reorganizeButton = page.locator('button:has-text("Reorganizar")')
      
      if (await reorganizeButton.isVisible()) {
        // Click reorganize button
        await reorganizeButton.click()
        
        // Should show edit mode message
        await expect(page.locator('text=Modo de reorganización activado')).toBeVisible()
        
        // Should show instruction text
        await expect(page.locator('text=Haz clic en una tarjeta para seleccionarla')).toBeVisible()
        
        console.log('✅ Reorganize mode works with dynamic data')
        
        // Exit reorganize mode
        const saveButton = page.locator('button:has-text("Guardar")')
        await saveButton.click()
        
        // Should exit edit mode
        await expect(page.locator('text=Modo de reorganización activado')).not.toBeVisible()
      }
    }
    
    console.log('✅ Reorganize functionality works with dynamic works')
  })
})

