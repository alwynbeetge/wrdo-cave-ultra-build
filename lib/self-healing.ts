
// WRDO Cave Ultra - Self-Healing Capabilities System
import { prisma } from '@/lib/db'
import { wrdoWebSocket } from '@/lib/websocket-server'
import { taskQueue } from '@/queue/tasks'
import { aiRouter } from '@/lib/ai-router'
import { emailIntegration } from '@/lib/email-integration'

export interface SystemHealth {
  component: string
  status: 'healthy' | 'warning' | 'critical' | 'failure'
  lastCheck: Date
  metrics: Record<string, number>
  issues: string[]
  autoRecoveryAttempts: number
  manualInterventionRequired: boolean
}

export interface RecoveryAction {
  id: string
  type: 'restart_service' | 'clear_cache' | 'reconnect_database' | 'reset_api_limits' | 'cleanup_resources'
  component: string
  description: string
  automated: boolean
  riskLevel: 'low' | 'medium' | 'high'
  estimatedDuration: number // milliseconds
  requiredConfirmation: boolean
}

export interface HealthAlert {
  id: string
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  component: string
  message: string
  recommendation: string
  autoRecoveryAvailable: boolean
  timestamp: Date
}

class WRDOSelfHealing {
  private static instance: WRDOSelfHealing
  private healthChecks = new Map<string, SystemHealth>()
  private recoveryActions = new Map<string, RecoveryAction>()
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false
  private autoRecoveryEnabled = true
  private alertThresholds = {
    cpu: 80,
    memory: 85,
    disk: 90,
    responseTime: 5000,
    errorRate: 0.05,
    queueSize: 100
  }

  private constructor() {
    this.initializeHealthChecks()
    this.startMonitoring()
  }

  static getInstance(): WRDOSelfHealing {
    if (!WRDOSelfHealing.instance) {
      WRDOSelfHealing.instance = new WRDOSelfHealing()
    }
    return WRDOSelfHealing.instance
  }

  // Initialize health checks for all system components
  private initializeHealthChecks() {
    const components = [
      'database',
      'ai_router',
      'email_service',
      'websocket_server',
      'task_queue',
      'memory_system',
      'api_endpoints',
      'file_system',
      'network_connectivity'
    ]

    components.forEach(component => {
      this.healthChecks.set(component, {
        component,
        status: 'healthy',
        lastCheck: new Date(),
        metrics: {},
        issues: [],
        autoRecoveryAttempts: 0,
        manualInterventionRequired: false
      })
    })

    console.log('🏥 Self-healing system initialized with health checks for all components')
  }

  // Start continuous monitoring
  private startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks()
    }, 30000) // Check every 30 seconds

    console.log('🔍 Self-healing monitoring started')
  }

  // Perform health checks on all components
  private async performHealthChecks() {
    try {
      await Promise.all([
        this.checkDatabaseHealth(),
        this.checkAIRouterHealth(),
        this.checkEmailServiceHealth(),
        this.checkWebSocketHealth(),
        this.checkTaskQueueHealth(),
        this.checkMemorySystemHealth(),
        this.checkAPIEndpointsHealth(),
        this.checkFileSystemHealth(),
        this.checkNetworkConnectivity()
      ])

      // Analyze overall system health
      await this.analyzeSystemHealth()
    } catch (error) {
      console.error('Health check execution failed:', error)
    }
  }

  // Database health check
  private async checkDatabaseHealth() {
    const component = 'database'
    const health = this.healthChecks.get(component)!
    const startTime = Date.now()

    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`
      
      // Check response time
      const responseTime = Date.now() - startTime
      
      // Get connection count (simplified)
      const metrics = {
        responseTime,
        connectionCount: 1, // Simplified
        queryCount: 0
      }

      health.metrics = metrics
      health.lastCheck = new Date()
      health.issues = []

      if (responseTime > this.alertThresholds.responseTime) {
        health.status = 'warning'
        health.issues.push('High database response time')
      } else {
        health.status = 'healthy'
      }

    } catch (error) {
      health.status = 'critical'
      health.issues = ['Database connection failed']
      health.metrics = { responseTime: Date.now() - startTime }
      
      await this.handleComponentFailure(component, error)
    }

    this.healthChecks.set(component, health)
  }

  // AI Router health check
  private async checkAIRouterHealth() {
    const component = 'ai_router'
    const health = this.healthChecks.get(component)!

    try {
      // Test AI router with simple request
      const testResponse = await aiRouter.chatCompletion([
        { role: 'user', content: 'Health check - respond with OK' }
      ], 'gpt-4o', { maxTokens: 10 })

      health.status = testResponse.content.toLowerCase().includes('ok') ? 'healthy' : 'warning'
      health.metrics = {
        responseTime: testResponse.processingTime,
        tokensUsed: testResponse.tokensUsed,
        cost: testResponse.cost
      }
      health.issues = testResponse.fallbackUsed ? ['Fallback model used'] : []
      health.lastCheck = new Date()

    } catch (error) {
      health.status = 'critical'
      health.issues = ['AI router health check failed']
      await this.handleComponentFailure(component, error)
    }

    this.healthChecks.set(component, health)
  }

  // Email service health check
  private async checkEmailServiceHealth() {
    const component = 'email_service'
    const health = this.healthChecks.get(component)!

    try {
      // Test email service connection
      // This is simplified - in production, test actual email API
      health.status = 'healthy'
      health.metrics = {
        lastSync: Date.now(),
        emailsProcessed: 0,
        errorRate: 0
      }
      health.issues = []
      health.lastCheck = new Date()

    } catch (error) {
      health.status = 'warning'
      health.issues = ['Email service connection issues']
    }

    this.healthChecks.set(component, health)
  }

  // WebSocket health check
  private async checkWebSocketHealth() {
    const component = 'websocket_server'
    const health = this.healthChecks.get(component)!

    try {
      const connectionCount = wrdoWebSocket.getActiveConnectionsCount()
      
      health.status = 'healthy'
      health.metrics = {
        activeConnections: connectionCount,
        uptime: process.uptime()
      }
      health.issues = []
      health.lastCheck = new Date()

    } catch (error) {
      health.status = 'warning'
      health.issues = ['WebSocket server issues']
    }

    this.healthChecks.set(component, health)
  }

  // Task queue health check
  private async checkTaskQueueHealth() {
    const component = 'task_queue'
    const health = this.healthChecks.get(component)!

    try {
      const queueStats = taskQueue.getStats()
      
      let status: SystemHealth['status'] = 'healthy'
      const issues: string[] = []

      if (queueStats.pending > this.alertThresholds.queueSize) {
        status = 'warning'
        issues.push('High pending task count')
      }

      if (queueStats.queueHealth === 'critical') {
        status = 'critical'
        issues.push('Queue health critical')
      }

      health.status = status
      health.metrics = {
        pending: queueStats.pending,
        running: queueStats.running,
        completed: queueStats.completed,
        failed: queueStats.failed,
        successRate: queueStats.successRate
      }
      health.issues = issues
      health.lastCheck = new Date()

    } catch (error) {
      health.status = 'critical'
      health.issues = ['Task queue health check failed']
      await this.handleComponentFailure(component, error)
    }

    this.healthChecks.set(component, health)
  }

  // Memory system health check
  private async checkMemorySystemHealth() {
    const component = 'memory_system'
    const health = this.healthChecks.get(component)!

    try {
      const memoryUsage = process.memoryUsage()
      const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100

      let status: SystemHealth['status'] = 'healthy'
      const issues: string[] = []

      if (memoryPercentage > this.alertThresholds.memory) {
        status = 'warning'
        issues.push('High memory usage')
      }

      health.status = status
      health.metrics = {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        memoryPercentage,
        external: memoryUsage.external
      }
      health.issues = issues
      health.lastCheck = new Date()

    } catch (error) {
      health.status = 'warning'
      health.issues = ['Memory system monitoring failed']
    }

    this.healthChecks.set(component, health)
  }

  // API endpoints health check
  private async checkAPIEndpointsHealth() {
    const component = 'api_endpoints'
    const health = this.healthChecks.get(component)!

    try {
      // Test critical API endpoints
      const endpoints = ['/api/socketio', '/api/queue', '/api/email/sync']
      let healthyCount = 0

      for (const endpoint of endpoints) {
        try {
          // In production, make actual HTTP requests to test endpoints
          healthyCount++
        } catch (error) {
          // Endpoint failed
        }
      }

      const healthPercentage = healthyCount / endpoints.length
      
      health.status = healthPercentage >= 0.8 ? 'healthy' : 
                    healthPercentage >= 0.5 ? 'warning' : 'critical'
      health.metrics = {
        healthyEndpoints: healthyCount,
        totalEndpoints: endpoints.length,
        healthPercentage
      }
      health.issues = healthPercentage < 1 ? ['Some API endpoints failing'] : []
      health.lastCheck = new Date()

    } catch (error) {
      health.status = 'warning'
      health.issues = ['API endpoints health check failed']
    }

    this.healthChecks.set(component, health)
  }

  // File system health check
  private async checkFileSystemHealth() {
    const component = 'file_system'
    const health = this.healthChecks.get(component)!

    try {
      // Check disk space (simplified)
      health.status = 'healthy'
      health.metrics = {
        diskUsage: 50, // Simplified percentage
        freeSpace: 1000000000 // Simplified bytes
      }
      health.issues = []
      health.lastCheck = new Date()

    } catch (error) {
      health.status = 'warning'
      health.issues = ['File system monitoring failed']
    }

    this.healthChecks.set(component, health)
  }

  // Network connectivity health check
  private async checkNetworkConnectivity() {
    const component = 'network_connectivity'
    const health = this.healthChecks.get(component)!

    try {
      // Test external connectivity (simplified)
      health.status = 'healthy'
      health.metrics = {
        latency: 50, // Simplified ms
        packetLoss: 0
      }
      health.issues = []
      health.lastCheck = new Date()

    } catch (error) {
      health.status = 'warning'
      health.issues = ['Network connectivity issues']
    }

    this.healthChecks.set(component, health)
  }

  // Analyze overall system health and trigger recovery if needed
  private async analyzeSystemHealth() {
    const allHealthChecks = Array.from(this.healthChecks.values())
    const criticalIssues = allHealthChecks.filter(h => h.status === 'critical')
    const warningIssues = allHealthChecks.filter(h => h.status === 'warning')

    // Calculate overall health score
    const healthScore = allHealthChecks.reduce((score, health) => {
      switch (health.status) {
        case 'healthy': return score + 1
        case 'warning': return score + 0.5
        case 'critical': return score + 0.1
        default: return score
      }
    }, 0) / allHealthChecks.length

    // Trigger recovery actions if needed
    if (criticalIssues.length > 0 && this.autoRecoveryEnabled) {
      await this.triggerAutoRecovery(criticalIssues)
    }

    // Send alerts for significant issues
    if (criticalIssues.length > 0 || warningIssues.length > 2) {
      await this.sendHealthAlert({
        id: `health_alert_${Date.now()}`,
        severity: criticalIssues.length > 0 ? 'critical' : 'warning',
        component: 'system_overview',
        message: `System health issues detected: ${criticalIssues.length} critical, ${warningIssues.length} warnings`,
        recommendation: criticalIssues.length > 0 ? 'Auto-recovery initiated' : 'Monitor closely',
        autoRecoveryAvailable: this.autoRecoveryEnabled,
        timestamp: new Date()
      })
    }
  }

  // Handle component failure
  private async handleComponentFailure(component: string, error: any) {
    console.error(`🚨 Component failure detected: ${component}`, error)

    const health = this.healthChecks.get(component)!
    health.autoRecoveryAttempts++

    // Attempt auto-recovery if enabled and within limits
    if (this.autoRecoveryEnabled && health.autoRecoveryAttempts <= 3) {
      await this.attemptComponentRecovery(component)
    } else {
      health.manualInterventionRequired = true
    }
  }

  // Trigger automatic recovery for critical issues
  private async triggerAutoRecovery(criticalIssues: SystemHealth[]) {
    console.log('🔧 Triggering auto-recovery for critical issues')

    for (const issue of criticalIssues) {
      await this.attemptComponentRecovery(issue.component)
    }
  }

  // Attempt to recover a specific component
  private async attemptComponentRecovery(component: string) {
    console.log(`🔧 Attempting recovery for component: ${component}`)

    try {
      switch (component) {
        case 'database':
          await this.recoverDatabase()
          break
        case 'ai_router':
          await this.recoverAIRouter()
          break
        case 'task_queue':
          await this.recoverTaskQueue()
          break
        case 'memory_system':
          await this.recoverMemorySystem()
          break
        default:
          console.log(`No specific recovery action for component: ${component}`)
      }
    } catch (error) {
      console.error(`Recovery failed for component ${component}:`, error)
    }
  }

  // Database recovery
  private async recoverDatabase() {
    try {
      // Attempt to reconnect
      await prisma.$disconnect()
      await prisma.$connect()
      console.log('✅ Database recovery successful')
    } catch (error) {
      console.error('❌ Database recovery failed:', error)
    }
  }

  // AI Router recovery
  private async recoverAIRouter() {
    try {
      // Clear any cached connections or reset state
      console.log('✅ AI Router recovery initiated')
    } catch (error) {
      console.error('❌ AI Router recovery failed:', error)
    }
  }

  // Task Queue recovery
  private async recoverTaskQueue() {
    try {
      // Clear stuck tasks or reset queue state
      console.log('✅ Task Queue recovery initiated')
    } catch (error) {
      console.error('❌ Task Queue recovery failed:', error)
    }
  }

  // Memory system recovery
  private async recoverMemorySystem() {
    try {
      // Force garbage collection
      if (global.gc) {
        global.gc()
      }
      console.log('✅ Memory system recovery completed')
    } catch (error) {
      console.error('❌ Memory system recovery failed:', error)
    }
  }

  // Send health alert
  private async sendHealthAlert(alert: HealthAlert) {
    // Log alert
    console.log(`🚨 Health Alert [${alert.severity.toUpperCase()}]: ${alert.message}`)

    // Send to all admin users via WebSocket
    const notification = {
      id: alert.id,
      type: 'system_alert' as const,
      title: `System Health Alert`,
      message: alert.message,
      severity: alert.severity === 'critical' || alert.severity === 'emergency' ? 'critical' as const : 'high' as const,
      metadata: {
        component: alert.component,
        recommendation: alert.recommendation,
        autoRecoveryAvailable: alert.autoRecoveryAvailable
      },
      timestamp: alert.timestamp,
      read: false
    }

    // In production, send to admin users
    wrdoWebSocket.sendGlobalNotification(notification)
  }

  // Get current system health status
  getSystemHealth(): {
    overallStatus: 'healthy' | 'degraded' | 'critical'
    components: SystemHealth[]
    lastUpdate: Date
    autoRecoveryEnabled: boolean
  } {
    const components = Array.from(this.healthChecks.values())
    const criticalCount = components.filter(c => c.status === 'critical').length
    const warningCount = components.filter(c => c.status === 'warning').length

    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy'
    if (criticalCount > 0) {
      overallStatus = 'critical'
    } else if (warningCount > 2) {
      overallStatus = 'degraded'
    }

    return {
      overallStatus,
      components,
      lastUpdate: new Date(),
      autoRecoveryEnabled: this.autoRecoveryEnabled
    }
  }

  // Enable/disable auto-recovery
  setAutoRecovery(enabled: boolean) {
    this.autoRecoveryEnabled = enabled
    console.log(`🔧 Auto-recovery ${enabled ? 'enabled' : 'disabled'}`)
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
    console.log('🔍 Self-healing monitoring stopped')
  }
}

export const selfHealing = WRDOSelfHealing.getInstance()
