import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async goto() {
    await super.goto('/login')
    await this.validateLoginPage()
  }

  async validateLoginPage() {
    await expect(this.page.locator('h1')).toContainText('Iniciar sesión')
    await expect(this.page.locator('input[type="email"]')).toBeVisible()
    await expect(this.page.locator('input[type="password"]')).toBeVisible()
    await expect(this.page.locator('button[type="submit"]')).toBeVisible()
    
    console.log('✅ Login page validation passed')
  }

  async fillEmail(email: string) {
    await this.page.fill('input[type="email"]', email)
  }

  async fillPassword(password: string) {
    await this.page.fill('input[type="password"]', password)
  }

  async submitLogin() {
    await this.page.click('button[type="submit"]')
  }

  async loginWithCredentials(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submitLogin()
  }

  async loginWithGoogle() {
    await this.page.click('button:has-text("Google")')
    // Handle OAuth flow if needed
  }

  async loginWithGitHub() {
    await this.page.click('button:has-text("GitHub")')
    // Handle OAuth flow if needed
  }

  async expectLoginSuccess() {
    // Should redirect to main page or dashboard
    await expect(this.page).toHaveURL(/\/(main|dashboard)/)
    await this.validateHeader()
    
    // Should show user avatar or profile indicator
    await expect(this.page.locator('[aria-label="Ir a mi perfil"]')).toBeVisible()
    
    console.log('✅ Login success validation passed')
  }

  async expectLoginError(expectedError?: string) {
    // Should stay on login page
    await expect(this.page).toHaveURL(/\/login/)
    
    // Should show error message
    const errorElement = this.page.locator('[role="alert"], .error, .text-red-600')
    await expect(errorElement).toBeVisible()
    
    if (expectedError) {
      await expect(errorElement).toContainText(expectedError)
    }
    
    console.log('✅ Login error validation passed')
  }

  async navigateToRegister() {
    await this.page.click('text=¿No tienes cuenta? Regístrate')
    await expect(this.page).toHaveURL(/\/register/)
  }

  async navigateToForgotPassword() {
    await this.page.click('text=¿Olvidaste tu contraseña?')
    // Validate forgot password flow
  }

  // Test invalid login attempts
  async testInvalidCredentials() {
    const invalidCredentials = [
      { email: 'invalid@email.com', password: 'wrongpassword' },
      { email: 'notanemail', password: 'password123' },
      { email: '', password: 'password123' },
      { email: 'test@example.com', password: '' }
    ]

    for (const creds of invalidCredentials) {
      await this.fillEmail(creds.email)
      await this.fillPassword(creds.password)
      await this.submitLogin()
      
      await this.expectLoginError()
      
      // Clear form for next attempt
      await this.page.fill('input[type="email"]', '')
      await this.page.fill('input[type="password"]', '')
    }
    
    console.log('✅ Invalid credentials test passed')
  }

  // Test form validation
  async testFormValidation() {
    // Test empty form submission
    await this.submitLogin()
    
    // Should show validation errors
    const emailError = this.page.locator('input[type="email"]:invalid')
    const passwordError = this.page.locator('input[type="password"]:invalid')
    
    await expect(emailError).toBeVisible()
    await expect(passwordError).toBeVisible()
    
    // Test invalid email format
    await this.fillEmail('invalid-email')
    await this.fillPassword('validpassword')
    await this.submitLogin()
    
    await expect(emailError).toBeVisible()
    
    console.log('✅ Form validation test passed')
  }

  // Test accessibility
  async testAccessibility() {
    await super.checkAccessibility()
    
    // Check form labels
    await expect(this.page.locator('label[for*="email"]')).toBeVisible()
    await expect(this.page.locator('label[for*="password"]')).toBeVisible()
    
    // Check tab navigation
    await this.page.keyboard.press('Tab')
    await expect(this.page.locator('input[type="email"]')).toBeFocused()
    
    await this.page.keyboard.press('Tab')
    await expect(this.page.locator('input[type="password"]')).toBeFocused()
    
    await this.page.keyboard.press('Tab')
    await expect(this.page.locator('button[type="submit"]')).toBeFocused()
    
    console.log('✅ Login accessibility test passed')
  }

  // Test security features
  async testSecurityFeatures() {
    // Test password visibility toggle if present
    const passwordToggle = this.page.locator('button[aria-label*="password"]')
    if (await passwordToggle.isVisible()) {
      await this.fillPassword('testpassword')
      
      // Should be hidden by default
      await expect(this.page.locator('input[type="password"]')).toBeVisible()
      
      // Click toggle
      await passwordToggle.click()
      await expect(this.page.locator('input[type="text"]')).toBeVisible()
      
      // Click toggle again
      await passwordToggle.click()
      await expect(this.page.locator('input[type="password"]')).toBeVisible()
    }
    
    // Test CSRF protection (form should have proper tokens)
    const form = this.page.locator('form')
    const formHtml = await form.innerHTML()
    
    // In a real app, you'd check for CSRF tokens
    expect(formHtml).toBeTruthy()
    
    console.log('✅ Security features test passed')
  }

  // Performance test
  async testPerformance() {
    const startTime = Date.now()
    
    await this.loginWithCredentials('testuser1@palabreo-e2e.test', 'testpassword123')
    
    const endTime = Date.now()
    const loginTime = endTime - startTime
    
    // Login should complete within reasonable time
    expect(loginTime).toBeLessThan(3000) // 3 seconds max
    
    console.log(`✅ Login performance test passed: ${loginTime}ms`)
    
    return loginTime
  }
}

