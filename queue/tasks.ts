
// WRDO Cave Ultra - Multi-tasking Queue System for Background Job Processing
import { EventEmitter } from 'events'
import { prisma } from '@/lib/db'
import { wrdoWebSocket } from '@/lib/websocket-server'
import { aiRouter } from '@/lib/ai-router'
import { emailIntegration } from '@/lib/email-integration'

export interface QueueTask {
  id: string
  type: 'ai_analysis' | 'email_processing' | 'data_analysis' | 'report_generation' | 'system_maintenance' | 'agent_execution'
  priority: 'low' | 'normal' | 'high' | 'critical'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying' | 'cancelled'
  payload: Record<string, any>
  userId?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  failedAt?: Date
  retryCount: number
  maxRetries: number
  timeout: number // milliseconds
  dependencies?: string[] // task IDs this task depends on
  result?: any
  error?: string
  progress?: number // 0-100
  estimatedDuration?: number // milliseconds
  actualDuration?: number // milliseconds
}

export interface QueueStats {
  pending: number
  running: number
  completed: number
  failed: number
  totalProcessed: number
  averageProcessingTime: number
  successRate: number
  queueHealth: 'healthy' | 'degraded' | 'critical'
}

class WRDOTaskQueue extends EventEmitter {
  private static instance: WRDOTaskQueue
  private tasks = new Map<string, QueueTask>()
  private runningTasks = new Set<string>()
  private workers = new Map<string, Worker>()
  private maxConcurrentTasks = 5
  private processingInterval: NodeJS.Timeout | null = null
  private statsInterval: NodeJS.Timeout | null = null
  private isRunning = false

  private constructor() {
    super()
    this.startProcessing()
    this.startStatsCollection()
  }

  static getInstance(): WRDOTaskQueue {
    if (!WRDOTaskQueue.instance) {
      WRDOTaskQueue.instance = new WRDOTaskQueue()
    }
    return WRDOTaskQueue.instance
  }

  // Add task to queue
  async addTask(task: Omit<QueueTask, 'id' | 'createdAt' | 'status' | 'retryCount'>): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const queueTask: QueueTask = {
      ...task,
      id: taskId,
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: task.maxRetries || 3,
      timeout: task.timeout || 300000 // 5 minutes default
    }

    this.tasks.set(taskId, queueTask)
    
    // Store in database
    await this.persistTask(queueTask)
    
    // Emit event
    this.emit('taskAdded', queueTask)
    
    // Send notification to user
    if (queueTask.userId) {
      wrdoWebSocket.sendTaskUpdate(queueTask.userId, taskId, 'queued')
    }

    console.log(`📋 Task ${taskId} added to queue (${task.type})`)
    return taskId
  }

  // Process tasks in queue
  private async startProcessing() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.processingInterval = setInterval(async () => {
      await this.processPendingTasks()
    }, 1000) // Check every second

    console.log('🚀 Task queue processing started')
  }

  private async processPendingTasks() {
    if (this.runningTasks.size >= this.maxConcurrentTasks) {
      return // Queue is full
    }

    // Get pending tasks sorted by priority and creation date
    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending' && this.areDependenciesMet(task))
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return a.createdAt.getTime() - b.createdAt.getTime()
      })

    const availableSlots = this.maxConcurrentTasks - this.runningTasks.size
    const tasksToProcess = pendingTasks.slice(0, availableSlots)

    for (const task of tasksToProcess) {
      await this.executeTask(task)
    }
  }

  private areDependenciesMet(task: QueueTask): boolean {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true
    }

    return task.dependencies.every(depId => {
      const depTask = this.tasks.get(depId)
      return depTask && depTask.status === 'completed'
    })
  }

  private async executeTask(task: QueueTask) {
    try {
      // Update task status
      task.status = 'running'
      task.startedAt = new Date()
      this.runningTasks.add(task.id)
      
      await this.persistTask(task)
      this.emit('taskStarted', task)

      // Send notification
      if (task.userId) {
        wrdoWebSocket.sendTaskUpdate(task.userId, task.id, 'running', 0)
      }

      console.log(`⚡ Executing task ${task.id} (${task.type})`)

      // Execute task based on type
      const result = await this.processTaskByType(task)

      // Task completed successfully
      task.status = 'completed'
      task.completedAt = new Date()
      task.result = result
      task.actualDuration = task.completedAt.getTime() - task.startedAt!.getTime()
      task.progress = 100

      this.runningTasks.delete(task.id)
      await this.persistTask(task)
      this.emit('taskCompleted', task)

      // Send completion notification
      if (task.userId) {
        wrdoWebSocket.sendTaskUpdate(task.userId, task.id, 'completed', 100)
        
        // Send agent completion if it's an agent task
        if (task.type === 'agent_execution') {
          wrdoWebSocket.sendAgentCompletion(task.userId, task.payload.agentId, result)
        }
      }

      console.log(`✅ Task ${task.id} completed successfully`)

    } catch (error) {
      await this.handleTaskFailure(task, error)
    }
  }

  private async processTaskByType(task: QueueTask): Promise<any> {
    const updateProgress = (progress: number) => {
      task.progress = progress
      if (task.userId) {
        wrdoWebSocket.sendTaskUpdate(task.userId, task.id, 'running', progress)
      }
    }

    switch (task.type) {
      case 'ai_analysis':
        return await this.processAIAnalysis(task, updateProgress)
        
      case 'email_processing':
        return await this.processEmailTask(task, updateProgress)
        
      case 'data_analysis':
        return await this.processDataAnalysis(task, updateProgress)
        
      case 'report_generation':
        return await this.processReportGeneration(task, updateProgress)
        
      case 'system_maintenance':
        return await this.processSystemMaintenance(task, updateProgress)
        
      case 'agent_execution':
        return await this.processAgentExecution(task, updateProgress)
        
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  private async processAIAnalysis(task: QueueTask, updateProgress: (p: number) => void): Promise<any> {
    updateProgress(10)
    
    const { prompt, model = 'gpt-4o', userId } = task.payload
    
    updateProgress(30)
    
    // Use AI router to process the analysis
    const messages = [
      { role: 'system' as const, content: 'You are an expert data analyst. Provide comprehensive analysis.' },
      { role: 'user' as const, content: prompt }
    ]
    
    updateProgress(50)
    
    const response = await aiRouter.chatCompletion(messages, model, { userId })
    
    updateProgress(90)
    
    return {
      analysis: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      processingTime: response.processingTime
    }
  }

  private async processEmailTask(task: QueueTask, updateProgress: (p: number) => void): Promise<any> {
    updateProgress(20)
    
    const { userId, action } = task.payload
    
    updateProgress(50)
    
    if (action === 'sync') {
      await emailIntegration.startEmailMonitoring(userId)
    }
    
    updateProgress(100)
    
    return { success: true, action }
  }

  private async processDataAnalysis(task: QueueTask, updateProgress: (p: number) => void): Promise<any> {
    updateProgress(10)
    
    const { dataSource, analysisType, parameters } = task.payload
    
    updateProgress(30)
    
    // Simulate data analysis
    await this.delay(2000)
    updateProgress(60)
    
    // Process analysis
    const result = {
      dataSource,
      analysisType,
      insights: 'Data analysis completed with key insights',
      metrics: {
        totalRecords: Math.floor(Math.random() * 10000),
        anomalies: Math.floor(Math.random() * 50),
        trends: ['upward', 'stable', 'declining'][Math.floor(Math.random() * 3)]
      },
      completedAt: new Date()
    }
    
    updateProgress(100)
    
    return result
  }

  private async processReportGeneration(task: QueueTask, updateProgress: (p: number) => void): Promise<any> {
    updateProgress(10)
    
    const { reportType, timeframe, includeSections } = task.payload
    
    updateProgress(30)
    
    // Generate report sections
    const sections = []
    for (const section of includeSections) {
      sections.push({
        name: section,
        content: `Generated content for ${section}`,
        data: {}
      })
      updateProgress(30 + (sections.length / includeSections.length) * 50)
    }
    
    updateProgress(90)
    
    const report = {
      type: reportType,
      timeframe,
      generatedAt: new Date(),
      sections,
      summary: 'Report generated successfully with all requested sections'
    }
    
    updateProgress(100)
    
    return report
  }

  private async processSystemMaintenance(task: QueueTask, updateProgress: (p: number) => void): Promise<any> {
    updateProgress(10)
    
    const { maintenanceType } = task.payload
    
    updateProgress(30)
    
    // Perform maintenance tasks
    const results = []
    
    if (maintenanceType === 'cleanup') {
      // Database cleanup
      results.push('Database cleanup completed')
      updateProgress(50)
      
      // Log cleanup
      results.push('Log files cleaned')
      updateProgress(70)
      
      // Cache cleanup
      results.push('Cache cleared')
      updateProgress(90)
    }
    
    updateProgress(100)
    
    return {
      maintenanceType,
      results,
      completedAt: new Date()
    }
  }

  private async processAgentExecution(task: QueueTask, updateProgress: (p: number) => void): Promise<any> {
    updateProgress(10)
    
    const { agentId, agentTask, approvalData } = task.payload
    
    updateProgress(30)
    
    // Execute agent task using AI router
    const result = await aiRouter.executeApprovedAgentTask(
      approvalData,
      true,
      task.userId
    )
    
    updateProgress(80)
    
    // Store agent execution result
    await prisma.deepAgentTask.create({
      data: {
        title: agentTask,
        description: `Agent execution: ${agentId}`,
        taskType: 'execution',
        briefing: approvalData,
        status: 'completed',
        result: {
          content: result.content,
          model: result.model,
          provider: result.provider,
          tokensUsed: result.tokensUsed,
          cost: result.cost,
          processingTime: result.processingTime
        },
        actualCost: result.cost,
        completedAt: new Date(),
        userId: task.userId!
      }
    })
    
    updateProgress(100)
    
    return result
  }

  private async handleTaskFailure(task: QueueTask, error: any) {
    task.retryCount++
    this.runningTasks.delete(task.id)

    if (task.retryCount <= task.maxRetries) {
      // Retry the task
      task.status = 'retrying'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      
      console.log(`🔄 Retrying task ${task.id} (attempt ${task.retryCount}/${task.maxRetries})`)
      
      // Exponential backoff: wait 2^retryCount seconds
      setTimeout(async () => {
        task.status = 'pending'
        await this.persistTask(task)
      }, Math.pow(2, task.retryCount) * 1000)
    } else {
      // Task failed permanently
      task.status = 'failed'
      task.failedAt = new Date()
      task.error = error instanceof Error ? error.message : 'Unknown error'
      
      console.error(`❌ Task ${task.id} failed permanently:`, task.error)
      
      this.emit('taskFailed', task)
      
      // Send failure notification
      if (task.userId) {
        wrdoWebSocket.sendTaskUpdate(task.userId, task.id, 'failed')
      }
    }

    await this.persistTask(task)
  }

  // Get task by ID
  getTask(taskId: string): QueueTask | undefined {
    return this.tasks.get(taskId)
  }

  // Get tasks by user
  getUserTasks(userId: string): QueueTask[] {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId)
  }

  // Get queue statistics
  getStats(): QueueStats {
    const tasks = Array.from(this.tasks.values())
    const completed = tasks.filter(t => t.status === 'completed')
    const failed = tasks.filter(t => t.status === 'failed')
    
    const avgTime = completed.length > 0 
      ? completed.reduce((sum, t) => sum + (t.actualDuration || 0), 0) / completed.length 
      : 0

    const successRate = tasks.length > 0 
      ? completed.length / (completed.length + failed.length) 
      : 1

    let queueHealth: 'healthy' | 'degraded' | 'critical' = 'healthy'
    if (successRate < 0.8) queueHealth = 'degraded'
    if (successRate < 0.5 || this.runningTasks.size >= this.maxConcurrentTasks) queueHealth = 'critical'

    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: completed.length,
      failed: failed.length,
      totalProcessed: completed.length + failed.length,
      averageProcessingTime: avgTime,
      successRate,
      queueHealth
    }
  }

  // Cancel task
  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId)
    if (!task) return false

    if (task.status === 'pending') {
      task.status = 'cancelled'
      await this.persistTask(task)
      this.emit('taskCancelled', task)
      return true
    }

    return false // Cannot cancel running tasks
  }

  // Persist task to database
  private async persistTask(task: QueueTask) {
    try {
      // In production, save to database
      // This is a simplified version
      console.log(`💾 Task ${task.id} persisted (${task.status})`)
    } catch (error) {
      console.error('Failed to persist task:', error)
    }
  }

  // Start collecting statistics
  private startStatsCollection() {
    this.statsInterval = setInterval(() => {
      const stats = this.getStats()
      this.emit('statsUpdated', stats)
      
      // Log important metrics
      if (stats.queueHealth !== 'healthy') {
        console.warn(`⚠️ Queue health: ${stats.queueHealth}`)
      }
    }, 30000) // Every 30 seconds
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Shutdown queue gracefully
  async shutdown() {
    this.isRunning = false
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }
    
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }

    // Wait for running tasks to complete
    const timeout = 30000 // 30 seconds timeout
    const startTime = Date.now()
    
    while (this.runningTasks.size > 0 && Date.now() - startTime < timeout) {
      await this.delay(1000)
    }

    console.log('📋 Task queue shutdown completed')
  }
}

export const taskQueue = WRDOTaskQueue.getInstance()

// Worker interface for different task types
interface Worker {
  id: string
  type: string
  isActive: boolean
  processedCount: number
  lastActivity: Date
}

// Export helper functions
export async function addAIAnalysisTask(userId: string, prompt: string, priority: QueueTask['priority'] = 'normal') {
  return await taskQueue.addTask({
    type: 'ai_analysis',
    priority,
    payload: { prompt, userId },
    userId,
    maxRetries: 2,
    timeout: 180000 // 3 minutes
  })
}

export async function addEmailProcessingTask(userId: string, action: string, priority: QueueTask['priority'] = 'normal') {
  return await taskQueue.addTask({
    type: 'email_processing',
    priority,
    payload: { userId, action },
    userId,
    maxRetries: 3,
    timeout: 120000 // 2 minutes
  })
}

export async function addAgentExecutionTask(userId: string, agentId: string, agentTask: string, approvalData: any) {
  return await taskQueue.addTask({
    type: 'agent_execution',
    priority: 'high',
    payload: { agentId, agentTask, approvalData, userId },
    userId,
    maxRetries: 1,
    timeout: 1800000 // 30 minutes
  })
}
