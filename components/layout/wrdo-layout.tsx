
'use client';

import React, { useEffect, ReactNode } from 'react';
import { MainNav } from '@/components/navigation/main-nav';
import { WRDOProvider, useWRDO } from '@/lib/wrdo-context';
import { NotificationCenter } from '@/components/ui/notification-center';
import { WRDOStatusBar } from '@/components/ui/wrdo-status-bar';
import { QuickActions } from '@/components/ui/quick-actions';
import { cn } from '@/lib/utils';

interface WRDOLayoutProps {
  children: ReactNode;
  user?: any;
  hideNavigation?: boolean;
  className?: string;
}

function WRDOLayoutInner({ children, user, hideNavigation, className }: WRDOLayoutProps) {
  const { state, actions } = useWRDO();

  useEffect(() => {
    // Initialize WRDO system
    if (!state.isInitialized) {
      actions.initializeWRDO();
    }

    // Set user if provided
    if (user && !state.currentUser) {
      actions.setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        permissions: user.permissions || [],
        lastLogin: user.lastLogin,
        ipAddress: user.ipAddress,
        device: user.device,
      });
    }
  }, [user, state.isInitialized, state.currentUser, actions]);

  // Generate AI suggestions when page changes
  useEffect(() => {
    if (state.currentPage && state.isInitialized) {
      setTimeout(() => actions.suggestActions(), 1000);
    }
  }, [state.currentPage?.path, actions, state.isInitialized]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Main Navigation */}
      {!hideNavigation && <MainNav />}
      
      {/* Main Content Area */}
      <div className={cn(
        'flex-1',
        !hideNavigation && 'lg:ml-64',
        className
      )}>
        {/* Status Bar */}
        <WRDOStatusBar />
        
        {/* Page Content */}
        <main className="relative min-h-screen">
          {children}
        </main>
        
        {/* Floating UI Elements */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
          <QuickActions />
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
}

export function WRDOLayout(props: WRDOLayoutProps) {
  return (
    <WRDOProvider>
      <WRDOLayoutInner {...props} />
    </WRDOProvider>
  );
}
