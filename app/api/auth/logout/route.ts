
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getCurrentSession } from '@/lib/auth';
import { ipTracker, extractRequestData } from '@/lib/ip-tracking';
import { apiRateLimiter, applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestData = extractRequestData(request);
  
  try {
    // Apply rate limiting
    const rateLimit = await applyRateLimit(request, apiRateLimiter);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: rateLimit.headers }
      );
    }

    // Get current session to log user info
    const session = await getCurrentSession();
    
    // Destroy session
    await destroySession();

    // Log logout activity
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      userId: session?.user.id,
      action: 'logout',
      resource: 'auth',
      details: {
        sessionDestroyed: true,
        logoutMethod: 'manual',
      },
      success: true,
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error('Logout error:', error);
    
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      action: 'logout_error',
      resource: 'auth',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Disable other methods
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
