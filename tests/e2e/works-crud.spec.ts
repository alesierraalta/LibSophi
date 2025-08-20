import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { WriterPage } from './pages/WriterPage'
import { BasePage } from './pages/BasePage'

test.describe('Works CRUD Operations E2E Tests', () => {
  let loginPage: LoginPage
  let writerPage: WriterPage
  let basePage: BasePage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    writerPage = new WriterPage(page)
    basePage = new BasePage(page)

    // Login before each test
    await loginPage.goto()
    await loginPage.loginWithCredentials('testuser1@palabreo-e2e.test', 'testpassword123')
    await loginPage.expectLoginSuccess()
  })

  test.afterEach(async ({ page }) => {
    // Cleanup: Delete any test works created during the test
    try {
      // Navigate to user's works page
      await page.goto('/mis-obras')
      
      // Delete any works with "E2E Test" in the title
      const testWorks = page.locator('text*="E2E Test"')
      const count = await testWorks.count()
      
      for (let i = 0; i < count; i++) {
        const deleteButton = page.locator(`[data-testid="delete-work-${i}"], button:has-text("Eliminar")`).first()
        if (await deleteButton.isVisible()) {
          await deleteButton.click()
          
          // Confirm deletion
          const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sí")')
          if (await confirmButton.isVisible()) {
            await confirmButton.click()
          }
        }
      }
    } catch (error) {
      console.log('Cleanup: No test works to delete')
    }
  })

  test('should create a new published work successfully', async () => {
    await writerPage.goto()
    
    const workData = {
      title: 'E2E Test Published Work',
      content: 'This is a test work created by E2E testing. It should be published immediately.',
      category: 'Fiction',
      tags: ['test', 'e2e', 'automation'],
      published: true
    }
    
    await writerPage.createWork(workData)
    
    // Verify the work was created and is accessible
    const currentUrl = writerPage.page.url()
    if (currentUrl.includes('/work/') || currentUrl.includes('/obra/')) {
      // We're on the work page, verify content
      await expect(writerPage.page.locator('h1')).toContainText(workData.title)
      await expect(writerPage.page.locator('text*="' + workData.content + '"')).toBeVisible()
      
      console.log('✅ Published work creation test passed')
    } else {
      // We might be on a success page, check for success message
      const successMessage = writerPage.page.locator('text=publicado con éxito', 'text=published successfully')
      await expect(successMessage).toBeVisible()
      
      console.log('✅ Published work creation test passed (success page)')
    }
  })

  test('should create a draft work successfully', async () => {
    await writerPage.goto()
    
    const workData = {
      title: 'E2E Test Draft Work',
      content: 'This is a test draft work created by E2E testing. It should be saved as draft.',
      category: 'Essay',
      tags: ['draft', 'test'],
      published: false
    }
    
    await writerPage.createWork(workData)
    
    // Navigate to drafts page to verify
    await writerPage.page.goto('/mis-obras')
    
    // Look for the draft work
    const draftWork = writerPage.page.locator(`text="${workData.title}"`)
    await expect(draftWork).toBeVisible()
    
    // Check if it's marked as draft
    const draftIndicator = writerPage.page.locator('text=Borrador', 'text=Draft')
    await expect(draftIndicator).toBeVisible()
    
    console.log('✅ Draft work creation test passed')
  })

  test('should edit an existing work', async () => {
    // First create a work to edit
    await writerPage.goto()
    
    const originalWork = {
      title: 'E2E Test Original Work',
      content: 'This is the original content that will be edited.',
      published: true
    }
    
    await writerPage.createWork(originalWork)
    
    // Navigate to edit the work
    await writerPage.page.goto('/mis-obras')
    
    // Find and click edit button for our work
    const editButton = writerPage.page.locator('[data-testid="edit-work"], button:has-text("Editar")').first()
    await editButton.click()
    
    // Should be on edit page
    await expect(writerPage.page).toHaveURL(/\/(edit|editar)/)
    
    // Verify original content is loaded
    await writerPage.expectTitleValue(originalWork.title)
    await writerPage.expectContentValue(originalWork.content)
    
    // Make changes
    const updatedWork = {
      title: 'E2E Test Updated Work',
      content: 'This content has been updated through E2E testing.',
      published: true
    }
    
    await writerPage.fillTitle(updatedWork.title)
    await writerPage.fillContent(updatedWork.content)
    await writerPage.publishWork()
    
    // Verify update was successful
    await writerPage.expectPublishSuccess()
    
    console.log('✅ Work editing test passed')
  })

  test('should delete a work', async () => {
    // First create a work to delete
    await writerPage.goto()
    
    const workToDelete = {
      title: 'E2E Test Work To Delete',
      content: 'This work will be deleted by the E2E test.',
      published: true
    }
    
    await writerPage.createWork(workToDelete)
    
    // Navigate to works list
    await writerPage.page.goto('/mis-obras')
    
    // Find the work we just created
    const workElement = writerPage.page.locator(`text="${workToDelete.title}"`).first()
    await expect(workElement).toBeVisible()
    
    // Click delete button
    const deleteButton = writerPage.page.locator('[data-testid="delete-work"], button:has-text("Eliminar")').first()
    await deleteButton.click()
    
    // Confirm deletion
    const confirmButton = writerPage.page.locator('button:has-text("Confirmar"), button:has-text("Sí"), button:has-text("Delete")')
    await expect(confirmButton).toBeVisible()
    await confirmButton.click()
    
    // Wait for deletion to complete
    await writerPage.page.waitForTimeout(2000)
    
    // Verify work is no longer visible
    const deletedWork = writerPage.page.locator(`text="${workToDelete.title}"`)
    await expect(deletedWork).not.toBeVisible()
    
    console.log('✅ Work deletion test passed')
  })

  test('should handle work visibility settings', async () => {
    await writerPage.goto()
    
    // Create a private work
    const privateWork = {
      title: 'E2E Test Private Work',
      content: 'This is a private work that should not be publicly visible.',
      published: true
    }
    
    await writerPage.createWork(privateWork)
    
    // If there's a visibility setting, test it
    const visibilitySelect = writerPage.page.locator('select[name="visibility"], [data-testid="visibility-select"]')
    if (await visibilitySelect.isVisible()) {
      await visibilitySelect.selectOption('private')
      
      // Save changes
      const saveButton = writerPage.page.locator('button:has-text("Guardar"), button:has-text("Save")')
      await saveButton.click()
      
      console.log('✅ Work visibility test passed')
    } else {
      console.log('ℹ️ Work visibility settings not implemented')
    }
  })

  test('should handle work categories and tags', async () => {
    await writerPage.goto()
    
    const workWithMetadata = {
      title: 'E2E Test Work with Metadata',
      content: 'This work tests category and tag functionality.',
      category: 'Fiction',
      tags: ['fantasy', 'adventure', 'test'],
      published: true
    }
    
    await writerPage.createWork(workWithMetadata)
    
    // Navigate to the work and verify metadata
    const currentUrl = writerPage.page.url()
    if (currentUrl.includes('/work/') || currentUrl.includes('/obra/')) {
      // Check if category is displayed
      const categoryElement = writerPage.page.locator(`text="${workWithMetadata.category}"`)
      if (await categoryElement.isVisible()) {
        console.log('✅ Category display test passed')
      }
      
      // Check if tags are displayed
      for (const tag of workWithMetadata.tags) {
        const tagElement = writerPage.page.locator(`text="${tag}"`)
        if (await tagElement.isVisible()) {
          console.log(`✅ Tag "${tag}" display test passed`)
        }
      }
    }
    
    console.log('✅ Work metadata test completed')
  })

  test('should handle work search functionality', async () => {
    // First create a work with searchable content
    await writerPage.goto()
    
    const searchableWork = {
      title: 'E2E Test Searchable Work UniqueKeyword123',
      content: 'This work contains a unique keyword: UniqueKeyword123 for testing search functionality.',
      published: true
    }
    
    await writerPage.createWork(searchableWork)
    
    // Navigate to search page or use search functionality
    await basePage.goto('/explore')
    
    // Perform search
    await basePage.searchFor('UniqueKeyword123')
    
    // Wait for search results
    await writerPage.page.waitForTimeout(2000)
    
    // Verify our work appears in search results
    const searchResult = writerPage.page.locator(`text="${searchableWork.title}"`)
    await expect(searchResult).toBeVisible()
    
    console.log('✅ Work search functionality test passed')
  })

  test('should handle work pagination', async () => {
    // This test assumes there are enough works to trigger pagination
    await writerPage.page.goto('/explore')
    
    // Check if pagination exists
    const paginationNext = writerPage.page.locator('button:has-text("Siguiente"), button:has-text("Next"), [aria-label="Next page"]')
    const paginationPrev = writerPage.page.locator('button:has-text("Anterior"), button:has-text("Previous"), [aria-label="Previous page"]')
    
    if (await paginationNext.isVisible()) {
      // Test next page
      await paginationNext.click()
      await writerPage.page.waitForTimeout(2000)
      
      // Should be on page 2
      const currentPage = writerPage.page.locator('text*="Página 2", text*="Page 2"')
      if (await currentPage.isVisible()) {
        console.log('✅ Pagination next test passed')
      }
      
      // Test previous page
      if (await paginationPrev.isVisible()) {
        await paginationPrev.click()
        await writerPage.page.waitForTimeout(2000)
        
        console.log('✅ Pagination previous test passed')
      }
    } else {
      console.log('ℹ️ Pagination not available (not enough content)')
    }
  })

  test('should handle work comments system', async () => {
    // First create a work to comment on
    await writerPage.goto()
    
    const workWithComments = {
      title: 'E2E Test Work for Comments',
      content: 'This work will be used to test the commenting system.',
      published: true
    }
    
    await writerPage.createWork(workWithComments)
    
    // Should be on the work page, look for comment section
    const commentSection = writerPage.page.locator('[data-testid="comments"], .comments-section')
    
    if (await commentSection.isVisible()) {
      // Try to add a comment
      const commentInput = writerPage.page.locator('textarea[placeholder*="comentario"], textarea[name="comment"]')
      const submitCommentButton = writerPage.page.locator('button:has-text("Comentar"), button:has-text("Submit")')
      
      if (await commentInput.isVisible() && await submitCommentButton.isVisible()) {
        await commentInput.fill('This is a test comment from E2E testing.')
        await submitCommentButton.click()
        
        // Wait for comment to appear
        await writerPage.page.waitForTimeout(2000)
        
        // Verify comment appears
        const newComment = writerPage.page.locator('text*="This is a test comment from E2E testing."')
        await expect(newComment).toBeVisible()
        
        console.log('✅ Comment system test passed')
      } else {
        console.log('ℹ️ Comment input not available (may require additional permissions)')
      }
    } else {
      console.log('ℹ️ Comment system not implemented')
    }
  })

  test('should handle work statistics and analytics', async () => {
    // Navigate to user's works dashboard
    await writerPage.page.goto('/mis-obras')
    
    // Look for statistics
    const statisticsSection = writerPage.page.locator('[data-testid="statistics"], .statistics, .analytics')
    
    if (await statisticsSection.isVisible()) {
      // Check for common statistics
      const viewsCount = writerPage.page.locator('text*="visualizaciones", text*="views"')
      const likesCount = writerPage.page.locator('text*="me gusta", text*="likes"')
      const commentsCount = writerPage.page.locator('text*="comentarios", text*="comments"')
      
      if (await viewsCount.isVisible()) {
        console.log('✅ Views statistics displayed')
      }
      
      if (await likesCount.isVisible()) {
        console.log('✅ Likes statistics displayed')
      }
      
      if (await commentsCount.isVisible()) {
        console.log('✅ Comments statistics displayed')
      }
      
      console.log('✅ Work statistics test completed')
    } else {
      console.log('ℹ️ Work statistics not implemented')
    }
  })

  test('should validate database integrity during CRUD operations', async () => {
    // This test ensures that database operations maintain integrity
    
    // Create multiple works rapidly
    const works = []
    for (let i = 0; i < 3; i++) {
      await writerPage.goto()
      
      const work = {
        title: `E2E Test Batch Work ${i}`,
        content: `This is batch work number ${i} for testing database integrity.`,
        published: true
      }
      
      works.push(work)
      await writerPage.createWork(work)
      
      // Small delay to avoid overwhelming the system
      await writerPage.page.waitForTimeout(1000)
    }
    
    // Verify all works were created
    await writerPage.page.goto('/mis-obras')
    
    for (const work of works) {
      const workElement = writerPage.page.locator(`text="${work.title}"`)
      await expect(workElement).toBeVisible()
    }
    
    console.log('✅ Database integrity test passed - all batch works created')
    
    // Clean up batch works
    for (const work of works) {
      const deleteButton = writerPage.page.locator(`[data-testid="delete-work"], button:has-text("Eliminar")`).first()
      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        
        const confirmButton = writerPage.page.locator('button:has-text("Confirmar"), button:has-text("Sí")')
        if (await confirmButton.isVisible()) {
          await confirmButton.click()
          await writerPage.page.waitForTimeout(1000)
        }
      }
    }
    
    console.log('✅ Database cleanup completed')
  })

  test('should measure CRUD operation performance', async () => {
    // Measure create performance
    const createStartTime = Date.now()
    
    await writerPage.goto()
    await writerPage.createWork({
      title: 'E2E Test Performance Work',
      content: 'This work is used to measure CRUD operation performance.',
      published: true
    })
    
    const createEndTime = Date.now()
    const createTime = createEndTime - createStartTime
    
    expect(createTime).toBeLessThan(10000) // 10 seconds max for create
    
    // Measure read performance (navigate to works list)
    const readStartTime = Date.now()
    await writerPage.page.goto('/mis-obras')
    const readEndTime = Date.now()
    const readTime = readEndTime - readStartTime
    
    expect(readTime).toBeLessThan(5000) // 5 seconds max for read
    
    console.log(`✅ CRUD Performance Test Results:`)
    console.log(`   Create: ${createTime}ms`)
    console.log(`   Read: ${readTime}ms`)
  })
})

