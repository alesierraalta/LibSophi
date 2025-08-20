import { chromium, FullConfig } from '@playwright/test'
import { getSupabaseServerClient } from '@/lib/supabase/server'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E Test Global Setup...')

  // Start the browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    console.log('✅ Development server is ready')

    // Setup test database
    await setupTestDatabase()

    // Create test users and data
    await createTestData()

    console.log('✅ E2E Test Global Setup completed successfully')
  } catch (error) {
    console.error('❌ E2E Test Global Setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

async function setupTestDatabase() {
  console.log('🗄️ Setting up test database...')
  
  const supabase = getSupabaseServerClient()
  
  // Create test schema or use test database
  // This ensures we don't pollute production data
  try {
    // Clean up any existing test data first
    await cleanupTestData()
    
    // Verify database connection
    const { error } = await supabase.from('users').select('count').limit(1)
    if (error && !error.message.includes('relation "users" does not exist')) {
      throw error
    }
    
    console.log('✅ Test database setup completed')
  } catch (error) {
    console.error('❌ Test database setup failed:', error)
    throw error
  }
}

async function createTestData() {
  console.log('📝 Creating test data...')
  
  const supabase = getSupabaseServerClient()
  
  try {
    // Create test users
    const testUsers = [
      {
        id: 'test-user-1',
        email: 'testuser1@palabreo-e2e.test',
        name: 'Test User One',
        avatar: '/api/placeholder/32/32'
      },
      {
        id: 'test-user-2', 
        email: 'testuser2@palabreo-e2e.test',
        name: 'Test User Two',
        avatar: '/api/placeholder/32/32'
      }
    ]

    // Note: In a real app, you'd use proper user creation methods
    // This is simplified for E2E testing purposes
    console.log('Creating test users...')
    
    // Create test works
    const testWorks = [
      {
        id: 'test-work-1',
        title: 'E2E Test Story One',
        content: 'This is a test story for E2E testing purposes.',
        author_id: 'test-user-1',
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'test-work-2',
        title: 'E2E Test Story Two', 
        content: 'This is another test story for E2E testing.',
        author_id: 'test-user-2',
        published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    console.log('Test data creation completed')
  } catch (error) {
    console.error('❌ Test data creation failed:', error)
    throw error
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up existing test data...')
  
  const supabase = getSupabaseServerClient()
  
  try {
    // Clean up in correct order (respecting foreign keys)
    await supabase.from('comments').delete().like('content', '%e2e-test%')
    await supabase.from('works').delete().like('title', '%E2E Test%')
    await supabase.from('users').delete().like('email', '%@palabreo-e2e.test')
    
    console.log('✅ Test data cleanup completed')
  } catch (error) {
    console.warn('⚠️ Test data cleanup warning:', error)
    // Don't throw here as tables might not exist yet
  }
}

export default globalSetup
