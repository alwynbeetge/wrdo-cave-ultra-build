
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies() {
    const mockCookies = new Map()
    return {
      get: jest.fn((name) => ({
        value: mockCookies.get(name),
      })),
      set: jest.fn((name, value, options) => {
        mockCookies.set(name, value)
      }),
      delete: jest.fn((name) => {
        mockCookies.delete(name)
      }),
    }
  },
}))

// Mock prisma client
jest.mock('./lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    securityEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    chatMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    deepAgentTask: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

// Mock environment variables
process.env.ABACUSAI_API_KEY = 'test-api-key'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NODE_ENV = 'test'

// Mock fetch globally
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockSession: () => ({
    user: global.testUtils.createMockUser(),
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }),
  
  createMockRequest: (options = {}) => ({
    json: jest.fn().mockResolvedValue(options.body || {}),
    headers: new Map([
      ['user-agent', 'test-agent'],
      ['x-forwarded-for', '127.0.0.1'],
      ...(options.headers || []),
    ]),
    cookies: new Map(),
    nextUrl: { pathname: options.pathname || '/' },
    url: options.url || 'http://localhost:3000',
    method: options.method || 'GET',
    ip: '127.0.0.1',
  }),
}
