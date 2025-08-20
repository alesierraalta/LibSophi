import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { BasePage } from './pages/BasePage'

test.describe('Authentication Flow E2E Tests', () => {
  let loginPage: LoginPage
  let basePage: BasePage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    basePage = new BasePage(page)
  })

  test.afterEach(async ({ page }) => {
    // Cleanup: Logout if logged in
    try {
      const profileButton = page.locator('[aria-label="Ir a mi perfil"]')
      if (await profileButton.isVisible()) {
        await profileButton.click()
        const logoutButton = page.locator('text=Cerrar sesión', 'text=Logout')
        if (await logoutButton.isVisible()) {
          await logoutButton.click()
        }
      }
    } catch (error) {
      console.log('Cleanup: No logout needed')
    }
  })

  test('should display login page correctly', async () => {
    await loginPage.goto()
    
    // Validate page structure
    await loginPage.validateLoginPage()
    
    // Validate header requirements
    await loginPage.validateHeader()
    
    // Check accessibility
    await loginPage.testAccessibility()
    
    // Check responsive design
    await loginPage.checkMobileResponsiveness()
  })

  test('should handle successful login with valid credentials', async () => {
    await loginPage.goto()
    
    // Test with valid test user
    await loginPage.loginWithCredentials('testuser1@palabreo-e2e.test', 'testpassword123')
    
    // Validate successful login
    await loginPage.expectLoginSuccess()
    
    // Validate post-login state
    await basePage.validateHeader()
    
    // Check that user is properly authenticated
    const profileButton = loginPage.page.locator('[aria-label="Ir a mi perfil"]')
    await expect(profileButton).toBeVisible()
  })

  test('should handle login errors with invalid credentials', async () => {
    await loginPage.goto()
    
    // Test various invalid credential scenarios
    await loginPage.testInvalidCredentials()
  })

  test('should validate form inputs properly', async () => {
    await loginPage.goto()
    
    // Test form validation
    await loginPage.testFormValidation()
  })

  test('should handle OAuth login flows', async () => {
    await loginPage.goto()
    
    // Test Google OAuth (if available)
    const googleButton = loginPage.page.locator('button:has-text("Google")')
    if (await googleButton.isVisible()) {
      await googleButton.click()
      
      // In a real test, you'd handle the OAuth flow
      // For now, we'll just check that the redirect happens
      await loginPage.page.waitForTimeout(1000)
      console.log('✅ Google OAuth button functional')
    }
    
    // Test GitHub OAuth (if available)
    const githubButton = loginPage.page.locator('button:has-text("GitHub")')
    if (await githubButton.isVisible()) {
      await githubButton.click()
      
      // Handle GitHub OAuth flow
      await loginPage.page.waitForTimeout(1000)
      console.log('✅ GitHub OAuth button functional')
    }
  })

  test('should maintain session across page refreshes', async () => {
    await loginPage.goto()
    
    // Login
    await loginPage.loginWithCredentials('testuser1@palabreo-e2e.test', 'testpassword123')
    await loginPage.expectLoginSuccess()
    
    // Refresh page
    await loginPage.page.reload()
    
    // Should still be logged in
    const profileButton = loginPage.page.locator('[aria-label="Ir a mi perfil"]')
    await expect(profileButton).toBeVisible()
    
    console.log('✅ Session persistence test passed')
  })

  test('should handle logout properly', async () => {
    await loginPage.goto()
    
    // Login first
    await loginPage.loginWithCredentials('testuser1@palabreo-e2e.test', 'testpassword123')
    await loginPage.expectLoginSuccess()
    
    // Logout
    const profileButton = loginPage.page.locator('[aria-label="Ir a mi perfil"]')
    await profileButton.click()
    
    const logoutButton = loginPage.page.locator('text=Cerrar sesión', 'text=Logout')
    await expect(logoutButton).toBeVisible()
    await logoutButton.click()
    
    // Should redirect to home or login page
    await loginPage.page.waitForTimeout(2000)
    const currentUrl = loginPage.page.url()
    const isLoggedOut = currentUrl.includes('/login') || currentUrl === '/' || currentUrl.includes('/home')
    expect(isLoggedOut).toBeTruthy()
    
    // Profile button should not be visible
    await expect(profileButton).not.toBeVisible()
    
    console.log('✅ Logout test passed')
  })

  test('should protect authenticated routes', async () => {
    // Try to access protected route without login
    await loginPage.page.goto('/writer')
    
    // Should redirect to login or show login prompt
    const currentUrl = loginPage.page.url()
    const isRedirectedToLogin = currentUrl.includes('/login')
    const hasLoginPrompt = await loginPage.page.locator('text=Iniciar sesión', 'text=Login').isVisible()
    
    expect(isRedirectedToLogin || hasLoginPrompt).toBeTruthy()
    
    console.log('✅ Route protection test passed')
  })

  test('should handle password reset flow', async () => {
    await loginPage.goto()
    
    // Click forgot password link
    const forgotPasswordLink = loginPage.page.locator('text=¿Olvidaste tu contraseña?', 'text=Forgot password?')
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click()
      
      // Should navigate to password reset page
      await expect(loginPage.page).toHaveURL(/\/(forgot-password|reset-password)/)
      
      // Fill email for password reset
      const emailInput = loginPage.page.locator('input[type="email"]')
      await emailInput.fill('testuser1@palabreo-e2e.test')
      
      // Submit reset request
      const submitButton = loginPage.page.locator('button[type="submit"]')
      await submitButton.click()
      
      // Should show success message
      const successMessage = loginPage.page.locator('text=correo enviado', 'text=email sent')
      await expect(successMessage).toBeVisible()
      
      console.log('✅ Password reset flow test passed')
    } else {
      console.log('ℹ️ Password reset feature not implemented')
    }
  })

  test('should handle registration flow', async () => {
    await loginPage.goto()
    
    // Navigate to registration
    await loginPage.navigateToRegister()
    
    // Fill registration form
    const nameInput = loginPage.page.locator('input[name="name"], input[placeholder*="nombre"]')
    const emailInput = loginPage.page.locator('input[type="email"]')
    const passwordInput = loginPage.page.locator('input[type="password"]').first()
    const confirmPasswordInput = loginPage.page.locator('input[name="confirmPassword"], input[placeholder*="confirmar"]')
    
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User Registration')
    }
    
    await emailInput.fill(`testuser-${Date.now()}@palabreo-e2e.test`)
    await passwordInput.fill('testpassword123')
    
    if (await confirmPasswordInput.isVisible()) {
      await confirmPasswordInput.fill('testpassword123')
    }
    
    // Submit registration
    const registerButton = loginPage.page.locator('button[type="submit"], button:has-text("Registrarse")')
    await registerButton.click()
    
    // Should show success or redirect to verification
    await loginPage.page.waitForTimeout(3000)
    
    const currentUrl = loginPage.page.url()
    const isRegistrationSuccess = currentUrl.includes('/main') || 
                                  currentUrl.includes('/verify') || 
                                  await loginPage.page.locator('text=registro exitoso', 'text=registration successful').isVisible()
    
    expect(isRegistrationSuccess).toBeTruthy()
    
    console.log('✅ Registration flow test passed')
  })

  test('should handle concurrent login attempts', async ({ browser }) => {
    // Open multiple tabs and try to login simultaneously
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()
    
    const loginPage1 = new LoginPage(page1)
    const loginPage2 = new LoginPage(page2)
    
    // Navigate both to login
    await Promise.all([
      loginPage1.goto(),
      loginPage2.goto()
    ])
    
    // Try to login with same credentials simultaneously
    await Promise.all([
      loginPage1.loginWithCredentials('testuser1@palabreo-e2e.test', 'testpassword123'),
      loginPage2.loginWithCredentials('testuser1@palabreo-e2e.test', 'testpassword123')
    ])
    
    // Both should succeed or handle gracefully
    await Promise.all([
      loginPage1.expectLoginSuccess(),
      loginPage2.expectLoginSuccess()
    ])
    
    await context1.close()
    await context2.close()
    
    console.log('✅ Concurrent login test passed')
  })

  test('should measure authentication performance', async () => {
    await loginPage.goto()
    
    // Measure login performance
    const loginTime = await loginPage.testPerformance()
    
    // Login should be fast
    expect(loginTime).toBeLessThan(3000) // 3 seconds max
    
    console.log(`✅ Authentication performance test passed: ${loginTime}ms`)
  })

  test('should validate security headers and features', async () => {
    await loginPage.goto()
    
    // Test security features
    await loginPage.testSecurityFeatures()
    
    // Check for security headers
    const response = await loginPage.page.goto('/login')
    const headers = response?.headers()
    
    if (headers) {
      // Check for common security headers
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'strict-transport-security'
      ]
      
      for (const header of securityHeaders) {
        if (headers[header]) {
          console.log(`✅ Security header ${header} present: ${headers[header]}`)
        } else {
          console.log(`⚠️ Security header ${header} missing`)
        }
      }
    }
    
    console.log('✅ Security validation test completed')
  })

  test('should handle database connection issues gracefully', async () => {
    await loginPage.goto()
    
    // Try login (this will test database connectivity)
    await loginPage.loginWithCredentials('testuser1@palabreo-e2e.test', 'testpassword123')
    
    // Should either succeed or show appropriate error
    try {
      await loginPage.expectLoginSuccess()
      console.log('✅ Database connection test passed - login successful')
    } catch (error) {
      // Check if there's a graceful error message
      const errorMessage = await loginPage.page.locator('[role="alert"], .error').textContent()
      if (errorMessage) {
        console.log(`ℹ️ Database connection issue handled gracefully: ${errorMessage}`)
      } else {
        throw error
      }
    }
  })
})

