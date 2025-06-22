
'use client';

import React from 'react';
import { Activity, Wifi, Database, Brain, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWRDO } from '@/lib/wrdo-context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function WRDOStatusBar() {
  const { state } = useWRDO();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'offline':
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return '●';
      case 'degraded':
        return '◐';
      case 'offline':
      case 'error':
        return '○';
      default:
        return '◯';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50"
    >
      <div className="flex items-center justify-between px-4 py-2 text-xs">
        {/* Left: Page Context */}
        <div className="flex items-center gap-4">
          {state.currentPage && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Page:</span>
              <Badge variant="outline" className="text-blue-300 border-blue-400/30">
                {state.currentPage.title}
              </Badge>
              
              {state.pageAwareness.entitiesOnPage.length > 0 && (
                <Badge variant="outline" className="text-purple-300 border-purple-400/30">
                  {state.pageAwareness.entitiesOnPage.length} items
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Center: System Status */}
        <div className="flex items-center gap-6">
          {/* AI Status */}
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            <span className={cn('text-xs', getStatusColor(state.systemHealth.aiStatus))}>
              {getStatusIcon(state.systemHealth.aiStatus)} AI
            </span>
          </div>

          {/* Database Status */}
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            <span className={cn('text-xs', getStatusColor(state.systemHealth.dbStatus))}>
              {getStatusIcon(state.systemHealth.dbStatus)} DB
            </span>
          </div>

          {/* API Status Summary */}
          <div className="flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            <span className="text-xs text-slate-400">
              APIs: {Object.values(state.systemHealth.apiStatus).filter(s => s === 'connected').length}/
              {Object.keys(state.systemHealth.apiStatus).length}
            </span>
          </div>

          {/* Active Notifications */}
          {state.notifications.filter(n => !n.read && n.type === 'error').length > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-400" />
              <span className="text-xs text-red-400">
                {state.notifications.filter(n => !n.read && n.type === 'error').length} alerts
              </span>
            </div>
          )}
        </div>

        {/* Right: Current AI Model & Quick Stats */}
        <div className="flex items-center gap-4">
          {state.selectedModel && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Model:</span>
              <Badge variant="outline" className="text-green-300 border-green-400/30">
                {state.selectedModel}
              </Badge>
            </div>
          )}

          {/* Current Time */}
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="h-3 w-3" />
            <span className="text-xs">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Page Suggestions Bar */}
      {state.pageAwareness.suggestions.length > 0 && (
        <div className="px-4 py-1 bg-blue-900/20 border-t border-blue-500/30">
          <div className="flex items-center gap-2 text-xs">
            <Brain className="h-3 w-3 text-blue-400" />
            <span className="text-blue-300">WRDO suggests:</span>
            <div className="flex items-center gap-2">
              {state.pageAwareness.suggestions.slice(0, 3).map((suggestion, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-blue-200 border-blue-400/30 hover:bg-blue-500/20 cursor-pointer transition-colors"
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
