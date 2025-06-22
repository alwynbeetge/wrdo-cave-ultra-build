import { prisma } from './db';
import { hashPassword, verifyPassword, User } from './auth';

export async function getCurrentSession(): Promise<{ user: User; expires: Date } | null> {
  try {
    const { cookies } = await import('next/headers');
    const sessionToken = cookies().get('session-token')?.value;
    
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
  const { cookies } = await import('next/headers');
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
