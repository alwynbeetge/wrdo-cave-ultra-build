
import {
  RateLimiter,
  IpBlocker,
  RATE_LIMITS,
  getClientIp,
  getUserAgent,
  applyRateLimit,
} from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

describe('Rate Limiting', () => {
  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter

    beforeEach(() => {
      rateLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 5 }, `test-${Date.now()}`)
    })

    afterEach(() => {
      // Clear the cache between tests
      jest.clearAllMocks()
    })

    it('should allow requests within limit', async () => {
      const result = await rateLimiter.checkRateLimit('test-id')
      
      expect(result.allowed).toBe(true)
      expect(result.remainingRequests).toBe(4)
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should track multiple requests', async () => {
      const testId = `test-id-${Date.now()}`
      await rateLimiter.checkRateLimit(testId)
      await rateLimiter.checkRateLimit(testId)
      const result = await rateLimiter.checkRateLimit(testId)
      
      expect(result.allowed).toBe(true)
      expect(result.remainingRequests).toBe(2)
    })

    it('should block requests when limit exceeded', async () => {
      // Make 5 requests (the limit)
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkRateLimit('test-id')
      }
      
      // 6th request should be blocked
      const result = await rateLimiter.checkRateLimit('test-id')
      
      expect(result.allowed).toBe(false)
      expect(result.remainingRequests).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should reset after window expires', async () => {
      const shortWindowLimiter = new RateLimiter({ windowMs: 10, maxRequests: 1 }, 'short')
      
      // Use up the limit
      await shortWindowLimiter.checkRateLimit('test-id')
      let result = await shortWindowLimiter.checkRateLimit('test-id')
      expect(result.allowed).toBe(false)
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 15))
      
      // Should be allowed again
      result = await shortWindowLimiter.checkRateLimit('test-id')
      expect(result.allowed).toBe(true)
    })

    it('should handle different identifiers separately', async () => {
      await rateLimiter.checkRateLimit('user-1')
      const result = await rateLimiter.checkRateLimit('user-2')
      
      expect(result.allowed).toBe(true)
      expect(result.remainingRequests).toBe(4) // Fresh limit for user-2
    })
  })

  describe('IpBlocker', () => {
    let ipBlocker: IpBlocker

    beforeEach(() => {
      ipBlocker = new IpBlocker()
    })

    it('should block IP address', () => {
      ipBlocker.blockIp('192.168.1.100', 'Test block')
      
      const status = ipBlocker.isBlocked('192.168.1.100')
      expect(status.blocked).toBe(true)
      expect(status.reason).toBe('Test block')
    })

    it('should not block unblocked IP', () => {
      const status = ipBlocker.isBlocked('192.168.1.101')
      expect(status.blocked).toBe(false)
    })

    it('should unblock IP address', () => {
      ipBlocker.blockIp('192.168.1.100', 'Test block')
      expect(ipBlocker.isBlocked('192.168.1.100').blocked).toBe(true)
      
      const unblocked = ipBlocker.unblockIp('192.168.1.100')
      expect(unblocked).toBe(true)
      expect(ipBlocker.isBlocked('192.168.1.100').blocked).toBe(false)
    })

    it('should increment attempt count', () => {
      ipBlocker.blockIp('192.168.1.100', 'Test block')
      
      const count1 = ipBlocker.incrementAttempts('192.168.1.100')
      expect(count1).toBe(2) // Initial + increment
      
      const count2 = ipBlocker.incrementAttempts('192.168.1.100')
      expect(count2).toBe(3)
    })

    it('should get blocked IPs list', () => {
      ipBlocker.blockIp('192.168.1.100', 'Reason 1')
      ipBlocker.blockIp('192.168.1.101', 'Reason 2')
      
      const blockedIps = ipBlocker.getBlockedIps()
      expect(blockedIps).toHaveLength(2)
      expect(blockedIps[0].ip).toBe('192.168.1.100')
      expect(blockedIps[1].ip).toBe('192.168.1.101')
    })
  })

  describe('Helper Functions', () => {
    describe('getClientIp', () => {
      it('should extract IP from x-forwarded-for header', () => {
        const mockRequest = {
          headers: new Map([
            ['x-forwarded-for', '192.168.1.100, 10.0.0.1'],
          ]),
          ip: '127.0.0.1',
        } as unknown as NextRequest
        
        const ip = getClientIp(mockRequest)
        expect(ip).toBe('192.168.1.100')
      })

      it('should extract IP from x-real-ip header', () => {
        const mockRequest = {
          headers: new Map([
            ['x-real-ip', '192.168.1.100'],
          ]),
          ip: '127.0.0.1',
        } as unknown as NextRequest
        
        const ip = getClientIp(mockRequest)
        expect(ip).toBe('192.168.1.100')
      })

      it('should extract IP from cf-connecting-ip header', () => {
        const mockRequest = {
          headers: new Map([
            ['cf-connecting-ip', '192.168.1.100'],
          ]),
          ip: '127.0.0.1',
        } as unknown as NextRequest
        
        const ip = getClientIp(mockRequest)
        expect(ip).toBe('192.168.1.100')
      })

      it('should fallback to request IP', () => {
        const mockRequest = {
          headers: new Map(),
          ip: '127.0.0.1',
        } as unknown as NextRequest
        
        const ip = getClientIp(mockRequest)
        expect(ip).toBe('127.0.0.1')
      })

      it('should return unknown for missing IP', () => {
        const mockRequest = {
          headers: new Map(),
        } as unknown as NextRequest
        
        const ip = getClientIp(mockRequest)
        expect(ip).toBe('unknown')
      })
    })

    describe('getUserAgent', () => {
      it('should extract user agent from header', () => {
        const mockRequest = {
          headers: new Map([
            ['user-agent', 'Mozilla/5.0 (Test Browser)'],
          ]),
        } as unknown as NextRequest
        
        const userAgent = getUserAgent(mockRequest)
        expect(userAgent).toBe('Mozilla/5.0 (Test Browser)')
      })

      it('should return unknown for missing user agent', () => {
        const mockRequest = {
          headers: new Map(),
        } as unknown as NextRequest
        
        const userAgent = getUserAgent(mockRequest)
        expect(userAgent).toBe('unknown')
      })
    })
  })

  describe('applyRateLimit', () => {
    it('should apply rate limiting', async () => {
      const testId = `test-${Date.now()}`
      const mockRequest = {
        headers: new Map([
          ['x-forwarded-for', '192.168.1.200'],
          ['user-agent', 'test-agent'],
        ]),
        ip: '192.168.1.200',
      } as unknown as NextRequest
      
      const rateLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 5 }, testId)
      
      const result = await applyRateLimit(mockRequest, rateLimiter)
      
      expect(result.allowed).toBe(true)
      expect(result.headers).toHaveProperty('X-RateLimit-Limit', '5')
      expect(result.headers).toHaveProperty('X-RateLimit-Remaining', '4')
      expect(result.headers).toHaveProperty('X-RateLimit-Reset')
    })

    it('should block when IP is blocked', async () => {
      const testIp = '192.168.1.150'
      const mockRequest = {
        headers: new Map([
          ['x-forwarded-for', testIp],
          ['user-agent', 'test-agent'],
        ]),
        ip: testIp,
      } as unknown as NextRequest
      
      const rateLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 5 }, 'block-test')
      
      // Import and use the ipBlocker directly
      const ipBlocker = new IpBlocker()
      ipBlocker.blockIp(testIp, 'Test block')
      
      // Mock the global ipBlocker in the rate-limit module
      const rateLimitModule = require('@/lib/rate-limit')
      const originalIsBlocked = rateLimitModule.ipBlocker.isBlocked
      rateLimitModule.ipBlocker.isBlocked = jest.fn().mockReturnValue({
        blocked: true,
        reason: 'Test block',
        blockedAt: Date.now(),
      })
      
      const result = await applyRateLimit(mockRequest, rateLimiter)
      
      expect(result.allowed).toBe(false)
      expect(result.headers).toHaveProperty('X-RateLimit-Blocked', 'true')
      expect(result.retryAfter).toBe(3600)
      
      // Restore original function
      rateLimitModule.ipBlocker.isBlocked = originalIsBlocked
    })
  })

  describe('RATE_LIMITS Configuration', () => {
    it('should have valid rate limit configurations', () => {
      Object.values(RATE_LIMITS).forEach(config => {
        expect(config).toHaveProperty('windowMs')
        expect(config).toHaveProperty('maxRequests')
        
        expect(typeof config.windowMs).toBe('number')
        expect(typeof config.maxRequests).toBe('number')
        expect(config.windowMs).toBeGreaterThan(0)
        expect(config.maxRequests).toBeGreaterThan(0)
      })
    })

    it('should have different limits for different endpoints', () => {
      expect(RATE_LIMITS.LOGIN.maxRequests).toBeLessThan(RATE_LIMITS.API_GENERAL.maxRequests)
      expect(RATE_LIMITS.REGISTER.maxRequests).toBeLessThan(RATE_LIMITS.CHAT.maxRequests)
    })
  })
})
