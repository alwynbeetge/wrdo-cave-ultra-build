
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateInput } from '@/lib/validation';
import { adminRateLimiter, applyRateLimit } from '@/lib/rate-limit';
import { ipTracker, extractRequestData } from '@/lib/ip-tracking';
import { aiRouter, AI_AGENTS } from '@/lib/ai-router';
import { z } from 'zod';

const agentRequestSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  task: z.string().min(10, 'Task description must be at least 10 characters').max(2000, 'Task description too long'),
  justification: z.string().min(20, 'Justification must be at least 20 characters').max(1000, 'Justification too long'),
  maxExecutionTime: z.number().min(5).max(120).optional(),
});

const agentApprovalSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  approved: z.boolean(),
  approvalNotes: z.string().max(500, 'Approval notes too long').optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestData = extractRequestData(request);
  
  try {
    // Check authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const rateLimit = await applyRateLimit(request, adminRateLimiter, session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many agent requests. Please slow down.' },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const body = await request.json();
    const validation = validateInput(agentRequestSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: rateLimit.headers }
      );
    }

    const { agentId, task, justification, maxExecutionTime } = validation.data;

    // Validate agent exists
    if (!AI_AGENTS[agentId]) {
      return NextResponse.json(
        { error: 'Invalid agent ID' },
        { status: 400, headers: rateLimit.headers }
      );
    }

    // Create approval request using AI router
    const approvalRequest = await aiRouter.requestAgentExecution(agentId, task, {
      userId: session.user.id,
      justification,
      maxExecutionTime,
    });

    // Save request to database
    const savedRequest = await prisma.deepAgentTask.create({
      data: {
        title: `Agent Request: ${AI_AGENTS[agentId].name}`,
        description: task,
        taskType: 'agent_execution',
        briefing: {
          agentId,
          task,
          justification,
          estimatedCost: approvalRequest.estimatedCost,
          estimatedTime: approvalRequest.estimatedTime,
          riskLevel: approvalRequest.riskLevel,
        } as any,
        status: 'pending',
        estimatedCost: approvalRequest.estimatedCost,
        userId: session.user.id,
      },
    });

    // Log the request
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      userId: session.user.id,
      action: 'agent_request_created',
      resource: 'agent',
      details: {
        agentId,
        taskId: savedRequest.id,
        estimatedCost: approvalRequest.estimatedCost,
        riskLevel: approvalRequest.riskLevel,
      },
      success: true,
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId: savedRequest.id,
        approvalRequest,
        message: 'Agent request created successfully. Awaiting approval.',
      },
      { headers: rateLimit.headers }
    );

  } catch (error) {
    console.error('Agent request error:', error);
    
    const session = await getCurrentSession().catch(() => null);
    
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      userId: session?.user.id,
      action: 'agent_request_error',
      resource: 'agent',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Approve or reject agent request
export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  const requestData = extractRequestData(request);
  
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin privileges (simplified check)
    const isAdmin = session.user.email?.includes('admin') || session.user.id === 'admin-user';
    if (!isAdmin) {
      await ipTracker.logSecurityEvent({
        type: 'admin_action',
        severity: 'medium',
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        userId: session.user.id,
        description: 'Unauthorized attempt to approve agent request',
      });

      return NextResponse.json(
        { error: 'Insufficient privileges' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = validateInput(agentApprovalSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { requestId, approved, approvalNotes } = validation.data;

    // Get the request from database
    const agentTask = await prisma.deepAgentTask.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!agentTask) {
      return NextResponse.json(
        { error: 'Agent request not found' },
        { status: 404 }
      );
    }

    if (agentTask.status !== 'pending') {
      return NextResponse.json(
        { error: 'Agent request has already been processed' },
        { status: 400 }
      );
    }

    // Update request status
    const updatedTask = await prisma.deepAgentTask.update({
      where: { id: requestId },
      data: {
        status: approved ? 'approved' : 'rejected',
        approvedAt: approved ? new Date() : null,
        result: {
          approvedBy: session.user.id,
          approvalNotes,
          approvedAt: new Date().toISOString(),
        } as any,
      },
    });

    // If approved, execute the agent task
    let executionResult = null;
    if (approved && agentTask.briefing) {
      try {
        const briefing = agentTask.briefing as any;
        const approvalRequest = {
          agentId: briefing.agentId,
          task: agentTask.description,
          estimatedCost: briefing.estimatedCost,
          estimatedTime: briefing.estimatedTime,
          riskLevel: briefing.riskLevel,
          justification: briefing.justification,
        };

        executionResult = await aiRouter.executeApprovedAgentTask(
          approvalRequest,
          true,
          session.user.id
        );

        // Update task with results
        await prisma.deepAgentTask.update({
          where: { id: requestId },
          data: {
            status: 'completed',
            actualCost: executionResult.cost,
            completedAt: new Date(),
            result: {
              ...(updatedTask.result as any || {}),
              executionResult: {
                content: executionResult.content,
                model: executionResult.model,
                provider: executionResult.provider,
                tokensUsed: executionResult.tokensUsed,
                cost: executionResult.cost,
                processingTime: executionResult.processingTime,
              },
            } as any,
          },
        });
      } catch (executionError) {
        console.error('Agent execution error:', executionError);
        
        await prisma.deepAgentTask.update({
          where: { id: requestId },
          data: {
            status: 'failed',
            result: {
              ...(updatedTask.result as any || {}),
              error: executionError instanceof Error ? executionError.message : 'Execution failed',
            } as any,
          },
        });
      }
    }

    // Log the approval/rejection
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      userId: session.user.id,
      action: approved ? 'agent_request_approved' : 'agent_request_rejected',
      resource: 'agent',
      details: {
        requestId,
        targetUserId: agentTask.userId,
        approvalNotes,
        executionResult: executionResult ? {
          cost: executionResult.cost,
          tokensUsed: executionResult.tokensUsed,
        } : null,
      },
      success: true,
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      approved,
      message: approved ? 'Agent request approved and executed' : 'Agent request rejected',
      executionResult,
    });

  } catch (error) {
    console.error('Agent approval error:', error);
    
    const session = await getCurrentSession().catch(() => null);
    
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      userId: session?.user.id,
      action: 'agent_approval_error',
      resource: 'agent',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get agent requests (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const requests = await prisma.deepAgentTask.findMany({
      where: {
        taskType: 'agent_execution',
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Math.min(limit, 100),
    });

    return NextResponse.json({ requests });

  } catch (error) {
    console.error('Get agent requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
