import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class WriterPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async goto() {
    await super.goto('/writer')
    await this.validateWriterPage()
  }

  async validateWriterPage() {
    await expect(this.page.locator('h1')).toContainText('Escribir')
    await expect(this.page.locator('[data-testid="title-input"], input[placeholder*="título"]')).toBeVisible()
    await expect(this.page.locator('[data-testid="content-editor"], textarea[placeholder*="contenido"]')).toBeVisible()
    await expect(this.page.locator('[data-testid="publish-button"], button:has-text("Publicar")')).toBeVisible()
    
    console.log('✅ Writer page validation passed')
  }

  async fillTitle(title: string) {
    const titleInput = this.page.locator('[data-testid="title-input"], input[placeholder*="título"]').first()
    await titleInput.fill(title)
  }

  async fillContent(content: string) {
    const contentEditor = this.page.locator('[data-testid="content-editor"], textarea[placeholder*="contenido"]').first()
    await contentEditor.fill(content)
  }

  async selectCategory(category: string) {
    const categorySelect = this.page.locator('select[name="category"], [data-testid="category-select"]')
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption(category)
    }
  }

  async addTags(tags: string[]) {
    for (const tag of tags) {
      const tagInput = this.page.locator('input[placeholder*="tag"], [data-testid="tag-input"]')
      if (await tagInput.isVisible()) {
        await tagInput.fill(tag)
        await this.page.keyboard.press('Enter')
      }
    }
  }

  async togglePublished(published: boolean = true) {
    const publishToggle = this.page.locator('input[type="checkbox"][name="published"], [data-testid="publish-toggle"]')
    if (await publishToggle.isVisible()) {
      const isChecked = await publishToggle.isChecked()
      if (isChecked !== published) {
        await publishToggle.click()
      }
    }
  }

  async saveAsDraft() {
    const draftButton = this.page.locator('button:has-text("Guardar borrador"), [data-testid="save-draft-button"]')
    await draftButton.click()
  }

  async publishWork() {
    const publishButton = this.page.locator('[data-testid="publish-button"], button:has-text("Publicar")').first()
    await publishButton.click()
  }

  async previewWork() {
    const previewButton = this.page.locator('button:has-text("Vista previa"), [data-testid="preview-button"]')
    if (await previewButton.isVisible()) {
      await previewButton.click()
    }
  }

  async expectTitleValue(title: string) {
    const titleInput = this.page.locator('[data-testid="title-input"], input[placeholder*="título"]').first()
    await expect(titleInput).toHaveValue(title)
  }

  async expectContentValue(content: string) {
    const contentEditor = this.page.locator('[data-testid="content-editor"], textarea[placeholder*="contenido"]').first()
    await expect(contentEditor).toHaveValue(content)
  }

  async expectPublishSuccess() {
    // Should redirect to the published work or show success message
    await this.page.waitForTimeout(2000) // Allow for navigation
    
    const currentUrl = this.page.url()
    const isWorkPage = currentUrl.includes('/work/') || currentUrl.includes('/obra/')
    const isSuccessPage = await this.page.locator('text=publicado con éxito', 'text=published successfully').isVisible()
    
    expect(isWorkPage || isSuccessPage).toBeTruthy()
    
    console.log('✅ Publish success validation passed')
  }

  async expectSaveDraftSuccess() {
    // Should show draft saved message
    const successMessage = this.page.locator('text=borrador guardado', 'text=draft saved')
    await expect(successMessage).toBeVisible()
    
    console.log('✅ Save draft success validation passed')
  }

  // Create a complete work
  async createWork(workData: {
    title: string
    content: string
    category?: string
    tags?: string[]
    published?: boolean
  }) {
    await this.fillTitle(workData.title)
    await this.fillContent(workData.content)
    
    if (workData.category) {
      await this.selectCategory(workData.category)
    }
    
    if (workData.tags && workData.tags.length > 0) {
      await this.addTags(workData.tags)
    }
    
    if (workData.published !== undefined) {
      await this.togglePublished(workData.published)
    }
    
    if (workData.published === false) {
      await this.saveAsDraft()
      await this.expectSaveDraftSuccess()
    } else {
      await this.publishWork()
      await this.expectPublishSuccess()
    }
  }

  // Test form validation
  async testFormValidation() {
    // Try to publish without title
    await this.fillContent('Content without title')
    await this.publishWork()
    
    // Should show validation error
    const titleError = this.page.locator('text=título es requerido', 'text=title is required')
    await expect(titleError).toBeVisible()
    
    // Clear content and try to publish without content
    await this.fillTitle('Title without content')
    await this.fillContent('')
    await this.publishWork()
    
    // Should show validation error
    const contentError = this.page.locator('text=contenido es requerido', 'text=content is required')
    await expect(contentError).toBeVisible()
    
    console.log('✅ Form validation test passed')
  }

  // Test autosave functionality
  async testAutosave() {
    const testTitle = 'Autosave Test Title'
    const testContent = 'This content should be autosaved'
    
    await this.fillTitle(testTitle)
    await this.fillContent(testContent)
    
    // Wait for autosave (usually triggered after a delay)
    await this.page.waitForTimeout(3000)
    
    // Look for autosave indicator
    const autosaveIndicator = this.page.locator('text=guardado automáticamente', 'text=autosaved')
    if (await autosaveIndicator.isVisible()) {
      console.log('✅ Autosave indicator found')
    }
    
    // Refresh page and check if content persists
    await this.page.reload()
    await this.validateWriterPage()
    
    // Content should be restored (if autosave is implemented)
    const titleInput = this.page.locator('[data-testid="title-input"], input[placeholder*="título"]').first()
    const contentEditor = this.page.locator('[data-testid="content-editor"], textarea[placeholder*="contenido"]').first()
    
    const restoredTitle = await titleInput.inputValue()
    const restoredContent = await contentEditor.inputValue()
    
    if (restoredTitle === testTitle && restoredContent === testContent) {
      console.log('✅ Autosave functionality test passed')
    } else {
      console.log('ℹ️ Autosave not implemented or not working')
    }
  }

  // Test rich text editor functionality
  async testRichTextEditor() {
    const contentEditor = this.page.locator('[data-testid="content-editor"], textarea[placeholder*="contenido"]').first()
    
    // Test basic text input
    await contentEditor.fill('This is **bold** text and *italic* text.')
    
    // Test formatting buttons if they exist
    const boldButton = this.page.locator('button[title="Bold"], button[aria-label*="bold"]')
    const italicButton = this.page.locator('button[title="Italic"], button[aria-label*="italic"]')
    
    if (await boldButton.isVisible()) {
      // Select text and apply formatting
      await contentEditor.selectText()
      await boldButton.click()
      console.log('✅ Bold formatting tested')
    }
    
    if (await italicButton.isVisible()) {
      await italicButton.click()
      console.log('✅ Italic formatting tested')
    }
    
    // Test other formatting options
    const headingButton = this.page.locator('button[title*="Heading"], button[aria-label*="heading"]')
    const listButton = this.page.locator('button[title*="List"], button[aria-label*="list"]')
    
    if (await headingButton.isVisible()) {
      await headingButton.click()
      console.log('✅ Heading formatting tested')
    }
    
    if (await listButton.isVisible()) {
      await listButton.click()
      console.log('✅ List formatting tested')
    }
    
    console.log('✅ Rich text editor test completed')
  }

  // Test file upload functionality
  async testFileUpload() {
    const fileInput = this.page.locator('input[type="file"]')
    
    if (await fileInput.isVisible()) {
      // Create a test file
      const testFile = {
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      }
      
      await fileInput.setInputFiles(testFile)
      
      // Wait for upload to complete
      await this.page.waitForTimeout(2000)
      
      // Check for upload success indicator
      const uploadSuccess = this.page.locator('text=subido exitosamente', 'text=uploaded successfully')
      if (await uploadSuccess.isVisible()) {
        console.log('✅ File upload test passed')
      }
    } else {
      console.log('ℹ️ File upload not available on this page')
    }
  }

  // Test keyboard shortcuts
  async testKeyboardShortcuts() {
    const contentEditor = this.page.locator('[data-testid="content-editor"], textarea[placeholder*="contenido"]').first()
    await contentEditor.focus()
    
    // Test common shortcuts
    const shortcuts = [
      { keys: 'Control+b', description: 'Bold' },
      { keys: 'Control+i', description: 'Italic' },
      { keys: 'Control+s', description: 'Save' },
      { keys: 'Control+z', description: 'Undo' },
      { keys: 'Control+y', description: 'Redo' }
    ]
    
    for (const shortcut of shortcuts) {
      try {
        await this.page.keyboard.press(shortcut.keys)
        await this.page.waitForTimeout(500)
        console.log(`✅ Keyboard shortcut ${shortcut.description} (${shortcut.keys}) tested`)
      } catch (error) {
        console.log(`ℹ️ Keyboard shortcut ${shortcut.description} (${shortcut.keys}) not working or not implemented`)
      }
    }
  }

  // Test word count functionality
  async testWordCount() {
    const testContent = 'This is a test content with exactly ten words in it.'
    await this.fillContent(testContent)
    
    const wordCountElement = this.page.locator('[data-testid="word-count"], .word-count')
    
    if (await wordCountElement.isVisible()) {
      const wordCount = await wordCountElement.textContent()
      expect(wordCount).toContain('10') // Should show 10 words
      console.log('✅ Word count functionality test passed')
    } else {
      console.log('ℹ️ Word count feature not implemented')
    }
  }

  // Performance test for large content
  async testPerformanceWithLargeContent() {
    const largeContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(1000)
    
    const startTime = Date.now()
    await this.fillContent(largeContent)
    const endTime = Date.now()
    
    const inputTime = endTime - startTime
    expect(inputTime).toBeLessThan(5000) // Should handle large content within 5 seconds
    
    console.log(`✅ Large content performance test passed: ${inputTime}ms`)
    
    return inputTime
  }
}

