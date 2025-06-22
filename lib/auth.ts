
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: Date;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate session token
export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'wrdo-cave-ultra-dev-secret-key-2025');

// Create JWT token for middleware-compatible auth
export async function createJWTToken(user: User): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
  
  return token;
}

// Verify JWT token (works in Edge Runtime)
export async function verifyJWTToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      id: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string | null,
      image: payload.image as string | null,
      createdAt: new Date(), // We don't store these in JWT
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Create session with JWT token
export async function createSession(user: User): Promise<string> {
  const jwtToken = await createJWTToken(user);
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Set JWT session cookie
  cookies().set('session-token', jwtToken, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return jwtToken;
}



// Get current session (Server Components compatible)
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const sessionToken = cookies().get('session-token')?.value;
    
    if (!sessionToken) {
      return null;
    }

    const user = await verifyJWTToken(sessionToken);
    
    if (!user) {
      return null;
    }

    return {
      user,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

// Middleware helper for protected routes (Edge Runtime compatible)
export async function requireAuth(request: NextRequest): Promise<User | null> {
  const sessionToken = request.cookies.get('session-token')?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  return await verifyJWTToken(sessionToken);
}
