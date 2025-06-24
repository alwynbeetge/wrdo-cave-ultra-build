
// WRDO Cave Ultra - WRDO Brain Phase 2 API Route
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { wrdoBrainCore } from '@/lib/wrdo-brain-integration';

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

    switch (action) {
      case 'status':
        const status = await wrdoBrainCore.getBrainStatus();
        return NextResponse.json({
          success: true,
          status,
          message: 'WRDO Brain Core Phase 2 status retrieved'
        });

      case 'features':
        const features = wrdoBrainCore.getEnhancedFeatures();
        return NextResponse.json({
          success: true,
          features,
          phase: 2,
          message: 'Phase 2 enhanced features active'
        });

      case 'diagnostics':
        const diagnostics = await wrdoBrainCore.runDiagnostics();
        return NextResponse.json({
          success: true,
          diagnostics,
          message: 'System diagnostics completed'
        });

      case 'health':
        // Quick health check
        const isReady = wrdoBrainCore.isReady();
        return NextResponse.json({
          success: true,
          ready: isReady,
          phase: 2,
          timestamp: new Date(),
          message: isReady ? 'WRDO Brain Core is operational' : 'System initializing'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: status, features, diagnostics, or health' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('WRDO Brain API error:', error);
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
    const { action, message, useEnhancedContext = true } = body;

    switch (action) {
      case 'enhanced_chat':
        if (!message) {
          return NextResponse.json(
            { error: 'Message is required for enhanced chat' },
            { status: 400 }
          );
        }

        const chatResult = await wrdoBrainCore.enhancedChat(
          session.user.id,
          message,
          [], // conversation history would be passed here
          useEnhancedContext
        );

        return NextResponse.json({
          success: true,
          ...chatResult,
          phase: 2,
          message: 'Enhanced chat response generated'
        });

      case 'start_email_monitoring':
        await wrdoBrainCore.startEnhancedEmailMonitoring(session.user.id);
        return NextResponse.json({
          success: true,
          message: 'Enhanced email monitoring started'
        });

      case 'autonomous_maintenance':
        const taskId = await wrdoBrainCore.triggerAutonomousMaintenance();
        return NextResponse.json({
          success: true,
          taskId,
          message: 'Autonomous maintenance task initiated'
        });

      case 'initialize':
        await wrdoBrainCore.initialize();
        return NextResponse.json({
          success: true,
          message: 'WRDO Brain Core Phase 2 initialized successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: enhanced_chat, start_email_monitoring, autonomous_maintenance, or initialize' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('WRDO Brain POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
