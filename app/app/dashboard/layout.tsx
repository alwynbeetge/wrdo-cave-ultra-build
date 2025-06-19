
'use client';

import { WRDOLayout } from '@/components/layout/wrdo-layout';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from auth context/session
    const getCurrentUser = async () => {
      try {
        // This would normally come from your auth system
        const userData = {
          id: 'user_1',
          name: 'Admin User',
          email: 'admin@wrdo.cave',
          role: 'admin',
          permissions: [
            'admin.view', 'admin.manage', 'ai.configure', 'finance.view', 
            'finance.edit', 'projects.view', 'projects.edit', 'settings.view', 
            'settings.edit', 'chat.send', 'chat.upload'
          ],
          lastLogin: new Date(),
          ipAddress: '127.0.0.1',
          device: 'Desktop'
        };
        setUser(userData);
      } catch (error) {
        console.error('Failed to get user:', error);
        redirect('/login');
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading WRDO Cave Ultra...</div>
      </div>
    );
  }

  return (
    <WRDOLayout user={user}>
      {children}
    </WRDOLayout>
  );
}
