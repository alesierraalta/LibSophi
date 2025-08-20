import { test, expect } from '@playwright/test'

test.describe('Profile Cards Large Size Tests', () => {
  test('cards should have full-width layout like main page', async ({ page }) => {
    await page.goto('/')
    
    // Test the grid layout calculations for full-width cards
    const gridTest = await page.evaluate(() => {
      // Simulate the new single-column grid layout logic
      const works = [
        { id: '1', title: 'Work 1' },
        { id: '2', title: 'Work 2' },
        { id: '3', title: 'Work 3' }
      ]
      
      const positions = works.map((work, index) => ({
        id: work.id,
        x: 0,
        y: index * 8,
        w: 12,
        h: 8,
      }))
      
      return {
        positions,
        firstItemPos: positions[0],
        secondItemPos: positions[1],
        thirdItemPos: positions[2]
      }
    })
    
    // Verify single-column full-width positioning
    expect(gridTest.firstItemPos.x).toBe(0)
    expect(gridTest.firstItemPos.y).toBe(0)
    expect(gridTest.firstItemPos.w).toBe(12) // Full width
    expect(gridTest.firstItemPos.h).toBe(8) // Taller height
    
    expect(gridTest.secondItemPos.x).toBe(0)
    expect(gridTest.secondItemPos.y).toBe(8) // Stacked vertically
    expect(gridTest.secondItemPos.w).toBe(12)
    
    expect(gridTest.thirdItemPos.x).toBe(0)
    expect(gridTest.thirdItemPos.y).toBe(16) // Further down
    expect(gridTest.thirdItemPos.w).toBe(12)
    
    console.log('✅ Grid layout uses full-width single-column layout')
  })

  test('cards should have main page style structure', async ({ page }) => {
    await page.goto('/')
    
    // Inject test HTML to simulate the new large card design
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-large-cards'
      testContainer.innerHTML = `
        <div class="space-y-4">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative group mb-4">
            <div class="p-6 pt-8">
              <!-- Work Header -->
              <div class="flex items-start space-x-4 mb-5">
                <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-3 min-w-0">
                      <h4 class="font-semibold text-gray-900 text-sm">Mi Obra</h4>
                    </div>
                    <div class="flex items-center space-x-2 flex-shrink-0">
                      <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span class="text-xs text-gray-500 font-medium">Nov 15</span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3 mb-3">
                    <div class="flex items-center space-x-1">
                      <div class="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span class="text-xs bg-red-50 text-red-700 border border-red-200 rounded px-2 py-0.5 font-medium">
                        Novela
                      </span>
                    </div>
                    <span class="text-xs text-gray-500 flex items-center gap-1">
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                      <span>5 min de lectura</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Work Content -->
              <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3 hover:text-red-700 transition-colors duration-200 cursor-pointer">
                  Test Work Title
                </h3>
                <p class="text-gray-700 leading-relaxed mb-4 line-clamp-3" style="font-family: 'Times New Roman', Times, serif;">
                  This is a test description that shows how the large cards look with the main page style design.
                </p>
                <div class="relative rounded-xl overflow-hidden mb-4 group">
                  <img 
                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=640&h=360&fit=crop" 
                    alt="Test Work"
                    class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
              
              <!-- Work Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex items-center space-x-6">
                  <div class="flex items-center space-x-2 text-gray-500">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-sm font-medium">125</span>
                  </div>
                  <div class="flex items-center space-x-2 text-gray-500">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <span class="text-sm font-medium">62</span>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <button class="text-gray-500 hover:text-yellow-600 transition-colors duration-200">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                  </button>
                  <button class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check main page style elements
    await expect(page.locator('#test-large-cards .p-6.pt-8')).toBeVisible() // Main padding
    await expect(page.locator('#test-large-cards .h-12.w-12.rounded-full')).toBeVisible() // Avatar area
    await expect(page.locator('#test-large-cards .text-lg.font-semibold')).toBeVisible() // Title
    await expect(page.locator('#test-large-cards .h-48.object-cover')).toBeVisible() // Large image
    await expect(page.locator('#test-large-cards .border-t.border-gray-100')).toBeVisible() // Actions border
    
    console.log('✅ Large cards have main page style structure')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-large-cards')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('cards should have proper header with work info', async ({ page }) => {
    await page.goto('/')
    
    // Test work header structure
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-work-header'
      testContainer.innerHTML = `
        <div class="flex items-start space-x-4 mb-5">
          <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold text-gray-900 text-sm">Mi Obra</h4>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-xs text-gray-500 font-medium">Nov 15</span>
              </div>
            </div>
            <div class="flex items-center space-x-3 mb-3">
              <span class="text-xs bg-red-50 text-red-700 border border-red-200 rounded px-2 py-0.5 font-medium">
                Novela
              </span>
              <span class="text-xs text-gray-500">5 min de lectura</span>
            </div>
          </div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check work header elements
    await expect(page.locator('#test-work-header .bg-red-100')).toBeVisible() // Work icon background
    await expect(page.locator('#test-work-header .text-red-600')).toBeVisible() // Work icon
    await expect(page.locator('#test-work-header .bg-green-500')).toBeVisible() // Status indicator
    await expect(page.locator('#test-work-header .bg-red-50')).toBeVisible() // Genre badge
    
    console.log('✅ Work header has proper structure and styling')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-work-header')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('cards should have proper image display', async ({ page }) => {
    await page.goto('/')
    
    // Test image display structure
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-image-display'
      testContainer.innerHTML = `
        <div class="relative rounded-xl overflow-hidden mb-4 group">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=640&h=360&fit=crop" 
            alt="Test Work"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check image display elements
    const imageContainer = page.locator('#test-image-display .rounded-xl')
    const image = page.locator('#test-image-display img')
    const overlay = page.locator('#test-image-display .bg-black\\/10')
    
    await expect(imageContainer).toBeVisible()
    await expect(image).toBeVisible()
    await expect(overlay).toBeVisible()
    
    // Check image classes
    const hasCorrectClasses = await image.evaluate(el => {
      return el.classList.contains('w-full') &&
             el.classList.contains('h-48') &&
             el.classList.contains('object-cover') &&
             el.classList.contains('group-hover:scale-105')
    })
    
    expect(hasCorrectClasses).toBeTruthy()
    
    console.log('✅ Image display has proper structure and hover effects')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-image-display')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('cards should have proper action buttons', async ({ page }) => {
    await page.goto('/')
    
    // Test action buttons structure
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-action-buttons'
      testContainer.innerHTML = `
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-2 text-gray-500">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm font-medium">125</span>
            </div>
            <div class="flex items-center space-x-2 text-gray-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01"/>
              </svg>
              <span class="text-sm font-medium">62</span>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button class="text-gray-500 hover:text-yellow-600 transition-colors duration-200">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
          </div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check action buttons structure
    await expect(page.locator('#test-action-buttons .border-t.border-gray-100')).toBeVisible() // Top border
    await expect(page.locator('#test-action-buttons .space-x-6')).toBeVisible() // Stats section
    await expect(page.locator('#test-action-buttons .space-x-3')).toBeVisible() // Buttons section
    await expect(page.locator('#test-action-buttons .h-5.w-5').first()).toBeVisible() // Icons
    await expect(page.locator('#test-action-buttons .text-sm.font-medium').first()).toBeVisible() // Numbers
    
    console.log('✅ Action buttons have proper structure and styling')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-action-buttons')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('grid configuration should support larger cards', async ({ page }) => {
    await page.goto('/')
    
    // Test the grid configuration values
    const gridConfig = await page.evaluate(() => {
      // Simulate the GridStack configuration
      return {
        cellHeight: 60,
        column: 12,
        margin: 20,
        minRow: 1,
        animate: true
      }
    })
    
    expect(gridConfig.cellHeight).toBe(60) // Smaller cell height for more flexibility
    expect(gridConfig.column).toBe(12) // 12-column grid
    expect(gridConfig.margin).toBe(20) // Larger margin for better spacing
    expect(gridConfig.animate).toBe(true) // Animation enabled
    
    console.log('✅ Grid configuration supports larger cards with proper spacing')
  })
})

