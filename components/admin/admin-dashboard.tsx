
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Shield, 
  Database, 
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { User } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    systemHealth: 'healthy'
  })
  const [isInitializing, setIsInitializing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch admin stats
    const fetchStats = async () => {
      try {
        // Mock data for now - in real implementation, these would be API calls
        setSystemStats({
          totalUsers: 5,
          activeUsers: 3,
          totalSessions: 42,
          systemHealth: 'healthy'
        })
      } catch (error) {
        console.error('Failed to fetch admin stats:', error)
      }
    }

    fetchStats()
  }, [])

  const initializeRoles = async () => {
    setIsInitializing(true)
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Default roles have been initialized.',
        })
      } else {
        throw new Error('Failed to initialize roles')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize roles. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const adminStats = [
    {
      title: 'Total Users',
      value: systemStats.totalUsers.toString(),
      description: 'Registered accounts',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Active Sessions',
      value: systemStats.activeUsers.toString(),
      description: 'Currently online',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'System Health',
      value: 'Healthy',
      description: 'All systems operational',
      icon: CheckCircle,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Total Sessions',
      value: systemStats.totalSessions.toString(),
      description: 'Since deployment',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    }
  ]

  const quickActions = [
    {
      title: 'Initialize Roles',
      description: 'Set up default user roles and permissions',
      action: initializeRoles,
      loading: isInitializing,
      icon: Shield,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'View Audit Logs',
      description: 'Check system activity and security logs',
      action: () => toast({ title: 'Feature coming soon', description: 'Audit logs view will be available soon.' }),
      loading: false,
      icon: Clock,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'System Settings',
      description: 'Configure global system parameters',
      action: () => toast({ title: 'Feature coming soon', description: 'System settings will be available soon.' }),
      loading: false,
      icon: Settings,
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ]

  const recentEvents = [
    {
      event: 'User registration',
      user: user.email,
      time: '2 minutes ago',
      type: 'success'
    },
    {
      event: 'System health check',
      user: 'System',
      time: '15 minutes ago',
      type: 'info'
    },
    {
      event: 'Database backup',
      user: 'System',
      time: '1 hour ago',
      type: 'success'
    },
    {
      event: 'Role assignment',
      user: 'Admin',
      time: '2 hours ago',
      type: 'info'
    }
  ]

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
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
        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-400" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Common administrative tasks and system management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <action.icon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">{action.title}</p>
                      <p className="text-xs text-gray-400">{action.description}</p>
                    </div>
                  </div>
                  <Button
                    onClick={action.action}
                    disabled={action.loading}
                    size="sm"
                    className={action.color}
                  >
                    {action.loading ? 'Loading...' : 'Execute'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-400" />
              <span>Recent Events</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest system activities and administrative actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    event.type === 'success' ? 'bg-green-400' : 
                    event.type === 'warning' ? 'bg-yellow-400' : 
                    'bg-blue-400'
                  }`} />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-white">{event.event}</p>
                      <Badge variant="secondary" className="text-xs">
                        {event.user}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Database className="h-5 w-5 text-purple-400" />
            <span>System Status</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Current system health and operational status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Database</span>
                <Badge className="bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">API Services</span>
                <Badge className="bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">AI Services</span>
                <Badge className="bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Authentication</span>
                <Badge className="bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Storage</span>
                <Badge className="bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Monitoring</span>
                <Badge className="bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Running
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
