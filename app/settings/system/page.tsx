'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Server, 
  Database, 
  Shield, 
  Lock, 
  Key, 
  RefreshCw, 
  Power, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Globe,
  Zap,
  Download,
  Upload,
  Save,
  Trash2,
  Plus,
  Minus,
  Edit,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  FileText,
  Code,
  Terminal,
  Bug,
  AlertCircle,
  Info,
  Bell,
  Mail,
  Smartphone,
  Tablet,
  Users,
  UserCheck,
  UserX,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Filter,
  Search,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share2
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const systemMetrics = {
  uptime: '15 days, 8 hours',
  cpuUsage: 23.5,
  memoryUsage: 67.2,
  diskUsage: 45.8,
  networkIn: 1.2,
  networkOut: 0.8,
  activeConnections: 156,
  totalRequests: 2847392,
  errorRate: 0.02,
  responseTime: 145
};

const systemServices = [
  {
    id: 1,
    name: 'Web Server',
    status: 'running',
    port: 3000,
    uptime: '15 days',
    memory: '256 MB',
    cpu: '12%',
    restarts: 0,
    lastRestart: '2024-02-05T10:30:00Z'
  },
  {
    id: 2,
    name: 'Database',
    status: 'running',
    port: 5432,
    uptime: '15 days',
    memory: '512 MB',
    cpu: '8%',
    restarts: 0,
    lastRestart: '2024-02-05T10:30:00Z'
  },
  {
    id: 3,
    name: 'Redis Cache',
    status: 'running',
    port: 6379,
    uptime: '15 days',
    memory: '128 MB',
    cpu: '3%',
    restarts: 1,
    lastRestart: '2024-02-10T14:20:00Z'
  },
  {
    id: 4,
    name: 'Background Jobs',
    status: 'running',
    port: null,
    uptime: '15 days',
    memory: '64 MB',
    cpu: '5%',
    restarts: 0,
    lastRestart: '2024-02-05T10:30:00Z'
  },
  {
    id: 5,
    name: 'File Storage',
    status: 'warning',
    port: 9000,
    uptime: '14 days',
    memory: '32 MB',
    cpu: '2%',
    restarts: 3,
    lastRestart: '2024-02-18T09:15:00Z'
  },
  {
    id: 6,
    name: 'Email Service',
    status: 'stopped',
    port: 587,
    uptime: '0 days',
    memory: '0 MB',
    cpu: '0%',
    restarts: 5,
    lastRestart: '2024-02-19T16:45:00Z'
  }
];

const systemLogs = [
  {
    id: 1,
    timestamp: '2024-02-20T11:45:32Z',
    level: 'info',
    service: 'Web Server',
    message: 'Server started successfully on port 3000',
    details: 'Application initialization completed'
  },
  {
    id: 2,
    timestamp: '2024-02-20T11:42:18Z',
    level: 'warning',
    service: 'File Storage',
    message: 'High memory usage detected',
    details: 'Memory usage exceeded 80% threshold'
  },
  {
    id: 3,
    timestamp: '2024-02-20T11:38:45Z',
    level: 'error',
    service: 'Email Service',
    message: 'Failed to connect to SMTP server',
    details: 'Connection timeout after 30 seconds'
  },
  {
    id: 4,
    timestamp: '2024-02-20T11:35:12Z',
    level: 'info',
    service: 'Database',
    message: 'Backup completed successfully',
    details: 'Database backup saved to /backups/db_20240220.sql'
  },
  {
    id: 5,
    timestamp: '2024-02-20T11:30:00Z',
    level: 'info',
    service: 'Background Jobs',
    message: 'Scheduled maintenance completed',
    details: 'Cleaned up 1,247 expired sessions'
  }
];

const performanceData = [
  { time: '11:00', cpu: 15, memory: 62, disk: 45, network: 1.1 },
  { time: '11:15', cpu: 18, memory: 64, disk: 45, network: 1.3 },
  { time: '11:30', cpu: 22, memory: 66, disk: 46, network: 1.2 },
  { time: '11:45', cpu: 25, memory: 68, disk: 46, network: 1.4 },
  { time: '12:00', cpu: 20, memory: 65, disk: 45, network: 1.0 },
  { time: '12:15', cpu: 23, memory: 67, disk: 46, network: 1.2 },
  { time: '12:30', cpu: 19, memory: 63, disk: 45, network: 0.9 },
];

export default function SystemControlsSettings() {
  const { state, actions } = useWRDO();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupInterval: '24',
    logLevel: 'info',
    maxLogSize: '100',
    sessionTimeout: '30',
    maxConnections: '1000',
    rateLimitEnabled: true,
    rateLimitRequests: '100',
    rateLimitWindow: '60',
    sslEnabled: true,
    compressionEnabled: true,
    cachingEnabled: true,
    cacheExpiry: '3600',
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        systemMetrics,
        systemSettings,
        activeTab,
        servicesCount: systemServices.length,
        runningServices: systemServices.filter(s => s.status === 'running').length,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [systemMetrics, systemSettings, activeTab, state.currentUser?.id]);

  const filteredLogs = systemLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'warning': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'stopped': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'error': return 'text-red-300 border-red-400/30 bg-red-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'stopped': return <XCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-300 border-blue-400/30 bg-blue-500/10';
      case 'warning': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'error': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'debug': return 'text-purple-300 border-purple-400/30 bg-purple-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="h-3 w-3" />;
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'error': return <XCircle className="h-3 w-3" />;
      case 'debug': return <Bug className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const formatUptime = (uptime: string) => {
    return uptime;
  };

  const formatBytes = (bytes: string) => {
    return bytes;
  };

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleServiceAction = (service: any, action: string) => {
    console.log(`${action} service:`, service.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Controls</h1>
          <p className="text-slate-400">Monitor system performance, manage services, and configure system settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-300 border-green-400/30">
            Uptime: {systemMetrics.uptime}
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button variant="outline" className="text-white border-slate-600">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700">
        {[
          { id: 'overview', label: 'Overview', icon: Monitor },
          { id: 'services', label: 'Services', icon: Server },
          { id: 'logs', label: 'System Logs', icon: FileText },
          { id: 'settings', label: 'System Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'CPU Usage',
                value: `${systemMetrics.cpuUsage}%`,
                change: 'Normal range',
                icon: Cpu,
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10',
              },
              {
                title: 'Memory Usage',
                value: `${systemMetrics.memoryUsage}%`,
                change: 'Within limits',
                icon: MemoryStick,
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
              },
              {
                title: 'Disk Usage',
                value: `${systemMetrics.diskUsage}%`,
                change: 'Healthy',
                icon: HardDrive,
                color: 'text-purple-400',
                bgColor: 'bg-purple-500/10',
              },
              {
                title: 'Active Connections',
                value: systemMetrics.activeConnections.toString(),
                change: 'Current sessions',
                icon: Network,
                color: 'text-yellow-400',
                bgColor: 'bg-yellow-500/10',
              },
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                        <metric.icon className={`h-4 w-4 ${metric.color}`} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{metric.change}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Performance (Last 2 hours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
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
                    <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} name="Memory %" />
                    <Line type="monotone" dataKey="disk" stroke="#8B5CF6" strokeWidth={2} name="Disk %" />
                    <Line type="monotone" dataKey="network" stroke="#F59E0B" strokeWidth={2} name="Network MB/s" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Request Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Requests</span>
                    <span className="text-white font-semibold">{systemMetrics.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Error Rate</span>
                    <span className="text-white font-semibold">{systemMetrics.errorRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Response Time</span>
                    <span className="text-white font-semibold">{systemMetrics.responseTime}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inbound Traffic</span>
                    <span className="text-white font-semibold">{systemMetrics.networkIn} MB/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Outbound Traffic</span>
                    <span className="text-white font-semibold">{systemMetrics.networkOut} MB/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Connections</span>
                    <span className="text-white font-semibold">{systemMetrics.activeConnections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Service Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Running Services</span>
                    <span className="text-green-300 font-semibold">{systemServices.filter(s => s.status === 'running').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Warning Services</span>
                    <span className="text-yellow-300 font-semibold">{systemServices.filter(s => s.status === 'warning').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stopped Services</span>
                    <span className="text-red-300 font-semibold">{systemServices.filter(s => s.status === 'stopped').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemServices.map((service) => (
                  <div key={service.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-slate-600/50">
                          <Server className="h-4 w-4 text-slate-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getStatusColor(service.status)}>
                              {getStatusIcon(service.status)}
                              <span className="ml-1 uppercase text-xs">{service.status}</span>
                            </Badge>
                            {service.port && (
                              <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                                Port: {service.port}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-white font-semibold mb-2">{service.name}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
                            <span>Uptime: {service.uptime}</span>
                            <span>Memory: {service.memory}</span>
                            <span>CPU: {service.cpu}</span>
                            <span>Restarts: {service.restarts}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-white border-slate-600"
                          onClick={() => handleServiceAction(service, 'restart')}
                        >
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Restart
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={service.status === 'running' ? 'text-red-400 border-red-600' : 'text-green-400 border-green-600'}
                          onClick={() => handleServiceAction(service, service.status === 'running' ? 'stop' : 'start')}
                        >
                          {service.status === 'running' ? (
                            <>
                              <Power className="h-3 w-3 mr-2" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Power className="h-3 w-3 mr-2" />
                              Start
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-white border-slate-600"
                          onClick={() => {
                            setSelectedService(service);
                            setShowServiceModal(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-slate-700 border-slate-600 text-white"
            />
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Log Level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all" className="text-white">All Levels</SelectItem>
                <SelectItem value="info" className="text-white">Info</SelectItem>
                <SelectItem value="warning" className="text-white">Warning</SelectItem>
                <SelectItem value="error" className="text-white">Error</SelectItem>
                <SelectItem value="debug" className="text-white">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                System Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getLevelColor(log.level)}>
                          {getLevelIcon(log.level)}
                          <span className="ml-1 uppercase text-xs">{log.level}</span>
                        </Badge>
                        <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                          {log.service}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-white font-medium mb-1">{log.message}</p>
                    <p className="text-sm text-slate-400">{log.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">System Configuration</h2>
            <Button className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Maintenance Mode</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className={systemSettings.maintenanceMode ? 'text-red-400 border-red-600' : 'text-green-400 border-green-600'}
                    onClick={() => handleSettingChange('maintenanceMode', !systemSettings.maintenanceMode)}
                  >
                    {systemSettings.maintenanceMode ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Debug Mode</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className={systemSettings.debugMode ? 'text-yellow-400 border-yellow-600' : 'text-slate-400 border-slate-600'}
                    onClick={() => handleSettingChange('debugMode', !systemSettings.debugMode)}
                  >
                    {systemSettings.debugMode ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Session Timeout (minutes)</label>
                  <Input
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Max Connections</label>
                  <Input
                    value={systemSettings.maxConnections}
                    onChange={(e) => handleSettingChange('maxConnections', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    type="number"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security & Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">SSL Enabled</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className={systemSettings.sslEnabled ? 'text-green-400 border-green-600' : 'text-red-400 border-red-600'}
                    onClick={() => handleSettingChange('sslEnabled', !systemSettings.sslEnabled)}
                  >
                    {systemSettings.sslEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Rate Limiting</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className={systemSettings.rateLimitEnabled ? 'text-green-400 border-green-600' : 'text-red-400 border-red-600'}
                    onClick={() => handleSettingChange('rateLimitEnabled', !systemSettings.rateLimitEnabled)}
                  >
                    {systemSettings.rateLimitEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Rate Limit (requests/minute)</label>
                  <Input
                    value={systemSettings.rateLimitRequests}
                    onChange={(e) => handleSettingChange('rateLimitRequests', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    type="number"
                    disabled={!systemSettings.rateLimitEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Compression</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className={systemSettings.compressionEnabled ? 'text-green-400 border-green-600' : 'text-red-400 border-red-600'}
                    onClick={() => handleSettingChange('compressionEnabled', !systemSettings.compressionEnabled)}
                  >
                    {systemSettings.compressionEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Backup & Logging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Auto Backup</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className={systemSettings.autoBackup ? 'text-green-400 border-green-600' : 'text-red-400 border-red-600'}
                    onClick={() => handleSettingChange('autoBackup', !systemSettings.autoBackup)}
                  >
                    {systemSettings.autoBackup ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Backup Interval (hours)</label>
                  <Input
                    value={systemSettings.backupInterval}
                    onChange={(e) => handleSettingChange('backupInterval', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    type="number"
                    disabled={!systemSettings.autoBackup}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Log Level</label>
                  <Select value={systemSettings.logLevel} onValueChange={(value) => handleSettingChange('logLevel', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="debug" className="text-white">Debug</SelectItem>
                      <SelectItem value="info" className="text-white">Info</SelectItem>
                      <SelectItem value="warning" className="text-white">Warning</SelectItem>
                      <SelectItem value="error" className="text-white">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Max Log Size (MB)</label>
                  <Input
                    value={systemSettings.maxLogSize}
                    onChange={(e) => handleSettingChange('maxLogSize', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    type="number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
