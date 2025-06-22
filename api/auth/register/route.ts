
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

// REGISTRATION DISABLED - PRIVATE PORTAL
// This endpoint has been disabled for security reasons.
// User registration is restricted to administrators only.

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Registration is disabled. This is a private portal. Please contact an administrator for access.',
      code: 'REGISTRATION_DISABLED'
    },
    { status: 403 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Registration is disabled. This is a private portal.',
      code: 'REGISTRATION_DISABLED'
    },
    { status: 403 }
  );
}

// All other methods are also disabled
export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
