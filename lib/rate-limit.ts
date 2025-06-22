
import NodeCache from 'node-cache';
import { NextRequest } from 'next/server';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Default rate limit configurations for different endpoints
export const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  REGISTER: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour (disabled but kept for reference)
  CHAT: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 messages per minute
  API_GENERAL: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  UPLOAD: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 uploads per hour
  ADMIN: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 admin actions per minute
} as const;

// Create cache instances for different rate limits
const rateLimitCache = new NodeCache({ stdTTL: 0 }); // TTL managed manually
const ipBlockCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL for blocked IPs

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface IpBlockEntry {
  reason: string;
  blockedAt: number;
  attempts: number;
}

export class RateLimiter {
  private cache: NodeCache;
  private config: RateLimitConfig;
  private keyPrefix: string;

  constructor(config: RateLimitConfig, keyPrefix: string = 'rl') {
    this.cache = rateLimitCache;
    this.config = config;
    this.keyPrefix = keyPrefix;
  }

  async checkRateLimit(identifier: string): Promise<{
    allowed: boolean;
    remainingRequests: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Date.now();
    
    // Get current entry
    let entry = this.cache.get<RateLimitEntry>(key);
    
    if (!entry) {
      // First request
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstRequest: now,
      };
      this.cache.set(key, entry, this.config.windowMs / 1000);
      return {
        allowed: true,
        remainingRequests: this.config.maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }

    // Check if window has expired
    if (now >= entry.resetTime) {
      // Reset the window
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstRequest: now,
      };
      this.cache.set(key, entry, this.config.windowMs / 1000);
      return {
        allowed: true,
        remainingRequests: this.config.maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }

    // Increment counter
    entry.count++;
    this.cache.set(key, entry, Math.ceil((entry.resetTime - now) / 1000));

    if (entry.count > this.config.maxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    return {
      allowed: true,
      remainingRequests: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  async recordRequest(identifier: string, success: boolean = true): Promise<void> {
    // Skip recording based on configuration
    if ((success && this.config.skipSuccessfulRequests) || 
        (!success && this.config.skipFailedRequests)) {
      return;
    }

    // Request is already recorded in checkRateLimit
    // This method can be used for additional logging if needed
  }
}

// IP blocking functionality
export class IpBlocker {
  private cache: NodeCache;

  constructor() {
    this.cache = ipBlockCache;
  }

  blockIp(ip: string, reason: string, durationMs: number = 3600000): void {
    const entry: IpBlockEntry = {
      reason,
      blockedAt: Date.now(),
      attempts: 1,
    };
    this.cache.set(`blocked:${ip}`, entry, durationMs / 1000);
  }

  isBlocked(ip: string): { blocked: boolean; reason?: string; blockedAt?: number } {
    const entry = this.cache.get<IpBlockEntry>(`blocked:${ip}`);
    if (entry) {
      return {
        blocked: true,
        reason: entry.reason,
        blockedAt: entry.blockedAt,
      };
    }
    return { blocked: false };
  }

  unblockIp(ip: string): boolean {
    return this.cache.del(`blocked:${ip}`) > 0;
  }

  incrementAttempts(ip: string): number {
    const entry = this.cache.get<IpBlockEntry>(`blocked:${ip}`);
    if (entry) {
      entry.attempts++;
      this.cache.set(`blocked:${ip}`, entry);
      return entry.attempts;
    }
    return 0;
  }

  getBlockedIps(): Array<{ ip: string; entry: IpBlockEntry }> {
    const keys = this.cache.keys().filter(key => key.startsWith('blocked:'));
    return keys.map(key => ({
      ip: key.replace('blocked:', ''),
      entry: this.cache.get<IpBlockEntry>(key)!,
    }));
  }
}

// Helper functions
export function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfIp) {
    return cfIp;
  }
  
  // Fallback to connection IP (may not be accurate behind proxies)
  return request.ip || 'unknown';
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

// Create rate limiter instances
export const loginRateLimiter = new RateLimiter(RATE_LIMITS.LOGIN, 'login');
export const chatRateLimiter = new RateLimiter(RATE_LIMITS.CHAT, 'chat');
export const apiRateLimiter = new RateLimiter(RATE_LIMITS.API_GENERAL, 'api');
export const uploadRateLimiter = new RateLimiter(RATE_LIMITS.UPLOAD, 'upload');
export const adminRateLimiter = new RateLimiter(RATE_LIMITS.ADMIN, 'admin');

// Global IP blocker instance
export const ipBlocker = new IpBlocker();

// Middleware helper for rate limiting
export async function applyRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter,
  identifier?: string
): Promise<{
  allowed: boolean;
  headers: Record<string, string>;
  retryAfter?: number;
}> {
  const clientIp = getClientIp(request);
  const rateLimitId = identifier || clientIp;
  
  // Check if IP is blocked
  const blockStatus = ipBlocker.isBlocked(clientIp);
  if (blockStatus.blocked) {
    return {
      allowed: false,
      headers: {
        'X-RateLimit-Blocked': 'true',
        'X-RateLimit-Block-Reason': blockStatus.reason || 'IP blocked',
      },
      retryAfter: 3600, // 1 hour
    };
  }
  
  const result = await rateLimiter.checkRateLimit(rateLimitId);
  
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
    'X-RateLimit-Remaining': result.remainingRequests.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  };
  
  if (!result.allowed && result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }
  
  return {
    allowed: result.allowed,
    headers,
    retryAfter: result.retryAfter,
  };
}
