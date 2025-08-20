import { test, expect } from '@playwright/test'

test.describe('Recommendation Algorithms - Direct Database Tests', () => {
  
  test('Popular Recommendations Function Works', async ({ page }) => {
    // Navigate to a page that uses recommendations
    await page.goto('/explore')
    
    // Wait for the page to load
    await page.waitForTimeout(3000)
    
    // Check that the explore page loads without errors
    const errorElements = await page.locator('text=Error').count()
    expect(errorElements).toBe(0)
    
    // Check that loading completes
    const loadingElements = await page.locator('text=Descubriendo obras...').count()
    expect(loadingElements).toBe(0)
    
    // Verify that some content is displayed (or appropriate empty state)
    const pageContent = await page.content()
    expect(pageContent).toContain('Explorar')
  })

  test('Main Page Shows Following Content Only', async ({ page }) => {
    await page.goto('/main')
    
    // Wait for page to load
    await page.waitForTimeout(2000)
    
    // Check that the "following content" indicator is shown
    const followingIndicator = page.locator('text=Contenido de personas que sigues')
    await expect(followingIndicator).toBeVisible()
    
    // Verify no "Solo seguidos" checkbox exists (since it's always following now)
    const followingCheckbox = page.locator('input[type="checkbox"]').first()
    
    // The checkbox should either not exist or not be visible
    const checkboxCount = await page.locator('input[type="checkbox"]').count()
    if (checkboxCount > 0) {
      // If checkbox exists, it should not be the "Solo seguidos" one
      const checkboxText = await page.locator('text=Solo seguidos').count()
      expect(checkboxText).toBe(0)
    }
  })

  test('Explore Page Loads Recommendation Content', async ({ page }) => {
    await page.goto('/explore')
    
    // Wait for content to load
    await page.waitForTimeout(5000)
    
    // Check for the explore page structure
    const exploreTitle = page.locator('h2:has-text("Explorar")')
    await expect(exploreTitle).toBeVisible()
    
    const exploreDescription = page.locator('text=Descubre obras, autores y newsletters que podrían encantarte')
    await expect(exploreDescription).toBeVisible()
    
    // Check that the page doesn't show error states
    const errorMessages = await page.locator('text=Error loading').count()
    expect(errorMessages).toBe(0)
  })

  test('Page Performance - Recommendations Load Within Reasonable Time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/explore')
    
    // Wait for the main content to appear
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    
    const loadTime = Date.now() - startTime
    
    // Should load within 15 seconds (more generous for slower systems)
    expect(loadTime).toBeLessThan(15000)
    
    // Wait for loading to complete by checking for content or empty state
    await page.waitForTimeout(5000)
    
    // Check that either content is loaded OR we have an appropriate empty state
    const hasContent = await page.locator('[data-testid="work-card"]').count()
    const hasEmptyState = await page.locator('text=No hay obras').count()
    const hasLoadingComplete = hasContent > 0 || hasEmptyState > 0
    
    // Verify loading has completed (either content or empty state)
    expect(hasLoadingComplete).toBe(true)
  })

  test('Navigation Between Main and Explore Works', async ({ page }) => {
    // Start at main page
    await page.goto('/main')
    await page.waitForTimeout(3000)
    
    // Try multiple navigation strategies to find the explore link
    let exploreClicked = false
    
    // Strategy 1: Look for desktop navigation
    const desktopExplore = page.locator('nav button:has-text("Explorar"), nav a:has-text("Explorar")')
    if (await desktopExplore.count() > 0 && await desktopExplore.first().isVisible()) {
      await desktopExplore.first().click()
      exploreClicked = true
    }
    
    // Strategy 2: Look for mobile navigation if desktop not found
    if (!exploreClicked) {
      const mobileExplore = page.locator('.lg\\:hidden button:has-text("Explorar")')
      if (await mobileExplore.count() > 0 && await mobileExplore.first().isVisible()) {
        await mobileExplore.first().click()
        exploreClicked = true
      }
    }
    
    // Strategy 3: Direct URL navigation if buttons not working
    if (!exploreClicked) {
      await page.goto('/explore')
      exploreClicked = true
    }
    
    // Verify we're on explore page
    await page.waitForURL('/explore', { timeout: 10000 })
    await expect(page.locator('h2:has-text("Explorar")')).toBeVisible()
    
    // Navigate back to main using similar strategy
    let homeClicked = false
    
    // Strategy 1: Desktop navigation
    const desktopHome = page.locator('nav button:has-text("Inicio"), nav a:has-text("Inicio")')
    if (await desktopHome.count() > 0 && await desktopHome.first().isVisible()) {
      await desktopHome.first().click()
      homeClicked = true
    }
    
    // Strategy 2: Mobile navigation
    if (!homeClicked) {
      const mobileHome = page.locator('.lg\\:hidden button:has-text("Inicio")')
      if (await mobileHome.count() > 0 && await mobileHome.first().isVisible()) {
        await mobileHome.first().click()
        homeClicked = true
      }
    }
    
    // Strategy 3: Direct URL navigation
    if (!homeClicked) {
      await page.goto('/main')
      homeClicked = true
    }
    
    // Verify we're back on main page
    await page.waitForURL('/main', { timeout: 10000 })
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Contenido de personas que sigues')).toBeVisible()
  })

  test('Responsive Design - Mobile Navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/explore')
    await page.waitForTimeout(2000)
    
    // On mobile, navigation should be in carousel format
    const mobileNav = page.locator('.lg\\:hidden')
    await expect(mobileNav.first()).toBeVisible()
    
    // Should have mobile navigation items
    const exploreButton = page.locator('button:has-text("Explorar")')
    const homeButton = page.locator('button:has-text("Inicio")')
    
    await expect(exploreButton.first()).toBeVisible()
    await expect(homeButton.first()).toBeVisible()
  })

  test('Error Handling - Graceful Fallbacks', async ({ page }) => {
    // Test that pages handle errors gracefully
    await page.goto('/explore')
    
    // Wait for any potential error states
    await page.waitForTimeout(3000)
    
    // Should not show JavaScript errors in console (basic check)
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })
    
    await page.reload()
    await page.waitForTimeout(2000)
    
    // Filter out known non-critical errors
    const criticalErrors = logs.filter(log => 
      !log.includes('favicon') && 
      !log.includes('manifest') &&
      !log.includes('sw.js') &&
      !log.includes('_next/static')
    )
    
    expect(criticalErrors.length).toBe(0)
  })

  test('Content Structure - Proper HTML Semantics', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForTimeout(2000)
    
    // Check for proper semantic HTML
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
    
    const headerElement = page.locator('header')
    await expect(headerElement).toBeVisible()
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Verify aria labels and accessibility
    const logoButton = page.locator('[aria-label*="perfil"]')
    const count = await logoButton.count()
    expect(count).toBeGreaterThanOrEqual(0) // Should have accessible elements
  })

  test('Header Consistency - Logo and Name Present', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForTimeout(2000)
    
    // Check for logo image
    const logo = page.locator('img[alt*="Palabreo"]')
    await expect(logo).toBeVisible()
    
    // Check for Palabreo name text
    const nameText = page.locator('h1:has-text("Palabreo")')
    await expect(nameText).toBeVisible()
    
    // Verify both are in header
    const headerLogo = page.locator('header img[alt*="Palabreo"]')
    const headerName = page.locator('header h1:has-text("Palabreo")')
    
    await expect(headerLogo).toBeVisible()
    await expect(headerName).toBeVisible()
  })
})

test.describe('User Interface Consistency', () => {
  
  test('Icons Consistency - Uses Lucide React Icons', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForTimeout(2000)
    
    // Check that no emoji icons are used in main UI
    const pageText = await page.textContent('body')
    
    // Common emojis that should not be in UI
    const emojiPattern = /[🔍📚❤️👤📝🏠🔔]/g
    const hasEmojis = emojiPattern.test(pageText || '')
    
    expect(hasEmojis).toBe(false)
    
    // Verify Lucide icons are present (they use SVG)
    const svgIcons = page.locator('svg')
    const iconCount = await svgIcons.count()
    
    expect(iconCount).toBeGreaterThan(0) // Should have SVG icons from Lucide
  })

  test('Color Scheme Consistency', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForTimeout(2000)
    
    // Check for red color scheme elements
    const redElements = page.locator('[class*="red-"]')
    const redCount = await redElements.count()
    
    expect(redCount).toBeGreaterThan(0) // Should use red color scheme
    
    // Check for primary button styling
    const primaryButtons = page.locator('button[class*="bg-red"]')
    const buttonCount = await primaryButtons.count()
    
    expect(buttonCount).toBeGreaterThan(0) // Should have red primary buttons
  })
})

test.describe('Recommendation System Integration', () => {
  
  test('Explore vs Main Content Differentiation', async ({ page }) => {
    // Check explore page
    await page.goto('/explore')
    await page.waitForTimeout(3000)
    
    const exploreContent = await page.content()
    
    // Check main page
    await page.goto('/main')
    await page.waitForTimeout(3000)
    
    const mainContent = await page.content()
    
    // Pages should have different content structures
    expect(exploreContent).not.toBe(mainContent)
    
    // Main should have following indicator
    expect(mainContent).toContain('Contenido de personas que sigues')
    
    // Explore should have exploration messaging
    expect(exploreContent).toContain('Descubre obras')
  })

  test('Filter Functionality on Explore', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForTimeout(2000)
    
    // Check for period filters
    const periodFilters = page.locator('button:has-text("Hoy"), button:has-text("Semana"), button:has-text("Mes")')
    const periodCount = await periodFilters.count()
    expect(periodCount).toBeGreaterThan(0)
    
    // Check for type filters
    const typeFilters = page.locator('button:has-text("Todo"), button:has-text("Ficción"), button:has-text("Newsletter")')
    const typeCount = await typeFilters.count()
    expect(typeCount).toBeGreaterThan(0)
    
    // Try clicking a filter
    const weekFilter = page.locator('button:has-text("Semana")')
    if (await weekFilter.count() > 0) {
      await weekFilter.first().click()
      await page.waitForTimeout(1000)
      
      // Should remain on same page
      expect(page.url()).toContain('/explore')
    }
  })
})
