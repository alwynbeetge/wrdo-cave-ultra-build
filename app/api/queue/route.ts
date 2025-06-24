
// WRDO Cave Ultra - Queue Management API Route
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { taskQueue, addAIAnalysisTask, addEmailProcessingTask, addAgentExecutionTask } from '@/queue/tasks';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const taskId = url.searchParams.get('taskId');

    switch (action) {
      case 'stats':
        const stats = taskQueue.getStats();
        return NextResponse.json({ success: true, stats });

      case 'user_tasks':
        const userTasks = taskQueue.getUserTasks(session.user.id);
        return NextResponse.json({ success: true, tasks: userTasks });

      case 'task_detail':
        if (!taskId) {
          return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
        }
        const task = taskQueue.getTask(taskId);
        if (!task) {
          return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, task });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Queue API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, taskType, priority = 'normal', payload } = body;

    switch (action) {
      case 'add_task':
        let taskId: string;

        switch (taskType) {
          case 'ai_analysis':
            if (!payload.prompt) {
              return NextResponse.json({ error: 'Prompt required for AI analysis' }, { status: 400 });
            }
            taskId = await addAIAnalysisTask(session.user.id, payload.prompt, priority);
            break;

          case 'email_processing':
            if (!payload.action) {
              return NextResponse.json({ error: 'Action required for email processing' }, { status: 400 });
            }
            taskId = await addEmailProcessingTask(session.user.id, payload.action, priority);
            break;

          case 'agent_execution':
            if (!payload.agentId || !payload.agentTask || !payload.approvalData) {
              return NextResponse.json({ error: 'Agent details required' }, { status: 400 });
            }
            taskId = await addAgentExecutionTask(
              session.user.id, 
              payload.agentId, 
              payload.agentTask, 
              payload.approvalData
            );
            break;

          default:
            // Generic task addition
            taskId = await taskQueue.addTask({
              type: taskType,
              priority,
              payload: { ...payload, userId: session.user.id },
              userId: session.user.id,
              maxRetries: payload.maxRetries || 3,
              timeout: payload.timeout || 300000
            });
        }

        return NextResponse.json({
          success: true,
          taskId,
          message: 'Task added to queue successfully'
        });

      case 'cancel_task':
        if (!payload.taskId) {
          return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
        }

        const cancelled = await taskQueue.cancelTask(payload.taskId);
        if (cancelled) {
          return NextResponse.json({
            success: true,
            message: 'Task cancelled successfully'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'Task could not be cancelled (may be running or completed)'
          });
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Queue API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
