
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateInput, chatMessageSchema } from '@/lib/validation';
import { chatRateLimiter, applyRateLimit } from '@/lib/rate-limit';
import { ipTracker, extractRequestData } from '@/lib/ip-tracking';
import { aiRouter, AI_AGENTS } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestData = extractRequestData(request);
  
  try {
    // Check authentication
    const session = await getCurrentSession();
    if (!session) {
      await ipTracker.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        description: 'Unauthorized chat API access attempt',
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const rateLimit = await applyRateLimit(request, chatRateLimiter, session.user.id);
    if (!rateLimit.allowed) {
      await ipTracker.logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        userId: session.user.id,
        description: 'Chat rate limit exceeded',
        metadata: { retryAfter: rateLimit.retryAfter },
      });

      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429, headers: rateLimit.headers }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validation = validateInput(chatMessageSchema, body);
    
    if (!validation.success) {
      await ipTracker.logActivity({
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        userId: session.user.id,
        action: 'chat_request',
        resource: 'chat',
        success: false,
        errorMessage: validation.error,
      });

      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: rateLimit.headers }
      );
    }

    const { message, model, conversationId, temperature, maxTokens } = validation.data;

    // Verify user authorization
    if (body.userId && body.userId !== session.user.id) {
      await ipTracker.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        userId: session.user.id,
        description: 'Attempted to access chat for different user',
        metadata: { requestedUserId: body.userId },
      });

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: rateLimit.headers }
      );
    }

    // Check if it's an agent request (should be handled separately)
    if (aiRouter.isAgent(model)) {
      return NextResponse.json(
        { 
          error: 'Agent requests require approval. Use the agent request flow.',
          requiresApproval: true,
          agentInfo: AI_AGENTS[model]
        },
        { status: 400, headers: rateLimit.headers }
      );
    }

    // Log chat attempt
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      userId: session.user.id,
      action: 'chat_request',
      resource: 'chat',
      details: {
        model,
        messageLength: message.length,
        conversationId,
      },
    });

    // Prepare messages for AI
    const messages = [
      {
        role: 'system' as const,
        content: `You are an intelligent AI assistant in the WRDO Cave platform. You provide accurate, helpful, and professional responses. 

Current date: ${new Date().toLocaleDateString()}
User: ${session.user.name || session.user.email}

Guidelines:
- Be professional, accurate, and helpful
- Provide detailed responses when appropriate
- For complex queries, break down your response into clear sections
- If you're unsure about something, acknowledge it
- Stay focused on the user's question`
      },
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Get AI response using router with fallback
    const aiResponse = await aiRouter.chatCompletion(messages, model, {
      temperature,
      maxTokens,
      userId: session.user.id,
      conversationId,
    });

    // Save conversation to database
    let savedMessage = null;
    try {
      savedMessage = await prisma.chatMessage.create({
        data: {
          message,
          response: aiResponse.content,
          userId: session.user.id,
          // Store additional metadata
          metadata: {
            model: aiResponse.model,
            provider: aiResponse.provider,
            tokensUsed: aiResponse.tokensUsed,
            cost: aiResponse.cost,
            processingTime: aiResponse.processingTime,
            fallbackUsed: aiResponse.fallbackUsed,
            fallbackReason: aiResponse.fallbackReason,
            conversationId,
          } as any,
        },
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if database save fails
    }

    // Log successful chat completion
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      userId: session.user.id,
      action: 'chat_completed',
      resource: 'chat',
      details: {
        model: aiResponse.model,
        provider: aiResponse.provider,
        tokensUsed: aiResponse.tokensUsed,
        cost: aiResponse.cost,
        processingTime: aiResponse.processingTime,
        fallbackUsed: aiResponse.fallbackUsed,
        messageId: savedMessage?.id,
      },
      success: true,
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        response: aiResponse.content,
        metadata: {
          model: aiResponse.model,
          provider: aiResponse.provider,
          tokensUsed: aiResponse.tokensUsed,
          cost: aiResponse.cost,
          processingTime: aiResponse.processingTime,
          fallbackUsed: aiResponse.fallbackUsed,
          fallbackReason: aiResponse.fallbackReason,
        },
      },
      { headers: rateLimit.headers }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    
    const session = await getCurrentSession().catch(() => null);
    
    await ipTracker.logActivity({
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      userId: session?.user.id,
      action: 'chat_error',
      resource: 'chat',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    });

    await ipTracker.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'medium',
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      userId: session?.user.id,
      description: 'Chat API internal error',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
