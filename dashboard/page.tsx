
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Brain, 
  DollarSign, 
  FolderOpen, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ArrowUpRight,
  BarChart3,
  Shield
} from 'lucide-react';
import { useWRDO } from '@/lib/wrdo-context';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

// Sample data for charts
const systemMetrics = [
  { time: '00:00', cpu: 45, memory: 62, ai_requests: 23 },
  { time: '04:00', cpu: 42, memory: 58, ai_requests: 18 },
  { time: '08:00', cpu: 68, memory: 71, ai_requests: 45 },
  { time: '12:00', cpu: 75, memory: 73, ai_requests: 52 },
  { time: '16:00', cpu: 82, memory: 78, ai_requests: 48 },
  { time: '20:00', cpu: 65, memory: 69, ai_requests: 35 },
];

const aiUsageData = [
  { name: 'GPT-4o', value: 45, cost: 24.50 },
  { name: 'Gemini Pro', value: 30, cost: 8.20 },
  { name: 'DeepSeek', value: 25, cost: 3.10 },
];

const COLORS = ['#60B5FF', '#FF9149', '#FF9898'];

export default function DashboardOverview() {
  const { state, actions } = useWRDO();
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 12,
    activeAgents: 3,
    monthlySpend: 1247.89,
    systemUptime: '99.8%',
    pendingTasks: 8,
    securityAlerts: 2,
    apiConnections: 8,
    dataProcessed: '2.4TB'
  });

  useEffect(() => {
    // Update dashboard data in context
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        dashboardStats,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });

    // Simulate real-time updates
    const interval = setInterval(() => {
      setDashboardStats(prev => ({
        ...prev,
        pendingTasks: Math.max(0, prev.pendingTasks + Math.floor(Math.random() * 3) - 1),
        monthlySpend: prev.monthlySpend + Math.random() * 10 - 5,
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, [actions, dashboardStats, state.currentUser?.id]);

  const statCards = [
    {
      title: 'Active Projects',
      value: dashboardStats.totalProjects,
      change: '+2 this week',
      icon: FolderOpen,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'AI Agents',
      value: dashboardStats.activeAgents,
      change: 'All operational',
      icon: Brain,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Monthly Spend',
      value: `$${dashboardStats.monthlySpend.toFixed(2)}`,
      change: '+12% vs last month',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'System Uptime',
      value: dashboardStats.systemUptime,
      change: 'Excellent',
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Pending Tasks',
      value: dashboardStats.pendingTasks,
      change: '-3 since yesterday',
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    {
      title: 'Security Status',
      value: dashboardStats.securityAlerts,
      change: 'alerts active',
      icon: Shield,
      color: dashboardStats.securityAlerts > 0 ? 'text-red-400' : 'text-green-400',
      bgColor: dashboardStats.securityAlerts > 0 ? 'bg-red-500/10' : 'bg-green-500/10',
      borderColor: dashboardStats.securityAlerts > 0 ? 'border-red-500/20' : 'border-green-500/20',
    },
  ];

  const quickActions = [
    { label: 'New Project', href: '/dashboard/projects?action=create', icon: FolderOpen },
    { label: 'AI Chat', href: '/chat', icon: Brain },
    { label: 'View Finances', href: '/dashboard/finances', icon: DollarSign },
    { label: 'System Settings', href: '/settings/system', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">WRDO Cave Ultra Dashboard</h1>
          <p className="text-slate-400">Autonomous AI Operations Control Center</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-300 border-green-400/30">
            System Operational
          </Badge>
          <Badge variant="outline" className="text-blue-300 border-blue-400/30">
            AI Active
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-slate-800/50 border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Performance (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={systemMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#60B5FF" fill="#60B5FF" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="memory" stackId="1" stroke="#FF9149" fill="#FF9149" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="ai_requests" stackId="1" stroke="#FF9898" fill="#FF9898" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Model Usage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Model Usage & Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={aiUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {aiUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-16 flex flex-col gap-2 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                  onClick={() => window.location.href = action.href}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'success', message: 'AI model fallback successful - GPT-4o → Gemini Pro', time: '2 minutes ago' },
                { type: 'info', message: 'New project "Market Analysis Q1" created', time: '15 minutes ago' },
                { type: 'warning', message: 'API rate limit approaching for Paystack integration', time: '1 hour ago' },
                { type: 'success', message: 'Weekly database backup completed successfully', time: '2 hours ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                  {activity.type === 'success' && <CheckCircle className="h-4 w-4 text-green-400" />}
                  {activity.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                  {activity.type === 'info' && <Activity className="h-4 w-4 text-blue-400" />}
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.message}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
