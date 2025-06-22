
import {
  AIRouter,
  AI_MODELS,
  AI_AGENTS,
  estimateMessageCost,
  formatCost,
} from '@/lib/ai-router'

// Mock the fetch function
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('AI Router', () => {
  let aiRouter: AIRouter

  beforeEach(() => {
    jest.clearAllMocks()
    aiRouter = new AIRouter()
  })

  describe('AIRouter initialization', () => {
    it('should initialize with API key', () => {
      expect(() => new AIRouter()).not.toThrow()
    })

    it('should throw error without API key', () => {
      delete process.env.ABACUSAI_API_KEY
      expect(() => new AIRouter()).toThrow('ABACUSAI_API_KEY environment variable is required')
      process.env.ABACUSAI_API_KEY = 'test-api-key'
    })
  })

  describe('getAvailableModels', () => {
    it('should return all available models and agents', () => {
      const models = aiRouter.getAvailableModels()
      
      expect(models.length).toBeGreaterThan(0)
      expect(models).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'gpt-4o' }),
        expect.objectContaining({ id: 'deep-agent' }),
      ]))
    })
  })

  describe('getModel', () => {
    it('should return model information', () => {
      const model = aiRouter.getModel('gpt-4o')
      
      expect(model).toBeDefined()
      expect(model?.id).toBe('gpt-4o')
      expect(model?.provider).toBe('openai')
    })

    it('should return agent information', () => {
      const agent = aiRouter.getModel('deep-agent')
      
      expect(agent).toBeDefined()
      expect(agent?.id).toBe('deep-agent')
      expect(agent?.isAgent).toBe(true)
    })

    it('should return null for unknown model', () => {
      const model = aiRouter.getModel('unknown-model')
      expect(model).toBeNull()
    })
  })

  describe('isAgent', () => {
    it('should identify agents correctly', () => {
      expect(aiRouter.isAgent('deep-agent')).toBe(true)
      expect(aiRouter.isAgent('devin-agent')).toBe(true)
      expect(aiRouter.isAgent('gpt-4o')).toBe(false)
    })
  })

  describe('chatCompletion', () => {
    const mockMessages = [
      { role: 'system' as const, content: 'You are a helpful assistant' },
      { role: 'user' as const, content: 'Hello, world!' },
    ]

    it('should complete chat with primary model', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Hello! How can I help you?' } }],
          usage: { total_tokens: 25 },
        }),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await aiRouter.chatCompletion(mockMessages, 'gpt-4o')

      expect(result.content).toBe('Hello! How can I help you?')
      expect(result.model).toBe('gpt-4o')
      expect(result.provider).toBe('openai')
      expect(result.fallbackUsed).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should use fallback when primary model fails', async () => {
      // First call fails
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: jest.fn().mockResolvedValue('Server error'),
        } as any)
        // Second call succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Fallback response' } }],
            usage: { total_tokens: 20 },
          }),
        } as any)

      const result = await aiRouter.chatCompletion(mockMessages, 'gpt-4o')

      expect(result.content).toBe('Fallback response')
      expect(result.fallbackUsed).toBe(true)
      expect(result.fallbackReason).toContain('API request failed')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should throw error when all models fail', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Server error'),
      } as any)

      await expect(
        aiRouter.chatCompletion(mockMessages, 'gpt-4o')
      ).rejects.toThrow('All AI models failed')
    })

    it('should reject agent requests', async () => {
      await expect(
        aiRouter.chatCompletion(mockMessages, 'deep-agent')
      ).rejects.toThrow('Agent requests require explicit approval')
    })

    it('should throw error for unknown model', async () => {
      await expect(
        aiRouter.chatCompletion(mockMessages, 'unknown-model')
      ).rejects.toThrow('Unknown model: unknown-model')
    })
  })

  describe('requestAgentExecution', () => {
    it('should create agent approval request', async () => {
      const request = await aiRouter.requestAgentExecution(
        'deep-agent',
        'Analyze market trends for Q4 2024',
        {
          userId: 'test-user',
          justification: 'Need comprehensive market analysis for strategic planning',
        }
      )

      expect(request.agentId).toBe('deep-agent')
      expect(request.task).toBe('Analyze market trends for Q4 2024')
      expect(request.estimatedCost).toBeGreaterThan(0)
      expect(request.estimatedTime).toBeGreaterThan(0)
      expect(request.riskLevel).toBe('medium')
    })

    it('should throw error for unknown agent', async () => {
      await expect(
        aiRouter.requestAgentExecution('unknown-agent', 'test task', {
          userId: 'test-user',
          justification: 'test',
        })
      ).rejects.toThrow('Unknown agent: unknown-agent')
    })

    it('should estimate higher cost for complex tasks', async () => {
      const simpleRequest = await aiRouter.requestAgentExecution(
        'deep-agent',
        'Simple query',
        { userId: 'test-user', justification: 'test' }
      )

      const complexRequest = await aiRouter.requestAgentExecution(
        'deep-agent',
        'Comprehensive market research analysis with detailed competitive analysis and integration workflows',
        { userId: 'test-user', justification: 'test' }
      )

      expect(complexRequest.estimatedCost).toBeGreaterThan(simpleRequest.estimatedCost)
    })
  })

  describe('executeApprovedAgentTask', () => {
    const mockApprovalRequest = {
      agentId: 'deep-agent',
      task: 'Test task',
      estimatedCost: 2.5,
      estimatedTime: 15,
      riskLevel: 'medium' as const,
      justification: 'Test justification',
    }

    it('should execute approved agent task', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Agent execution result' } }],
          usage: { total_tokens: 50 },
        }),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await aiRouter.executeApprovedAgentTask(
        mockApprovalRequest,
        true,
        'admin-user'
      )

      expect(result.content).toBe('Agent execution result')
      expect(result.model).toBe('deep-agent')
      expect(result.tokensUsed).toBe(50)
    })

    it('should throw error when not approved', async () => {
      await expect(
        aiRouter.executeApprovedAgentTask(mockApprovalRequest, false)
      ).rejects.toThrow('Agent execution was not approved')
    })

    it('should throw error for unknown agent', async () => {
      const invalidRequest = { ...mockApprovalRequest, agentId: 'unknown-agent' }
      
      await expect(
        aiRouter.executeApprovedAgentTask(invalidRequest, true)
      ).rejects.toThrow('Unknown agent: unknown-agent')
    })
  })
})

describe('AI Router Utilities', () => {
  describe('estimateMessageCost', () => {
    it('should estimate cost correctly', () => {
      const message = 'Hello, world!'
      const cost = estimateMessageCost(message, 'gpt-4o')
      
      expect(cost).toBeGreaterThan(0)
      expect(typeof cost).toBe('number')
    })

    it('should return 0 for unknown model', () => {
      const message = 'Hello, world!'
      const cost = estimateMessageCost(message, 'unknown-model')
      
      expect(cost).toBe(0)
    })

    it('should estimate higher cost for longer messages', () => {
      const shortMessage = 'Hi'
      const longMessage = 'This is a much longer message that should cost more to process'
      
      const shortCost = estimateMessageCost(shortMessage, 'gpt-4o')
      const longCost = estimateMessageCost(longMessage, 'gpt-4o')
      
      expect(longCost).toBeGreaterThan(shortCost)
    })
  })

  describe('formatCost', () => {
    it('should format small costs with k suffix', () => {
      const cost = 0.005
      const formatted = formatCost(cost)
      
      expect(formatted).toBe('$5.00k')
    })

    it('should format larger costs normally', () => {
      const cost = 0.025
      const formatted = formatCost(cost)
      
      expect(formatted).toBe('$0.025')
    })

    it('should handle zero cost', () => {
      const cost = 0
      const formatted = formatCost(cost)
      
      expect(formatted).toBe('$0.00k')
    })
  })
})

describe('AI Models and Agents Configuration', () => {
  describe('AI_MODELS', () => {
    it('should have required properties', () => {
      Object.values(AI_MODELS).forEach(model => {
        expect(model).toHaveProperty('id')
        expect(model).toHaveProperty('name')
        expect(model).toHaveProperty('provider')
        expect(model).toHaveProperty('costPerToken')
        expect(model).toHaveProperty('maxTokens')
        expect(model).toHaveProperty('capabilities')
        
        expect(typeof model.costPerToken).toBe('number')
        expect(model.costPerToken).toBeGreaterThan(0)
        expect(typeof model.maxTokens).toBe('number')
        expect(model.maxTokens).toBeGreaterThan(0)
        expect(Array.isArray(model.capabilities)).toBe(true)
      })
    })
  })

  describe('AI_AGENTS', () => {
    it('should have required agent properties', () => {
      Object.values(AI_AGENTS).forEach(agent => {
        expect(agent).toHaveProperty('id')
        expect(agent).toHaveProperty('name')
        expect(agent).toHaveProperty('isAgent', true)
        expect(agent).toHaveProperty('requiresApproval', true)
        expect(agent).toHaveProperty('description')
        expect(agent).toHaveProperty('specializedFor')
        expect(agent).toHaveProperty('riskLevel')
        expect(agent).toHaveProperty('maxExecutionTime')
        expect(agent).toHaveProperty('estimatedCostPerRequest')
        
        expect(['low', 'medium', 'high']).toContain(agent.riskLevel)
        expect(typeof agent.maxExecutionTime).toBe('number')
        expect(agent.maxExecutionTime).toBeGreaterThan(0)
        expect(typeof agent.estimatedCostPerRequest).toBe('number')
        expect(agent.estimatedCostPerRequest!).toBeGreaterThan(0)
      })
    })
  })
})
