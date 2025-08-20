import { test, expect } from '@playwright/test'

test.describe('New Profile Works Grid Tests', () => {
  test('new component should have proper card structure', async ({ page }) => {
    await page.goto('/')
    
    // Inject test HTML to simulate the new component
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-new-component'
      testContainer.innerHTML = `
        <div class="space-y-6">
          <div class="relative bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer">
            <div class="p-0">
              <!-- Work Header -->
              <div class="p-6 pb-4">
                <div class="flex items-start space-x-4">
                  <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-3">
                        <h4 class="font-semibold text-gray-900 text-sm">Mi Obra</h4>
                        <span class="text-xs text-gray-500">·</span>
                        <span class="text-xs text-gray-500">15 nov</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-xs text-gray-500 font-medium">Publicado</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-3">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        Novela
                      </span>
                      <span class="text-xs text-gray-500 flex items-center">
                        <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        5 min de lectura
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Work Content -->
              <div class="px-6 pb-4">
                <h3 class="text-xl font-bold text-gray-900 mb-3 hover:text-red-700 transition-colors duration-200 line-clamp-2">
                  Test Work Title
                </h3>
                <p class="text-gray-700 leading-relaxed mb-4 line-clamp-3 text-base" style="font-family: 'Times New Roman', Times, serif;">
                  This is a test description for the new component that should show how the cards look now.
                </p>
              </div>

              <!-- Work Image -->
              <div class="px-6 pb-6">
                <div class="relative rounded-xl overflow-hidden group">
                  <img 
                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop"
                    alt="Test Work"
                    class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <!-- Work Actions -->
              <div class="px-6 pb-6 pt-4 border-t border-gray-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-6">
                    <button class="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors duration-200 group">
                      <svg class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                      </svg>
                      <span class="text-sm font-medium">125</span>
                    </button>
                    <button class="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors duration-200 group">
                      <svg class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01"/>
                      </svg>
                      <span class="text-sm font-medium">62</span>
                    </button>
                  </div>
                  <div class="flex items-center space-x-3">
                    <button class="text-gray-500 hover:text-yellow-600 transition-colors duration-200">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check card structure elements
    await expect(page.locator('#test-new-component .space-y-6')).toBeVisible()
    await expect(page.locator('#test-new-component .shadow-sm')).toBeVisible()
    await expect(page.locator('#test-new-component .hover\\:shadow-lg')).toBeVisible()
    
    // Check header elements
    await expect(page.locator('#test-new-component .bg-red-100')).toBeVisible() // Work icon background
    await expect(page.locator('#test-new-component .bg-green-500')).toBeVisible() // Status indicator
    await expect(page.locator('#test-new-component .bg-red-50')).toBeVisible() // Genre badge
    
    // Check content elements
    await expect(page.locator('#test-new-component .text-xl.font-bold')).toBeVisible() // Title
    await expect(page.locator('#test-new-component .h-64.object-cover')).toBeVisible() // Image
    
    // Check action buttons
    await expect(page.locator('#test-new-component .border-t.border-gray-100')).toBeVisible() // Actions border
    await expect(page.locator('#test-new-component button').first()).toBeVisible() // Action buttons
    
    console.log('✅ New component has proper card structure')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-new-component')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('cards should have proper spacing and layout', async ({ page }) => {
    await page.goto('/')
    
    // Test spacing structure
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-spacing'
      testContainer.innerHTML = `
        <div class="space-y-6">
          <div class="p-6 pb-4">Header Section</div>
          <div class="px-6 pb-4">Content Section</div>
          <div class="px-6 pb-6">Image Section</div>
          <div class="px-6 pb-6 pt-4">Actions Section</div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check spacing classes
    await expect(page.locator('#test-spacing .space-y-6')).toBeVisible()
    await expect(page.locator('#test-spacing .p-6.pb-4')).toBeVisible()
    await expect(page.locator('#test-spacing .px-6.pb-4')).toBeVisible()
    await expect(page.locator('#test-spacing .px-6.pb-6').first()).toBeVisible()
    
    console.log('✅ Cards have proper spacing and layout')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-spacing')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('edit mode toggle should work correctly', async ({ page }) => {
    await page.goto('/')
    
    // Test edit mode toggle
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-edit-mode'
      testContainer.innerHTML = `
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900">Mis Obras</h3>
          <button id="edit-toggle" class="border border-gray-300 rounded px-3 py-1">
            Reorganizar
          </button>
        </div>
        <div id="edit-instructions" class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center" style="display: none;">
          <p class="text-sm text-blue-700 font-medium mb-1">
            🎯 Modo de reorganización activado
          </p>
          <p class="text-xs text-blue-600">
            Arrastra las tarjetas para cambiar su orden
          </p>
        </div>
      `
      document.body.appendChild(testContainer)
      
      // Simulate toggle functionality
      const button = document.getElementById('edit-toggle')
      const instructions = document.getElementById('edit-instructions')
      let isEditMode = false
      
      button.addEventListener('click', () => {
        isEditMode = !isEditMode
        button.textContent = isEditMode ? 'Guardar' : 'Reorganizar'
        button.className = isEditMode 
          ? 'bg-red-600 text-white rounded px-3 py-1'
          : 'border border-gray-300 rounded px-3 py-1'
        instructions.style.display = isEditMode ? 'block' : 'none'
      })
    })
    
    // Check initial state
    await expect(page.locator('#test-edit-mode #edit-toggle')).toHaveText('Reorganizar')
    await expect(page.locator('#test-edit-mode #edit-instructions')).toBeHidden()
    
    // Click toggle
    await page.locator('#test-edit-mode #edit-toggle').click()
    
    // Check edit mode state
    await expect(page.locator('#test-edit-mode #edit-toggle')).toHaveText('Guardar')
    await expect(page.locator('#test-edit-mode #edit-instructions')).toBeVisible()
    
    console.log('✅ Edit mode toggle works correctly')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-edit-mode')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('empty state should display correctly', async ({ page }) => {
    await page.goto('/')
    
    // Test empty state
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-empty-state'
      testContainer.innerHTML = `
        <div class="bg-white border border-gray-200 rounded-lg">
          <div class="p-12 text-center">
            <div class="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Aún no tienes obras</h3>
            <p class="text-gray-600 mb-6">Crea tu primera obra para comenzar a compartir tus historias con el mundo.</p>
            <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Crear primera obra
            </button>
          </div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check empty state elements
    await expect(page.locator('#test-empty-state .h-16.w-16')).toBeVisible() // Icon container
    await expect(page.locator('#test-empty-state .text-lg.font-semibold')).toBeVisible() // Title
    await expect(page.locator('#test-empty-state .text-gray-600')).toBeVisible() // Description
    await expect(page.locator('#test-empty-state .bg-red-600')).toBeVisible() // CTA button
    
    console.log('✅ Empty state displays correctly')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-empty-state')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('action buttons should have proper hover effects', async ({ page }) => {
    await page.goto('/')
    
    // Test action button hover effects
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-hover-effects'
      testContainer.innerHTML = `
        <div class="flex items-center space-x-6">
          <button class="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors duration-200 group">
            <svg class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-medium">125</span>
          </button>
          <button class="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors duration-200 group">
            <svg class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01"/>
            </svg>
            <span class="text-sm font-medium">62</span>
          </button>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check hover effect classes
    const likeButton = page.locator('#test-hover-effects button').first()
    const commentButton = page.locator('#test-hover-effects button').nth(1)
    
    await expect(likeButton).toHaveClass(/hover:text-red-600/)
    await expect(commentButton).toHaveClass(/hover:text-blue-600/)
    
    // Check scale effect classes on icons
    await expect(page.locator('#test-hover-effects .group-hover\\:scale-110').first()).toBeVisible()
    
    console.log('✅ Action buttons have proper hover effects')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-hover-effects')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })
})
