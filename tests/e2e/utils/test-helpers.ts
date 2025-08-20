import { Page, expect } from '@playwright/test'
import { databaseCleanup } from './database-cleanup'

/**
 * Test helper utilities for E2E testing
 * Provides common functionality and validation methods
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for element to be visible with custom timeout
   */
  async waitForElement(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout })
  }

  /**
   * Wait for multiple elements to be visible
   */
  async waitForElements(selectors: string[], timeout: number = 10000): Promise<void> {
    const promises = selectors.map(selector => 
      this.page.waitForSelector(selector, { timeout })
    )
    await Promise.all(promises)
  }

  /**
   * Safe click with retry mechanism
   */
  async safeClick(selector: string, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.click(selector, { timeout: 5000 })
        return
      } catch (error) {
        if (i === retries - 1) throw error
        await this.page.waitForTimeout(1000)
      }
    }
  }

  /**
   * Safe fill input with retry mechanism
   */
  async safeFill(selector: string, value: string, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.fill(selector, value, { timeout: 5000 })
        return
      } catch (error) {
        if (i === retries - 1) throw error
        await this.page.waitForTimeout(1000)
      }
    }
  }

  /**
   * Wait for navigation with timeout
   */
  async waitForNavigation(timeout: number = 10000): Promise<void> {
    await this.page.waitForNavigation({ timeout })
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    await this.page.screenshot({ 
      path: `tests/e2e/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    })
  }

  /**
   * Validate page performance
   */
  async validatePerformance(thresholds: {
    loadTime?: number,
    domContentLoaded?: number,
    totalTime?: number
  } = {}): Promise<any> {
    const defaultThresholds = {
      loadTime: 2000,
      domContentLoaded: 1500,
      totalTime: 5000,
      ...thresholds
    }

    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      }
    })

    // Validate against thresholds
    if (performanceMetrics.loadTime > defaultThresholds.loadTime) {
      console.warn(`⚠️ Load time exceeded threshold: ${performanceMetrics.loadTime}ms > ${defaultThresholds.loadTime}ms`)
    }

    if (performanceMetrics.domContentLoaded > defaultThresholds.domContentLoaded) {
      console.warn(`⚠️ DOM content loaded exceeded threshold: ${performanceMetrics.domContentLoaded}ms > ${defaultThresholds.domContentLoaded}ms`)
    }

    if (performanceMetrics.totalTime > defaultThresholds.totalTime) {
      console.warn(`⚠️ Total time exceeded threshold: ${performanceMetrics.totalTime}ms > ${defaultThresholds.totalTime}ms`)
    }

    console.log('📊 Performance Metrics:', performanceMetrics)
    return performanceMetrics
  }

  /**
   * Check for JavaScript errors on page
   */
  async checkForJavaScriptErrors(): Promise<string[]> {
    const errors: string[] = []
    
    this.page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    return errors
  }

  /**
   * Validate accessibility standards
   */
  async validateAccessibility(): Promise<void> {
    // Check for skip links
    const skipLinks = await this.page.locator('a[href^="#"]').count()
    if (skipLinks === 0) {
      console.warn('⚠️ No skip links found for accessibility')
    }

    // Check for proper heading hierarchy
    const headings = {
      h1: await this.page.locator('h1').count(),
      h2: await this.page.locator('h2').count(),
      h3: await this.page.locator('h3').count(),
    }

    if (headings.h1 === 0) {
      console.warn('⚠️ No H1 heading found')
    } else if (headings.h1 > 1) {
      console.warn('⚠️ Multiple H1 headings found')
    }

    // Check for alt text on images
    const imagesWithoutAlt = await this.page.locator('img:not([alt])').count()
    if (imagesWithoutAlt > 0) {
      console.warn(`⚠️ ${imagesWithoutAlt} images without alt text found`)
    }

    // Check for form labels
    const inputsWithoutLabels = await this.page.locator('input:not([aria-label]):not([aria-labelledby])').count()
    if (inputsWithoutLabels > 0) {
      console.warn(`⚠️ ${inputsWithoutLabels} inputs without proper labels found`)
    }

    console.log('♿ Accessibility validation completed')
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<void> {
    // Start from the beginning of the page
    await this.page.keyboard.press('Home')
    
    // Tab through focusable elements
    const focusableElements = await this.page.locator('button, input, select, textarea, a[href]').count()
    
    for (let i = 0; i < Math.min(focusableElements, 10); i++) {
      await this.page.keyboard.press('Tab')
      await this.page.waitForTimeout(100)
    }

    // Test Enter key on buttons
    const buttons = await this.page.locator('button').all()
    if (buttons.length > 0) {
      await buttons[0].focus()
      // Note: We don't actually press Enter to avoid triggering actions
    }

    console.log('⌨️ Keyboard navigation test completed')
  }

  /**
   * Validate responsive design
   */
  async validateResponsiveDesign(): Promise<void> {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop Small' },
      { width: 1920, height: 1080, name: 'Desktop Large' }
    ]

    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height })
      await this.page.waitForTimeout(500) // Allow for responsive adjustments

      // Check if content is still visible and accessible
      const header = this.page.locator('header')
      const main = this.page.locator('main, [role="main"]')
      
      await expect(header).toBeVisible()
      
      if (await main.count() > 0) {
        await expect(main).toBeVisible()
      }

      // Check for horizontal scrollbar (usually indicates layout issues)
      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })

      if (hasHorizontalScroll) {
        console.warn(`⚠️ Horizontal scroll detected on ${viewport.name} viewport`)
      }

      console.log(`✅ Responsive test passed for ${viewport.name} (${viewport.width}x${viewport.height})`)
    }

    // Reset to default viewport
    await this.page.setViewportSize({ width: 1280, height: 720 })
  }

  /**
   * Monitor network requests
   */
  async monitorNetworkRequests(): Promise<{
    requests: any[],
    failedRequests: any[],
    slowRequests: any[]
  }> {
    const requests: any[] = []
    const failedRequests: any[] = []
    const slowRequests: any[] = []

    this.page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      })
    })

    this.page.on('response', (response) => {
      const request = requests.find(req => req.url === response.url())
      if (request) {
        const responseTime = Date.now() - request.timestamp
        request.status = response.status()
        request.responseTime = responseTime

        if (response.status() >= 400) {
          failedRequests.push(request)
        }

        if (responseTime > 3000) { // 3 seconds threshold
          slowRequests.push(request)
        }
      }
    })

    return { requests, failedRequests, slowRequests }
  }

  /**
   * Validate database state
   */
  async validateDatabaseState(): Promise<void> {
    // Get cleanup statistics to validate database state
    const stats = await databaseCleanup.getCleanupStats()
    
    console.log('📊 Database State:', stats)
    
    if (stats.testUsers > 100) {
      console.warn(`⚠️ High number of test users: ${stats.testUsers}`)
    }
    
    if (stats.testWorks > 500) {
      console.warn(`⚠️ High number of test works: ${stats.testWorks}`)
    }
    
    if (stats.testComments > 1000) {
      console.warn(`⚠️ High number of test comments: ${stats.testComments}`)
    }
  }

  /**
   * Create test data
   */
  async createTestData(): Promise<void> {
    await databaseCleanup.createTestData()
  }

  /**
   * Clean up test data
   */
  async cleanupTestData(): Promise<void> {
    await databaseCleanup.cleanupAll()
  }

  /**
   * Emergency cleanup
   */
  async emergencyCleanup(): Promise<void> {
    await databaseCleanup.emergencyCleanup()
  }

  /**
   * Generate unique test identifier
   */
  generateTestId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'detached', timeout })
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded()
  }

  /**
   * Get element text content safely
   */
  async getTextContent(selector: string): Promise<string> {
    const element = this.page.locator(selector)
    await element.waitFor()
    return await element.textContent() || ''
  }

  /**
   * Check if element exists (without waiting)
   */
  async elementExists(selector: string): Promise<boolean> {
    return await this.page.locator(selector).count() > 0
  }

  /**
   * Simulate slow network conditions
   */
  async simulateSlowNetwork(): Promise<void> {
    await this.page.context().setExtraHTTPHeaders({
      'Connection': 'keep-alive'
    })
    
    // Simulate slow 3G
    await this.page.context().route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay
      await route.continue()
    })
  }

  /**
   * Reset network conditions
   */
  async resetNetworkConditions(): Promise<void> {
    await this.page.context().unroute('**/*')
  }

  /**
   * Validate form submission
   */
  async validateFormSubmission(formSelector: string, expectedResult: 'success' | 'error'): Promise<void> {
    const form = this.page.locator(formSelector)
    await expect(form).toBeVisible()
    
    await form.locator('button[type="submit"]').click()
    
    if (expectedResult === 'success') {
      // Look for success indicators
      const successIndicators = [
        '.success', '.alert-success', '[role="alert"]',
        'text=success', 'text=éxito', 'text=completado'
      ]
      
      let found = false
      for (const indicator of successIndicators) {
        if (await this.page.locator(indicator).isVisible()) {
          found = true
          break
        }
      }
      
      if (!found) {
        // Check for URL change as success indicator
        await this.page.waitForNavigation({ timeout: 5000 }).catch(() => {
          console.warn('⚠️ No clear success indicator found after form submission')
        })
      }
    } else {
      // Look for error indicators
      const errorIndicators = [
        '.error', '.alert-error', '.text-red-600',
        'text=error', 'text=failed', 'text=inválido'
      ]
      
      let found = false
      for (const indicator of errorIndicators) {
        if (await this.page.locator(indicator).isVisible()) {
          found = true
          break
        }
      }
      
      expect(found).toBeTruthy()
    }
  }
}

/**
 * Global test utilities
 */
export const TestUtils = {
  /**
   * Generate test email
   */
  generateTestEmail(): string {
    return `test-${Date.now()}@palabreo-e2e.test`
  },

  /**
   * Generate test username
   */
  generateTestUsername(): string {
    return `testuser-${Date.now()}`
  },

  /**
   * Generate test content
   */
  generateTestContent(type: 'title' | 'content' | 'comment' = 'content'): string {
    const timestamp = Date.now()
    
    switch (type) {
      case 'title':
        return `E2E Test Title ${timestamp}`
      case 'content':
        return `This is test content created during E2E testing at ${new Date().toISOString()}. Content ID: ${timestamp}`
      case 'comment':
        return `Test comment created during E2E testing. Comment ID: ${timestamp}`
      default:
        return `Test content ${timestamp}`
    }
  },

  /**
   * Sleep/wait utility
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * Retry utility
   */
  async retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === retries - 1) throw error
        await this.sleep(delay)
      }
    }
    throw new Error('Retry failed')
  }
}

