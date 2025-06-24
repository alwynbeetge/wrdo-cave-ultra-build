
// WRDO Cave Ultra - Enhanced Context Injection for Memory Recall
import { prisma } from '@/lib/db'
import { aiRouter } from '@/lib/ai-router'

export interface MemoryContext {
  id: string
  type: 'conversation' | 'page_context' | 'user_preference' | 'task_history' | 'document' | 'pattern'
  content: string
  metadata: Record<string, any>
  relevanceScore: number
  timestamp: Date
  userId: string
  tags: string[]
  embeddings?: number[] // Vector embeddings for semantic search
}

export interface ContextualMemory {
  userId: string
  sessionContext: {
    currentPage: string
    recentActions: string[]
    activeProjects: string[]
    userIntent: string
  }
  conversationHistory: Array<{
    timestamp: Date
    message: string
    response: string
    context: string[]
  }>
  userPreferences: {
    communicationStyle: string
    preferredModels: string[]
    workPatterns: Record<string, any>
    personalDetails: Record<string, any>
  }
  domainKnowledge: {
    businessContext: string[]
    technicalSkills: string[]
    projectHistory: string[]
    relationshipMap: Record<string, string[]>
  }
  patterns: {
    timePreferences: Record<string, any>
    decisionPatterns: string[]
    workflowPreferences: string[]
  }
}

class WRDOMemoryInjection {
  private static instance: WRDOMemoryInjection
  private memoryCache = new Map<string, ContextualMemory>()
  private embeddingCache = new Map<string, number[]>()

  private constructor() {}

  static getInstance(): WRDOMemoryInjection {
    if (!WRDOMemoryInjection.instance) {
      WRDOMemoryInjection.instance = new WRDOMemoryInjection()
    }
    return WRDOMemoryInjection.instance
  }

  // Enhanced context injection for AI conversations
  async injectContextualMemory(
    userId: string, 
    currentMessage: string, 
    conversationHistory: any[]
  ): Promise<{
    enhancedPrompt: string
    contextSources: string[]
    relevantMemories: MemoryContext[]
    confidenceScore: number
  }> {
    try {
      // Analyze current message for intent and entities
      const messageAnalysis = await this.analyzeMessage(currentMessage)
      
      // Retrieve relevant memories based on analysis
      const relevantMemories = await this.retrieveRelevantMemories(
        userId, 
        messageAnalysis,
        conversationHistory
      )
      
      // Get user's contextual memory
      const userMemory = await this.getUserContextualMemory(userId)
      
      // Build enhanced context
      const contextualPrompt = await this.buildContextualPrompt(
        currentMessage,
        relevantMemories,
        userMemory,
        messageAnalysis
      )

      return {
        enhancedPrompt: contextualPrompt,
        contextSources: relevantMemories.map(m => m.type),
        relevantMemories,
        confidenceScore: this.calculateConfidenceScore(relevantMemories, messageAnalysis)
      }
    } catch (error) {
      console.error('Context injection failed:', error)
      return {
        enhancedPrompt: currentMessage,
        contextSources: [],
        relevantMemories: [],
        confidenceScore: 0
      }
    }
  }

  // Analyze message for intent, entities, and context clues
  private async analyzeMessage(message: string): Promise<{
    intent: string
    entities: string[]
    keywords: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    urgency: 'low' | 'medium' | 'high'
    category: string
    semanticVector?: number[]
  }> {
    try {
      // Use AI to analyze the message
      const analysisPrompt = `Analyze this message and extract:
1. User intent (what they want to accomplish)
2. Key entities (people, places, things, concepts)
3. Important keywords
4. Sentiment
5. Urgency level
6. Category (technical, business, personal, creative, etc.)

Message: "${message}"

Respond in JSON format with: intent, entities, keywords, sentiment, urgency, category`

      const response = await aiRouter.chatCompletion([
        { role: 'system', content: 'You are an expert message analyzer. Always respond with valid JSON.' },
        { role: 'user', content: analysisPrompt }
      ], 'gpt-4o')

      const analysis = JSON.parse(response.content)
      
      // Generate semantic embeddings (simplified - in production use proper embedding model)
      const semanticVector = await this.generateSemanticEmbedding(message)

      return {
        ...analysis,
        semanticVector
      }
    } catch (error) {
      console.error('Message analysis failed:', error)
      return {
        intent: 'general_inquiry',
        entities: [],
        keywords: message.split(' ').slice(0, 5),
        sentiment: 'neutral',
        urgency: 'medium',
        category: 'general',
        semanticVector: []
      }
    }
  }

  // Retrieve relevant memories using semantic and keyword matching
  private async retrieveRelevantMemories(
    userId: string,
    messageAnalysis: any,
    conversationHistory: any[]
  ): Promise<MemoryContext[]> {
    const relevantMemories: MemoryContext[] = []

    try {
      // 1. Retrieve from conversation history
      const conversationMemories = await this.getConversationMemories(
        userId, 
        messageAnalysis.keywords
      )
      relevantMemories.push(...conversationMemories)

      // 2. Retrieve from user preferences
      const preferenceMemories = await this.getPreferenceMemories(
        userId, 
        messageAnalysis.category
      )
      relevantMemories.push(...preferenceMemories)

      // 3. Retrieve from document/knowledge base
      const documentMemories = await this.getDocumentMemories(
        userId, 
        messageAnalysis.entities
      )
      relevantMemories.push(...documentMemories)

      // 4. Retrieve from pattern recognition
      const patternMemories = await this.getPatternMemories(
        userId, 
        messageAnalysis.intent
      )
      relevantMemories.push(...patternMemories)

      // 5. Semantic similarity search
      if (messageAnalysis.semanticVector) {
        const semanticMemories = await this.getSemanticMemories(
          userId,
          messageAnalysis.semanticVector
        )
        relevantMemories.push(...semanticMemories)
      }

      // Sort by relevance and return top matches
      return relevantMemories
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10) // Top 10 most relevant
    } catch (error) {
      console.error('Memory retrieval failed:', error)
      return []
    }
  }

  // Get conversation memories
  private async getConversationMemories(userId: string, keywords: string[]): Promise<MemoryContext[]> {
    try {
      const chatMessages = await prisma.chatMessage.findMany({
        where: { 
          userId,
          OR: keywords.map(keyword => ({
            OR: [
              { message: { contains: keyword, mode: 'insensitive' } },
              { response: { contains: keyword, mode: 'insensitive' } }
            ]
          }))
        },
        orderBy: { timestamp: 'desc' },
        take: 5
      })

      return chatMessages.map(msg => ({
        id: msg.id,
        type: 'conversation' as const,
        content: `Q: ${msg.message}\nA: ${msg.response}`,
        metadata: {
          model: (msg.metadata as any)?.model,
          timestamp: msg.timestamp,
          cost: (msg.metadata as any)?.cost
        },
        relevanceScore: 0.8,
        timestamp: msg.timestamp,
        userId,
        tags: keywords
      }))
    } catch (error) {
      console.error('Failed to get conversation memories:', error)
      return []
    }
  }

  // Get user preference memories
  private async getPreferenceMemories(userId: string, category: string): Promise<MemoryContext[]> {
    try {
      const contextualLearning = await prisma.contextualLearning.findMany({
        where: { 
          userId,
          context: { contains: category }
        },
        orderBy: { lastUpdated: 'desc' },
        take: 3
      })

      return contextualLearning.map(learning => ({
        id: learning.id,
        type: 'user_preference' as const,
        content: JSON.stringify(learning.learningData),
        metadata: {
          context: learning.context,
          confidence: learning.confidence,
          lastUpdated: learning.lastUpdated
        },
        relevanceScore: learning.confidence,
        timestamp: learning.lastUpdated,
        userId,
        tags: [category, learning.context]
      }))
    } catch (error) {
      console.error('Failed to get preference memories:', error)
      return []
    }
  }

  // Get document memories
  private async getDocumentMemories(userId: string, entities: string[]): Promise<MemoryContext[]> {
    try {
      const documents = await prisma.document.findMany({
        where: {
          userId,
          OR: entities.map(entity => ({
            name: { contains: entity, mode: 'insensitive' }
          }))
        },
        orderBy: { uploadedAt: 'desc' },
        take: 3
      })

      return documents.map(doc => ({
        id: doc.id,
        type: 'document' as const,
        content: `Document: ${doc.name} (${doc.type}) - ${doc.category}`,
        metadata: {
          type: doc.type,
          category: doc.category,
          size: doc.size,
          uploadedAt: doc.uploadedAt,
          fileUrl: doc.fileUrl
        },
        relevanceScore: 0.7,
        timestamp: doc.uploadedAt,
        userId,
        tags: entities
      }))
    } catch (error) {
      console.error('Failed to get document memories:', error)
      return []
    }
  }

  // Get pattern memories
  private async getPatternMemories(userId: string, intent: string): Promise<MemoryContext[]> {
    try {
      // In production, this would query pattern recognition data
      return []
    } catch (error) {
      console.error('Failed to get pattern memories:', error)
      return []
    }
  }

  // Get semantic memories using vector similarity
  private async getSemanticMemories(userId: string, queryVector: number[]): Promise<MemoryContext[]> {
    try {
      // In production, this would use a vector database like Pinecone or Weaviate
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Failed to get semantic memories:', error)
      return []
    }
  }

  // Build contextual prompt with injected memories
  private async buildContextualPrompt(
    originalMessage: string,
    memories: MemoryContext[],
    userMemory: ContextualMemory,
    messageAnalysis: any
  ): Promise<string> {
    let contextualPrompt = `# Enhanced Context for AI Response

## User Message
${originalMessage}

## Relevant Context`

    // Add user preferences
    if (userMemory.userPreferences.communicationStyle) {
      contextualPrompt += `\n### Communication Style
User prefers: ${userMemory.userPreferences.communicationStyle}`
    }

    // Add recent context
    if (userMemory.sessionContext.currentPage) {
      contextualPrompt += `\n### Current Session
Page: ${userMemory.sessionContext.currentPage}
Recent actions: ${userMemory.sessionContext.recentActions.join(', ')}`
    }

    // Add relevant memories
    if (memories.length > 0) {
      contextualPrompt += `\n### Relevant Previous Context`
      memories.slice(0, 5).forEach((memory, index) => {
        contextualPrompt += `\n${index + 1}. ${memory.type}: ${memory.content.substring(0, 200)}...`
      })
    }

    // Add domain knowledge
    if (userMemory.domainKnowledge.businessContext.length > 0) {
      contextualPrompt += `\n### Domain Knowledge
Business context: ${userMemory.domainKnowledge.businessContext.join(', ')}`
    }

    contextualPrompt += `\n\n## Instructions
Please provide a response that:
1. Takes into account the user's communication style and preferences
2. References relevant previous context when appropriate
3. Maintains continuity with recent conversations
4. Addresses the user's intent: ${messageAnalysis.intent}
5. Considers the urgency level: ${messageAnalysis.urgency}

## Original Message to Respond To
${originalMessage}`

    return contextualPrompt
  }

  // Get or create user contextual memory
  private async getUserContextualMemory(userId: string): Promise<ContextualMemory> {
    if (this.memoryCache.has(userId)) {
      return this.memoryCache.get(userId)!
    }

    try {
      // Load from database and build contextual memory
      const contextualMemory: ContextualMemory = {
        userId,
        sessionContext: {
          currentPage: '',
          recentActions: [],
          activeProjects: [],
          userIntent: ''
        },
        conversationHistory: [],
        userPreferences: {
          communicationStyle: 'professional',
          preferredModels: ['gpt-4o'],
          workPatterns: {},
          personalDetails: {}
        },
        domainKnowledge: {
          businessContext: [],
          technicalSkills: [],
          projectHistory: [],
          relationshipMap: {}
        },
        patterns: {
          timePreferences: {},
          decisionPatterns: [],
          workflowPreferences: []
        }
      }

      // Load user preferences from database
      const preferences = await prisma.contextualLearning.findMany({
        where: { userId }
      })

      preferences.forEach(pref => {
        switch (pref.context) {
          case 'communication_style':
            contextualMemory.userPreferences.communicationStyle = (pref.learningData as any)?.style || 'professional'
            break
          case 'work_patterns':
            contextualMemory.patterns.workflowPreferences = (pref.learningData as any)?.patterns || []
            break
          // Add more context types as needed
        }
      })

      this.memoryCache.set(userId, contextualMemory)
      return contextualMemory
    } catch (error) {
      console.error('Failed to load user contextual memory:', error)
      return {
        userId,
        sessionContext: { currentPage: '', recentActions: [], activeProjects: [], userIntent: '' },
        conversationHistory: [],
        userPreferences: { communicationStyle: 'professional', preferredModels: ['gpt-4o'], workPatterns: {}, personalDetails: {} },
        domainKnowledge: { businessContext: [], technicalSkills: [], projectHistory: [], relationshipMap: {} },
        patterns: { timePreferences: {}, decisionPatterns: [], workflowPreferences: [] }
      }
    }
  }

  // Generate semantic embedding (simplified)
  private async generateSemanticEmbedding(text: string): Promise<number[]> {
    try {
      // In production, use a proper embedding model like OpenAI's text-embedding-ada-002
      // For now, return a simple hash-based vector
      const hash = this.simpleHash(text)
      return Array.from({ length: 10 }, (_, i) => (hash + i) % 100 / 100)
    } catch (error) {
      console.error('Failed to generate embedding:', error)
      return []
    }
  }

  // Simple hash function for demonstration
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Calculate confidence score for injected context
  private calculateConfidenceScore(memories: MemoryContext[], messageAnalysis: any): number {
    if (memories.length === 0) return 0

    const avgRelevance = memories.reduce((sum, mem) => sum + mem.relevanceScore, 0) / memories.length
    const recencyBoost = memories.filter(mem => 
      Date.now() - mem.timestamp.getTime() < 24 * 60 * 60 * 1000 // Within 24 hours
    ).length / memories.length

    return Math.min(avgRelevance + recencyBoost * 0.2, 1.0)
  }

  // Update user memory with new information
  async updateUserMemory(
    userId: string, 
    message: string, 
    response: string, 
    context: string[]
  ): Promise<void> {
    try {
      // Update conversation history in cache
      const userMemory = await this.getUserContextualMemory(userId)
      userMemory.conversationHistory.unshift({
        timestamp: new Date(),
        message,
        response,
        context
      })

      // Keep only last 50 conversations
      userMemory.conversationHistory = userMemory.conversationHistory.slice(0, 50)

      // Store in database
      await prisma.chatMessage.create({
        data: {
          message,
          response,
          userId,
          metadata: { context }
        }
      })

      this.memoryCache.set(userId, userMemory)
    } catch (error) {
      console.error('Failed to update user memory:', error)
    }
  }

  // Learn from user interactions
  async learnFromInteraction(
    userId: string,
    interactionType: string,
    patterns: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.contextualLearning.upsert({
        where: {
          userId_context: {
            userId,
            context: interactionType
          }
        },
        update: {
          learningData: patterns,
          confidence: Math.min(1.0, (patterns.confidence || 0.5) + 0.1),
          lastUpdated: new Date()
        },
        create: {
          userId,
          context: interactionType,
          learningData: patterns,
          confidence: patterns.confidence || 0.5,
          lastUpdated: new Date()
        }
      })

      // Update cache
      const userMemory = await this.getUserContextualMemory(userId)
      switch (interactionType) {
        case 'communication_style':
          userMemory.userPreferences.communicationStyle = patterns.style
          break
        case 'work_patterns':
          userMemory.patterns.workflowPreferences = patterns.patterns
          break
      }

      this.memoryCache.set(userId, userMemory)
    } catch (error) {
      console.error('Failed to learn from interaction:', error)
    }
  }

  // Clear user memory cache
  clearUserCache(userId: string): void {
    this.memoryCache.delete(userId)
  }

  // Get memory statistics
  getMemoryStats(userId: string): {
    cacheSize: number
    conversationCount: number
    preferencesCount: number
    documentsCount: number
  } {
    const userMemory = this.memoryCache.get(userId)
    return {
      cacheSize: this.memoryCache.size,
      conversationCount: userMemory?.conversationHistory.length || 0,
      preferencesCount: Object.keys(userMemory?.userPreferences || {}).length,
      documentsCount: userMemory?.domainKnowledge.businessContext.length || 0
    }
  }
}

export const memoryInjection = WRDOMemoryInjection.getInstance()
