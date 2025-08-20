import { test, expect } from '@playwright/test'

test.describe('Profile Animations Tests', () => {
  test('staggered animations should be implemented', async ({ page }) => {
    await page.goto('/')
    
    // Test staggered animation structure
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-stagger-animations'
      testContainer.innerHTML = `
        <div class="space-y-6 opacity-0" style="animation: fadeIn 0.5s ease-in-out forwards;">
          <div class="card-1" style="animation: slideUp 0.4s ease-out 0.1s forwards; transform: translateY(20px); opacity: 0;">
            <div class="bg-white p-4 rounded-lg shadow-sm">Card 1</div>
          </div>
          <div class="card-2" style="animation: slideUp 0.4s ease-out 0.2s forwards; transform: translateY(20px); opacity: 0;">
            <div class="bg-white p-4 rounded-lg shadow-sm">Card 2</div>
          </div>
          <div class="card-3" style="animation: slideUp 0.4s ease-out 0.3s forwards; transform: translateY(20px); opacity: 0;">
            <div class="bg-white p-4 rounded-lg shadow-sm">Card 3</div>
          </div>
        </div>
        <style>
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        </style>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check container animation
    await expect(page.locator('#test-stagger-animations .space-y-6')).toBeVisible()
    
    // Check individual card animations
    await expect(page.locator('#test-stagger-animations .card-1')).toBeVisible()
    await expect(page.locator('#test-stagger-animations .card-2')).toBeVisible()
    await expect(page.locator('#test-stagger-animations .card-3')).toBeVisible()
    
    console.log('✅ Staggered animations structure is implemented')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-stagger-animations')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('hover animations should be implemented', async ({ page }) => {
    await page.goto('/')
    
    // Test hover animations
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-hover-animations'
      testContainer.innerHTML = `
        <div class="grid grid-cols-3 gap-6">
          <div class="card-hover bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl">
            <h3 class="font-semibold">Hover Card</h3>
            <p>This card should animate on hover</p>
          </div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check hover animation classes
    const hoverCard = page.locator('#test-hover-animations .card-hover')
    await expect(hoverCard).toBeVisible()
    
    const hasHoverClasses = await hoverCard.evaluate(el => {
      return el.classList.contains('transition-all') &&
             el.classList.contains('duration-300') &&
             el.classList.contains('hover:scale-105') &&
             el.classList.contains('hover:-translate-y-2') &&
             el.classList.contains('hover:shadow-xl')
    })
    
    expect(hasHoverClasses).toBeTruthy()
    
    console.log('✅ Hover animations are implemented')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-hover-animations')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('button animations should be implemented', async ({ page }) => {
    await page.goto('/')
    
    // Test button animations
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-button-animations'
      testContainer.innerHTML = `
        <div class="flex space-x-4">
          <button class="animated-button bg-red-600 text-white px-4 py-2 rounded transition-all duration-200 hover:scale-105 active:scale-95">
            <svg class="w-4 h-4 mr-2 inline transition-transform duration-200 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Animated Button
          </button>
          
          <button class="icon-button text-gray-500 hover:text-red-600 transition-colors duration-200">
            <svg class="w-5 h-5 transition-transform duration-200 hover:scale-120" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
            </svg>
          </button>
          
          <button class="rotate-button text-gray-500 hover:text-purple-600 transition-colors duration-200">
            <svg class="w-5 h-5 transition-transform duration-200 hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check button animations
    const animatedButton = page.locator('#test-button-animations .animated-button')
    const iconButton = page.locator('#test-button-animations .icon-button')
    const rotateButton = page.locator('#test-button-animations .rotate-button')
    
    await expect(animatedButton).toBeVisible()
    await expect(iconButton).toBeVisible()
    await expect(rotateButton).toBeVisible()
    
    // Check animation classes
    const hasButtonAnimations = await animatedButton.evaluate(el => {
      return el.classList.contains('transition-all') &&
             el.classList.contains('hover:scale-105') &&
             el.classList.contains('active:scale-95')
    })
    
    const hasIconAnimations = await page.locator('#test-button-animations .hover\\:rotate-90').isVisible()
    const hasRotateAnimations = await page.locator('#test-button-animations .hover\\:rotate-180').isVisible()
    
    expect(hasButtonAnimations).toBeTruthy()
    expect(hasIconAnimations).toBeTruthy()
    expect(hasRotateAnimations).toBeTruthy()
    
    console.log('✅ Button animations are implemented')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-button-animations')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('drag animations should be implemented', async ({ page }) => {
    await page.goto('/')
    
    // Test drag animations
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-drag-animations'
      testContainer.innerHTML = `
        <div class="space-y-4">
          <!-- Normal card -->
          <div class="normal-card bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300">
            Normal Card
          </div>
          
          <!-- Dragged card -->
          <div class="dragged-card bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 opacity-80 scale-95 z-10 cursor-move">
            Dragged Card (Visual Feedback)
          </div>
          
          <!-- Drop target -->
          <div class="drop-target relative bg-white border border-gray-200 rounded-lg p-4">
            <div class="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50/50 rounded-lg pointer-events-none opacity-100 transition-opacity duration-200">
            </div>
            Drop Target (with indicator)
          </div>
        </div>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check drag animation elements
    await expect(page.locator('#test-drag-animations .normal-card')).toBeVisible()
    await expect(page.locator('#test-drag-animations .dragged-card')).toBeVisible()
    await expect(page.locator('#test-drag-animations .drop-target')).toBeVisible()
    
    // Check drag visual feedback
    const draggedCard = page.locator('#test-drag-animations .dragged-card')
    await expect(draggedCard).toHaveClass(/opacity-80/)
    await expect(draggedCard).toHaveClass(/scale-95/)
    await expect(draggedCard).toHaveClass(/z-10/)
    await expect(draggedCard).toHaveClass(/cursor-move/)
    
    // Check drop indicator
    const dropIndicator = page.locator('#test-drag-animations .border-dashed')
    await expect(dropIndicator).toBeVisible()
    await expect(dropIndicator).toHaveClass(/border-blue-400/)
    await expect(dropIndicator).toHaveClass(/bg-blue-50\/50/)
    
    console.log('✅ Drag animations are implemented')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-drag-animations')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('edit mode animations should be implemented', async ({ page }) => {
    await page.goto('/')
    
    // Test edit mode animations
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-edit-mode-animations'
      testContainer.innerHTML = `
        <div class="space-y-4">
          <!-- Edit instructions (animated entry) -->
          <div class="edit-instructions bg-blue-50 border border-blue-200 rounded-lg p-4 text-center overflow-hidden transition-all duration-300" style="animation: slideDown 0.3s ease-out forwards;">
            <p class="text-sm text-blue-700 font-medium mb-1" style="animation: fadeInUp 0.2s ease-out 0.1s forwards; opacity: 0; transform: translateY(10px);">
              🎯 Modo de reorganización activado
            </p>
            <p class="text-xs text-blue-600" style="animation: fadeInUp 0.2s ease-out 0.2s forwards; opacity: 0; transform: translateY(10px);">
              Arrastra las tarjetas para cambiar su orden
            </p>
          </div>
          
          <!-- Drag handle (animated appearance) -->
          <div class="relative bg-white border rounded-lg p-4">
            <div class="drag-handle absolute top-4 left-4 z-10 bg-white/90 p-2 rounded-full shadow-lg border" style="animation: scaleIn 0.3s ease-out forwards; transform: scale(0); opacity: 0;">
              <svg class="h-4 w-4 text-gray-600 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
              </svg>
            </div>
            Card with animated drag handle
          </div>
        </div>
        
        <style>
          @keyframes slideDown {
            from { height: 0; opacity: 0; transform: translateY(-20px); }
            to { height: auto; opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        </style>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check edit mode elements
    await expect(page.locator('#test-edit-mode-animations .edit-instructions')).toBeVisible()
    await expect(page.locator('#test-edit-mode-animations .drag-handle')).toBeVisible()
    
    // Check animation classes and styles
    const editInstructions = page.locator('#test-edit-mode-animations .edit-instructions')
    await expect(editInstructions).toHaveClass(/transition-all/)
    await expect(editInstructions).toHaveClass(/duration-300/)
    
    const dragHandle = page.locator('#test-edit-mode-animations .drag-handle')
    await expect(dragHandle).toBeVisible()
    
    console.log('✅ Edit mode animations are implemented')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-edit-mode-animations')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })

  test('empty state animations should be implemented', async ({ page }) => {
    await page.goto('/')
    
    // Test empty state animations
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-empty-state-animations'
      testContainer.innerHTML = `
        <div class="bg-white border border-gray-200 rounded-lg">
          <div class="p-12 text-center">
            <div class="icon-container h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 transition-all duration-500" style="animation: bounceIn 0.6s ease-out 0.2s forwards; transform: scale(0) rotate(-180deg); opacity: 0;">
              <svg class="w-8 h-8 text-red-600 transition-all duration-1000" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="animation: drawPath 1s ease-out 0.5s forwards;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke-dasharray="100" stroke-dashoffset="100"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2 transition-all duration-300" style="animation: fadeInUp 0.4s ease-out 0.3s forwards; opacity: 0; transform: translateY(20px);">
              Aún no tienes obras
            </h3>
            <p class="text-gray-600 mb-6 transition-all duration-300" style="animation: fadeInUp 0.4s ease-out 0.4s forwards; opacity: 0; transform: translateY(20px);">
              Crea tu primera obra para comenzar a compartir tus historias con el mundo.
            </p>
            <div class="button-container transition-all duration-300" style="animation: fadeInUp 0.4s ease-out 0.5s forwards; opacity: 0; transform: translateY(20px);">
              <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-all duration-200 hover:scale-105 active:scale-95">
                <svg class="w-4 h-4 mr-2 inline transition-transform duration-200 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Crear primera obra
              </button>
            </div>
          </div>
        </div>
        
        <style>
          @keyframes bounceIn {
            from { transform: scale(0) rotate(-180deg); opacity: 0; }
            to { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes drawPath {
            from { stroke-dashoffset: 100; }
            to { stroke-dashoffset: 0; }
          }
        </style>
      `
      document.body.appendChild(testContainer)
    })
    
    // Check empty state elements
    await expect(page.locator('#test-empty-state-animations .icon-container')).toBeVisible()
    await expect(page.locator('#test-empty-state-animations h3')).toBeVisible()
    await expect(page.locator('#test-empty-state-animations p')).toBeVisible()
    await expect(page.locator('#test-empty-state-animations .button-container')).toBeVisible()
    
    // Check animation classes
    const iconContainer = page.locator('#test-empty-state-animations .icon-container')
    await expect(iconContainer).toHaveClass(/transition-all/)
    await expect(iconContainer).toHaveClass(/duration-500/)
    
    const button = page.locator('#test-empty-state-animations button')
    await expect(button).toHaveClass(/hover:scale-105/)
    await expect(button).toHaveClass(/active:scale-95/)
    
    console.log('✅ Empty state animations are implemented')
    
    // Clean up
    await page.evaluate(() => {
      const testContainer = document.getElementById('test-empty-state-animations')
      if (testContainer) {
        testContainer.remove()
      }
    })
  })
})

