
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { authenticateUser, storeSession } from '@/lib/auth-db';
import { prisma } from '@/lib/db';
import { validateInput, loginSchema, sanitizeEmail } from '@/lib/validation';
import { loginRateLimiter, applyRateLimit, ipBlocker } from '@/lib/rate-limit';
import { ipTracker, extractRequestData } from '@/lib/ip-tracking';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestData = extractRequestData(request);
  
  try {
    // Apply rate limiting
    const rateLimit = await applyRateLimit(request, loginRateLimiter);
    
    if (!rateLimit.allowed) {
      // Log security event for rate limit exceeded
      await ipTracker.logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        description: `Login rate limit exceeded for IP ${requestData.ip}`,
        metadata: {
          endpoint: '/api/auth/login',
          retryAfter: rateLimit.retryAfter,
        },
      });

      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: rateLimit.headers,
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateInput(loginSchema, body);
    
    if (!validation.success) {
      await ipTracker.logActivity({
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        action: 'login_attempt',
        resource: 'auth',
        success: false,
        errorMessage: validation.error,
        responseTime: Date.now() - startTime,
      });

      return NextResponse.json(
        { error: validation.error },
        { 
          status: 400,
          headers: rateLimit.headers,
        }
      );
    }

    const { email, password } = validation.data;
    const sanitizedEmail = sanitizeEmail(email);

    // Track login attempt
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      action: 'login_attempt',
      resource: 'auth',
      details: {
        email: sanitizedEmail,
        timestamp: new Date().toISOString(),
      },
    });

    const user = {
      id: 'mock-user-1',
      email: sanitizedEmail,
      name: 'Admin User',
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (!sanitizedEmail || !password) {
      // Log failed authentication
      await ipTracker.logSecurityEvent({
        type: 'failed_auth',
        severity: 'medium',
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        description: `Failed login attempt for email: ${sanitizedEmail}`,
        metadata: {
          email: sanitizedEmail,
          timestamp: new Date().toISOString(),
        },
      });

      await ipTracker.logActivity({
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        action: 'login_failed',
        resource: 'auth',
        details: { email: sanitizedEmail },
        success: false,
        errorMessage: 'Invalid credentials',
        responseTime: Date.now() - startTime,
      });

      // Check if this IP should be blocked for excessive failed attempts
      const analysis = await ipTracker.analyzeIpActivity(requestData.ip, 60);
      if (analysis.riskScore >= 8) {
        ipBlocker.blockIp(requestData.ip, 'Excessive failed login attempts', 3600000); // Block for 1 hour
        
        await ipTracker.logSecurityEvent({
          type: 'blocked_ip',
          severity: 'high',
          ip: requestData.ip,
          userAgent: requestData.userAgent,
          description: `IP blocked due to excessive failed login attempts (risk score: ${analysis.riskScore})`,
          metadata: {
            riskScore: analysis.riskScore,
            totalRequests: analysis.totalRequests,
            failedRequests: analysis.failedRequests,
            blockDuration: '1 hour',
          },
        });
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { 
          status: 401,
          headers: rateLimit.headers,
        }
      );
    }

    // Create session with JWT token (no database storage for mock)
    const sessionToken = await createSession(user);

    // Log successful login
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      userId: user.id,
      action: 'login_success',
      resource: 'auth',
      details: { 
        email: sanitizedEmail,
        sessionToken: sessionToken.substring(0, 8) + '...', // Log partial token for tracking
      },
      success: true,
      responseTime: Date.now() - startTime,
    });


    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      },
      { 
        status: 200,
        headers: rateLimit.headers,
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    
    // Log internal error
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      action: 'login_error',
      resource: 'auth',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    });

    await ipTracker.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      description: 'Internal server error during login attempt',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/auth/login',
      },
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Disable all other HTTP methods
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
