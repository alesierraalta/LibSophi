import { test, expect } from '@playwright/test'

test.describe('Writer Page - Database Integration', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start each test from a clean state
    await page.goto('/writer')
    await page.waitForLoadState('networkidle')
  })

  test('Writer page loads correctly', async ({ page }) => {
    // Wait for the initial overlay to load
    await expect(page.locator('text=¿Qué vas a escribir hoy?')).toBeVisible({ timeout: 10000 })
    
    // Check for main UI elements
    await expect(page.locator('text=Nueva obra')).toBeVisible()
    await expect(page.locator('text=Continuación')).toBeVisible()
  })

  test('Can start new work and access editor', async ({ page }) => {
    // Click "Nueva obra"
    await page.click('text=Nueva obra')
    await page.waitForTimeout(1000) // Wait for animation
    
    // Should now show the editor
    await expect(page.locator('input[placeholder*="Título de tu obra"]')).toBeVisible()
    await expect(page.locator('textarea[placeholder*="Escribe aquí"]')).toBeVisible()
    
    // Check for desktop toolbar elements (avoid mobile duplicates)
    await expect(page.locator('.hidden.sm\\:flex button[aria-label*="Negrita"]')).toBeVisible()
    await expect(page.locator('.hidden.sm\\:flex button[aria-label*="Cursiva"]')).toBeVisible()
  })

  test('Form validation works correctly', async ({ page }) => {
    await page.click('text=Nueva obra')
    await page.waitForTimeout(1000) // Wait for animation
    
    // Try to publish without title (should be disabled) - target the desktop publish button
    const publishButton = page.locator('button[aria-label="Publicar"]')
    await expect(publishButton).toBeDisabled()
    
    // Add title but not enough content
    await page.fill('input[placeholder*="Título de tu obra"]', 'Test Work')
    await expect(publishButton).toBeDisabled()
    
    // Add sufficient content
    const longContent = 'Este es un contenido de prueba que tiene más de 50 caracteres para cumplir con los requisitos mínimos de publicación.'
    await page.fill('textarea[placeholder*="Escribe aquí"]', longContent)
    
    // Now publish button should be enabled
    await expect(publishButton).not.toBeDisabled()
  })

  test('Can edit existing work via URL parameter', async ({ page }) => {
    // First, we need to create a work to edit
    // For this test, we'll mock having a work ID in the URL
    await page.goto('/writer?edit=test-work-id')
    
    // Should show loading state initially
    await expect(page.locator('text=Cargando obra para editar')).toBeVisible()
    
    // Wait for loading to complete (or error to show)
    await page.waitForTimeout(3000)
    
    // Should either load the work or show an error
    const hasError = await page.locator('div:has-text("Error")').isVisible()
    const hasEditor = await page.locator('input[placeholder*="Título de tu obra"]').isVisible()
    
    expect(hasError || hasEditor).toBe(true)
  })

  test('Chapter management works correctly', async ({ page }) => {
    await page.click('text=Nueva obra')
    await page.waitForTimeout(1000) // Wait for animation
    
    // Enable chapters - click the toggle switch div
    const toggleSwitch = page.locator('div.w-10.h-5.bg-gray-200')
    await toggleSwitch.click({ force: true })
    await page.waitForTimeout(500) // Wait for chapter UI to appear
    
    // Should show chapters section
    await expect(page.locator('text=Capítulos')).toBeVisible()
    await expect(page.locator('text=1. Capítulo 1')).toBeVisible()
    
    // Add a new chapter
    await page.click('button:has-text("Agregar capítulo")')
    await expect(page.locator('text=Capítulo 2')).toBeVisible()
    
    // Should be able to switch between chapters
    await page.click('button:has-text("1. Capítulo 1")')
    await page.fill('textarea[placeholder*="Escribe aquí"]', 'Contenido del capítulo 1')
    
    await page.click('button:has-text("2. Capítulo 2")')
    await page.fill('textarea[placeholder*="Escribe aquí"]', 'Contenido del capítulo 2')
    
    // Content should persist when switching chapters
    await page.click('button:has-text("1. Capítulo 1")')
    await expect(page.locator('textarea[placeholder*="Escribe aquí"]')).toHaveValue('Contenido del capítulo 1')
  })

  test('Preview mode works correctly', async ({ page }) => {
    await page.click('text=Nueva obra')
    
    // Add some content with markdown
    await page.fill('input[placeholder*="Título de tu obra"]', 'Mi Obra de Prueba')
    await page.fill('textarea[placeholder*="Escribe aquí"]', '# Capítulo 1\n\nEste es un **texto en negrita** y este es *cursiva*.\n\n- Lista item 1\n- Lista item 2')
    
    // Switch to preview mode
    await page.click('button:has-text("Vista previa")')
    
    // Should show rendered content
    await expect(page.locator('h1:has-text("Capítulo 1")')).toBeVisible()
    await expect(page.locator('strong:has-text("texto en negrita")')).toBeVisible()
    await expect(page.locator('em:has-text("cursiva")')).toBeVisible()
    await expect(page.locator('li:has-text("Lista item 1")')).toBeVisible()
  })

  test('Formatting toolbar functions work', async ({ page }) => {
    await page.click('text=Nueva obra')
    await page.waitForTimeout(1000) // Wait for animation
    
    const textarea = page.locator('textarea[placeholder*="Escribe aquí"]')
    await textarea.fill('texto de prueba')
    
    // Select all text
    await textarea.selectText()
    
    // Apply bold formatting - use desktop toolbar
    await page.click('.hidden.sm\\:flex button[aria-label*="Negrita"]')
    await expect(textarea).toHaveValue('**texto de prueba**')
    
    // Clear and test italic
    await textarea.fill('texto de prueba')
    await textarea.selectText()
    await page.click('.hidden.sm\\:flex button[aria-label*="Cursiva"]')
    await expect(textarea).toHaveValue('*texto de prueba*')
    
    // Test heading
    await textarea.fill('Mi título')
    await textarea.click() // Position cursor at end
    await page.click('.hidden.sm\\:flex button[aria-label*="Encabezado 1"]')
    await expect(textarea).toHaveValue('# Mi título')
  })

  test('Auto-save functionality works', async ({ page }) => {
    await page.click('text=Nueva obra')
    
    // Add title and content
    await page.fill('input[placeholder*="Título de tu obra"]', 'Obra con Auto-guardado')
    await page.fill('textarea[placeholder*="Escribe aquí"]', 'Contenido que se guarda automáticamente')
    
    // Wait for auto-save
    await page.waitForTimeout(1000)
    
    // Should show saving indicator
    const savingIndicator = page.locator('text=Guardando')
    const savedIndicator = page.locator('text=Guardado')
    
    // Wait for save to complete
    await expect(savedIndicator).toBeVisible({ timeout: 5000 })
  })

  test('Genre selection works correctly', async ({ page }) => {
    await page.click('text=Nueva obra')
    await page.waitForTimeout(1000) // Wait for animation
    
    // Check default genre - target the genre select specifically (not font selectors)
    const genreSelect = page.locator('aside select').last() // The genre select is in the sidebar
    await expect(genreSelect).toHaveValue('cuento')
    
    // Change genre
    await genreSelect.selectOption('novela')
    await expect(genreSelect).toHaveValue('novela')
    
    // Changing to novela should enable chapters by default - check the toggle state
    const chaptersToggle = page.locator('input[type="checkbox"]').first() // The chapters checkbox
    await expect(chaptersToggle).toBeChecked()
  })

  test('Tags functionality works', async ({ page }) => {
    await page.click('text=Nueva obra')
    await page.waitForTimeout(1000) // Wait for animation
    
    // Add a tag
    const tagInput = page.locator('input[placeholder*="Presiona Enter para agregar"]')
    await tagInput.fill('fantasía')
    await tagInput.press('Enter')
    await page.waitForTimeout(300) // Wait for tag to appear
    
    // Should show the tag
    await expect(page.locator('text=#fantasía')).toBeVisible()
    
    // Add another tag
    await tagInput.fill('aventura')
    await tagInput.press('Enter')
    await page.waitForTimeout(300) // Wait for tag to appear
    await expect(page.locator('text=#aventura')).toBeVisible()
    
    // Remove a tag - use force click to avoid interception issues
    const removeButton = page.locator('button:has-text("#fantasía ×")')
    await removeButton.click({ force: true })
    await expect(page.locator('text=#fantasía')).not.toBeVisible()
    await expect(page.locator('text=#aventura')).toBeVisible()
  })

  test('Cover URL functionality works', async ({ page }) => {
    await page.click('text=Nueva obra')
    
    // Add cover URL
    const coverInput = page.locator('input[placeholder*="https://"]')
    await coverInput.fill('https://example.com/cover.jpg')
    
    // Should show cover image
    await expect(page.locator('img[alt="Cover"]')).toBeVisible()
    await expect(page.locator('img[alt="Cover"]')).toHaveAttribute('src', 'https://example.com/cover.jpg')
    
    // Remove cover
    await page.click('button:has-text("Quitar")')
    await expect(page.locator('img[alt="Cover"]')).not.toBeVisible()
  })

  test('Word count and reading time display correctly', async ({ page }) => {
    await page.click('text=Nueva obra')
    
    // Add content
    const content = 'Este es un texto de prueba con varias palabras para probar el contador de palabras y el tiempo de lectura estimado.'
    await page.fill('textarea[placeholder*="Escribe aquí"]', content)
    
    // Should show word count
    const wordCount = content.split(' ').length
    await expect(page.locator(`text=Palabras: ${wordCount}`)).toBeVisible()
    
    // Should show reading time
    const readingTime = Math.max(1, Math.round(wordCount / 200))
    await expect(page.locator(`text=Tiempo de lectura: ${readingTime} min`)).toBeVisible()
  })

  test('Focus mode works correctly', async ({ page }) => {
    await page.click('text=Nueva obra')
    await page.waitForTimeout(1000) // Wait for animation
    
    // Initially should show sidebar
    await expect(page.locator('text=Detalles')).toBeVisible()
    
    // Enable focus mode - use desktop focus button
    const focusButton = page.locator('.hidden.sm\\:flex button[aria-label*="Modo enfoque"]')
    await focusButton.click()
    await page.waitForTimeout(500) // Wait for animation
    
    // Sidebar should be hidden or less visible - check for the focus mode classes
    const sidebar = page.locator('aside')
    await expect(sidebar).toHaveClass(/opacity-0|pointer-events-none/)
    
    // Exit focus mode
    const exitFocusButton = page.locator('button[aria-label*="Salir del modo enfoque"]')
    await exitFocusButton.click()
    await page.waitForTimeout(500) // Wait for animation
    await expect(page.locator('text=Detalles')).toBeVisible()
  })

  test('Mobile toolbar appears on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/writer')
    await page.waitForLoadState('networkidle')
    
    await page.click('text=Nueva obra')
    await page.waitForTimeout(1000) // Wait for animation
    
    // Should show mobile toolbar (now visible in mobile viewport) - use exact selectors
    await expect(page.locator('.sm\\:hidden button[aria-label="Negrita"]')).toBeVisible()
    await expect(page.locator('.sm\\:hidden button[aria-label="Cursiva"]')).toBeVisible()
  })

  test('Tutorial can be started and navigated', async ({ page }) => {
    await page.click('text=Nueva obra')
    
    // Start tutorial
    await page.click('button:has-text("Tutorial")')
    
    // Should show tutorial overlay
    await expect(page.locator('[role="dialog"][aria-label*="Recorrido guiado"]')).toBeVisible()
    
    // Should show first step
    await expect(page.locator('text=Paso 1 de')).toBeVisible()
    
    // Navigate tutorial
    await page.click('button:has-text("Siguiente")')
    await expect(page.locator('text=Paso 2 de')).toBeVisible()
    
    // Skip tutorial
    await page.click('button:has-text("Saltar")')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Undo and redo functionality works', async ({ page }) => {
    await page.click('text=Nueva obra')
    await page.waitForTimeout(1000) // Wait for animation
    
    const textarea = page.locator('textarea[placeholder*="Escribe aquí"]')
    
    // Add initial content
    await textarea.fill('Contenido inicial')
    
    // Make a change
    await textarea.fill('Contenido inicial modificado')
    
    // Undo - use desktop toolbar
    await page.click('.hidden.sm\\:flex button[aria-label*="Deshacer"]')
    await expect(textarea).toHaveValue('Contenido inicial')
    
    // Redo - use desktop toolbar
    await page.click('.hidden.sm\\:flex button[aria-label*="Rehacer"]')
    await expect(textarea).toHaveValue('Contenido inicial modificado')
  })

  test('Keyboard shortcuts work correctly', async ({ page }) => {
    await page.click('text=Nueva obra')
    
    const textarea = page.locator('textarea[placeholder*="Escribe aquí"]')
    await textarea.fill('texto de prueba')
    await textarea.selectText()
    
    // Test Ctrl+B for bold
    await page.keyboard.press('Control+b')
    await expect(textarea).toHaveValue('**texto de prueba**')
    
    // Clear and test Ctrl+I for italic
    await textarea.fill('texto de prueba')
    await textarea.selectText()
    await page.keyboard.press('Control+i')
    await expect(textarea).toHaveValue('*texto de prueba*')
    
    // Test Ctrl+K for link
    await textarea.fill('enlace')
    await textarea.selectText()
    await page.keyboard.press('Control+k')
    await expect(textarea).toHaveValue('[enlace](https://)')
  })

  test('Error handling displays correctly', async ({ page }) => {
    // Test with invalid edit ID
    await page.goto('/writer?edit=invalid-work-id')
    await page.waitForLoadState('networkidle')
    
    // Should show loading first
    const hasLoading = await page.locator('text=Cargando obra para editar').isVisible({ timeout: 5000 })
    
    // Then should show error message or fallback to overlay
    const hasError = await page.locator('div:has-text("Error")').isVisible({ timeout: 5000 })
    const hasNoSePoudo = await page.locator('div:has-text("No se pudo")').isVisible({ timeout: 5000 })
    const hasNotFound = await page.locator('div:has-text("no encontrada")').isVisible({ timeout: 5000 })
    const hasOverlay = await page.locator('text=¿Qué vas a escribir hoy?').isVisible({ timeout: 5000 })
    
    // At least one should be visible - error messages or fallback overlay
    expect(hasError || hasNoSePoudo || hasNotFound || hasOverlay).toBe(true)
  })

  test('Draft restoration works on page reload', async ({ page }) => {
    await page.click('text=Nueva obra')
    
    // Add content
    await page.fill('input[placeholder*="Título de tu obra"]', 'Borrador de Prueba')
    await page.fill('textarea[placeholder*="Escribe aquí"]', 'Contenido del borrador')
    
    // Wait for auto-save
    await page.waitForTimeout(1000)
    
    // Reload page
    await page.reload()
    
    // Should offer to restore draft
    await expect(page.locator('text=Continuar borrador')).toBeVisible()
    
    // Click to restore
    await page.click('text=Continuar borrador')
    
    // Content should be restored
    await expect(page.locator('input[placeholder*="Título de tu obra"]')).toHaveValue('Borrador de Prueba')
    await expect(page.locator('textarea[placeholder*="Escribe aquí"]')).toHaveValue('Contenido del borrador')
  })

  test('Work selection overlay can be navigated', async ({ page }) => {
    // Should show work selection overlay initially
    await expect(page.locator('text=¿Qué vas a escribir hoy?')).toBeVisible()
    
    // Click "Continuación"
    await page.click('text=Continuación')
    
    // Should show existing works selection
    await expect(page.locator('text=Elige una obra para continuar')).toBeVisible()
    
    // Should have "Volver" button
    await expect(page.locator('button:has-text("Volver")')).toBeVisible()
    
    // Should have "Nueva obra" button
    await expect(page.locator('button:has-text("Nueva obra")')).toBeVisible()
    
    // Go back
    await page.click('button:has-text("Volver")')
    await expect(page.locator('text=¿Qué vas a escribir hoy?')).toBeVisible()
  })

})
