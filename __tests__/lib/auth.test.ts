
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  authenticateUser,
  createUser,
  getUserByEmail,
} from '@/lib/auth'
import { prisma } from '@/lib/db'

jest.mock('@/lib/db')

describe('Authentication Library', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50) // bcrypt hashes are typically 60 characters
    })

    it('should produce different hashes for the same password', async () => {
      const password = 'testpassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })
  })

  describe('generateSessionToken', () => {
    it('should generate a session token', () => {
      const token = generateSessionToken()
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(10)
    })

    it('should generate unique tokens', () => {
      const token1 = generateSessionToken()
      const token2 = generateSessionToken()
      
      expect(token1).not.toBe(token2)
    })
  })

  describe('getUserByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = global.testUtils.createMockUser()
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      
      const user = await getUserByEmail('test@example.com')
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(user).toEqual(mockUser)
    })

    it('should return null for non-existent email', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      
      const user = await getUserByEmail('nonexistent@example.com')
      
      expect(user).toBeNull()
    })
  })

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const mockUser = global.testUtils.createMockUser()
      ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)
      
      const user = await createUser('test@example.com', 'password123', 'Test User')
      
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: expect.any(String),
          name: 'Test User',
        },
      })
      expect(user).toEqual(mockUser)
    })

    it('should create user without name', async () => {
      const mockUser = { ...global.testUtils.createMockUser(), name: null }
      ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)
      
      const user = await createUser('test@example.com', 'password123')
      
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: expect.any(String),
          name: undefined,
        },
      })
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user with correct credentials', async () => {
      const password = 'password123'
      const hashedPassword = await hashPassword(password)
      const mockUser = {
        ...global.testUtils.createMockUser(),
        password: hashedPassword,
      }
      
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      
      const user = await authenticateUser('test@example.com', password)
      
      expect(user).toBeDefined()
      expect(user?.email).toBe('test@example.com')
      expect(user?.id).toBe(mockUser.id)
    })

    it('should return null for incorrect password', async () => {
      const password = 'password123'
      const wrongPassword = 'wrongpassword'
      const hashedPassword = await hashPassword(password)
      const mockUser = {
        ...global.testUtils.createMockUser(),
        password: hashedPassword,
      }
      
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      
      const user = await authenticateUser('test@example.com', wrongPassword)
      
      expect(user).toBeNull()
    })

    it('should return null for non-existent user', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      
      const user = await authenticateUser('nonexistent@example.com', 'password123')
      
      expect(user).toBeNull()
    })

    it('should return null for user without password', async () => {
      const mockUser = {
        ...global.testUtils.createMockUser(),
        password: null,
      }
      
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      
      const user = await authenticateUser('test@example.com', 'password123')
      
      expect(user).toBeNull()
    })
  })
})
