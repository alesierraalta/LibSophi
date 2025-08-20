import { test, expect } from '@playwright/test'

test.describe('Debug Writer Page', () => {
  
  test('Debug what shows on writer page', async ({ page }) => {
    await page.goto('/writer')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Get the current URL
    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)
    
    // Get the page title
    const pageTitle = await page.title()
    console.log('Page title:', pageTitle)
    
    // Get all h1 elements
    const h1Elements = await page.locator('h1').allTextContents()
    console.log('H1 elements:', h1Elements)
    
    // Get all button texts
    const buttons = await page.locator('button').allTextContents()
    console.log('Button texts:', buttons.slice(0, 10)) // First 10 buttons
    
    // Check if overlay is present
    const hasOverlay = await page.locator('[class*="fixed"][class*="inset-0"]').isVisible()
    console.log('Has overlay:', hasOverlay)
    
    // Check for specific texts
    const hasWriterText = await page.locator('text=¿Qué vas a escribir hoy?').isVisible()
    const hasNewWorkButton = await page.locator('text=Nueva obra').isVisible()
    const hasWelcomeText = await page.locator('text=¡Bienvenido de vuelta!').isVisible()
    
    console.log('Has writer text:', hasWriterText)
    console.log('Has new work button:', hasNewWorkButton)
    console.log('Has welcome text:', hasWelcomeText)
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-writer-page.png', fullPage: true })
    
    // Check body content
    const bodyText = await page.locator('body').textContent()
    console.log('Body contains "escritor":', bodyText?.includes('escritor'))
    console.log('Body contains "obra":', bodyText?.includes('obra'))
    console.log('Body contains "Bienvenido":', bodyText?.includes('Bienvenido'))
  })

})
