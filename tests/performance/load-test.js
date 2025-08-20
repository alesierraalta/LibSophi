import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')

// Test configuration
export const options = {
  stages: [
    // Ramp up
    { duration: '2m', target: 10 }, // Warm up
    { duration: '3m', target: 50 }, // Normal load
    { duration: '2m', target: 100 }, // Peak load
    { duration: '3m', target: 100 }, // Stay at peak
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    // HTTP request duration should be < 500ms for 95% of requests
    http_req_duration: ['p(95)<500'],
    // Error rate should be < 1%
    errors: ['rate<0.01'],
    // HTTP request rate should be > 100 req/s
    http_reqs: ['rate>100'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Test scenarios
const scenarios = {
  homepage: { weight: 30, endpoint: '/' },
  main: { weight: 25, endpoint: '/main' },
  explore: { weight: 20, endpoint: '/explore' },
  profile: { weight: 10, endpoint: '/profile' },
  notifications: { weight: 10, endpoint: '/notifications' },
  writer: { weight: 5, endpoint: '/writer' }
}

export default function () {
  // Select random scenario based on weights
  const scenario = selectScenario()
  const url = `${BASE_URL}${scenario.endpoint}`
  
  // Make HTTP request
  const response = http.get(url, {
    headers: {
      'User-Agent': 'k6-load-test/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    },
    tags: { 
      endpoint: scenario.endpoint,
      scenario: getScenarioName(scenario.endpoint)
    }
  })

  // Validate response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
    'response size > 1KB': (r) => r.body.length > 1024,
    'contains Palabreo': (r) => r.body.includes('Palabreo'),
  })

  // Record errors
  errorRate.add(!success)

  // Simulate user reading time
  sleep(Math.random() * 3 + 1) // 1-4 seconds
}

function selectScenario() {
  const totalWeight = Object.values(scenarios).reduce((sum, s) => sum + s.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const [name, scenario] of Object.entries(scenarios)) {
    random -= scenario.weight
    if (random <= 0) {
      return scenario
    }
  }
  
  return scenarios.homepage // fallback
}

function getScenarioName(endpoint) {
  switch (endpoint) {
    case '/': return 'homepage'
    case '/main': return 'main'
    case '/explore': return 'explore'
    case '/profile': return 'profile'
    case '/notifications': return 'notifications'
    case '/writer': return 'writer'
    default: return 'unknown'
  }
}

// Lifecycle functions
export function setup() {
  console.log('🚀 Starting load test...')
  console.log(`Target URL: ${BASE_URL}`)
  
  // Warm up the server
  const warmupResponse = http.get(BASE_URL)
  console.log(`Warmup response: ${warmupResponse.status}`)
  
  return { timestamp: new Date().toISOString() }
}

export function teardown(data) {
  console.log('✅ Load test completed!')
  console.log(`Started at: ${data.timestamp}`)
  console.log(`Finished at: ${new Date().toISOString()}`)
}

