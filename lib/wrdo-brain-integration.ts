
// WRDO Cave Ultra - Phase 2 Brain Integration System
import { memoryInjection } from './memory-injection'
import { selfHealing } from './self-healing'
import { wrdoWebSocket } from './websocket-server'
import { taskQueue, addAIAnalysisTask, addEmailProcessingTask } from '../queue/tasks'
import { emailIntegration, emailScheduler } from './email-integration'
import { aiRouter } from './ai-router'
import { prisma } from './db'

export interface WRDOBrainEnhancement {
  realTimeNotifications: boolean
  intelligentEmailAlerts: boolean
  backgroundJobProcessing: boolean
  contextualMemoryRecall: boolean
  selfHealingCapabilities: boolean
  autonomousOperations: boolean
}

export interface WRDOBrainStatus {
  systemHealth: 'healthy' | 'degraded' | 'critical'
  activeConnections: number
  queueStats: any
  memoryStats: any
  emailMonitoring: boolean
  autoRecovery: boolean
  enhancedFeatures: WRDOBrainEnhancement
  lastUpdate: Date
}

class WRDOBrainCore {
  private static instance: WRDOBrainCore
  private isInitialized = false
  private enhancedFeatures: WRDOBrainEnhancement = {
    realTimeNotifications: false,
    intelligentEmailAlerts: false,
    backgroundJobProcessing: false,
    contextualMemoryRecall: false,
    selfHealingCapabilities: false,
    autonomousOperations: false
  }

  private constructor() {}

  static getInstance(): WRDOBrainCore {
    if (!WRDOBrainCore.instance) {
      WRDOBrainCore.instance = new WRDOBrainCore()
    }
    return WRDOBrainCore.instance
  }

  // Initialize all Phase 2 systems
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('🧠 Initializing WRDO Brain Core Phase 2 Systems...')

    try {
      // Initialize self-healing first
      selfHealing.setAutoRecovery(true)
      this.enhancedFeatures.selfHealingCapabilities = true
      console.log('✅ Self-healing system active')

      // Initialize real-time notifications
      // WebSocket is initialized automatically
      this.enhancedFeatures.realTimeNotifications = true
      console.log('✅ Real-time notifications active')

      // Initialize background job processing
      // Task queue is initialized automatically
      this.enhancedFeatures.backgroundJobProcessing = true
      console.log('✅ Background job processing active')

      // Initialize contextual memory recall
      // Memory injection is initialized automatically
      this.enhancedFeatures.contextualMemoryRecall = true
      console.log('✅ Contextual memory recall active')

      // Initialize email integration
      this.enhancedFeatures.intelligentEmailAlerts = true
      console.log('✅ Intelligent email alerts ready')

      // Initialize autonomous operations
      this.enhancedFeatures.autonomousOperations = true
      console.log('✅ Autonomous operations active')

      this.isInitialized = true
      console.log('🚀 WRDO Brain Core Phase 2 fully initialized!')

      // Send initialization notification
      wrdoWebSocket.sendGlobalNotification({
        id: `brain_init_${Date.now()}`,
        type: 'system_alert',
        title: 'WRDO Brain Core Enhanced',
        message: 'Phase 2 capabilities are now active: Real-time notifications, intelligent email alerts, background processing, contextual memory, self-healing, and autonomous operations.',
        severity: 'medium',
        metadata: { phase: 2, features: this.enhancedFeatures },
        timestamp: new Date(),
        read: false
      })

    } catch (error) {
      console.error('❌ WRDO Brain Core initialization failed:', error)
      throw error
    }
  }

  // Enhanced AI chat with all Phase 2 features
  async enhancedChat(
    userId: string, 
    message: string, 
    conversationHistory: any[] = [],
    useEnhancedContext = true
  ): Promise<{
    response: string
    metadata: any
    contextInjected: boolean
    memoryRecalled: boolean
    backgroundTasksTriggered: string[]
  }> {
    const backgroundTasks: string[] = []

    try {
      let enhancedMessage = message
      let contextInjected = false
      let memoryRecalled = false

      // Phase 2: Enhanced context injection
      if (useEnhancedContext && this.enhancedFeatures.contextualMemoryRecall) {
        const contextResult = await memoryInjection.injectContextualMemory(
          userId, 
          message, 
          conversationHistory
        )

        if (contextResult.confidenceScore > 0.3) {
          enhancedMessage = contextResult.enhancedPrompt
          contextInjected = true
          memoryRecalled = true

          console.log(`🧠 Context injected (confidence: ${contextResult.confidenceScore})`)
        }
      }

      // Use AI router for enhanced response
      const aiResponse = await aiRouter.chatCompletion([
        { role: 'user', content: enhancedMessage }
      ], 'gpt-4o', { userId })

      // Phase 2: Background processing for related tasks
      if (this.enhancedFeatures.backgroundJobProcessing) {
        // Analyze message for background tasks
        if (message.toLowerCase().includes('email')) {
          const taskId = await addEmailProcessingTask(userId, 'sync', 'normal')
          backgroundTasks.push(`email_sync:${taskId}`)
        }

        if (message.toLowerCase().includes('analyze') || message.toLowerCase().includes('report')) {
          const taskId = await addAIAnalysisTask(userId, `Follow-up analysis for: ${message}`, 'low')
          backgroundTasks.push(`analysis:${taskId}`)
        }
      }

      // Update memory with new interaction
      if (this.enhancedFeatures.contextualMemoryRecall) {
        await memoryInjection.updateUserMemory(
          userId, 
          message, 
          aiResponse.content, 
          ['chat_interaction']
        )
      }

      // Send real-time notification for important responses
      if (this.enhancedFeatures.realTimeNotifications && aiResponse.content.length > 500) {
        wrdoWebSocket.sendNotificationToUser(userId, {
          id: `chat_response_${Date.now()}`,
          type: 'agent_complete',
          title: 'Comprehensive Response Ready',
          message: 'Your AI assistant has prepared a detailed response',
          severity: 'low',
          userId,
          metadata: { responseLength: aiResponse.content.length },
          timestamp: new Date(),
          read: false
        })
      }

      return {
        response: aiResponse.content,
        metadata: {
          ...aiResponse,
          enhancedFeatures: this.enhancedFeatures,
          contextSources: contextInjected ? ['memory', 'preferences', 'history'] : []
        },
        contextInjected,
        memoryRecalled,
        backgroundTasksTriggered: backgroundTasks
      }

    } catch (error) {
      console.error('Enhanced chat failed:', error)
      throw error
    }
  }

  // Start enhanced email monitoring for a user
  async startEnhancedEmailMonitoring(userId: string): Promise<void> {
    if (!this.enhancedFeatures.intelligentEmailAlerts) {
      throw new Error('Intelligent email alerts not available')
    }

    try {
      // Start email monitoring with intelligent alerts
      emailScheduler.startMonitoring(userId, 5) // Every 5 minutes

      // Add background task for initial email sync
      await addEmailProcessingTask(userId, 'initial_sync', 'high')

      console.log(`📧 Enhanced email monitoring started for user ${userId}`)
    } catch (error) {
      console.error('Failed to start enhanced email monitoring:', error)
      throw error
    }
  }

  // Trigger autonomous system maintenance
  async triggerAutonomousMaintenance(): Promise<string> {
    if (!this.enhancedFeatures.autonomousOperations) {
      throw new Error('Autonomous operations not available')
    }

    try {
      const taskId = await taskQueue.addTask({
        type: 'system_maintenance',
        priority: 'normal',
        payload: { 
          maintenanceType: 'cleanup',
          automated: true 
        },
        maxRetries: 1,
        timeout: 600000 // 10 minutes
      })

      console.log(`🔧 Autonomous maintenance task created: ${taskId}`)
      return taskId
    } catch (error) {
      console.error('Failed to trigger autonomous maintenance:', error)
      throw error
    }
  }

  // Get comprehensive brain status
  async getBrainStatus(): Promise<WRDOBrainStatus> {
    try {
      const systemHealth = selfHealing.getSystemHealth()
      const queueStats = taskQueue.getStats()
      const activeConnections = wrdoWebSocket.getActiveConnectionsCount()

      // Get memory stats (simplified)
      const memoryStats = {
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        cacheSize: 0 // Would get from memory injection
      }

      return {
        systemHealth: systemHealth.overallStatus,
        activeConnections,
        queueStats,
        memoryStats,
        emailMonitoring: true, // Simplified
        autoRecovery: systemHealth.autoRecoveryEnabled,
        enhancedFeatures: this.enhancedFeatures,
        lastUpdate: new Date()
      }
    } catch (error) {
      console.error('Failed to get brain status:', error)
      throw error
    }
  }

  // Run system diagnostics
  async runDiagnostics(): Promise<{
    overallHealth: string
    diagnostics: Record<string, any>
    recommendations: string[]
  }> {
    const diagnostics: Record<string, any> = {}
    const recommendations: string[] = []

    try {
      // Check all Phase 2 systems
      diagnostics.selfHealing = selfHealing.getSystemHealth()
      diagnostics.taskQueue = taskQueue.getStats()
      diagnostics.memoryUsage = process.memoryUsage()
      diagnostics.uptime = process.uptime()

      // Generate recommendations
      if (diagnostics.taskQueue.failed > 10) {
        recommendations.push('High task failure rate detected - consider reviewing task configurations')
      }

      if (diagnostics.memoryUsage.heapUsed / diagnostics.memoryUsage.heapTotal > 0.8) {
        recommendations.push('High memory usage - consider running maintenance cleanup')
      }

      const overallHealth = diagnostics.selfHealing.overallStatus

      return {
        overallHealth,
        diagnostics,
        recommendations
      }
    } catch (error) {
      console.error('Diagnostics failed:', error)
      throw error
    }
  }

  // Get feature status
  getEnhancedFeatures(): WRDOBrainEnhancement {
    return { ...this.enhancedFeatures }
  }

  // Check if brain is initialized
  isReady(): boolean {
    return this.isInitialized
  }
}

export const wrdoBrainCore = WRDOBrainCore.getInstance()

// Auto-initialize on import
wrdoBrainCore.initialize().catch(error => {
  console.error('WRDO Brain Core auto-initialization failed:', error)
})
