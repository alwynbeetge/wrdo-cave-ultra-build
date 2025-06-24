
// WRDO Cave Ultra - WebSocket Real-time Notifications Server
import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest } from 'next'
import type { Socket as NetSocket } from 'net'
import type { Server as HTTPServer } from 'http'

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiRequest {
  socket: SocketWithIO
}

export interface WRDONotification {
  id: string
  type: 'agent_complete' | 'task_update' | 'system_alert' | 'email_alert' | 'security_event'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  metadata?: Record<string, any>
  timestamp: Date
  read: boolean
}

export interface WRDOSystemEvent {
  type: 'job_started' | 'job_completed' | 'job_failed' | 'agent_approval_required' | 'memory_update'
  userId?: string
  jobId?: string
  agentId?: string
  data: Record<string, any>
  timestamp: Date
}

class WRDOWebSocketManager {
  private static instance: WRDOWebSocketManager
  private io: SocketIOServer | null = null
  private activeConnections = new Map<string, string[]>() // userId -> socketIds
  
  private constructor() {}

  static getInstance(): WRDOWebSocketManager {
    if (!WRDOWebSocketManager.instance) {
      WRDOWebSocketManager.instance = new WRDOWebSocketManager()
    }
    return WRDOWebSocketManager.instance
  }

  initializeIO(server: SocketIOServer) {
    this.io = server
    this.setupEventHandlers()
    console.log('🔌 WRDO WebSocket server initialized')
  }

  private setupEventHandlers() {
    if (!this.io) return

    this.io.on('connection', (socket) => {
      console.log(`🔗 Client connected: ${socket.id}`)

      // Handle user authentication and room joining
      socket.on('authenticate', (data: { userId: string; token?: string }) => {
        try {
          // Validate user authentication (in production, verify JWT token)
          this.addUserConnection(data.userId, socket.id)
          socket.join(`user:${data.userId}`)
          socket.join('global') // Global notifications

          socket.emit('authenticated', { 
            success: true, 
            userId: data.userId,
            timestamp: new Date()
          })

          console.log(`✅ User ${data.userId} authenticated on socket ${socket.id}`)
        } catch (error) {
          socket.emit('auth_error', { error: 'Authentication failed' })
        }
      })

      // Handle notification acknowledgment
      socket.on('notification_read', (data: { notificationId: string, userId: string }) => {
        this.markNotificationRead(data.notificationId, data.userId)
      })

      // Handle agent status requests
      socket.on('agent_status_request', (data: { agentId: string, userId: string }) => {
        this.sendAgentStatus(data.agentId, data.userId, socket)
      })

      // Handle system health requests
      socket.on('system_health_request', (userId: string) => {
        this.sendSystemHealth(userId, socket)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        this.removeUserConnection(socket.id)
        console.log(`🔌 Client disconnected: ${socket.id}`)
      })
    })
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: WRDONotification) {
    if (!this.io) return false

    this.io.to(`user:${userId}`).emit('notification', notification)
    console.log(`📬 Notification sent to user ${userId}:`, notification.title)
    return true
  }

  // Send notification to all users
  sendGlobalNotification(notification: WRDONotification) {
    if (!this.io) return false

    this.io.to('global').emit('global_notification', notification)
    console.log(`📢 Global notification sent:`, notification.title)
    return true
  }

  // Send system event to user
  sendSystemEvent(userId: string, event: WRDOSystemEvent) {
    if (!this.io) return false

    this.io.to(`user:${userId}`).emit('system_event', event)
    console.log(`⚡ System event sent to user ${userId}:`, event.type)
    return true
  }

  // Send agent completion notification
  sendAgentCompletion(userId: string, agentId: string, result: any) {
    const notification: WRDONotification = {
      id: `agent_${agentId}_${Date.now()}`,
      type: 'agent_complete',
      title: 'Agent Task Completed',
      message: `Your ${agentId} agent has completed its task successfully.`,
      severity: 'medium',
      userId,
      metadata: { agentId, result },
      timestamp: new Date(),
      read: false
    }

    this.sendNotificationToUser(userId, notification)
  }

  // Send task update notification
  sendTaskUpdate(userId: string, taskId: string, status: string, progress?: number) {
    const notification: WRDONotification = {
      id: `task_${taskId}_${Date.now()}`,
      type: 'task_update',
      title: 'Task Status Update',
      message: `Task ${taskId} status: ${status}${progress ? ` (${progress}%)` : ''}`,
      severity: 'low',
      userId,
      metadata: { taskId, status, progress },
      timestamp: new Date(),
      read: false
    }

    this.sendNotificationToUser(userId, notification)
  }

  // Send email alert notification
  sendEmailAlert(userId: string, emailData: any) {
    const notification: WRDONotification = {
      id: `email_${Date.now()}`,
      type: 'email_alert',
      title: 'Important Email Received',
      message: `High-priority email from ${emailData.sender}: ${emailData.subject}`,
      severity: emailData.priority === 'urgent' ? 'critical' : 'medium',
      userId,
      metadata: emailData,
      timestamp: new Date(),
      read: false
    }

    this.sendNotificationToUser(userId, notification)
  }

  // Send security event notification
  sendSecurityAlert(userId: string, eventType: string, details: any) {
    const notification: WRDONotification = {
      id: `security_${Date.now()}`,
      type: 'security_event',
      title: 'Security Alert',
      message: `Security event detected: ${eventType}`,
      severity: 'high',
      userId,
      metadata: { eventType, details },
      timestamp: new Date(),
      read: false
    }

    this.sendNotificationToUser(userId, notification)
  }

  // System health update
  sendSystemHealth(userId: string, socket: any) {
    const healthData = {
      timestamp: new Date(),
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeConnections: this.activeConnections.size,
      services: {
        ai: 'operational',
        database: 'operational',
        email: 'operational',
        websocket: 'operational'
      }
    }

    socket.emit('system_health', healthData)
  }

  // Send agent status
  sendAgentStatus(agentId: string, userId: string, socket: any) {
    // In production, fetch real agent status from database
    const agentStatus = {
      agentId,
      status: 'active',
      lastExecution: new Date(),
      tasksCompleted: Math.floor(Math.random() * 100),
      averageExecutionTime: Math.floor(Math.random() * 5000) + 1000,
      successRate: 0.95 + Math.random() * 0.05
    }

    socket.emit('agent_status', agentStatus)
  }

  private addUserConnection(userId: string, socketId: string) {
    if (!this.activeConnections.has(userId)) {
      this.activeConnections.set(userId, [])
    }
    this.activeConnections.get(userId)?.push(socketId)
  }

  private removeUserConnection(socketId: string) {
    Array.from(this.activeConnections.entries()).forEach(([userId, socketIds]) => {
      const index = socketIds.indexOf(socketId)
      if (index > -1) {
        socketIds.splice(index, 1)
        if (socketIds.length === 0) {
          this.activeConnections.delete(userId)
        }
      }
    })
  }

  private async markNotificationRead(notificationId: string, userId: string) {
    // In production, update notification status in database
    console.log(`✅ Notification ${notificationId} marked as read by user ${userId}`)
  }

  // Get active connections count
  getActiveConnectionsCount(): number {
    return this.activeConnections.size
  }

  // Get user connection status
  isUserConnected(userId: string): boolean {
    return this.activeConnections.has(userId)
  }
}

export const wrdoWebSocket = WRDOWebSocketManager.getInstance()

// Helper function to initialize WebSocket in API route
export function initializeWebSocket(res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log('🚀 Initializing Socket.IO server...')
    
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://your-domain.com'] 
          : ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST']
      }
    })
    
    res.socket.server.io = io
    wrdoWebSocket.initializeIO(io)
  }
  
  return res.socket.server.io
}
