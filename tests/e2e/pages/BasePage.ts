import { Page, expect } from '@playwright/test'

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string = '/') {
    await this.page.goto(path)
    await this.waitForPageLoad()
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  async waitForElement(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { timeout })
  }

  async clickElement(selector: string) {
    await this.page.click(selector)
  }

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value)
  }

  async getText(selector: string): Promise<string> {
    return await this.page.textContent(selector) || ''
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector)
  }

  async waitForNavigation(action: () => Promise<void>) {
    await Promise.all([
      this.page.waitForNavigation(),
      action()
    ])
  }

  // Header validation (per memory requirements)
  async validateHeader() {
    // Check for logo
    await expect(this.page.locator('img[alt*="Palabreo logo"]')).toBeVisible()
    
    // Check for brand name
    await expect(this.page.locator('text=Palabreo')).toBeVisible()
    
    console.log('✅ Header validation passed: Logo and brand name present')
  }

  // Common navigation actions
  async navigateToLogin() {
    await this.page.click('text=Iniciar sesión')
  }

  async navigateToRegister() {
    await this.page.click('text=Registrarse')
  }

  async navigateToWriter() {
    await this.page.click('text=Publicar')
  }

  async navigateToProfile() {
    await this.page.click('[aria-label="Ir a mi perfil"]')
  }

  // Search functionality
  async searchFor(query: string) {
    await this.page.fill('input[placeholder*="Buscar obras"]', query)
    await this.page.press('input[placeholder*="Buscar obras"]', 'Enter')
  }

  // Notification handling
  async openNotifications() {
    await this.page.click('button[aria-haspopup="menu"]')
  }

  async getNotificationCount(): Promise<number> {
    const badge = this.page.locator('.absolute.-top-1.-right-1')
    if (await badge.isVisible()) {
      const text = await badge.textContent()
      return parseInt(text || '0')
    }
    return 0
  }

  // Error handling
  async checkForErrors() {
    const errorElements = await this.page.locator('[role="alert"], .error, .text-red-600').all()
    
    if (errorElements.length > 0) {
      const errors = []
      for (const element of errorElements) {
        const text = await element.textContent()
        if (text) errors.push(text)
      }
      console.warn('⚠️ Errors found on page:', errors)
      return errors
    }
    
    return []
  }

  // Performance checks
  async checkPagePerformance() {
    const performanceEntries = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      }
    })
    
    console.log('📊 Page Performance:', performanceEntries)
    
    // Assert performance thresholds
    expect(performanceEntries.totalTime).toBeLessThan(5000) // 5 seconds max
    expect(performanceEntries.loadTime).toBeLessThan(2000) // 2 seconds max
    
    return performanceEntries
  }

  // Accessibility checks
  async checkAccessibility() {
    // Check for skip links
    const skipLink = this.page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeAttached()
    
    // Check for proper heading structure
    const h1Elements = await this.page.locator('h1').count()
    expect(h1Elements).toBeGreaterThanOrEqual(1)
    
    // Check for alt text on images
    const images = await this.page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
    
    console.log('♿ Accessibility checks passed')
  }

  // Mobile responsiveness
  async checkMobileResponsiveness() {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 }, // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }  // Desktop
    ]
    
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport)
      await this.page.waitForTimeout(500) // Allow for responsive adjustments
      
      // Check that header is still visible and functional
      await this.validateHeader()
      
      console.log(`✅ Responsive test passed for ${viewport.width}x${viewport.height}`)
    }
  }

  // Database state validation
  async validateDatabaseIntegrity() {
    // This would typically call an API endpoint to validate database state
    const response = await this.page.request.get('/api/health/database')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('healthy')
    
    console.log('✅ Database integrity check passed')
  }
}

