
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  DollarSign, 
  FolderOpen, 
  Brain,
  Activity,
  AlertTriangle,
  Calendar,
  Globe,
  Search,
  FileText,
  Lock,
  TrendingUp,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWRDO } from '@/lib/wrdo-context';
import { useState } from 'react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  children?: NavItem[];
  permission?: string;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Main control center',
    children: [
      { title: 'Overview', href: '/dashboard', icon: BarChart3, description: 'System overview and metrics' },
      { title: 'Admin Panel', href: '/dashboard/admin', icon: Users, permission: 'admin.view', description: 'User and system management' },
      { title: 'AI Operations', href: '/dashboard/ai', icon: Brain, description: 'AI models, agents, and costs' },
      { title: 'Finances', href: '/dashboard/finances', icon: DollarSign, description: 'Financial tracking and analysis' },
      { title: 'Projects', href: '/dashboard/projects', icon: FolderOpen, description: 'Project management and tracking' },
      { title: 'Competitor Intel', href: '/dashboard/competitor', icon: Search, description: 'Competitive intelligence monitoring' },
      { title: 'IP Protection', href: '/dashboard/ip-protection', icon: Lock, description: 'Intellectual property management' },
      { title: 'Impact Assessment', href: '/dashboard/impact-assessment', icon: TrendingUp, description: 'Change impact analysis' },
      { title: 'Social Media', href: '/dashboard/social', icon: Activity, description: 'Social media analytics' },
    ]
  },
  {
    title: 'AI Chat',
    href: '/chat',
    icon: MessageSquare,
    description: 'Intelligent conversation interface',
    badge: 'AI'
  },
  {
    title: 'Monitoring',
    href: '/monitoring',
    icon: Activity,
    description: 'System monitoring and health',
    children: [
      { title: 'System Logs', href: '/dashboard/logs', icon: FileText, description: 'Comprehensive system logging' },
      { title: 'Security Events', href: '/dashboard/security', icon: Shield, description: 'Security monitoring and alerts' },
      { title: 'Issues & Reports', href: '/dashboard/issues', icon: AlertTriangle, description: 'Issue tracking and resolution' },
      { title: 'Performance', href: '/monitoring/performance', icon: Zap, description: 'System performance metrics' },
    ]
  },
  {
    title: 'Integrations',
    href: '/integrations',
    icon: Globe,
    description: 'External service management',
    children: [
      { title: 'API Management', href: '/integrations', icon: Globe, description: 'Manage all API connections' },
      { title: 'Email Systems', href: '/settings/email', icon: Bell, description: 'Gmail and email integrations' },
      { title: 'Payment Systems', href: '/settings/payments', icon: DollarSign, description: 'Paystack and payment processing' },
    ]
  },
  {
    title: 'Tasks & Calendar',
    href: '/dashboard/tasks',
    icon: Calendar,
    description: 'Task and schedule management'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration',
    children: [
      { title: 'General', href: '/settings', icon: Settings, description: 'General system settings' },
      { title: 'API Keys', href: '/settings/api', icon: Lock, description: 'API key management' },
      { title: 'SEO & Analytics', href: '/settings/seo', icon: TrendingUp, description: 'SEO and analytics configuration' },
      { title: 'System Controls', href: '/settings/system', icon: Zap, description: 'Advanced system controls' },
    ]
  },
];

export function MainNav() {
  const pathname = usePathname();
  const { state } = useWRDO();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    return state.currentUser?.permissions.includes(permission) || state.currentUser?.role === 'admin';
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return pathname === href;
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!hasPermission(item.permission)) return null;

    const isActive = isActiveRoute(item.href);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.href} className={cn('relative', level > 0 && 'ml-4')}>
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
            'hover:bg-white/10 hover:text-white',
            isActive 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
              : 'text-slate-300',
            level > 0 && 'text-xs py-1.5'
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <item.icon className={cn('h-4 w-4', level > 0 && 'h-3.5 w-3.5')} />
          <span className="flex-1">{item.title}</span>
          
          {item.badge && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
              {item.badge}
            </Badge>
          )}
          
          {state.notifications.filter(n => !n.read).length > 0 && item.href === '/monitoring' && (
            <Badge variant="destructive" className="bg-red-500/20 text-red-200 border-red-400/30">
              {state.notifications.filter(n => !n.read).length}
            </Badge>
          )}
        </Link>

        {hasChildren && (isActive || level === 0) && (
          <div className={cn('mt-1 space-y-1', level > 0 && 'ml-2')}>
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <nav className={cn(
        'fixed left-0 top-0 z-40 h-full w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 transition-transform duration-300',
        'lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 font-bold text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span>WRDO CAVE</span>
            </Link>
            
            {/* System Status Indicator */}
            <div className="flex items-center gap-1">
              <div className={cn(
                'h-2 w-2 rounded-full',
                state.systemHealth.aiStatus === 'healthy' ? 'bg-green-400' : 'bg-red-400'
              )} />
              <span className="text-xs text-slate-400">
                {state.systemHealth.aiStatus}
              </span>
            </div>
          </div>

          {/* User Info */}
          {state.currentUser && (
            <div className="border-b border-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                  {state.currentUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {state.currentUser.name}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {state.currentUser.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-2">
              {navigationItems.map(item => renderNavItem(item))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700/50 p-4">
            <div className="text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>WRDO Cave Ultra</span>
                <span className="text-green-400">v2.0</span>
              </div>
              {state.selectedModel && (
                <div className="mt-1 flex items-center gap-2">
                  <Brain className="h-3 w-3" />
                  <span className="truncate">{state.selectedModel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
