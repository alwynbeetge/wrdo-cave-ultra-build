
import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
});

// Chat validation schemas
export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(8000, 'Message too long'),
  model: z
    .string()
    .min(1, 'Model selection is required')
    .max(50, 'Model name too long'),
  conversationId: z
    .string()
    .uuid('Invalid conversation ID')
    .optional(),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .optional()
    .default(0.7),
  maxTokens: z
    .number()
    .min(1)
    .max(4000)
    .optional()
    .default(1000),
});

// Document upload validation schemas
export const documentUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[^<>:"/\\|?*]+$/, 'Invalid filename characters'),
  fileType: z
    .enum(['pdf', 'docx', 'txt', 'csv', 'xlsx'])
    .describe('Supported file types'),
  fileSize: z
    .number()
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB'), // 10MB limit
});

// Admin validation schemas
export const adminActionSchema = z.object({
  action: z.enum(['ban_user', 'unban_user', 'delete_user', 'change_role']),
  targetUserId: z.string().uuid('Invalid user ID'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
  newRole: z.enum(['admin', 'user']).optional(),
});

// IP tracking validation
export const ipTrackingSchema = z.object({
  ip: z.string().ip('Invalid IP address'),
  userAgent: z.string().max(1000, 'User agent too long'),
  action: z.string().min(1, 'Action is required').max(100, 'Action too long'),
  resource: z.string().min(1, 'Resource is required').max(100, 'Resource too long'),
  details: z.record(z.any()).optional(),
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  windowMs: z.number().min(1000).max(3600000), // 1 second to 1 hour
  maxRequests: z.number().min(1).max(10000),
  skipSuccessfulRequests: z.boolean().optional().default(false),
  skipFailedRequests: z.boolean().optional().default(false),
});

// Generic validation helpers
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

// Validation result types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type AdminActionInput = z.infer<typeof adminActionSchema>;
export type IpTrackingInput = z.infer<typeof ipTrackingSchema>;

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Sanitization helpers
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
