'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Monitor, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Wifi,
  Cpu,
  HardDrive,
  MemoryStick,
  Zap,
  Globe,
  Shield
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

const systemServices = [
  {
    id: 1,
    name: 'WRDO Cave API',
    type: 'api',
    status: 'healthy',
    uptime: 99.9,
    responseTime: 45,
    lastCheck: '2024-02-20T10:30:00Z',
    endpoint: 'https://api.wrdo.com/health',
    location: 'Primary',
  },
  {
    id: 2,
    name: 'AI Model Gateway',
    type: 'service',
    status: 'healthy',
    uptime: 99.7,
    responseTime: 120,
    lastCheck: '2024-02-20T10:29:00Z',
    endpoint: 'https://ai.wrdo.com/status',
    location: 'Primary',
  },
  {
    id: 3,
    name: 'Database Cluster',
    type: 'database',
    status: 'warning',
    uptime: 98.5,
    responseTime: 200,
    lastCheck: '2024-02-20T10:28:00Z',
    endpoint: 'postgresql://wrdo-db',
    location: 'Primary',
  },
  {
    id: 4,
    name: 'CDN Network',
    type: 'cdn',
    status: 'healthy',
    uptime: 99.95,
    responseTime: 25,
    lastCheck: '2024-02-20T10:30:00Z',
    endpoint: 'https://cdn.wrdo.com',
    location: 'Global',
  },
  {
    id: 5,
    name: 'Authentication Service',
    type: 'auth',
    status: 'critical',
    uptime: 95.2,
    responseTime: 500,
    lastCheck: '2024-02-20T10:25:00Z',
    endpoint: 'https://auth.wrdo.com/health',
    location: 'Primary',
  },
];

const performanceMetrics = [
  { time: '00:00', cpu: 45, memory: 62, disk: 78, network: 34 },
  { time: '04:00', cpu: 52, memory: 68, disk: 79, network: 42 },
  { time: '08:00', cpu: 78, memory: 85, disk: 81, network: 67 },
  { time: '12:00', cpu: 85, memory: 92, disk: 83, network: 78 },
  { time: '16:00', cpu: 72, memory: 88, disk: 84, network: 65 },
  { time: '20:00', cpu: 58, memory: 75, disk: 82, network: 45 },
];

const alertHistory = [
  {
    id: 1,
    type: 'critical',
    service: 'Authentication Service',
    message: 'High response time detected (>400ms)',
    timestamp: '2024-02-20T10:25:00Z',
    resolved: false,
  },
  {
    id: 2,
    type: 'warning',
    service: 'Database Cluster',
    message: 'Connection pool utilization above 80%',
    timestamp: '2024-02-20T09:45:00Z',
    resolved: false,
  },
  {
    id: 3,
    type: 'info',
    service: 'WRDO Cave API',
    message: 'Scheduled maintenance completed successfully',
    timestamp: '2024-02-20T08:00:00Z',
    resolved: true,
  },
];

export default function MonitoringDashboard() {
  const { state, actions } = useWRDO();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [monitoringStats, setMonitoringStats] = useState({
    totalServices: systemServices.length,
    healthyServices: systemServices.filter(service => service.status === 'healthy').length,
    warningServices: systemServices.filter(service => service.status === 'warning').length,
    criticalServices: systemServices.filter(service => service.status === 'critical').length,
    avgUptime: systemServices.reduce((sum, service) => sum + service.uptime, 0) / systemServices.length,
    avgResponseTime: systemServices.reduce((sum, service) => sum + service.responseTime, 0) / systemServices.length,
    activeAlerts: alertHistory.filter(alert => !alert.resolved).length,
    systemLoad: 72,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        monitoringStats,
        servicesTracked: systemServices.length,
        filterStatus,
        filterType,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [monitoringStats, filterStatus, filterType, state.currentUser?.id]);

  const filteredServices = systemServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    const matchesType = filterType === 'all' || service.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'warning': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'critical': return 'text-red-300 border-red-400/30 bg-red-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return <Globe className="h-4 w-4" />;
      case 'service': return <Server className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'cdn': return <Wifi className="h-4 w-4" />;
      case 'auth': return <Shield className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'warning': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'info': return 'text-blue-300 border-blue-400/30 bg-blue-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Monitoring</h1>
          <p className="text-slate-400">Monitor system health, performance, and service availability</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-300 border-green-400/30">
            {monitoringStats.avgUptime.toFixed(1)}% Uptime
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Monitor
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
        {[
          {
            title: 'Total Services',
            value: monitoringStats.totalServices,
            change: 'Monitored',
            icon: Monitor,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Healthy',
            value: monitoringStats.healthyServices,
            change: 'Services',
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Warning',
            value: monitoringStats.warningServices,
            change: 'Services',
            icon: AlertTriangle,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
          {
            title: 'Critical',
            value: monitoringStats.criticalServices,
            change: 'Services',
            icon: XCircle,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
          },
          {
            title: 'Avg Uptime',
            value: `${monitoringStats.avgUptime.toFixed(1)}%`,
            change: 'Last 30d',
            icon: TrendingUp,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Response Time',
            value: `${Math.round(monitoringStats.avgResponseTime)}ms`,
            change: 'Average',
            icon: Zap,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Active Alerts',
            value: monitoringStats.activeAlerts,
            change: 'Unresolved',
            icon: AlertTriangle,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
          },
          {
            title: 'System Load',
            value: `${monitoringStats.systemLoad}%`,
            change: 'Current',
            icon: Activity,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Performance (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceMetrics}>
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
                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="CPU %" />
                <Area type="monotone" dataKey="memory" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Memory %" />
                <Area type="monotone" dataKey="disk" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Disk %" />
                <Area type="monotone" dataKey="network" stackId="4" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Network %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Services Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Service Status
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-slate-700 border-slate-600 text-white"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="healthy" className="text-white">Healthy</SelectItem>
                  <SelectItem value="warning" className="text-white">Warning</SelectItem>
                  <SelectItem value="critical" className="text-white">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  <SelectItem value="api" className="text-white">API</SelectItem>
                  <SelectItem value="service" className="text-white">Service</SelectItem>
                  <SelectItem value="database" className="text-white">Database</SelectItem>
                  <SelectItem value="cdn" className="text-white">CDN</SelectItem>
                  <SelectItem value="auth" className="text-white">Auth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div key={service.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-600/50">
                        {getTypeIcon(service.type)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{service.name}</h3>
                        <p className="text-xs text-slate-400">{service.endpoint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(service.status)}>
                        {getStatusIcon(service.status)}
                        <span className="ml-1 capitalize">{service.status}</span>
                      </Badge>
                      <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                        {service.location}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Uptime</p>
                      <p className="text-lg font-semibold text-white">{service.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Response Time</p>
                      <p className="text-lg font-semibold text-white">{service.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Last Check</p>
                      <p className="text-sm text-white">{new Date(service.lastCheck).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-white border-slate-600">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="text-white border-slate-600">
                        Test Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertHistory.map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getAlertTypeColor(alert.type)}>
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-slate-300">{alert.service}</span>
                        {alert.resolved && (
                          <Badge variant="outline" className="text-green-300 border-green-400/30 bg-green-500/10">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-white mb-1">{alert.message}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <Button variant="outline" size="sm" className="text-white border-slate-600">
                        Resolve
                      </Button>
                    )}
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
