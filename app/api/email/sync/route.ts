
// WRDO Cave Ultra - Email Sync API Route
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { emailIntegration, emailScheduler } from '@/lib/email-integration';
import { prisma } from '@/lib/db';

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
    const { action, emailAccountId, intervalMinutes = 5 } = body;

    switch (action) {
      case 'sync_now':
        // Manual sync
        await emailIntegration.startEmailMonitoring(session.user.id);
        return NextResponse.json({ 
          success: true, 
          message: 'Email sync completed successfully' 
        });

      case 'start_monitoring':
        // Start automated monitoring
        emailScheduler.startMonitoring(session.user.id, intervalMinutes);
        
        // Update email account status
        if (emailAccountId) {
          await prisma.emailAccount.update({
            where: { id: emailAccountId },
            data: { 
              lastChecked: new Date(),
              isActive: true 
            }
          });
        }
        
        return NextResponse.json({ 
          success: true, 
          message: `Email monitoring started (${intervalMinutes}min intervals)` 
        });

      case 'stop_monitoring':
        // Stop automated monitoring
        emailScheduler.stopMonitoring(session.user.id);
        return NextResponse.json({ 
          success: true, 
          message: 'Email monitoring stopped' 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Email sync API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get user's email accounts and recent summaries
    const emailAccounts = await prisma.emailAccount.findMany({
      where: { userId: session.user.id },
      include: {
        emailSummary: {
          orderBy: { receivedAt: 'desc' },
          take: 20
        }
      }
    });

    return NextResponse.json({
      success: true,
      emailAccounts
    });
  } catch (error) {
    console.error('Email sync GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
