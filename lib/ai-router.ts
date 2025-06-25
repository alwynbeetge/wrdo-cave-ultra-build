
import { NextRequest } from 'next/server';

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'gemini' | 'deepseek';
  costPerToken: number;
  maxTokens: number;
  capabilities: string[];
  isAgent?: boolean;
  requiresApproval?: boolean;
  estimatedCostPerRequest?: number;
}

export interface AIAgent extends AIModel {
  isAgent: true;
  requiresApproval: true;
  description: string;
  specializedFor: string[];
  riskLevel: 'low' | 'medium' | 'high';
  maxExecutionTime: number; // in minutes
}

// Available AI models and agents
export const AI_MODELS: Record<string, AIModel> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    costPerToken: 0.00003,
    maxTokens: 4000,
    capabilities: ['text', 'analysis', 'coding', 'reasoning'],
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    costPerToken: 0.00001,
    maxTokens: 4000,
    capabilities: ['text', 'analysis', 'coding'],
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    costPerToken: 0.000002,
    maxTokens: 2000,
    capabilities: ['text', 'analysis'],
  },
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    costPerToken: 0.000001,
    maxTokens: 3000,
    capabilities: ['text', 'analysis', 'reasoning'],
  },
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    costPerToken: 0.0000005,
    maxTokens: 2500,
    capabilities: ['text', 'coding', 'math'],
  },
};

export const AI_AGENTS: Record<string, AIAgent> = {
  'deep-agent': {
    id: 'deep-agent',
    name: 'DeepAgent',
    provider: 'openai',
    costPerToken: 0.0001,
    maxTokens: 8000,
    capabilities: ['research', 'analysis', 'data-processing', 'automation'],
    isAgent: true,
    requiresApproval: true,
    estimatedCostPerRequest: 2.50,
    description: 'Advanced autonomous agent for complex research and analysis tasks',
    specializedFor: ['market-research', 'competitive-analysis', 'data-mining', 'trend-analysis'],
    riskLevel: 'medium',
    maxExecutionTime: 30,
  },
  'devin-agent': {
    id: 'devin-agent',
    name: 'Devin',
    provider: 'openai',
    costPerToken: 0.00015,
    maxTokens: 12000,
    capabilities: ['coding', 'software-development', 'debugging', 'architecture'],
    isAgent: true,
    requiresApproval: true,
    estimatedCostPerRequest: 5.00,
    description: 'Expert software development agent for complex coding tasks',
    specializedFor: ['full-stack-development', 'code-review', 'architecture-design', 'debugging'],
    riskLevel: 'high',
    maxExecutionTime: 60,
  },
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  tokensUsed: number;
  cost: number;
  processingTime: number;
  fallbackUsed?: boolean;
  fallbackReason?: string;
}

export interface AgentApprovalRequest {
  agentId: string;
  task: string;
  estimatedCost: number;
  estimatedTime: number;
  riskLevel: string;
  justification: string;
}

export class AIRouter {
  private openaiApiKey: string;
  
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || 'sk-test-key-for-development';
    if (!this.openaiApiKey) {
      console.warn('OPENAI_API_KEY environment variable not set, using mock responses');
    }
  }

  // Main chat completion method with fallback chain
  async chatCompletion(
    messages: ChatMessage[],
    modelId: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      userId?: string;
      conversationId?: string;
    } = {}
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    // Check if it's an agent request
    if (AI_AGENTS[modelId]) {
      throw new Error('Agent requests require explicit approval. Use requestAgentExecution() method.');
    }

    // Get primary model
    const primaryModel = AI_MODELS[modelId];
    if (!primaryModel) {
      throw new Error(`Unknown model: ${modelId}`);
    }

    // Define fallback chain based on primary model
    const fallbackChain = this.getFallbackChain(modelId);
    
    let lastError: Error | null = null;
    
    for (let i = 0; i < fallbackChain.length; i++) {
      const currentModelId = fallbackChain[i];
      const currentModel = AI_MODELS[currentModelId];
      
      try {
        const response = await this.executeModelRequest(
          messages,
          currentModelId,
          currentModel,
          options
        );
        
        const processingTime = Date.now() - startTime;
        
        return {
          content: response.content,
          model: currentModelId,
          provider: currentModel.provider,
          tokensUsed: response.tokensUsed,
          cost: response.cost,
          processingTime,
          fallbackUsed: i > 0,
          fallbackReason: i > 0 ? lastError?.message : undefined,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`Model ${currentModelId} failed:`, lastError.message);
        
        // If this is the last model in the chain, throw the error
        if (i === fallbackChain.length - 1) {
          throw new Error(`All AI models failed. Last error: ${lastError.message}`);
        }
        
        // Continue to next model in fallback chain
        continue;
      }
    }
    
    throw new Error('Unexpected error in AI router');
  }

  // Get fallback chain for a given model
  private getFallbackChain(primaryModelId: string): string[] {
    // Define fallback chains based on provider and capability
    const fallbackChains: Record<string, string[]> = {
      'gpt-4o': ['gpt-4o', 'gpt-4-turbo', 'gemini-pro', 'deepseek-chat'],
      'gpt-4-turbo': ['gpt-4-turbo', 'gpt-4o', 'gemini-pro', 'deepseek-chat'],
      'gpt-3.5-turbo': ['gpt-3.5-turbo', 'gemini-pro', 'deepseek-chat'],
      'gemini-pro': ['gemini-pro', 'gpt-4-turbo', 'deepseek-chat'],
      'deepseek-chat': ['deepseek-chat', 'gemini-pro', 'gpt-3.5-turbo'],
    };
    
    return fallbackChains[primaryModelId] || [primaryModelId];
  }

  // Execute request to specific model
  private async executeModelRequest(
    messages: ChatMessage[],
    modelId: string,
    model: AIModel,
    options: {
      temperature?: number;
      maxTokens?: number;
      userId?: string;
      conversationId?: string;
    }
  ): Promise<{ content: string; tokensUsed: number; cost: number }> {
    // Map model IDs to actual API model names
    const modelMapping: Record<string, string> = {
      'gpt-4o': 'gpt-4o',
      'gpt-4-turbo': 'gpt-4-turbo-preview',
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'gemini-pro': 'gemini-pro',
      'deepseek-chat': 'deepseek-chat',
    };

    const apiModel = modelMapping[modelId] || 'gpt-4.1-mini';
    
    const requestBody = {
      model: apiModel,
      messages: messages,
      max_tokens: Math.min(options.maxTokens || model.maxTokens, model.maxTokens),
      temperature: options.temperature || 0.7,
      ...(options.userId && { user: options.userId }),
    };

    // Use OpenAI API directly for OpenAI models, mock for others
    let response;
    if (model.provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
    } else {
      // Mock response for non-OpenAI providers
      response = {
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: `Mock response from ${model.name}: I understand your request and would provide a helpful response here. This is a development mock response.`
            }
          }],
          usage: {
            total_tokens: Math.floor(Math.random() * 100) + 50
          }
        })
      };
    }

    if (!response.ok) {
      const errorText = response.text ? await response.text() : 'Unknown error';
      const status = response.status || 500;
      const statusText = response.statusText || 'Internal Server Error';
      throw new Error(`API request failed: ${status} ${statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format');
    }

    const content = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;
    const cost = tokensUsed * model.costPerToken;

    return { content, tokensUsed, cost };
  }

  // Agent execution with approval flow
  async requestAgentExecution(
    agentId: string,
    task: string,
    options: {
      userId: string;
      justification: string;
      maxExecutionTime?: number;
    }
  ): Promise<AgentApprovalRequest> {
    const agent = AI_AGENTS[agentId];
    if (!agent) {
      throw new Error(`Unknown agent: ${agentId}`);
    }

    // Estimate cost and time based on task complexity
    const taskComplexity = this.analyzeTaskComplexity(task);
    const estimatedCost = agent.estimatedCostPerRequest! * taskComplexity.multiplier;
    const estimatedTime = Math.min(
      agent.maxExecutionTime * taskComplexity.multiplier,
      options.maxExecutionTime || agent.maxExecutionTime
    );

    const approvalRequest: AgentApprovalRequest = {
      agentId,
      task,
      estimatedCost,
      estimatedTime,
      riskLevel: agent.riskLevel,
      justification: options.justification,
    };

    // In a real implementation, this would be stored in database
    // and require admin approval before execution
    return approvalRequest;
  }

  // Execute approved agent task
  async executeApprovedAgentTask(
    approvalRequest: AgentApprovalRequest,
    approved: boolean,
    approvedBy?: string
  ): Promise<AIResponse> {
    if (!approved) {
      throw new Error('Agent execution was not approved');
    }

    const agent = AI_AGENTS[approvalRequest.agentId];
    if (!agent) {
      throw new Error(`Unknown agent: ${approvalRequest.agentId}`);
    }

    const startTime = Date.now();

    // Create specialized system prompt for agent
    const systemPrompt = this.createAgentSystemPrompt(agent, approvalRequest.task);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: approvalRequest.task },
    ];

    try {
      const response = await this.executeModelRequest(
        messages,
        'gpt-4o', // Agents use the most capable model
        { ...agent, maxTokens: agent.maxTokens },
        { maxTokens: agent.maxTokens }
      );

      const processingTime = Date.now() - startTime;

      return {
        content: response.content,
        model: approvalRequest.agentId,
        provider: agent.provider,
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        processingTime,
      };
    } catch (error) {
      throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Analyze task complexity for cost estimation
  private analyzeTaskComplexity(task: string): { multiplier: number; complexity: 'simple' | 'moderate' | 'complex' } {
    const taskLower = task.toLowerCase();
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    let multiplier = 1;

    // Check for complex keywords
    const complexKeywords = [
      'research', 'analyze', 'comprehensive', 'detailed', 'market analysis',
      'competitive analysis', 'full stack', 'architecture', 'multi-step',
      'integration', 'automation', 'workflow'
    ];

    const moderateKeywords = [
      'review', 'summarize', 'compare', 'list', 'explain', 'debug', 'optimize'
    ];

    const complexCount = complexKeywords.filter(keyword => taskLower.includes(keyword)).length;
    const moderateCount = moderateKeywords.filter(keyword => taskLower.includes(keyword)).length;

    if (complexCount >= 2 || taskLower.length > 500) {
      complexity = 'complex';
      multiplier = 2.5;
    } else if (complexCount >= 1 || moderateCount >= 2 || taskLower.length > 200) {
      complexity = 'moderate';
      multiplier = 1.5;
    }

    return { multiplier, complexity };
  }

  // Create specialized system prompt for agents
  private createAgentSystemPrompt(agent: AIAgent, task: string): string {
    const basePrompt = `You are ${agent.name}, ${agent.description}.

Your specialized capabilities include: ${agent.specializedFor.join(', ')}.

IMPORTANT GUIDELINES:
- Provide comprehensive, professional analysis
- Use structured formatting with clear sections
- Include actionable recommendations
- Be thorough but concise
- Cite sources when making claims
- Acknowledge limitations or assumptions

Risk Level: ${agent.riskLevel.toUpperCase()}
Max Execution Time: ${agent.maxExecutionTime} minutes

Current Task: ${task}

Provide a detailed, well-structured response that maximizes value for the user.`;

    return basePrompt;
  }

  // Get available models for UI selection
  getAvailableModels(): (AIModel | AIAgent)[] {
    return [
      ...Object.values(AI_MODELS),
      ...Object.values(AI_AGENTS),
    ];
  }

  // Get model information
  getModel(modelId: string): AIModel | AIAgent | null {
    return AI_MODELS[modelId] || AI_AGENTS[modelId] || null;
  }

  // Check if model is an agent
  isAgent(modelId: string): boolean {
    return !!AI_AGENTS[modelId];
  }
}

// Export singleton instance
export const aiRouter = new AIRouter();

// Utility functions for cost calculation
export function estimateMessageCost(message: string, modelId: string): number {
  const model = AI_MODELS[modelId] || AI_AGENTS[modelId];
  if (!model) return 0;

  // Rough estimation: ~4 characters per token
  const estimatedTokens = Math.ceil(message.length / 4) * 2; // *2 for input + output
  return estimatedTokens * model.costPerToken;
}

export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(2)}k`;
  }
  return `$${cost.toFixed(3)}`;
}
