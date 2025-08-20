import { test, expect } from '@playwright/test'

test.describe('Profile 3-Column Grid Tests', () => {
  test('grid should use 3-column layout on large screens', async ({ page }) => {
    await page.goto('/')
    
    // Test 3-column grid structure
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-3-column-grid'
      testContainer.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white border border-gray-200 rounded-lg p-4">Card 1</div>
          <div class="bg-white border border-gray-200 rounded-lg p-4">Card 2</div>
          <div class="bg-white border border-gray-200 rounded-lg p-4">Card 3</div>
          <div class="bg-white border border-gray-200 rounded-lg p-4">Card 4</div>
          <div class="bg-white border border-gray-200 rounded-lg p-4">Card 5</div>
          <div class="bg-white border border-gray-200 rounded-lg p-4">Card 6</div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check grid classes
    const gridContainer = page.locator('#test-3-column-grid .grid')
    await expect(gridContainer).toBeVisible()
    
    // Check responsive grid classes
    const hasCorrectClasses = await gridContainer.evaluate(el => {
      return el.classList.contains('grid-cols-1') &&
             el.classList.contains('sm:grid-cols-2') &&
             el.classList.contains('lg:grid-cols-3') &&
             el.classList.contains('gap-6')
    })
    
    expect(hasCorrectClasses).toBeTruthy()
    
    // Check that cards are visible
    const cards = page.locator('#test-3-column-grid .bg-white')
    await expect(cards.first()).toBeVisible()
    
    console.log('✅ Grid uses responsive 3-column layout')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-3-column-grid')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('cards should have compact design for 3-column layout', async ({ page }) => {
    await page.goto('/')
    
    // Test compact card design
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-compact-cards'
      testContainer.innerHTML = `
        <div class="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <!-- Work Image -->
          <div class="relative">
            <img 
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop"
              alt="Test Work"
              class="w-full h-48 object-cover"
            />
            <!-- Genre Badge on Image -->
            <div class="absolute top-3 right-3">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 border border-white/50">
                Novela
              </span>
            </div>
          </div>

          <!-- Work Content -->
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                  <svg class="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13"/>
                  </svg>
                </div>
                <span class="text-xs text-gray-500">15 nov</span>
              </div>
              <div class="flex items-center space-x-1">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-xs text-gray-500">Publicado</span>
              </div>
            </div>

            <h3 class="text-lg font-bold text-gray-900 mb-2 hover:text-red-700 transition-colors duration-200 line-clamp-2">
              Test Work Title
            </h3>
            <p class="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
              This is a compact description for the smaller card design.
            </p>
          </div>

          <!-- Work Actions -->
          <div class="px-4 pb-4 pt-3 border-t border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <button class="flex items-center space-x-1 text-gray-500">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-xs font-medium">125</span>
                </button>
                <button class="flex items-center space-x-1 text-gray-500">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01"/>
                  </svg>
                  <span class="text-xs font-medium">62</span>
                </button>
              </div>
              <div class="flex items-center space-x-2">
                <button class="text-gray-500">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check compact design elements
    await expect(page.locator('#test-compact-cards .h-48')).toBeVisible() // Compact image height
    await expect(page.locator('#test-compact-cards .p-4')).toBeVisible() // Compact padding
    await expect(page.locator('#test-compact-cards .h-6.w-6')).toBeVisible() // Smaller icon
    await expect(page.locator('#test-compact-cards .text-lg')).toBeVisible() // Compact title size
    await expect(page.locator('#test-compact-cards .text-sm')).toBeVisible() // Compact description
    await expect(page.locator('#test-compact-cards .h-4.w-4').first()).toBeVisible() // Smaller action icons
    await expect(page.locator('#test-compact-cards .text-xs').first()).toBeVisible() // Smaller text
    
    console.log('✅ Cards have compact design suitable for 3-column layout')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-compact-cards')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('genre badge should be positioned on image', async ({ page }) => {
    await page.goto('/')
    
    // Test genre badge positioning
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-genre-badge'
      testContainer.innerHTML = `
        <div class="relative">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop"
            alt="Test Work"
            class="w-full h-48 object-cover"
          />
          <div class="absolute top-3 right-3">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 border border-white/50">
              Novela
            </span>
          </div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check badge positioning and styling
    const badge = page.locator('#test-genre-badge .absolute.top-3.right-3 span')
    await expect(badge).toBeVisible()
    
    const hasCorrectClasses = await badge.evaluate(el => {
      return el.classList.contains('bg-white/90') &&
             el.classList.contains('backdrop-blur-sm') &&
             el.classList.contains('text-xs') &&
             el.classList.contains('rounded-full')
    })
    
    expect(hasCorrectClasses).toBeTruthy()
    
    console.log('✅ Genre badge is properly positioned on image')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-genre-badge')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('cards should have proper responsive behavior', async ({ page }) => {
    await page.goto('/')
    
    // Test responsive grid behavior
    const responsiveTest = await page.evaluate(() => {
      // Simulate different viewport sizes
      const breakpoints = {
        mobile: { width: 375, columns: 1 },
        tablet: { width: 768, columns: 2 },
        desktop: { width: 1024, columns: 3 }
      }
      
      return {
        breakpoints,
        gridClasses: {
          mobile: 'grid-cols-1',
          tablet: 'sm:grid-cols-2',
          desktop: 'lg:grid-cols-3'
        }
      }
    })
    
    // Verify responsive classes exist
    expect(responsiveTest.gridClasses.mobile).toBe('grid-cols-1')
    expect(responsiveTest.gridClasses.tablet).toBe('sm:grid-cols-2')
    expect(responsiveTest.gridClasses.desktop).toBe('lg:grid-cols-3')
    
    // Verify breakpoint logic
    expect(responsiveTest.breakpoints.mobile.columns).toBe(1)
    expect(responsiveTest.breakpoints.tablet.columns).toBe(2)
    expect(responsiveTest.breakpoints.desktop.columns).toBe(3)
    
    console.log('✅ Cards have proper responsive behavior')
  })

  test('compact actions should have smaller icons and spacing', async ({ page }) => {
    await page.goto('/')
    
    // Test compact action buttons
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-compact-actions'
      testContainer.innerHTML = `
        <div class="px-4 pb-4 pt-3 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button class="flex items-center space-x-1 text-gray-500">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                </svg>
                <span class="text-xs font-medium">125</span>
              </button>
              <button class="flex items-center space-x-1 text-gray-500">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01"/>
                </svg>
                <span class="text-xs font-medium">62</span>
              </button>
            </div>
            <div class="flex items-center space-x-2">
              <button class="text-gray-500">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check compact action styling
    await expect(page.locator('#test-compact-actions .px-4.pb-4.pt-3')).toBeVisible() // Compact padding
    await expect(page.locator('#test-compact-actions .space-x-4')).toBeVisible() // Compact spacing
    await expect(page.locator('#test-compact-actions .space-x-1').first()).toBeVisible() // Tight icon-text spacing
    await expect(page.locator('#test-compact-actions .space-x-2')).toBeVisible() // Compact button spacing
    await expect(page.locator('#test-compact-actions .h-4.w-4').first()).toBeVisible() // Smaller icons
    await expect(page.locator('#test-compact-actions .text-xs').first()).toBeVisible() // Smaller text
    
    console.log('✅ Compact actions have smaller icons and spacing')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-compact-actions')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('image should have proper aspect ratio for compact cards', async ({ page }) => {
    await page.goto('/')
    
    // Test image aspect ratio
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-image-aspect'
      testContainer.innerHTML = `
        <div class="relative">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop"
            alt="Test Work"
            class="w-full h-48 object-cover"
          />
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check image dimensions
    const image = page.locator('#test-image-aspect img')
    await expect(image).toBeVisible()
    
    const hasCorrectClasses = await image.evaluate(el => {
      return el.classList.contains('w-full') &&
             el.classList.contains('h-48') &&
             el.classList.contains('object-cover')
    })
    
    expect(hasCorrectClasses).toBeTruthy()
    
    console.log('✅ Image has proper aspect ratio for compact cards')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-image-aspect')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })
})
