
// WRDO Cave Ultra - WebSocket Hook for Real-time Notifications
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useToast } from '@/hooks/use-toast'

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

interface UseWebSocketOptions {
  userId?: string
  autoConnect?: boolean
  showToasts?: boolean
}

interface SystemHealth {
  timestamp: Date
  status: string
  uptime: number
  memory: any
  activeConnections: number
  services: Record<string, string>
}

interface AgentStatus {
  agentId: string
  status: string
  lastExecution: Date
  tasksCompleted: number
  averageExecutionTime: number
  successRate: number
}

export function useWebSocket({ userId, autoConnect = true, showToasts = true }: UseWebSocketOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<WRDONotification[]>([])
  const [systemEvents, setSystemEvents] = useState<WRDOSystemEvent[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({})
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const socketRef = useRef<Socket | null>(null)

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      upgrade: true,
      autoConnect: true
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔌 Connected to WRDO WebSocket server')
      setConnected(true)
      setError(null)

      // Authenticate user if userId is provided
      if (userId) {
        newSocket.emit('authenticate', { userId })
      }
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WRDO WebSocket server')
      setConnected(false)
    })

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err)
      setError(`Connection failed: ${err.message}`)
      setConnected(false)
    })

    // Authentication events
    newSocket.on('authenticated', (data) => {
      console.log('✅ WebSocket authenticated for user:', data.userId)
      if (showToasts) {
        toast({
          title: 'Connected',
          description: 'Real-time notifications are now active',
          variant: 'default'
        })
      }
    })

    newSocket.on('auth_error', (data) => {
      console.error('❌ WebSocket authentication failed:', data.error)
      setError(data.error)
    })

    // Notification events
    newSocket.on('notification', (notification: WRDONotification) => {
      console.log('📬 Received notification:', notification)
      setNotifications(prev => [notification, ...prev.slice(0, 99)]) // Keep last 100

      if (showToasts) {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.severity === 'critical' || notification.severity === 'high' ? 'destructive' : 'default'
        })
      }
    })

    newSocket.on('global_notification', (notification: WRDONotification) => {
      console.log('📢 Received global notification:', notification)
      setNotifications(prev => [notification, ...prev.slice(0, 99)])

      if (showToasts) {
        toast({
          title: `[Global] ${notification.title}`,
          description: notification.message,
          variant: notification.severity === 'critical' || notification.severity === 'high' ? 'destructive' : 'default'
        })
      }
    })

    // System events
    newSocket.on('system_event', (event: WRDOSystemEvent) => {
      console.log('⚡ Received system event:', event)
      setSystemEvents(prev => [event, ...prev.slice(0, 49)]) // Keep last 50

      // Show important system events as toasts
      if (showToasts && ['job_failed', 'agent_approval_required'].includes(event.type)) {
        toast({
          title: 'System Event',
          description: `${event.type.replace('_', ' ').toUpperCase()}: ${event.jobId || event.agentId || 'Unknown'}`,
          variant: event.type === 'job_failed' ? 'destructive' : 'default'
        })
      }
    })

    // System health updates
    newSocket.on('system_health', (health: SystemHealth) => {
      setSystemHealth(health)
    })

    // Agent status updates
    newSocket.on('agent_status', (status: AgentStatus) => {
      setAgentStatuses(prev => ({
        ...prev,
        [status.agentId]: status
      }))
    })

    return newSocket
  }, [userId, showToasts, toast])

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setConnected(false)
    }
  }, [])

  // Send notification acknowledgment
  const markNotificationRead = useCallback((notificationId: string) => {
    if (socketRef.current && userId) {
      socketRef.current.emit('notification_read', { notificationId, userId })
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    }
  }, [userId])

  // Request agent status
  const requestAgentStatus = useCallback((agentId: string) => {
    if (socketRef.current && userId) {
      socketRef.current.emit('agent_status_request', { agentId, userId })
    }
  }, [userId])

  // Request system health
  const requestSystemHealth = useCallback(() => {
    if (socketRef.current && userId) {
      socketRef.current.emit('system_health_request', userId)
    }
  }, [userId])

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Clear system events
  const clearSystemEvents = useCallback(() => {
    setSystemEvents([])
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && userId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, userId, connect, disconnect])

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length

  return {
    // Connection state
    connected,
    error,
    socket,
    
    // Actions
    connect,
    disconnect,
    markNotificationRead,
    requestAgentStatus,
    requestSystemHealth,
    clearNotifications,
    clearSystemEvents,
    
    // Data
    notifications,
    systemEvents,
    systemHealth,
    agentStatuses,
    unreadCount,
    
    // Computed
    hasUnreadNotifications: unreadCount > 0,
    isHealthy: systemHealth?.status === 'healthy'
  }
}
