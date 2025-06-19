
'use client';

import React, { useState } from 'react';
import { Plus, Zap, MessageSquare, Settings, Upload, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWRDO } from '@/lib/wrdo-context';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, actions } = useWRDO();
  const router = useRouter();

  const quickActions = [
    {
      icon: MessageSquare,
      label: 'AI Chat',
      action: () => router.push('/chat'),
      color: 'text-blue-400',
      bgColor: 'hover:bg-blue-500/20',
    },
    {
      icon: Plus,
      label: 'Create Entry',
      action: () => {
        // Context-aware creation based on current page
        const currentPath = state.currentPage?.path;
        if (currentPath?.includes('/finances')) {
          router.push('/dashboard/finances?action=create');
        } else if (currentPath?.includes('/projects')) {
          router.push('/dashboard/projects?action=create');
        } else {
          router.push('/dashboard?action=create');
        }
      },
      color: 'text-green-400',
      bgColor: 'hover:bg-green-500/20',
    },
    {
      icon: Upload,
      label: 'Upload File',
      action: () => {
        // Trigger file upload modal
        actions.addNotification({
          type: 'info',
          title: 'File Upload',
          message: 'File upload feature will open here',
          read: false,
        });
      },
      color: 'text-purple-400',
      bgColor: 'hover:bg-purple-500/20',
    },
    {
      icon: Search,
      label: 'Search',
      action: () => {
        // Trigger global search
        actions.addNotification({
          type: 'info',
          title: 'Global Search',
          message: 'Search functionality will be implemented here',
          read: false,
        });
      },
      color: 'text-yellow-400',
      bgColor: 'hover:bg-yellow-500/20',
    },
    {
      icon: Download,
      label: 'Export Data',
      action: () => {
        // Context-aware export
        actions.addNotification({
          type: 'info',
          title: 'Data Export',
          message: 'Export functionality for current page data',
          read: false,
        });
      },
      color: 'text-orange-400',
      bgColor: 'hover:bg-orange-500/20',
    },
    {
      icon: Settings,
      label: 'Quick Settings',
      action: () => router.push('/settings'),
      color: 'text-slate-400',
      bgColor: 'hover:bg-slate-500/20',
    },
  ];

  return (
    <>
      {/* Quick Actions Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-full right-0 mb-2"
          >
            <Card className="bg-slate-800/95 border-slate-600 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-2 w-64">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        action.action();
                        setIsOpen(false);
                        actions.logAction('quick_action', { action: action.label });
                      }}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200',
                        'hover:bg-white/10 text-white',
                        action.bgColor
                      )}
                    >
                      <action.icon className={cn('h-5 w-5', action.color)} />
                      <span className="text-xs font-medium">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
                
                {/* Context-aware suggestions */}
                {state.pageAwareness.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs text-slate-400 mb-2">Page Suggestions:</p>
                    <div className="space-y-1">
                      {state.pageAwareness.suggestions.slice(0, 2).map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left text-xs text-blue-300 hover:text-blue-200 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                          onClick={() => {
                            actions.addNotification({
                              type: 'info',
                              title: 'AI Suggestion',
                              message: `Executing: ${suggestion}`,
                              read: false,
                            });
                            setIsOpen(false);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
      >
        <Zap className="h-4 w-4" />
      </Button>
    </>
  );
}
