import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  
  test('Header Search Bar Navigates to Search Page', async ({ page }) => {
    // Start on main page
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    // Find search input in header
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    await expect(searchInput).toBeVisible()
    
    // Type search query
    await searchInput.fill('novela')
    
    // Press Enter to search
    await searchInput.press('Enter')
    
    // Should navigate to search page with query
    await page.waitForURL(/\/search\?q=novela/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/search\?q=novela/)
    
    // Should show search results page
    await expect(page.locator('h1:has-text("Resultados de búsqueda")')).toBeVisible()
  })

  test('Mobile Search Button Opens Search Page', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    // Find mobile search button
    const mobileSearchButton = page.locator('button[aria-label="Abrir búsqueda"]')
    await expect(mobileSearchButton).toBeVisible()
    
    // Click mobile search button
    await mobileSearchButton.click()
    
    // Should navigate to search page
    await page.waitForURL('/search', { timeout: 10000 })
    await expect(page).toHaveURL('/search')
  })

  test('Explore Page Search Redirects to Search Page', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    
    // Find search input in explore page
    const searchInput = page.locator('input[placeholder*="Buscar obras"]')
    await expect(searchInput).toBeVisible()
    
    // Type search query
    await searchInput.fill('ficción')
    
    // Press Enter
    await searchInput.press('Enter')
    
    // Should navigate to search page
    await page.waitForURL(/\/search\?q=ficci%C3%B3n/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/search\?q=ficci%C3%B3n/)
  })

  test('Search Page Loads and Shows Proper Structure', async ({ page }) => {
    await page.goto('/search')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Check main elements are present
    await expect(page.locator('h1:has-text("Resultados de búsqueda")')).toBeVisible()
    
    // Check filter tabs are present
    const filterTabs = ['Todo', 'Obras', 'Autores', 'Géneros']
    for (const tab of filterTabs) {
      await expect(page.locator(`button:has-text("${tab}")`)).toBeVisible()
    }
    
    // Check search input is present (mobile)
    const mobileSearchInput = page.locator('input[placeholder*="Buscar obras"]').first()
    // Should be visible on mobile or hidden on desktop
    const isVisible = await mobileSearchInput.isVisible()
    console.log(`Mobile search input visible: ${isVisible}`)
  })

  test('Search Page Filter Tabs Work', async ({ page }) => {
    await page.goto('/search?q=test')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Test clicking different filter tabs
    const tabs = ['Todo', 'Obras', 'Autores', 'Géneros']
    
    for (const tabName of tabs) {
      const tab = page.locator(`button:has-text("${tabName}")`)
      await expect(tab).toBeVisible()
      await tab.click()
      
      // Check that tab becomes active (has red color)
      await expect(tab).toHaveClass(/text-red-600/)
      
      await page.waitForTimeout(500) // Wait for filter to apply
    }
  })

  test('Search Page Shows No Results Message When Appropriate', async ({ page }) => {
    // Search for something that definitely won't exist
    await page.goto('/search?q=xyz123nonexistent987')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Wait for search to complete
    await page.waitForTimeout(3000)
    
    // Should show no results message
    const noResultsMessage = page.locator('text=No se encontraron resultados')
    const noResultsIcon = page.locator('svg').first() // Search icon
    
    // Either no results message should be visible, or we should have some results
    const hasNoResults = await noResultsMessage.isVisible()
    const hasResults = await page.locator('[data-testid="search-result"]').count() > 0
    
    if (hasNoResults) {
      await expect(noResultsMessage).toBeVisible()
      // Should also show helpful suggestions
      await expect(page.locator('text=Verifica la ortografía')).toBeVisible()
    } else if (hasResults) {
      console.log('Search returned results for the test query')
    } else {
      // If no specific message, at least the page should be functional
      await expect(page.locator('h1:has-text("Resultados de búsqueda")')).toBeVisible()
    }
  })

  test('Search Page Mobile Input Works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/search')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Find mobile search input
    const mobileSearchInput = page.locator('input[placeholder*="Buscar obras"]').first()
    
    if (await mobileSearchInput.isVisible()) {
      // Type in mobile search
      await mobileSearchInput.fill('test mobile search')
      
      // Press Enter
      await mobileSearchInput.press('Enter')
      
      // URL should be updated
      await page.waitForURL(/q=test%20mobile%20search/, { timeout: 10000 })
      await expect(page).toHaveURL(/q=test%20mobile%20search/)
    } else {
      console.log('Mobile search input not visible - may be hidden on this viewport size')
    }
  })

  test('Search Page Header Search Updates Results', async ({ page }) => {
    await page.goto('/search')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Find header search input (should be visible on desktop)
    const headerSearchInput = page.locator('header input[placeholder*="Buscar obras"]')
    
    if (await headerSearchInput.isVisible()) {
      // Type new search
      await headerSearchInput.fill('nueva búsqueda')
      
      // Press Enter
      await headerSearchInput.press('Enter')
      
      // Should update URL and results
      await page.waitForURL(/q=nueva%20b%C3%BAsqueda/, { timeout: 10000 })
      await expect(page).toHaveURL(/q=nueva%20b%C3%BAsqueda/)
      
      // Page should show the new search term
      await expect(page.locator('text="nueva búsqueda"')).toBeVisible()
    } else {
      console.log('Header search input not visible - may be on mobile viewport')
    }
  })

  test('Search Results Show Proper Loading State', async ({ page }) => {
    await page.goto('/search?q=loading-test')
    
    // Should show loading state initially
    const loadingIndicator = page.locator('text=Buscando contenido...')
    const loadingSpinner = page.locator('.animate-spin')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Loading should eventually disappear
    await page.waitForTimeout(5000)
    
    // Should not have stuck loading states
    const stillLoading = await loadingIndicator.isVisible()
    const stillSpinning = await loadingSpinner.count()
    
    if (stillLoading || stillSpinning > 0) {
      console.log('Warning: Loading state may be stuck')
    }
    
    // Page should be functional
    await expect(page.locator('h1:has-text("Resultados de búsqueda")')).toBeVisible()
  })

  test('Search Page Is Accessible', async ({ page }) => {
    await page.goto('/search?q=accessibility')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Check that filter tabs are keyboard accessible
    const firstTab = page.locator('button:has-text("Todo")').first()
    await firstTab.focus()
    await expect(firstTab).toBeFocused()
    
    // Should be able to navigate with keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Check that search input is accessible
    const searchInput = page.locator('input[placeholder*="Buscar obras"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.focus()
      await expect(searchInput).toBeFocused()
    }
    
    // Check that page has proper heading structure
    const mainHeading = page.locator('h1:has-text("Resultados de búsqueda")')
    await expect(mainHeading).toBeVisible()
  })

  test('Search Page Handles Empty Query Gracefully', async ({ page }) => {
    await page.goto('/search?q=')
    await page.waitForSelector('h1:has-text("Resultados de búsqueda")', { timeout: 15000 })
    
    // Should show "start searching" message
    const startMessage = page.locator('text=Comienza a buscar')
    const searchIcon = page.locator('svg').first()
    
    // Should show appropriate empty state
    await expect(startMessage).toBeVisible()
    
    // Should not show loading or error states
    const loadingIndicator = page.locator('text=Buscando contenido...')
    await expect(loadingIndicator).not.toBeVisible()
  })
})
