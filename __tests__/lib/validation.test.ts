
import {
  validateInput,
  loginSchema,
  registerSchema,
  chatMessageSchema,
  sanitizeString,
  sanitizeEmail,
} from '@/lib/validation'

describe('Validation Library', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }
      
      const result = validateInput(loginSchema, validData)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
        expect(result.data.password).toBe('password123')
      }
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }
      
      const result = validateInput(loginSchema, invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid email address')
      }
    })

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
      }
      
      const result = validateInput(loginSchema, invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Password must be at least 8 characters')
      }
    })

    it('should reject missing fields', () => {
      const invalidData = {
        email: 'test@example.com',
      }
      
      const result = validateInput(loginSchema, invalidData)
      
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      }
      
      const result = validateInput(registerSchema, validData)
      
      expect(result.success).toBe(true)
    })

    it('should reject invalid name with numbers', () => {
      const invalidData = {
        name: 'John123',
        email: 'john@example.com',
        password: 'Password123',
      }
      
      const result = validateInput(registerSchema, invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Name can only contain letters and spaces')
      }
    })

    it('should reject password without uppercase', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }
      
      const result = validateInput(registerSchema, invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Password must contain at least one lowercase letter, one uppercase letter, and one number')
      }
    })

    it('should reject password without number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password',
      }
      
      const result = validateInput(registerSchema, invalidData)
      
      expect(result.success).toBe(false)
    })
  })

  describe('chatMessageSchema', () => {
    it('should validate correct chat message', () => {
      const validData = {
        message: 'Hello, how are you?',
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 1000,
      }
      
      const result = validateInput(chatMessageSchema, validData)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.message).toBe('Hello, how are you?')
        expect(result.data.model).toBe('gpt-4o')
        expect(result.data.temperature).toBe(0.7)
        expect(result.data.maxTokens).toBe(1000)
      }
    })

    it('should apply default values', () => {
      const validData = {
        message: 'Hello',
        model: 'gpt-4o',
      }
      
      const result = validateInput(chatMessageSchema, validData)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.temperature).toBe(0.7)
        expect(result.data.maxTokens).toBe(1000)
      }
    })

    it('should reject empty message', () => {
      const invalidData = {
        message: '',
        model: 'gpt-4o',
      }
      
      const result = validateInput(chatMessageSchema, invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Message cannot be empty')
      }
    })

    it('should reject message that is too long', () => {
      const invalidData = {
        message: 'a'.repeat(8001),
        model: 'gpt-4o',
      }
      
      const result = validateInput(chatMessageSchema, invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Message too long')
      }
    })

    it('should reject invalid temperature', () => {
      const invalidData = {
        message: 'Hello',
        model: 'gpt-4o',
        temperature: 3,
      }
      
      const result = validateInput(chatMessageSchema, invalidData)
      
      expect(result.success).toBe(false)
    })
  })

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const input = 'Hello <script>alert("xss")</script> world'
      const result = sanitizeString(input)
      
      expect(result).toBe('Hello scriptalert("xss")/script world')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    })

    it('should trim whitespace', () => {
      const input = '  Hello world  '
      const result = sanitizeString(input)
      
      expect(result).toBe('Hello world')
    })

    it('should limit length', () => {
      const input = 'a'.repeat(1500)
      const result = sanitizeString(input, 100)
      
      expect(result.length).toBe(100)
    })

    it('should remove control characters', () => {
      const input = 'Hello\x00\x01\x7F world'
      const result = sanitizeString(input)
      
      expect(result).toBe('Hello world')
    })
  })

  describe('sanitizeEmail', () => {
    it('should convert to lowercase', () => {
      const input = 'Test@EXAMPLE.COM'
      const result = sanitizeEmail(input)
      
      expect(result).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      const input = '  test@example.com  '
      const result = sanitizeEmail(input)
      
      expect(result).toBe('test@example.com')
    })
  })
})
