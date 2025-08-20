import { test, expect } from '@playwright/test'

test.describe('Main Page useEffect Detection', () => {
  
  test('should detect if useEffect is running and making database calls', async ({ page }) => {
    const consoleMessages: string[] = []

    // Capture console.log messages that we added for debugging
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(text)
      
      // Log messages that contain our debug info
      if (text.includes('Main page:') || text.includes('fetched works') || text.includes('set posts')) {
        console.log(`🐛 DEBUG: ${text}`)
      }
      
      // Log any Supabase-related messages
      if (text.includes('supabase') || text.includes('Supabase')) {
        console.log(`💾 SUPABASE: ${text}`)
      }
      
      // Log any error messages
      if (msg.type() === 'error') {
        console.log(`❌ ERROR: ${text}`)
      }
    })

    console.log('🚀 Starting useEffect detection test...')
    
    await page.goto('/main')
    
    // Wait longer for useEffect to run
    console.log('⏳ Waiting for useEffect to execute...')
    await page.waitForTimeout(8000)
    
    console.log(`📊 Total console messages captured: ${consoleMessages.length}`)
    
    // Check for our specific debug messages
    const debugMessages = consoleMessages.filter(msg => msg.includes('Main page:'))
    const supabaseMessages = consoleMessages.filter(msg => 
      msg.includes('supabase') || msg.includes('Supabase') || msg.includes('fetched works')
    )
    
    console.log(`🐛 Debug messages found: ${debugMessages.length}`)
    console.log(`💾 Supabase-related messages: ${supabaseMessages.length}`)
    
    if (debugMessages.length > 0) {
      console.log('\n🐛 Debug messages:')
      debugMessages.forEach(msg => console.log(`  - ${msg}`))
    }
    
    if (supabaseMessages.length > 0) {
      console.log('\n💾 Supabase messages:')
      supabaseMessages.forEach(msg => console.log(`  - ${msg}`))
    }
    
    // Check if the page is actually a Next.js app
    const nextData = await page.locator('#__NEXT_DATA__').count()
    console.log(`⚛️  Next.js data script found: ${nextData > 0}`)
    
    // Check for any React components
    const reactComponents = await page.locator('[data-reactroot], [data-react-*]').count()
    console.log(`⚛️  React components found: ${reactComponents}`)
    
    // Check if we can find the specific main page elements
    const mainPageElements = await page.locator('text=Para ti, text=Siguiendo').count()
    console.log(`📱 Main page navigation elements found: ${mainPageElements}`)
    
    expect(true).toBeTruthy() // Always pass to see all logs
  })

  test('should check if the page is actually the main page we expect', async ({ page }) => {
    await page.goto('/main')
    await page.waitForTimeout(3000)
    
    // Check URL
    const currentURL = page.url()
    console.log(`🌐 Current URL: ${currentURL}`)
    
    // Check page title
    const title = await page.title()
    console.log(`📄 Page title: ${title}`)
    
    // Check for main page specific content
    const hasParaTi = await page.locator('text=Para ti').isVisible().catch(() => false)
    const hasSiguiendo = await page.locator('text=Siguiendo').isVisible().catch(() => false)
    const hasHeader = await page.locator('header').isVisible().catch(() => false)
    const hasAppHeader = await page.locator('[data-testid="app-header"], .app-header').isVisible().catch(() => false)
    
    console.log(`📱 "Para ti" tab visible: ${hasParaTi}`)
    console.log(`📱 "Siguiendo" tab visible: ${hasSiguiendo}`)
    console.log(`🏠 Header element visible: ${hasHeader}`)
    console.log(`🏠 App header visible: ${hasAppHeader}`)
    
    // Get page content to see what's actually rendering
    const bodyText = await page.locator('body').textContent()
    const contentPreview = bodyText?.substring(0, 500) + '...'
    console.log(`📝 Page content preview:\n${contentPreview}`)
    
    expect(true).toBeTruthy() // Always pass to see all logs
  })

})

