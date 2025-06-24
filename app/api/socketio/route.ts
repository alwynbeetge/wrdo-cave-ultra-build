
// WRDO Cave Ultra - WebSocket API Route
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'
import { wrdoWebSocket } from '@/lib/websocket-server'

// This route handles WebSocket connections
export async function GET(request: NextRequest) {
  try {
    // In a proper Next.js 13+ app directory setup, WebSocket initialization
    // should be handled differently. This is a placeholder for the proper setup.
    
    return NextResponse.json({ 
      message: 'WebSocket server initialized',
      endpoint: '/api/socketio',
      status: 'ready'
    })
  } catch (error) {
    console.error('WebSocket initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize WebSocket server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId, data } = body

    switch (type) {
      case 'send_notification':
        if (data.notification && userId) {
          wrdoWebSocket.sendNotificationToUser(userId, data.notification)
          return NextResponse.json({ success: true })
        }
        break
        
      case 'send_global_notification':
        if (data.notification) {
          wrdoWebSocket.sendGlobalNotification(data.notification)
          return NextResponse.json({ success: true })
        }
        break
        
      case 'agent_completion':
        if (userId && data.agentId && data.result) {
          wrdoWebSocket.sendAgentCompletion(userId, data.agentId, data.result)
          return NextResponse.json({ success: true })
        }
        break
        
      case 'task_update':
        if (userId && data.taskId && data.status) {
          wrdoWebSocket.sendTaskUpdate(userId, data.taskId, data.status, data.progress)
          return NextResponse.json({ success: true })
        }
        break
        
      default:
        return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error) {
    console.error('WebSocket API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
