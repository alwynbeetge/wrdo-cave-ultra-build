'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Wifi,
  User,
  Settings,
  Zap,
  Globe,
  Lock,
  Eye,
  Trash2,
  RefreshCw,
  Ban,
  Key,
  UserX,
  FileText,
  AlertCircle
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

const securityEvents = [
  {
    id: 1,
    timestamp: '2024-02-20T10:30:15Z',
    severity: 'critical',
    type: 'brute_force',
    title: 'Multiple Failed Login Attempts',
    description: 'Detected 15 failed login attempts from IP 203.0.113.45 targeting admin@wrdo.com',
    source: 'authentication-service',
    targetUser: 'admin@wrdo.com',
    sourceIp: '203.0.113.45',
    status: 'blocked',
    details: {
      attempts: 15,
      timeWindow: '5 minutes',
      action: 'IP blocked for 24 hours',
      location: 'Unknown'
    }
  },
  {
    id: 2,
    timestamp: '2024-02-20T10:25:42Z',
    severity: 'high',
    type: 'unauthorized_access',
    title: 'Unauthorized API Access Attempt',
    description: 'Invalid API key used to access protected endpoint /api/admin/users',
    source: 'api-gateway',
    targetUser: null,
    sourceIp: '192.168.1.200',
    status: 'blocked',
    details: {
      endpoint: '/api/admin/users',
      apiKey: 'sk-invalid-***',
      userAgent: 'curl/7.68.0',
      location: 'Internal Network'
    }
  },
  {
    id: 3,
    timestamp: '2024-02-20T10:20:18Z',
    severity: 'medium',
    type: 'suspicious_activity',
    title: 'Unusual Login Location',
    description: 'User logged in from new geographic location: Tokyo, Japan',
    source: 'geo-monitor',
    targetUser: 'user@wrdo.com',
    sourceIp: '103.5.140.25',
    status: 'monitored',
    details: {
      previousLocation: 'New York, USA',
      newLocation: 'Tokyo, Japan',
      timeSinceLastLogin: '2 hours',
      deviceFingerprint: 'new_device'
    }
  },
  {
    id: 4,
    timestamp: '2024-02-20T10:15:33Z',
    severity: 'low',
    type: 'rate_limit',
    title: 'API Rate Limit Exceeded',
    description: 'User exceeded API rate limit for chat completions endpoint',
    source: 'rate-limiter',
    targetUser: 'developer@wrdo.com',
    sourceIp: '10.0.1.50',
    status: 'throttled',
    details: {
      endpoint: '/api/chat/completions',
      requestCount: 1000,
      timeWindow: '1 hour',
      limit: 500
    }
  },
  {
    id: 5,
    timestamp: '2024-02-20T10:10:07Z',
    severity: 'critical',
    type: 'data_breach_attempt',
    title: 'SQL Injection Attempt Detected',
    description: 'Malicious SQL injection attempt blocked on user registration form',
    source: 'waf-service',
    targetUser: null,
    sourceIp: '45.33.32.156',
    status: 'blocked',
    details: {
      payload: "'; DROP TABLE users; --",
      endpoint: '/api/auth/register',
      wafRule: 'SQL_INJECTION_001',
      location: 'Unknown'
    }
  },
  {
    id: 6,
    timestamp: '2024-02-20T10:05:55Z',
    severity: 'medium',
    type: 'privilege_escalation',
    title: 'Privilege Escalation Attempt',
    description: 'User attempted to access admin panel without proper permissions',
    source: 'authorization-service',
    targetUser: 'user@wrdo.com',
    sourceIp: '172.16.0.25',
    status: 'denied',
    details: {
      requestedResource: '/dashboard/admin',
      userRole: 'user',
      requiredRole: 'admin',
      sessionId: 'sess_abc123'
    }
  }
];

const securityMetrics = [
  { hour: '06:00', critical: 0, high: 2, medium: 5, low: 8 },
  { hour: '07:00', critical: 1, high: 3, medium: 7, low: 12 },
  { hour: '08:00', critical: 0, high: 4, medium: 9, low: 15 },
  { hour: '09:00', critical: 2, high: 6, medium: 11, low: 18 },
  { hour: '10:00', critical: 3, high: 8, medium: 13, low: 22 },
  { hour: '11:00', critical: 1, high: 5, medium: 10, low: 16 },
];

export default function SecurityEventsDashboard() {
  const { state, actions } = useWRDO();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const [securityStats, setSecurityStats] = useState({
    totalEvents: securityEvents.length,
    criticalEvents: securityEvents.filter(event => event.severity === 'critical').length,
    highEvents: securityEvents.filter(event => event.severity === 'high').length,
    mediumEvents: securityEvents.filter(event => event.severity === 'medium').length,
    lowEvents: securityEvents.filter(event => event.severity === 'low').length,
    blockedEvents: securityEvents.filter(event => event.status === 'blocked').length,
    activeThreats: securityEvents.filter(event => event.status === 'monitored' || event.status === 'active').length,
    lastHourEvents: securityEvents.filter(event => {
      const eventTime = new Date(event.timestamp);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return eventTime > oneHourAgo;
    }).length,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        securityStats,
        eventsTracked: securityEvents.length,
        filterSeverity,
        filterType,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [securityStats, filterSeverity, filterType, state.currentUser?.id]);

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.targetUser && event.targetUser.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesSeverity && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'high': return 'text-orange-300 border-orange-400/30 bg-orange-500/10';
      case 'medium': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'low': return 'text-blue-300 border-blue-400/30 bg-blue-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'brute_force': return <Ban className="h-4 w-4" />;
      case 'unauthorized_access': return <Lock className="h-4 w-4" />;
      case 'suspicious_activity': return <Eye className="h-4 w-4" />;
      case 'rate_limit': return <Clock className="h-4 w-4" />;
      case 'data_breach_attempt': return <Shield className="h-4 w-4" />;
      case 'privilege_escalation': return <Key className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'monitored': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'denied': return 'text-orange-300 border-orange-400/30 bg-orange-500/10';
      case 'throttled': return 'text-blue-300 border-blue-400/30 bg-blue-500/10';
      case 'resolved': return 'text-green-300 border-green-400/30 bg-green-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Events</h1>
          <p className="text-slate-400">Monitor security threats, incidents, and system protection</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-red-300 border-red-400/30">
            {securityStats.criticalEvents} Critical
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
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
            title: 'Total Events',
            value: securityStats.totalEvents,
            change: 'All events',
            icon: Shield,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Critical',
            value: securityStats.criticalEvents,
            change: 'High priority',
            icon: XCircle,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
          },
          {
            title: 'High',
            value: securityStats.highEvents,
            change: 'Urgent',
            icon: AlertTriangle,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
          },
          {
            title: 'Medium',
            value: securityStats.mediumEvents,
            change: 'Moderate',
            icon: AlertCircle,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
          {
            title: 'Low',
            value: securityStats.lowEvents,
            change: 'Minor',
            icon: CheckCircle,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Blocked',
            value: securityStats.blockedEvents,
            change: 'Prevented',
            icon: Ban,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Active Threats',
            value: securityStats.activeThreats,
            change: 'Monitoring',
            icon: Eye,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Last Hour',
            value: securityStats.lastHourEvents,
            change: 'Recent',
            icon: Clock,
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
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

      {/* Security Events Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Security Events (6 hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={securityMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="critical" stackId="a" fill="#EF4444" name="Critical" />
                <Bar dataKey="high" stackId="a" fill="#F97316" name="High" />
                <Bar dataKey="medium" stackId="a" fill="#F59E0B" name="Medium" />
                <Bar dataKey="low" stackId="a" fill="#3B82F6" name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Security Events
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-slate-700 border-slate-600 text-white"
              />
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Severity</SelectItem>
                  <SelectItem value="critical" className="text-white">Critical</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  <SelectItem value="brute_force" className="text-white">Brute Force</SelectItem>
                  <SelectItem value="unauthorized_access" className="text-white">Unauthorized Access</SelectItem>
                  <SelectItem value="suspicious_activity" className="text-white">Suspicious Activity</SelectItem>
                  <SelectItem value="rate_limit" className="text-white">Rate Limit</SelectItem>
                  <SelectItem value="data_breach_attempt" className="text-white">Data Breach Attempt</SelectItem>
                  <SelectItem value="privilege_escalation" className="text-white">Privilege Escalation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-slate-600/50">
                        {getTypeIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getSeverityColor(event.severity)}>
                            {getSeverityIcon(event.severity)}
                            <span className="ml-1 uppercase text-xs">{event.severity}</span>
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(event.status)}>
                            {event.status.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold mb-1">{event.title}</h3>
                        <p className="text-slate-300 text-sm mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Server className="h-3 w-3" />
                            Source: {event.source}
                          </span>
                          {event.sourceIp && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              IP: {event.sourceIp}
                            </span>
                          )}
                          {event.targetUser && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Target: {event.targetUser}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-white border-slate-600"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        Details
                      </Button>
                      {event.status !== 'blocked' && event.status !== 'resolved' && (
                        <Button variant="outline" size="sm" className="text-red-300 border-red-600">
                          <Ban className="h-3 w-3 mr-2" />
                          Block
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Security Event Details</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Timestamp</p>
                <p className="text-white">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Severity</p>
                <Badge variant="outline" className={getSeverityColor(selectedEvent.severity)}>
                  {selectedEvent.severity.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Type</p>
                <p className="text-white">{selectedEvent.type.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Title</p>
                <p className="text-white">{selectedEvent.title}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Description</p>
                <p className="text-white">{selectedEvent.description}</p>
              </div>
              {selectedEvent.details && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Details</p>
                  <pre className="text-sm text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
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
