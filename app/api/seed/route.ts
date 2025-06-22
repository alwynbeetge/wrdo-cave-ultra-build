
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { initializeDefaultRoles } from '@/lib/roles';

export async function POST() {
  try {
    await initializeDefaultRoles();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Default roles initialized successfully' 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize default roles' },
      { status: 500 }
    );
  }
}
