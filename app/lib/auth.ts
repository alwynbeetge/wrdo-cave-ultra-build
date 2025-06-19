
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './db';

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

// Create session
export async function createSession(userId: string): Promise<string> {
  const sessionToken = generateSessionToken();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Set session cookie
  cookies().set('session-token', sessionToken, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return sessionToken;
}

// Get current session
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const sessionToken = cookies().get('session-token')?.value;
    
    if (!sessionToken) {
      return null;
    }

    // For now, we'll decode the session from the token
    // In production, you'd want to store sessions in database
    const userId = await getUserIdFromToken(sessionToken);
    
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

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

// Database-based session storage
export async function storeSession(token: string, userId: string): Promise<void> {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  // Store session in database
  await prisma.session.create({
    data: {
      sessionToken: token,
      userId,
      expires,
    },
  });
}

export async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
    });
    
    if (!session || session.expires < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({
          where: { sessionToken: token },
        });
      }
      return null;
    }
    
    return session.userId;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Destroy session
export async function destroySession(): Promise<void> {
  const sessionToken = cookies().get('session-token')?.value;
  
  if (sessionToken) {
    // Delete session from database
    try {
      await prisma.session.delete({
        where: { sessionToken },
      });
    } catch (error) {
      // Session might not exist, continue
    }
  }
  
  cookies().set('session-token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

// Get user by email
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

// Create user
export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password);
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  
  if (!user || !user.password) {
    return null;
  }
  
  const isValidPassword = await verifyPassword(password, user.password);
  
  if (!isValidPassword) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Middleware helper for protected routes
export async function requireAuth(request: NextRequest): Promise<User | null> {
  const sessionToken = request.cookies.get('session-token')?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  const userId = await getUserIdFromToken(sessionToken);
  
  if (!userId) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return user;
}
