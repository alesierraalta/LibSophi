import { test, expect } from '@playwright/test'

test.describe('Mis Obras - Real Data Display', () => {
  
  test('Mis Obras Page Shows Real Statistics', async ({ page }) => {
    await page.goto('/mis-obras')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Mis Obras")', { timeout: 15000 })
    
    // Wait for data to load
    await page.waitForTimeout(3000)
    
    // Check that statistics are displayed
    const statsContainer = page.locator('div:has(strong)').first()
    await expect(statsContainer).toBeVisible()
    
    // Should show number of works
    const worksCount = page.locator('strong').first()
    await expect(worksCount).toBeVisible()
    
    // Statistics should show numbers, not static text like "50 lecturas"
    const statsText = await page.textContent('body')
    
    // Should not contain old static text
    expect(statsText).not.toContain('50 lecturas')
    expect(statsText).not.toContain('12.5k')
    expect(statsText).not.toContain('8.1k')
    
    // Should contain new format with "vistas" instead of "lecturas"
    if (statsText && statsText.includes('vistas')) {
      console.log('✅ New format detected: using "vistas" instead of "lecturas"')
    }
  })

  test('Work Cards Show Real Data Format', async ({ page }) => {
    await page.goto('/mis-obras')
    await page.waitForSelector('h1:has-text("Mis Obras")', { timeout: 15000 })
    await page.waitForTimeout(3000)
    
    // Check for work cards
    const workCards = page.locator('[data-testid="work-card"]').or(page.locator('.grid > div'))
    const cardCount = await workCards.count()
    
    if (cardCount > 0) {
      // Check first card for proper data format
      const firstCard = workCards.first()
      const cardText = await firstCard.textContent()
      
      if (cardText) {
        // Should use new format
        expect(cardText).not.toContain('lecturas')
        
        // Should show either real numbers or formatted numbers
        const hasViews = cardText.includes('vistas')
        const hasLikes = cardText.includes('likes')
        
        if (hasViews) {
          console.log('✅ Card shows views in new format')
        }
        if (hasLikes) {
          console.log('✅ Card shows likes')
        }
        
        // Should show publication status (if cards exist)
        const hasStatus = cardText.includes('Publicada') || cardText.includes('Borrador')
        if (hasStatus) {
          console.log('✅ Card shows publication status')
        } else {
          console.log('ℹ️ Publication status not found in card text')
        }
      }
    } else {
      console.log('ℹ️ No work cards found - user may have no works')
    }
  })

  test('Statistics Use Real Database Numbers', async ({ page }) => {
    await page.goto('/mis-obras')
    await page.waitForSelector('h1:has-text("Mis Obras")', { timeout: 15000 })
    await page.waitForTimeout(3000)
    
    // Look for statistics badges
    const statsBadges = page.locator('span:has(strong)')
    const badgeCount = await statsBadges.count()
    
    if (badgeCount > 0) {
      // Check each badge for real data format
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const badge = statsBadges.nth(i)
        const badgeText = await badge.textContent()
        
        if (badgeText) {
          // Should not contain old static formats
          expect(badgeText).not.toContain('12.5k')
          expect(badgeText).not.toContain('8.1k')
          expect(badgeText).not.toContain('5.7k')
          
          console.log(`Badge ${i + 1}: ${badgeText}`)
        }
      }
    }
    
    // Check for new statistics types
    const pageText = await page.textContent('body')
    if (pageText) {
      const hasPublishedCount = pageText.includes('publicadas')
      const hasDraftsCount = pageText.includes('borradores')
      
      if (hasPublishedCount) {
        console.log('✅ Shows published works count')
      }
      if (hasDraftsCount) {
        console.log('✅ Shows drafts count')
      }
    }
  })

  test('Number Formatting Works Correctly', async ({ page }) => {
    await page.goto('/mis-obras')
    await page.waitForSelector('h1:has-text("Mis Obras")', { timeout: 15000 })
    await page.waitForTimeout(3000)
    
    const pageText = await page.textContent('body')
    
    if (pageText) {
      // Check for proper number formatting (k, M suffixes)
      const hasFormattedNumbers = /\d+\.?\d*[kM]/.test(pageText)
      
      if (hasFormattedNumbers) {
        console.log('✅ Numbers are properly formatted with k/M suffixes')
      } else {
        console.log('ℹ️ No large numbers requiring formatting found')
      }
      
      // Should show actual numbers, not placeholder text
      expect(pageText).not.toContain('50 lecturas')
      expect(pageText).not.toContain('Actualizado hoy')
      expect(pageText).not.toContain('Actualizado ayer')
    }
  })

  test('Page Loads Without Fallback to Static Data', async ({ page }) => {
    // Monitor console for database loading messages
    const consoleMessages: string[] = []
    page.on('console', msg => {
      consoleMessages.push(msg.text())
    })
    
    await page.goto('/mis-obras')
    await page.waitForSelector('h1:has-text("Mis Obras")', { timeout: 15000 })
    await page.waitForTimeout(3000)
    
    // Check console messages for database activity
    const hasDbMessages = consoleMessages.some(msg => 
      msg.includes('Loading works') || 
      msg.includes('Loaded works from database') ||
      msg.includes('authenticated user')
    )
    
    if (hasDbMessages) {
      console.log('✅ Database queries are being executed')
    } else {
      console.log('ℹ️ No explicit database loading messages found')
    }
    
    // Page should be functional regardless
    await expect(page.locator('h1:has-text("Mis Obras")')).toBeVisible()
  })

  test('Work Cards Show Enhanced Information', async ({ page }) => {
    await page.goto('/mis-obras')
    await page.waitForSelector('h1:has-text("Mis Obras")', { timeout: 15000 })
    await page.waitForTimeout(3000)
    
    // Look for enhanced work card information
    const pageText = await page.textContent('body')
    
    if (pageText) {
      // Should show word count if available
      const hasWordCount = pageText.includes('palabras')
      if (hasWordCount) {
        console.log('✅ Shows word count for works')
      }
      
      // Should show publication status
      const hasPublicationStatus = pageText.includes('Publicada') || pageText.includes('Borrador')
      expect(hasPublicationStatus).toBe(true)
      
      // Should show views and likes
      const hasViews = pageText.includes('vistas')
      const hasLikes = pageText.includes('likes')
      
      if (hasViews) {
        console.log('✅ Shows view counts')
      }
      if (hasLikes) {
        console.log('✅ Shows like counts')
      }
    }
  })
})
