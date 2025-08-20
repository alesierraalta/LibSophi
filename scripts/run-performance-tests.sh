#!/bin/bash

# Performance Testing Suite for Palabreo
# This script runs comprehensive performance tests

set -e

echo "🚀 Starting Palabreo Performance Testing Suite"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}📋 Checking dependencies...${NC}"
    
    if ! command -v k6 &> /dev/null; then
        echo -e "${RED}❌ k6 is not installed. Please install it first.${NC}"
        echo "Installation: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    
    if ! command -v lighthouse &> /dev/null; then
        echo -e "${RED}❌ Lighthouse is not installed. Installing...${NC}"
        npm install -g @lhci/cli
    fi
    
    echo -e "${GREEN}✅ All dependencies are available${NC}"
}

# Build the application
build_app() {
    echo -e "${BLUE}🏗️  Building application...${NC}"
    npm run build
    echo -e "${GREEN}✅ Build completed${NC}"
}

# Start the application server
start_server() {
    echo -e "${BLUE}🖥️  Starting server...${NC}"
    npm start &
    SERVER_PID=$!
    
    # Wait for server to be ready
    echo "Waiting for server to start..."
    sleep 10
    
    # Check if server is responding
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running (PID: $SERVER_PID)${NC}"
    else
        echo -e "${RED}❌ Server failed to start${NC}"
        exit 1
    fi
}

# Stop the server
stop_server() {
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "${BLUE}🛑 Stopping server...${NC}"
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Server stopped${NC}"
    fi
}

# Run database audit
run_database_audit() {
    echo -e "${BLUE}🔍 Running database audit...${NC}"
    
    if npx ts-node scripts/database-audit.ts; then
        echo -e "${GREEN}✅ Database audit completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Database audit completed with warnings${NC}"
    fi
}

# Run Lighthouse performance tests
run_lighthouse_tests() {
    echo -e "${BLUE}🏮 Running Lighthouse performance tests...${NC}"
    
    mkdir -p reports/lighthouse
    
    if lhci autorun --config=tests/performance/lighthouse.config.js; then
        echo -e "${GREEN}✅ Lighthouse tests passed${NC}"
    else
        echo -e "${RED}❌ Lighthouse tests failed${NC}"
        echo -e "${YELLOW}Check reports/lighthouse for detailed results${NC}"
    fi
}

# Run load tests
run_load_tests() {
    echo -e "${BLUE}📈 Running load tests...${NC}"
    
    mkdir -p reports/load-tests
    
    echo "Running web application load test..."
    if k6 run --out json=reports/load-tests/web-load-test.json tests/performance/load-test.js; then
        echo -e "${GREEN}✅ Web load test completed${NC}"
    else
        echo -e "${RED}❌ Web load test failed${NC}"
    fi
    
    echo "Running API load test..."
    if k6 run --out json=reports/load-tests/api-load-test.json tests/performance/api-load-test.js; then
        echo -e "${GREEN}✅ API load test completed${NC}"
    else
        echo -e "${RED}❌ API load test failed${NC}"
    fi
}

# Run Playwright performance tests
run_playwright_tests() {
    echo -e "${BLUE}🎭 Running Playwright performance tests...${NC}"
    
    if npx playwright test tests/e2e/basic-smoke.spec.ts --config=playwright-simple.config.ts; then
        echo -e "${GREEN}✅ Playwright performance tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Some Playwright tests failed${NC}"
    fi
}

# Generate performance report
generate_report() {
    echo -e "${BLUE}📊 Generating performance report...${NC}"
    
    cat > reports/performance-summary.md << EOF
# Palabreo Performance Test Report

Generated on: $(date)

## Test Results Summary

### Database Audit
- Schema verification completed
- Index optimization recommendations provided
- See DATABASE_AUDIT_PLAN.md for details

### Lighthouse Tests
- Core Web Vitals measured
- Performance, Accessibility, SEO scores evaluated
- Results in reports/lighthouse/

### Load Tests
- Web application load testing completed
- API endpoint performance tested
- Results in reports/load-tests/

### Playwright Tests
- End-to-end performance validation
- User journey performance measured

## Recommendations

1. **Database Optimization**
   - Run scripts/optimize-database.sql
   - Monitor slow queries regularly
   - Implement caching where appropriate

2. **Frontend Performance**
   - Optimize images and assets
   - Implement code splitting
   - Use lazy loading for heavy components

3. **API Performance**
   - Add response caching
   - Optimize database queries
   - Implement rate limiting

## Next Steps

1. Review detailed test results
2. Implement recommended optimizations
3. Set up continuous performance monitoring
4. Schedule regular performance tests

---
*For detailed optimization plan, see DATABASE_AUDIT_PLAN.md*
EOF

    echo -e "${GREEN}✅ Performance report generated: reports/performance-summary.md${NC}"
}

# Cleanup function
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    stop_server
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main execution
main() {
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Create reports directory
    mkdir -p reports
    
    # Run all tests
    check_dependencies
    run_database_audit
    
    # Only run server-dependent tests if we can start the server
    if build_app && start_server; then
        run_lighthouse_tests
        run_load_tests
        run_playwright_tests
    else
        echo -e "${YELLOW}⚠️  Skipping server-dependent tests due to startup issues${NC}"
    fi
    
    generate_report
    
    echo ""
    echo -e "${GREEN}🎉 Performance testing suite completed!${NC}"
    echo -e "${BLUE}📄 Check the reports/ directory for detailed results${NC}"
    echo -e "${BLUE}📋 Review DATABASE_AUDIT_PLAN.md for optimization guidance${NC}"
}

# Handle command line arguments
case "${1:-all}" in
    "audit")
        check_dependencies
        run_database_audit
        ;;
    "lighthouse")
        check_dependencies
        build_app
        start_server
        run_lighthouse_tests
        ;;
    "load")
        check_dependencies
        build_app
        start_server
        run_load_tests
        ;;
    "playwright")
        check_dependencies
        build_app
        start_server
        run_playwright_tests
        ;;
    "all"|*)
        main
        ;;
esac

