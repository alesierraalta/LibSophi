import { test, expect } from '@playwright/test'

test.describe('Header Logo Navigation', () => {
  
  test('Logo and Name in AppHeader Component Navigate to /main', async ({ page }) => {
    // Start on explore page
    await page.goto('/explore')
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    
    // Find the logo button (should be clickable)
    const logoButton = page.locator('button[aria-label="Ir a página principal"]')
    await expect(logoButton).toBeVisible()
    
    // Verify it contains both logo image and text
    const logoImage = logoButton.locator('img[alt*="Palabreo"]')
    const logoText = logoButton.locator('text=Palabreo')
    
    await expect(logoImage).toBeVisible()
    await expect(logoText).toBeVisible()
    
    // Click the logo/name button
    await logoButton.click()
    
    // Should navigate to /main
    await page.waitForURL('/main', { timeout: 10000 })
    
    // Verify we're on the main page
    await expect(page).toHaveURL('/main')
  })

  test('Logo and Name in Explore Page Navigate to /main', async ({ page }) => {
    // Start on explore page
    await page.goto('/explore')
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    
    // Find the logo button in explore page
    const logoButton = page.locator('button[aria-label="Ir a página principal"]')
    await expect(logoButton).toBeVisible()
    
    // Verify it contains both logo image and text
    const logoImage = logoButton.locator('img[alt*="Palabreo"]')
    const logoText = logoButton.locator('text=Palabreo')
    
    await expect(logoImage).toBeVisible()
    await expect(logoText).toBeVisible()
    
    // Click the logo/name button
    await logoButton.click()
    
    // Should navigate to /main
    await page.waitForURL('/main', { timeout: 10000 })
    
    // Verify we're on the main page
    await expect(page).toHaveURL('/main')
  })

  test('Logo Button Has Proper Accessibility', async ({ page }) => {
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    const logoButton = page.locator('button[aria-label="Ir a página principal"]')
    
    // Check accessibility attributes
    await expect(logoButton).toBeVisible()
    await expect(logoButton).toBeEnabled()
    await expect(logoButton).toHaveAttribute('aria-label', 'Ir a página principal')
    
    // Check that it's focusable
    await logoButton.focus()
    await expect(logoButton).toBeFocused()
    
    // Check that it has proper focus styling (focus ring)
    const focusClass = await logoButton.getAttribute('class')
    expect(focusClass).toContain('focus:ring')
  })

  test('Logo Button Works with Keyboard Navigation', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    
    const logoButton = page.locator('button[aria-label="Ir a página principal"]')
    
    // Focus the button with Tab navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // May need multiple tabs depending on page structure
    
    // Find and focus the logo button
    await logoButton.focus()
    await expect(logoButton).toBeFocused()
    
    // Press Enter to activate
    await page.keyboard.press('Enter')
    
    // Should navigate to /main
    await page.waitForURL('/main', { timeout: 10000 })
    await expect(page).toHaveURL('/main')
  })

  test('Logo Button Has Hover Effects', async ({ page }) => {
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    const logoButton = page.locator('button[aria-label="Ir a página principal"]')
    
    // Check that hover class is present
    const buttonClass = await logoButton.getAttribute('class')
    expect(buttonClass).toContain('hover:opacity-80')
    expect(buttonClass).toContain('transition-opacity')
    
    // Hover over the button
    await logoButton.hover()
    
    // Button should still be visible and functional after hover
    await expect(logoButton).toBeVisible()
    await expect(logoButton).toBeEnabled()
  })

  test('Logo Navigation Works from Different Pages', async ({ page }) => {
    // Test from profile page (if it uses AppHeader)
    await page.goto('/profile')
    
    // Wait for page to load
    await page.waitForTimeout(3000)
    
    // Check if logo button exists on this page
    const logoButton = page.locator('button[aria-label="Ir a página principal"]')
    const logoExists = await logoButton.count() > 0
    
    if (logoExists) {
      await logoButton.click()
      await page.waitForURL('/main', { timeout: 10000 })
      await expect(page).toHaveURL('/main')
    } else {
      console.log('Profile page does not use AppHeader - test skipped')
    }
  })

  test('Logo Button Maintains Consistent Styling', async ({ page }) => {
    // Test on main page
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    const logoButtonMain = page.locator('button[aria-label="Ir a página principal"]')
    const mainClasses = await logoButtonMain.getAttribute('class')
    
    // Navigate to explore
    await page.goto('/explore')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    const logoButtonExplore = page.locator('button[aria-label="Ir a página principal"]')
    const exploreClasses = await logoButtonExplore.getAttribute('class')
    
    // Classes should be consistent across pages
    expect(exploreClasses).toBe(mainClasses)
    
    // Both should have the same essential styling
    expect(mainClasses).toContain('flex items-center space-x-3')
    expect(mainClasses).toContain('hover:opacity-80')
    expect(mainClasses).toContain('focus:ring-red-500')
  })

  test('Logo Image and Text Are Both Present', async ({ page }) => {
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    const logoButton = page.locator('button[aria-label="Ir a página principal"]')
    
    // Check that both image and text are present within the button
    const logoImage = logoButton.locator('img[alt*="Palabreo"]')
    const logoText = logoButton.locator('h1:has-text("Palabreo")')
    
    await expect(logoImage).toBeVisible()
    await expect(logoText).toBeVisible()
    
    // Check that the text has proper styling
    const textClass = await logoText.getAttribute('class')
    expect(textClass).toContain('text-red-600')
    expect(textClass).toContain('font-bold')
    
    // Check that image has proper alt text
    await expect(logoImage).toHaveAttribute('alt', 'Palabreo logo')
  })
})
