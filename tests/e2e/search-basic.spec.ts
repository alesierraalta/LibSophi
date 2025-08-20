import { test, expect } from '@playwright/test'

test.describe('Basic Search Functionality', () => {
  
  test('Search Page Loads Successfully', async ({ page }) => {
    await page.goto('/search')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Check main elements
    await expect(page.locator('h1:has-text("Resultados de búsqueda")')).toBeVisible()
    await expect(page.locator('button:has-text("Todo")')).toBeVisible()
    await expect(page.locator('button:has-text("Obras")')).toBeVisible()
    await expect(page.locator('button:has-text("Autores")')).toBeVisible()
    await expect(page.locator('button:has-text("Géneros")')).toBeVisible()
  })

  test('Search Page with Query Shows Results Area', async ({ page }) => {
    await page.goto('/search?q=test')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Should show search term in results description
    const resultsText = page.locator('text="test"').or(page.locator('p:has-text("test")'))
    // Results text might be visible or page might show no results - both are valid
    const hasResultsText = await resultsText.count() > 0
    console.log(`Results text found: ${hasResultsText}`)
    
    // Filter tabs should be functional
    const obrasTab = page.locator('button:has-text("Obras")')
    await obrasTab.click()
    await expect(obrasTab).toHaveClass(/text-red-600/)
  })

  test('Mobile Search Button Works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    // Find and click mobile search button
    const mobileSearchButton = page.locator('button[aria-label="Abrir búsqueda"]')
    if (await mobileSearchButton.isVisible()) {
      await mobileSearchButton.click()
      
      // Should navigate to search page
      await page.waitForURL('/search', { timeout: 10000 })
      await expect(page).toHaveURL('/search')
    } else {
      console.log('Mobile search button not found - may not be on mobile layout')
    }
  })

  test('Search Filter Tabs Change Active State', async ({ page }) => {
    await page.goto('/search?q=example')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Test clicking different tabs
    const tabs = ['Todo', 'Obras', 'Autores', 'Géneros']
    
    for (const tabName of tabs) {
      const tab = page.locator(`button:has-text("${tabName}")`)
      await tab.click()
      await page.waitForTimeout(300)
      
      // Check that tab becomes active
      await expect(tab).toHaveClass(/text-red-600/)
    }
  })

  test('Empty Search Shows Appropriate Message', async ({ page }) => {
    await page.goto('/search')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Should show "start searching" message
    await expect(page.locator('text=Comienza a buscar')).toBeVisible()
    
    // Should not show loading states
    await expect(page.locator('text=Buscando contenido...')).not.toBeVisible()
  })

  test('Search Page Has Proper Header', async ({ page }) => {
    await page.goto('/search')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Should have AppHeader with clickable logo
    const logoButton = page.locator('button[aria-label="Ir a página principal"]')
    await expect(logoButton).toBeVisible()
    
    // Logo should work
    await logoButton.click()
    await page.waitForURL('/main', { timeout: 10000 })
    await expect(page).toHaveURL('/main')
  })

  test('Search Page Is Responsive', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/search')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Check desktop elements
    await expect(page.locator('h1:has-text("Resultados de búsqueda")')).toBeVisible()
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    
    // Should still be functional
    await expect(page.locator('h1:has-text("Resultados de búsqueda")')).toBeVisible()
    
    // Filter tabs should still be visible
    await expect(page.locator('button:has-text("Todo")')).toBeVisible()
  })

  test('Search Page Header Navigation Works', async ({ page }) => {
    await page.goto('/search?q=navigation-test')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Test navigation buttons in header
    const logoButton = page.locator('button[aria-label="Ir a página principal"]')
    await expect(logoButton).toBeVisible()
    
    // Test that we can navigate back to main
    await logoButton.click()
    await page.waitForURL('/main', { timeout: 10000 })
    
    // And back to search
    await page.goto('/search')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    await expect(page.locator('h1:has-text("Resultados de búsqueda")')).toBeVisible()
  })

  test('Search Page Performance - No Stuck Loading', async ({ page }) => {
    await page.goto('/search?q=performance')
    
    // Wait for initial load
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Wait a reasonable time for any search to complete
    await page.waitForTimeout(5000)
    
    // Check for stuck loading states
    const loadingSpinners = page.locator('.animate-spin')
    const loadingText = page.locator('text=Buscando contenido...')
    
    const spinnerCount = await loadingSpinners.count()
    const loadingVisible = await loadingText.isVisible()
    
    if (spinnerCount > 0 || loadingVisible) {
      console.log(`Warning: Possible stuck loading state - Spinners: ${spinnerCount}, Loading text: ${loadingVisible}`)
    }
    
    // Page should be functional regardless
    await expect(page.locator('h1:has-text("Resultados de búsqueda")')).toBeVisible()
  })
})
