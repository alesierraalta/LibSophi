import { test, expect } from '@playwright/test'

test.describe('Search Input Typing', () => {
  
  test('Can Type in Header Search Bar on Main Page', async ({ page }) => {
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    // Find search input in header
    const searchInput = page.locator('header input[placeholder*="Buscar obras"]')
    await expect(searchInput).toBeVisible()
    
    // Clear any existing value
    await searchInput.clear()
    
    // Type in the search input
    await searchInput.fill('test typing')
    
    // Verify the value was set
    const inputValue = await searchInput.inputValue()
    expect(inputValue).toBe('test typing')
    
    // Test that we can continue typing
    await searchInput.fill('')
    await searchInput.type('character by character')
    
    const finalValue = await searchInput.inputValue()
    expect(finalValue).toBe('character by character')
  })

  test('Can Type in Header Search Bar on Other Pages', async ({ page }) => {
    // Test on explore page
    await page.goto('/explore')
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Buscar obras"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.clear()
      await searchInput.fill('explore typing test')
      
      const inputValue = await searchInput.inputValue()
      expect(inputValue).toBe('explore typing test')
    } else {
      console.log('Search input not visible on explore page')
    }
  })

  test('Search Input Responds to Keyboard Events', async ({ page }) => {
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    const searchInput = page.locator('header input[placeholder*="Buscar obras"]')
    await expect(searchInput).toBeVisible()
    
    // Focus the input
    await searchInput.focus()
    await expect(searchInput).toBeFocused()
    
    // Type using keyboard
    await page.keyboard.type('keyboard test')
    
    const value = await searchInput.inputValue()
    expect(value).toBe('keyboard test')
    
    // Test backspace
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Backspace')
    
    const afterBackspace = await searchInput.inputValue()
    expect(afterBackspace).toBe('keyboard ')
    
    // Test selecting all and replacing
    await page.keyboard.press('Control+A')
    await page.keyboard.type('replaced text')
    
    const finalValue = await searchInput.inputValue()
    expect(finalValue).toBe('replaced text')
  })

  test('Search Input Allows Special Characters', async ({ page }) => {
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    const searchInput = page.locator('header input[placeholder*="Buscar obras"]')
    
    // Test special characters
    const specialText = 'búsqueda con ñ, acentos á é í ó ú, y símbolos @#$%'
    await searchInput.fill(specialText)
    
    const value = await searchInput.inputValue()
    expect(value).toBe(specialText)
  })

  test('Search Input Maintains Focus During Typing', async ({ page }) => {
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    const searchInput = page.locator('header input[placeholder*="Buscar obras"]')
    
    // Focus and start typing
    await searchInput.focus()
    await searchInput.fill('maintain focus test')
    
    // Input should still be focused
    await expect(searchInput).toBeFocused()
    
    // Should be able to continue typing without refocusing
    await page.keyboard.press('Space')
    await page.keyboard.type('continued')
    
    const finalValue = await searchInput.inputValue()
    expect(finalValue).toBe('maintain focus test continued')
  })

  test('Search Input Works After Page Navigation', async ({ page }) => {
    // Start on main page
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    let searchInput = page.locator('header input[placeholder*="Buscar obras"]')
    await searchInput.fill('first value')
    expect(await searchInput.inputValue()).toBe('first value')
    
    // Navigate to explore
    await page.goto('/explore')
    await page.waitForSelector('h2:has-text("Explorar")', { timeout: 15000 })
    
    // Navigate back to main
    await page.goto('/main')
    await page.waitForSelector('button[aria-label="Ir a página principal"]', { timeout: 15000 })
    
    // Search input should be functional again
    searchInput = page.locator('header input[placeholder*="Buscar obras"]')
    await searchInput.fill('after navigation')
    expect(await searchInput.inputValue()).toBe('after navigation')
  })
})
