
// WRDO Cave Ultra - Gmail Setup API Route
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { emailIntegration } from '@/lib/email-integration';
import { prisma } from '@/lib/db';

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
    const code = url.searchParams.get('code');

    if (code) {
      // Handle OAuth callback
      try {
        const tokens = await emailIntegration.exchangeCodeForTokens(code);
        
        // Create or update email account
        const emailAccount = await prisma.emailAccount.upsert({
          where: {
            userId_email: {
              userId: session.user.id,
              email: session.user.email
            }
          },
          update: {
            isActive: true,
            lastChecked: new Date()
          },
          create: {
            email: session.user.email,
            provider: 'gmail',
            isActive: true,
            lastChecked: new Date(),
            userId: session.user.id
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Gmail integration setup successfully',
          emailAccount
        });
      } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.json(
          { error: 'Failed to setup Gmail integration' },
          { status: 500 }
        );
      }
    } else {
      // Return OAuth URL for setup
      const authUrl = emailIntegration.getAuthUrl();
      return NextResponse.json({
        success: true,
        authUrl,
        message: 'Visit the auth URL to setup Gmail integration'
      });
    }
  } catch (error) {
    console.error('Gmail setup error:', error);
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
    const { action, emailAccountId } = body;

    switch (action) {
      case 'test_connection':
        // Test Gmail API connection
        try {
          await emailIntegration.getRecentEmails(session.user.id, 1);
          return NextResponse.json({
            success: true,
            message: 'Gmail connection test successful'
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Gmail connection test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }

      case 'disconnect':
        // Deactivate email account
        if (emailAccountId) {
          await prisma.emailAccount.update({
            where: { id: emailAccountId },
            data: { isActive: false }
          });
        }
        
        return NextResponse.json({
          success: true,
          message: 'Gmail integration disconnected'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Gmail setup POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
