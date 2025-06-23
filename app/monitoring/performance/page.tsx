'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Server,
  Database,
  Wifi,
  User,
  Settings,
  Globe,
  Lock,
  Eye,
  Trash2,
  RefreshCw,
  Ban,
  Key,
  UserX,
  Bug,
  AlertCircle,
  MessageSquare,
  Calendar,
  Flag,
  Edit,
  Archive,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Timer
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

const performanceMetrics = [
  {
    id: 1,
    timestamp: '2024-02-20T10:30:00Z',
    service: 'api-gateway',
    metric: 'response_time',
    value: 245,
    unit: 'ms',
    threshold: 500,
    status: 'healthy',
    details: {
      p50: 180,
      p95: 420,
      p99: 680,
      requests: 1250
    }
  },
  {
    id: 2,
    timestamp: '2024-02-20T10:30:00Z',
    service: 'database',
    metric: 'cpu_usage',
    value: 78,
    unit: '%',
    threshold: 80,
    status: 'warning',
    details: {
      cores: 4,
      loadAverage: 3.2,
      processes: 45,
      threads: 180
    }
  },
  {
    id: 3,
    timestamp: '2024-02-20T10:30:00Z',
    service: 'ai-service',
    metric: 'memory_usage',
    value: 6.8,
    unit: 'GB',
    threshold: 8.0,
    status: 'healthy',
    details: {
      totalMemory: 16,
      availableMemory: 9.2,
      bufferCache: 2.1,
      swap: 0.5
    }
  },
  {
    id: 4,
    timestamp: '2024-02-20T10:30:00Z',
    service: 'frontend',
    metric: 'page_load_time',
    value: 1.8,
    unit: 's',
    threshold: 3.0,
    status: 'healthy',
    details: {
      domContentLoaded: 0.9,
      firstContentfulPaint: 1.2,
      largestContentfulPaint: 1.8,
      cumulativeLayoutShift: 0.05
    }
  },
  {
    id: 5,
    timestamp: '2024-02-20T10:30:00Z',
    service: 'chat-service',
    metric: 'throughput',
    value: 450,
    unit: 'req/min',
    threshold: 1000,
    status: 'healthy',
    details: {
      successRate: 99.2,
      errorRate: 0.8,
      avgResponseSize: '2.4KB',
      concurrentUsers: 85
    }
  },
  {
    id: 6,
    timestamp: '2024-02-20T10:30:00Z',
    service: 'storage',
    metric: 'disk_usage',
    value: 85,
    unit: '%',
    threshold: 90,
    status: 'warning',
    details: {
      totalSpace: '500GB',
      usedSpace: '425GB',
      freeSpace: '75GB',
      inodes: 95
    }
  }
];

const performanceHistory = [
  { time: '10:00', responseTime: 180, cpuUsage: 65, memoryUsage: 5.2, throughput: 380 },
  { time: '10:05', responseTime: 195, cpuUsage: 70, memoryUsage: 5.8, throughput: 420 },
  { time: '10:10', responseTime: 210, cpuUsage: 72, memoryUsage: 6.1, throughput: 445 },
  { time: '10:15', responseTime: 225, cpuUsage: 75, memoryUsage: 6.4, throughput: 465 },
  { time: '10:20', responseTime: 235, cpuUsage: 76, memoryUsage: 6.6, throughput: 450 },
  { time: '10:25', responseTime: 240, cpuUsage: 78, memoryUsage: 6.8, throughput: 450 },
  { time: '10:30', responseTime: 245, cpuUsage: 78, memoryUsage: 6.8, throughput: 450 },
];

export default function PerformanceDashboard() {
  const { state, actions } = useWRDO();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState<any>(null);

  const [performanceStats, setPerformanceStats] = useState({
    totalMetrics: performanceMetrics.length,
    healthyServices: performanceMetrics.filter(metric => metric.status === 'healthy').length,
    warningServices: performanceMetrics.filter(metric => metric.status === 'warning').length,
    criticalServices: performanceMetrics.filter(metric => metric.status === 'critical').length,
    avgResponseTime: Math.round(performanceMetrics.filter(m => m.metric === 'response_time').reduce((acc, m) => acc + m.value, 0) / performanceMetrics.filter(m => m.metric === 'response_time').length || 0),
    avgCpuUsage: Math.round(performanceMetrics.filter(m => m.metric === 'cpu_usage').reduce((acc, m) => acc + m.value, 0) / performanceMetrics.filter(m => m.metric === 'cpu_usage').length || 0),
    avgMemoryUsage: Math.round(performanceMetrics.filter(m => m.metric === 'memory_usage').reduce((acc, m) => acc + m.value, 0) / performanceMetrics.filter(m => m.metric === 'memory_usage').length * 10) / 10 || 0,
    totalThroughput: performanceMetrics.filter(m => m.metric === 'throughput').reduce((acc, m) => acc + m.value, 0),
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        performanceStats,
        metricsTracked: performanceMetrics.length,
        filterService,
        filterStatus,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [performanceStats, filterService, filterStatus, state.currentUser?.id]);

  const filteredMetrics = performanceMetrics.filter(metric => {
    const matchesSearch = metric.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.metric.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === 'all' || metric.service === filterService;
    const matchesStatus = filterStatus === 'all' || metric.status === filterStatus;
    return matchesSearch && matchesService && matchesStatus;
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

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'response_time': return <Timer className="h-4 w-4" />;
      case 'cpu_usage': return <Cpu className="h-4 w-4" />;
      case 'memory_usage': return <MemoryStick className="h-4 w-4" />;
      case 'page_load_time': return <Globe className="h-4 w-4" />;
      case 'throughput': return <Activity className="h-4 w-4" />;
      case 'disk_usage': return <HardDrive className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'api-gateway': return <Server className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'ai-service': return <Zap className="h-4 w-4" />;
      case 'frontend': return <Globe className="h-4 w-4" />;
      case 'chat-service': return <MessageSquare className="h-4 w-4" />;
      case 'storage': return <HardDrive className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms' || unit === 's') {
      return `${value}${unit}`;
    } else if (unit === '%') {
      return `${value}%`;
    } else if (unit === 'GB') {
      return `${value}GB`;
    } else if (unit === 'req/min') {
      return `${value} req/min`;
    }
    return `${value} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Performance Monitoring</h1>
          <p className="text-slate-400">Real-time system performance metrics and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-yellow-300 border-yellow-400/30">
            {performanceStats.warningServices} Warnings
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Metrics
          </Button>
          <Button variant="outline" className="text-white border-slate-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
        {[
          {
            title: 'Total Metrics',
            value: performanceStats.totalMetrics,
            change: 'All services',
            icon: BarChart3,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Healthy',
            value: performanceStats.healthyServices,
            change: 'Good status',
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Warnings',
            value: performanceStats.warningServices,
            change: 'Need attention',
            icon: AlertTriangle,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
          {
            title: 'Critical',
            value: performanceStats.criticalServices,
            change: 'Urgent',
            icon: XCircle,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
          },
          {
            title: 'Avg Response',
            value: `${performanceStats.avgResponseTime}ms`,
            change: 'Response time',
            icon: Timer,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Avg CPU',
            value: `${performanceStats.avgCpuUsage}%`,
            change: 'CPU usage',
            icon: Cpu,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
          },
          {
            title: 'Avg Memory',
            value: `${performanceStats.avgMemoryUsage}GB`,
            change: 'Memory usage',
            icon: MemoryStick,
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
          },
          {
            title: 'Throughput',
            value: `${performanceStats.totalThroughput}`,
            change: 'req/min',
            icon: Activity,
            color: 'text-pink-400',
            bgColor: 'bg-pink-500/10',
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

      {/* Performance History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends (30 minutes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceHistory}>
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
                <Line type="monotone" dataKey="responseTime" stroke="#8B5CF6" strokeWidth={2} name="Response Time (ms)" />
                <Line type="monotone" dataKey="cpuUsage" stroke="#F59E0B" strokeWidth={2} name="CPU Usage (%)" />
                <Line type="monotone" dataKey="memoryUsage" stroke="#06B6D4" strokeWidth={2} name="Memory Usage (GB)" />
                <Line type="monotone" dataKey="throughput" stroke="#10B981" strokeWidth={2} name="Throughput (req/min)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Metrics List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search metrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-slate-700 border-slate-600 text-white"
              />
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Services</SelectItem>
                  <SelectItem value="api-gateway" className="text-white">API Gateway</SelectItem>
                  <SelectItem value="database" className="text-white">Database</SelectItem>
                  <SelectItem value="ai-service" className="text-white">AI Service</SelectItem>
                  <SelectItem value="frontend" className="text-white">Frontend</SelectItem>
                  <SelectItem value="chat-service" className="text-white">Chat Service</SelectItem>
                  <SelectItem value="storage" className="text-white">Storage</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMetrics.map((metric) => (
                <div key={metric.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-slate-600/50">
                        {getServiceIcon(metric.service)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getStatusColor(metric.status)}>
                            {getStatusIcon(metric.status)}
                            <span className="ml-1 uppercase text-xs">{metric.status}</span>
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(metric.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold mb-1 capitalize">
                          {metric.service.replace('-', ' ')} - {metric.metric.replace('_', ' ')}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-300 mb-2">
                          <span className="flex items-center gap-1">
                            {getMetricIcon(metric.metric)}
                            Current: {formatValue(metric.value, metric.unit)}
                          </span>
                          <span className="text-slate-400">
                            Threshold: {formatValue(metric.threshold, metric.unit)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            metric.value <= metric.threshold ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {metric.value <= metric.threshold ? 'Within limits' : 'Exceeds threshold'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              metric.value <= metric.threshold ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-white border-slate-600"
                        onClick={() => setSelectedMetric(metric)}
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
      </motion.div>

      {/* Metric Details Modal */}
      {selectedMetric && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMetric(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Performance Metric Details</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedMetric(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Service</p>
                  <p className="text-white capitalize">{selectedMetric.service.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Metric</p>
                  <p className="text-white capitalize">{selectedMetric.metric.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Current Value</p>
                  <p className="text-white">{formatValue(selectedMetric.value, selectedMetric.unit)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Threshold</p>
                  <p className="text-white">{formatValue(selectedMetric.threshold, selectedMetric.unit)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <Badge variant="outline" className={getStatusColor(selectedMetric.status)}>
                    {selectedMetric.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Last Updated</p>
                  <p className="text-white">{new Date(selectedMetric.timestamp).toLocaleString()}</p>
                </div>
              </div>
              {selectedMetric.details && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Additional Details</p>
                  <pre className="text-sm text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedMetric.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
