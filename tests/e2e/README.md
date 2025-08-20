# Palabreo E2E Testing Suite

## 🎯 Overview

This comprehensive End-to-End (E2E) testing suite validates the entire Palabreo platform from database operations to user interface functionality. The tests ensure that all features work correctly in real-world scenarios and maintain data integrity throughout the application lifecycle.

## 🏗️ Architecture

### Test Structure
```
tests/e2e/
├── pages/                  # Page Object Models
│   ├── BasePage.ts        # Common page functionality
│   ├── LoginPage.ts       # Authentication pages
│   └── WriterPage.ts      # Content creation pages
├── utils/                 # Testing utilities
│   ├── database-cleanup.ts # Database cleanup utilities
│   └── test-helpers.ts    # Common test helpers
├── fixtures/              # Test data and fixtures
├── auth-flow.spec.ts      # Authentication flow tests
├── works-crud.spec.ts     # Content CRUD operation tests
├── user-journey.spec.ts   # Complete user journey tests
├── global-setup.ts        # Global test setup
├── global-teardown.ts     # Global test cleanup
└── run-tests.ts          # Test runner orchestrator
```

### Key Features

✅ **Comprehensive Coverage**
- Authentication flows (login, registration, OAuth)
- CRUD operations for all content types
- Complete user journeys from registration to publication
- Cross-browser compatibility testing
- Mobile responsiveness validation
- Performance monitoring
- Accessibility compliance
- Database integrity validation

✅ **Robust Cleanup System**
- Automatic test data cleanup after each test
- Database rollback procedures
- Emergency cleanup functions
- Data integrity validation
- No test data pollution in production

✅ **Advanced Testing Features**
- Page Object Model pattern
- Parallel test execution
- Visual regression testing
- Network monitoring
- Performance benchmarking
- Error recovery testing
- Real-time validation

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Development server** running on `localhost:3000`
3. **Environment variables** configured:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with browser visible
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in specific browser
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run tests in all browsers
npm run test:e2e:all-browsers
```

### Advanced Usage

```bash
# Run specific test suite
npm run test:e2e -- --grep "authentication"

# Run with custom configuration
npm run test:e2e -- --workers 2 --retries 1 --timeout 60000

# Update visual snapshots
npm run test:e2e -- --update-snapshots

# Generate and view test report
npm run playwright:report
```

## 🧪 Test Categories

### 1. Authentication Flow Tests (`auth-flow.spec.ts`)

Tests all authentication-related functionality:

- ✅ Login page validation and functionality
- ✅ Registration flow with email verification
- ✅ OAuth integration (Google, GitHub)
- ✅ Password reset workflow
- ✅ Session management and persistence
- ✅ Route protection and authorization
- ✅ Logout functionality
- ✅ Concurrent login handling
- ✅ Security headers validation
- ✅ Performance benchmarking

**Key Validations:**
- Form validation and error handling
- Security features (CSRF protection, headers)
- Accessibility compliance
- Mobile responsiveness
- Database connectivity

### 2. Works CRUD Tests (`works-crud.spec.ts`)

Validates all content management operations:

- ✅ Work creation (published and draft)
- ✅ Work editing and updates
- ✅ Work deletion with confirmation
- ✅ Visibility settings and permissions
- ✅ Categories and tags management
- ✅ Search functionality
- ✅ Pagination handling
- ✅ Comment system integration
- ✅ Statistics and analytics
- ✅ Database integrity validation

**Key Features:**
- Comprehensive CRUD operation testing
- Batch operations and performance testing
- Data validation and error handling
- User permission verification
- Real-time updates validation

### 3. User Journey Tests (`user-journey.spec.ts`)

Complete end-to-end user scenarios:

- ✅ **New User Journey**: Registration → Profile Setup → First Publication → Community Interaction
- ✅ **Returning User Journey**: Login → Dashboard → Content Management → Analytics
- ✅ **Reader Journey**: Content Discovery → Reading → Engagement → Following
- ✅ **Author Workflow**: Draft Creation → Editing → Publication → Series Management
- ✅ **Mobile Experience**: Full functionality on mobile devices
- ✅ **Cross-Browser Compatibility**: Consistent experience across browsers
- ✅ **Performance Under Load**: System behavior with multiple operations
- ✅ **Error Recovery**: Graceful handling of network issues and errors

## 🛠️ Database Management

### Cleanup System

The E2E test suite includes a comprehensive database cleanup system to ensure no test data pollutes the production environment:

```typescript
// Automatic cleanup after each test
afterEach(async () => {
  await databaseCleanup.cleanupAll()
})

// Emergency cleanup if needed
npm run test:e2e:emergency-cleanup
```

### Cleanup Features

- **Pattern-based Cleanup**: Removes data matching test patterns
- **Foreign Key Awareness**: Respects database constraints during cleanup
- **Rollback Procedures**: Restores database to original state
- **Sequence Reset**: Prevents ID conflicts in subsequent tests
- **Validation**: Confirms successful cleanup completion

### Test Data Patterns

The cleanup system identifies test data using these patterns:
- Email addresses ending with `@palabreo-e2e.test`
- Titles/content containing "E2E Test"
- User names starting with "Test User"
- Content with specific test keywords

## 📊 Performance Monitoring

### Metrics Tracked

- **Page Load Times**: Homepage, login, dashboard loading
- **Authentication Performance**: Login/registration speed
- **CRUD Operation Speed**: Content creation/editing times
- **Database Query Performance**: Response times for data operations
- **Network Request Monitoring**: Failed/slow requests identification

### Performance Thresholds

```typescript
const performanceThresholds = {
  pageLoad: 3000,      // 3 seconds max
  authentication: 5000, // 5 seconds max
  crudOperations: 10000, // 10 seconds max
  databaseQueries: 2000  // 2 seconds max
}
```

## 🎨 Visual Testing

### Screenshot Capture

Automatic screenshot capture for:
- Test failures (debugging)
- Visual regression testing
- Cross-browser comparison
- Mobile vs desktop layouts

### Video Recording

- Full test execution videos on failure
- Step-by-step interaction recording
- Performance analysis footage

## 🔧 Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
})
```

## 🚨 Troubleshooting

### Common Issues

**1. Development Server Not Running**
```bash
# Start the development server first
npm run dev

# Then run tests
npm run test:e2e
```

**2. Database Connection Issues**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run cleanup if database is in bad state
npm run test:e2e:emergency-cleanup
```

**3. Browser Installation Issues**
```bash
# Reinstall Playwright browsers
npx playwright install --force
```

**4. Test Data Pollution**
```bash
# Emergency cleanup
npm run test:e2e:emergency-cleanup

# Regular cleanup
npm run test:e2e:cleanup
```

### Debug Mode

For detailed debugging:

```bash
# Run in debug mode with browser visible
npm run test:e2e:debug

# Run specific test in debug mode
npm run test:e2e:debug -- --grep "login"
```

### Logs and Reports

- **HTML Report**: `playwright-report/index.html`
- **Test Results**: Console output with detailed steps
- **Screenshots**: `test-results/` directory
- **Videos**: Captured for failed tests
- **Traces**: Available for failed test debugging

## 📈 Continuous Integration

### CI/CD Integration

The E2E test suite is designed for CI/CD environments:

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: |
    npm run dev &
    sleep 10
    npm run test:e2e
  env:
    CI: true
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### Environment-Specific Testing

- **Development**: Full test suite with debugging
- **Staging**: Comprehensive validation before production
- **Production**: Smoke tests and critical path validation

## 🎯 Best Practices

### Writing New Tests

1. **Follow Page Object Model**: Create page classes for new pages
2. **Use Test Helpers**: Leverage existing utilities for common operations
3. **Implement Cleanup**: Always clean up test data
4. **Add Performance Checks**: Monitor execution times
5. **Include Accessibility Tests**: Validate WCAG compliance
6. **Test Error Scenarios**: Validate error handling

### Test Data Management

1. **Use Unique Identifiers**: Include timestamps in test data
2. **Follow Naming Conventions**: Use "E2E Test" prefix for identification
3. **Clean Up Immediately**: Don't leave test data between runs
4. **Validate Database State**: Ensure cleanup was successful

### Performance Optimization

1. **Run Tests in Parallel**: Use multiple workers when possible
2. **Optimize Selectors**: Use efficient element selectors
3. **Minimize Network Requests**: Mock external services when appropriate
4. **Use Proper Waits**: Avoid fixed delays, use smart waiting

## 🔍 Monitoring and Reporting

### Test Metrics

- **Pass/Fail Rates**: Track test reliability
- **Execution Times**: Monitor performance trends
- **Coverage Reports**: Ensure comprehensive testing
- **Error Patterns**: Identify recurring issues

### Alerting

Set up alerts for:
- Test failures in CI/CD
- Performance degradation
- Database cleanup failures
- Security vulnerability detection

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

## 🤝 Contributing

When adding new E2E tests:

1. Follow the existing patterns and structure
2. Include comprehensive cleanup procedures
3. Add performance monitoring
4. Validate accessibility compliance
5. Test across multiple browsers and devices
6. Update documentation

---

This E2E testing suite ensures the Palabreo platform maintains high quality, performance, and reliability across all user interactions and database operations. The comprehensive cleanup system guarantees no test data pollution while providing thorough validation of all platform functionality.

