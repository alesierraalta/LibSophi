import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Counter } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('api_errors')
const successfulRequests = new Counter('api_success')

export const options = {
  scenarios: {
    // Read-heavy workload (typical for social platform)
    read_operations: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      exec: 'readOperations'
    },
    
    // Write operations (lower load)
    write_operations: {
      executor: 'ramping-vus',
      startVUs: 2,
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 10 },
        { duration: '1m', target: 0 },
      ],
      exec: 'writeOperations'
    }
  },
  thresholds: {
    // API response times
    'http_req_duration{operation:read}': ['p(95)<300'],
    'http_req_duration{operation:write}': ['p(95)<500'],
    
    // Error rates
    'api_errors': ['rate<0.01'],
    
    // Success rates
    'checks': ['rate>0.95'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Mock data for testing
const mockUser = {
  email: 'test@example.com',
  password: 'testpassword'
}

const mockWork = {
  title: 'Test Work',
  description: 'A test literary work',
  content: 'This is test content for performance testing.',
  genre: 'Ficción',
  published: true
}

const mockComment = {
  content: 'This is a test comment for performance testing.'
}

// Read operations test
export function readOperations() {
  const tests = [
    () => testGetWorks(),
    () => testGetProfile(),
    () => testGetNotifications(),
    () => testSearchWorks(),
    () => testGetWorkDetails()
  ]
  
  // Select random read operation
  const test = tests[Math.floor(Math.random() * tests.length)]
  test()
  
  sleep(0.5 + Math.random() * 2) // 0.5-2.5s think time
}

// Write operations test
export function writeOperations() {
  const tests = [
    () => testCreateWork(),
    () => testCreateComment(),
    () => testLikeWork(),
    () => testFollowUser(),
    () => testUpdateProfile()
  ]
  
  // Select random write operation
  const test = tests[Math.floor(Math.random() * tests.length)]
  test()
  
  sleep(1 + Math.random() * 3) // 1-4s think time
}

// Read operation tests
function testGetWorks() {
  const response = http.get(`${BASE_URL}/api/works`, {
    headers: { 'Content-Type': 'application/json' },
    tags: { operation: 'read', endpoint: '/api/works' }
  })
  
  const success = check(response, {
    'get works: status 200': (r) => r.status === 200,
    'get works: has data': (r) => {
      try {
        const data = JSON.parse(r.body)
        return Array.isArray(data) || (data && Array.isArray(data.data))
      } catch {
        return false
      }
    },
    'get works: response time ok': (r) => r.timings.duration < 500,
  })
  
  recordResult(success, 'get_works')
}

function testGetProfile() {
  const response = http.get(`${BASE_URL}/api/profile/test-user`, {
    headers: { 'Content-Type': 'application/json' },
    tags: { operation: 'read', endpoint: '/api/profile' }
  })
  
  const success = check(response, {
    'get profile: status 200 or 404': (r) => [200, 404].includes(r.status),
    'get profile: response time ok': (r) => r.timings.duration < 300,
  })
  
  recordResult(success, 'get_profile')
}

function testGetNotifications() {
  const response = http.get(`${BASE_URL}/api/notifications`, {
    headers: { 'Content-Type': 'application/json' },
    tags: { operation: 'read', endpoint: '/api/notifications' }
  })
  
  const success = check(response, {
    'get notifications: status 200 or 401': (r) => [200, 401].includes(r.status),
    'get notifications: response time ok': (r) => r.timings.duration < 200,
  })
  
  recordResult(success, 'get_notifications')
}

function testSearchWorks() {
  const searchTerms = ['ficción', 'poesía', 'romance', 'misterio', 'aventura']
  const term = searchTerms[Math.floor(Math.random() * searchTerms.length)]
  
  const response = http.get(`${BASE_URL}/api/works/search?q=${term}`, {
    headers: { 'Content-Type': 'application/json' },
    tags: { operation: 'read', endpoint: '/api/works/search' }
  })
  
  const success = check(response, {
    'search works: status 200': (r) => r.status === 200,
    'search works: response time ok': (r) => r.timings.duration < 400,
  })
  
  recordResult(success, 'search_works')
}

function testGetWorkDetails() {
  // Use a random work ID for testing
  const workId = Math.floor(Math.random() * 100) + 1
  
  const response = http.get(`${BASE_URL}/api/works/${workId}`, {
    headers: { 'Content-Type': 'application/json' },
    tags: { operation: 'read', endpoint: '/api/works/[id]' }
  })
  
  const success = check(response, {
    'get work details: status 200 or 404': (r) => [200, 404].includes(r.status),
    'get work details: response time ok': (r) => r.timings.duration < 300,
  })
  
  recordResult(success, 'get_work_details')
}

// Write operation tests
function testCreateWork() {
  const response = http.post(`${BASE_URL}/api/works`, JSON.stringify(mockWork), {
    headers: { 'Content-Type': 'application/json' },
    tags: { operation: 'write', endpoint: '/api/works' }
  })
  
  const success = check(response, {
    'create work: status 201 or 401': (r) => [201, 401].includes(r.status),
    'create work: response time ok': (r) => r.timings.duration < 1000,
  })
  
  recordResult(success, 'create_work')
}

function testCreateComment() {
  const workId = Math.floor(Math.random() * 100) + 1
  
  const response = http.post(`${BASE_URL}/api/works/${workId}/comments`, 
    JSON.stringify(mockComment), {
    headers: { 'Content-Type': 'application/json' },
    tags: { operation: 'write', endpoint: '/api/works/[id]/comments' }
  })
  
  const success = check(response, {
    'create comment: status 201 or 401': (r) => [201, 401, 404].includes(r.status),
    'create comment: response time ok': (r) => r.timings.duration < 500,
  })
  
  recordResult(success, 'create_comment')
}

function testLikeWork() {
  const workId = Math.floor(Math.random() * 100) + 1
  
  const response = http.post(`${BASE_URL}/api/works/${workId}/like`, '', {
    headers: { 'Content-Type': 'application/json' },
    tags: { operation: 'write', endpoint: '/api/works/[id]/like' }
  })
  
  const success = check(response, {
    'like work: status 200 or 401': (r) => [200, 401, 404].includes(r.status),
    'like work: response time ok': (r) => r.timings.duration < 300,
  })
  
  recordResult(success, 'like_work')
}

function testFollowUser() {
  const userId = Math.floor(Math.random() * 100) + 1
  
  const response = http.post(`${BASE_URL}/api/users/${userId}/follow`, '', {
    headers: { 'Content-Type': 'application/json' },
    tags: { operation: 'write', endpoint: '/api/users/[id]/follow' }
  })
  
  const success = check(response, {
    'follow user: status 200 or 401': (r) => [200, 401, 404].includes(r.status),
    'follow user: response time ok': (r) => r.timings.duration < 300,
  })
  
  recordResult(success, 'follow_user')
}

function testUpdateProfile() {
  const profileUpdate = {
    name: 'Test User Updated',
    bio: 'Updated bio for performance testing'
  }
  
  const response = http.put(`${BASE_URL}/api/profile`, JSON.stringify(profileUpdate), {
    headers: { 'Content-Type': 'application/json' },
    tags: { operation: 'write', endpoint: '/api/profile' }
  })
  
  const success = check(response, {
    'update profile: status 200 or 401': (r) => [200, 401].includes(r.status),
    'update profile: response time ok': (r) => r.timings.duration < 500,
  })
  
  recordResult(success, 'update_profile')
}

function recordResult(success, operation) {
  if (success) {
    successfulRequests.add(1, { operation })
  } else {
    errorRate.add(1, { operation })
  }
}

export function setup() {
  console.log('🚀 Starting API load test...')
  console.log(`Target API: ${BASE_URL}/api`)
  console.log('Testing both read and write operations...')
  
  return { startTime: new Date().toISOString() }
}

export function teardown(data) {
  console.log('✅ API load test completed!')
  console.log(`Duration: ${new Date().toISOString()} - ${data.startTime}`)
  console.log('Check the results for performance metrics and recommendations.')
}

