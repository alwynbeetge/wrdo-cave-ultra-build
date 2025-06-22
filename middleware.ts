
import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/chat',
  '/api/chat',
  '/api/admin',
  '/api/upload',
  '/api/documents',
  '/api/analytics',
] as const;

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register', // Kept for error handling, but returns 403
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/register', // Kept for error handling, but returns 403
] as const;

// Define admin-only routes
const ADMIN_ROUTES = [
  '/dashboard/admin',
  '/api/admin',
] as const;

// Rate limiting and security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Prevent caching of sensitive pages
  if (!response.headers.get('Cache-Control')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  return response;
}

// Check if route requires authentication
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
}

// Check if route requires admin access
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

// Enhanced logging for security events
async function logSecurityEvent(request: NextRequest, event: string, details: Record<string, any> = {}) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // In a production environment, you might want to send this to a security monitoring service
  console.log(`[SECURITY] ${event}`, {
    ip,
    userAgent,
    pathname: request.nextUrl.pathname,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Add security headers to all responses
  const response = NextResponse.next();
  addSecurityHeaders(response);
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/') ||
    pathname.includes('.') || // static files
    pathname.startsWith('/favicon')
  ) {
    return response;
  }

  // Log all requests for security monitoring
  await logSecurityEvent(request, 'REQUEST', {
    method: request.method,
    pathname,
  });

  // Handle register route - always redirect to login with message
  if (pathname === '/register') {
    await logSecurityEvent(request, 'REGISTER_ATTEMPT', {
      reason: 'Registration disabled - redirecting to login',
    });
    
    // Still allow the register page to load to show the disabled message
    return response;
  }

  // Handle registration API - this is handled in the API route itself
  if (pathname === '/api/auth/register') {
    await logSecurityEvent(request, 'API_REGISTER_ATTEMPT', {
      reason: 'API registration disabled',
    });
    // Let the API route handle the 403 response
    return response;
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    try {
      const user = await requireAuth(request);
      
      if (!user) {
        await logSecurityEvent(request, 'UNAUTHORIZED_ACCESS', {
          reason: 'No valid session',
          pathname,
        });
        
        // Redirect to login for protected routes
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // Check admin routes
      if (isAdminRoute(pathname)) {
        // For now, we'll check if user has admin role by checking if they're the first user
        // In a full implementation, you'd check user roles properly
        try {
          // This is a simplified admin check - in production you'd check proper roles
          const isAdmin = user.email && (
            user.email.includes('admin') || 
            user.id === 'first-user' // You'd implement proper role checking
          );
          
          if (!isAdmin) {
            await logSecurityEvent(request, 'ADMIN_ACCESS_DENIED', {
              userId: user.id,
              userEmail: user.email,
              pathname,
            });
            
            // Redirect non-admin users to regular dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      
      // Log successful authentication
      await logSecurityEvent(request, 'AUTHENTICATED_ACCESS', {
        userId: user.id,
        userEmail: user.email,
        pathname,
      });
      
    } catch (error) {
      console.error('Middleware auth error:', error);
      
      await logSecurityEvent(request, 'AUTH_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error',
        pathname,
      });
      
      // Redirect to login on auth error
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For API routes, add additional security measures
  if (pathname.startsWith('/api/')) {
    // Add API-specific security headers
    response.headers.set('X-API-Version', '1.0');
    response.headers.set('X-Rate-Limit-Policy', 'strict');
    
    // Log API access
    await logSecurityEvent(request, 'API_ACCESS', {
      endpoint: pathname,
      method: request.method,
    });
  }

  // Redirect root to login if not authenticated, otherwise to dashboard
  if (pathname === '/') {
    try {
      const user = await requireAuth(request);
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
