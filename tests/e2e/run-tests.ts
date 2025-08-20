#!/usr/bin/env ts-node

/**
 * Comprehensive E2E Test Runner for Palabreo
 * Orchestrates test execution with proper setup and cleanup
 */

import { execSync } from 'child_process'
import { databaseCleanup } from './utils/database-cleanup'

interface TestRunOptions {
  browser?: 'chromium' | 'firefox' | 'webkit' | 'all'
  headed?: boolean
  debug?: boolean
  reporter?: 'html' | 'json' | 'junit'
  workers?: number
  retries?: number
  timeout?: number
  grep?: string
  project?: string
  updateSnapshots?: boolean
  trace?: boolean
  video?: boolean
}

class E2ETestRunner {
  private options: TestRunOptions

  constructor(options: TestRunOptions = {}) {
    this.options = {
      browser: 'chromium',
      headed: false,
      debug: false,
      reporter: 'html',
      workers: 1,
      retries: 2,
      timeout: 30000,
      trace: true,
      video: true,
      ...options
    }
  }

  /**
   * Main test execution flow
   */
  async run(): Promise<void> {
    console.log('🚀 Starting Palabreo E2E Test Suite...')
    console.log('Configuration:', this.options)

    try {
      // Pre-test setup
      await this.preTestSetup()

      // Run tests
      await this.executeTests()

      // Post-test cleanup
      await this.postTestCleanup()

      console.log('✅ E2E Test Suite completed successfully!')

    } catch (error) {
      console.error('❌ E2E Test Suite failed:', error)
      
      // Emergency cleanup on failure
      await this.emergencyCleanup()
      
      process.exit(1)
    }
  }

  /**
   * Pre-test setup and validation
   */
  private async preTestSetup(): Promise<void> {
    console.log('🔧 Running pre-test setup...')

    // 1. Validate environment
    await this.validateEnvironment()

    // 2. Clean up any existing test data
    console.log('🧹 Cleaning up existing test data...')
    await databaseCleanup.cleanupAll()

    // 3. Create fresh test data
    console.log('📝 Creating fresh test data...')
    await databaseCleanup.createTestData()

    // 4. Validate database state
    const stats = await databaseCleanup.getCleanupStats()
    console.log('📊 Database state after setup:', stats)

    // 5. Start development server if needed
    await this.ensureDevServerRunning()

    console.log('✅ Pre-test setup completed')
  }

  /**
   * Execute Playwright tests
   */
  private async executeTests(): Promise<void> {
    console.log('🎭 Executing Playwright tests...')

    const playwrightArgs = this.buildPlaywrightArgs()
    const command = `npx playwright test ${playwrightArgs.join(' ')}`

    console.log('Running command:', command)

    try {
      execSync(command, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'test',
          CI: process.env.CI || 'false'
        }
      })
    } catch (error) {
      console.error('Test execution failed:', error)
      throw error
    }
  }

  /**
   * Post-test cleanup
   */
  private async postTestCleanup(): Promise<void> {
    console.log('🧹 Running post-test cleanup...')

    try {
      // Clean up all test data
      await databaseCleanup.cleanupAll()

      // Validate cleanup
      const stats = await databaseCleanup.getCleanupStats()
      console.log('📊 Database state after cleanup:', stats)

      if (stats.testUsers > 0 || stats.testWorks > 0 || stats.testComments > 0) {
        console.warn('⚠️ Some test data remains after cleanup')
      }

      console.log('✅ Post-test cleanup completed')
    } catch (error) {
      console.error('❌ Post-test cleanup failed:', error)
      throw error
    }
  }

  /**
   * Emergency cleanup on test failure
   */
  private async emergencyCleanup(): Promise<void> {
    console.log('🚨 Running emergency cleanup...')

    try {
      await databaseCleanup.emergencyCleanup()
      console.log('✅ Emergency cleanup completed')
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error)
    }
  }

  /**
   * Build Playwright command arguments
   */
  private buildPlaywrightArgs(): string[] {
    const args: string[] = []

    // Browser selection
    if (this.options.browser && this.options.browser !== 'all') {
      args.push('--project', this.options.browser)
    }

    // Headed mode
    if (this.options.headed) {
      args.push('--headed')
    }

    // Debug mode
    if (this.options.debug) {
      args.push('--debug')
    }

    // Reporter
    if (this.options.reporter) {
      args.push('--reporter', this.options.reporter)
    }

    // Workers
    if (this.options.workers) {
      args.push('--workers', this.options.workers.toString())
    }

    // Retries
    if (this.options.retries) {
      args.push('--retries', this.options.retries.toString())
    }

    // Timeout
    if (this.options.timeout) {
      args.push('--timeout', this.options.timeout.toString())
    }

    // Grep pattern
    if (this.options.grep) {
      args.push('--grep', this.options.grep)
    }

    // Update snapshots
    if (this.options.updateSnapshots) {
      args.push('--update-snapshots')
    }

    // Trace
    if (this.options.trace) {
      args.push('--trace', 'on-first-retry')
    }

    // Video
    if (this.options.video) {
      args.push('--video', 'retain-on-failure')
    }

    return args
  }

  /**
   * Validate environment before running tests
   */
  private async validateEnvironment(): Promise<void> {
    console.log('🔍 Validating environment...')

    // Check Node.js version
    const nodeVersion = process.version
    console.log('Node.js version:', nodeVersion)

    // Check required environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
    }

    // Check if Playwright is installed
    try {
      execSync('npx playwright --version', { stdio: 'pipe' })
    } catch (error) {
      throw new Error('Playwright is not installed. Run: npm install @playwright/test')
    }

    console.log('✅ Environment validation passed')
  }

  /**
   * Ensure development server is running
   */
  private async ensureDevServerRunning(): Promise<void> {
    console.log('🌐 Checking development server...')

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('http://localhost:3000', { 
        method: 'HEAD',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        console.log('✅ Development server is running')
      } else {
        throw new Error(`Server responded with status: ${response.status}`)
      }
    } catch (error) {
      console.warn('⚠️ Development server not accessible:', error)
      console.log('ℹ️ Make sure to run "npm run dev" before running E2E tests')
      throw new Error('Development server is not running')
    }
  }

  /**
   * Generate test report
   */
  async generateReport(): Promise<void> {
    console.log('📊 Generating test report...')

    try {
      // Generate HTML report
      execSync('npx playwright show-report', { stdio: 'inherit' })
    } catch (error) {
      console.warn('⚠️ Could not generate report:', error)
    }
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2)
  const options: TestRunOptions = {}

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--browser':
        options.browser = args[++i] as any
        break
      case '--headed':
        options.headed = true
        break
      case '--debug':
        options.debug = true
        break
      case '--reporter':
        options.reporter = args[++i] as any
        break
      case '--workers':
        options.workers = parseInt(args[++i])
        break
      case '--retries':
        options.retries = parseInt(args[++i])
        break
      case '--timeout':
        options.timeout = parseInt(args[++i])
        break
      case '--grep':
        options.grep = args[++i]
        break
      case '--update-snapshots':
        options.updateSnapshots = true
        break
      case '--help':
        printHelp()
        process.exit(0)
        break
    }
  }

  const runner = new E2ETestRunner(options)
  await runner.run()
}

function printHelp() {
  console.log(`
Palabreo E2E Test Runner

Usage: npm run test:e2e [options]

Options:
  --browser <browser>     Browser to use (chromium, firefox, webkit, all)
  --headed               Run tests in headed mode
  --debug                Run tests in debug mode
  --reporter <reporter>   Test reporter (html, json, junit)
  --workers <number>      Number of worker processes
  --retries <number>      Number of retries on failure
  --timeout <number>      Test timeout in milliseconds
  --grep <pattern>        Only run tests matching pattern
  --update-snapshots      Update visual snapshots
  --help                 Show this help message

Examples:
  npm run test:e2e                           # Run all tests with default settings
  npm run test:e2e -- --headed               # Run tests in headed mode
  npm run test:e2e -- --browser firefox      # Run tests in Firefox
  npm run test:e2e -- --grep "login"         # Run only login tests
  npm run test:e2e -- --debug --headed       # Run in debug mode with browser visible
  `)
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Test runner failed:', error)
    process.exit(1)
  })
}

export { E2ETestRunner }
export type { TestRunOptions }
