
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Clock,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react'
import { User } from '@/lib/auth'

interface DashboardOverviewProps {
  user: User
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalChats: 0,
    totalProjects: 0,
    activeUsers: 0,
    systemStatus: 'operational'
  })

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // This would be actual API calls in a real implementation
        setStats({
          totalChats: 42,
          totalProjects: 8,
          activeUsers: 12,
          systemStatus: 'operational'
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      }
    }

    fetchStats()
  }, [])

  const quickStats = [
    {
      title: 'AI Conversations',
      value: stats.totalChats.toString(),
      description: 'Total chat sessions',
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Active Projects',
      value: stats.totalProjects.toString(),
      description: 'Projects in progress',
      icon: BarChart3,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'System Status',
      value: 'Operational',
      description: 'All systems running',
      icon: Shield,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Intelligence Level',
      value: 'High',
      description: 'AI performance optimal',
      icon: Brain,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    }
  ]

  const recentActivities = [
    {
      action: 'AI Chat Session Started',
      time: '2 minutes ago',
      type: 'chat'
    },
    {
      action: 'Project "Market Analysis" Updated',
      time: '15 minutes ago',
      type: 'project'
    },
    {
      action: 'System Health Check Completed',
      time: '1 hour ago',
      type: 'system'
    },
    {
      action: 'New User Registered',
      time: '2 hours ago',
      type: 'user'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-400" />
            <span>Welcome to WRDO Cave</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Your AI-powered intelligence platform is ready. Start exploring the capabilities below.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-gray-400">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest system activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Frequently used features and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  <span className="text-white">Start AI Chat</span>
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  Quick
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  <span className="text-white">View Analytics</span>
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Popular
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-purple-400" />
                  <span className="text-white">AI Intelligence</span>
                </div>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  New
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
