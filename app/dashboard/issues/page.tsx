'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
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
  Bug,
  AlertCircle,
  MessageSquare,
  Calendar,
  Flag,
  Edit,
  Archive
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

const issuesReports = [
  {
    id: 1,
    timestamp: '2024-02-20T10:30:15Z',
    type: 'bug',
    priority: 'high',
    status: 'open',
    title: 'AI Chat Response Timeout',
    description: 'Users experiencing timeout errors when sending messages to AI chat after 30 seconds',
    reporter: 'admin@wrdo.com',
    assignee: 'dev@wrdo.com',
    category: 'ai-features',
    tags: ['chat', 'timeout', 'ai'],
    details: {
      affectedUsers: 15,
      errorRate: '12%',
      lastOccurrence: '2024-02-20T10:25:00Z',
      environment: 'production'
    }
  },
  {
    id: 2,
    timestamp: '2024-02-20T10:25:42Z',
    type: 'feature_request',
    priority: 'medium',
    status: 'in_progress',
    title: 'Dark Mode Toggle for Dashboard',
    description: 'Users requesting ability to switch between light and dark themes in dashboard',
    reporter: 'user@wrdo.com',
    assignee: 'design@wrdo.com',
    category: 'ui-ux',
    tags: ['dark-mode', 'theme', 'dashboard'],
    details: {
      votes: 23,
      estimatedEffort: '2 weeks',
      designStatus: 'in_review',
      priority: 'medium'
    }
  },
  {
    id: 3,
    timestamp: '2024-02-20T10:20:18Z',
    type: 'performance',
    priority: 'critical',
    status: 'open',
    title: 'Database Query Performance Degradation',
    description: 'Dashboard loading times increased by 300% due to inefficient database queries',
    reporter: 'monitor@wrdo.com',
    assignee: 'backend@wrdo.com',
    category: 'performance',
    tags: ['database', 'performance', 'queries'],
    details: {
      avgLoadTime: '4.2s',
      previousLoadTime: '1.1s',
      affectedQueries: 8,
      impact: 'all_users'
    }
  },
  {
    id: 4,
    timestamp: '2024-02-20T10:15:33Z',
    type: 'security',
    priority: 'critical',
    status: 'resolved',
    title: 'API Key Exposure in Client Code',
    description: 'OpenAI API key was accidentally exposed in client-side JavaScript bundle',
    reporter: 'security@wrdo.com',
    assignee: 'security@wrdo.com',
    category: 'security',
    tags: ['api-key', 'exposure', 'security'],
    details: {
      exposedKey: 'sk-***',
      exposureDuration: '2 hours',
      keyRotated: true,
      affectedBuilds: 3
    }
  },
  {
    id: 5,
    timestamp: '2024-02-20T10:10:07Z',
    type: 'bug',
    priority: 'low',
    status: 'closed',
    title: 'Minor UI Alignment Issue in Settings',
    description: 'Save button slightly misaligned in general settings form on mobile devices',
    reporter: 'qa@wrdo.com',
    assignee: 'frontend@wrdo.com',
    category: 'ui-ux',
    tags: ['mobile', 'alignment', 'settings'],
    details: {
      devices: ['iPhone 12', 'Samsung Galaxy S21'],
      browsers: ['Safari', 'Chrome Mobile'],
      severity: 'cosmetic',
      fixComplexity: 'trivial'
    }
  },
  {
    id: 6,
    timestamp: '2024-02-20T10:05:55Z',
    type: 'enhancement',
    priority: 'medium',
    status: 'planned',
    title: 'Export Dashboard Data to PDF',
    description: 'Add functionality to export dashboard metrics and charts as PDF reports',
    reporter: 'business@wrdo.com',
    assignee: 'backend@wrdo.com',
    category: 'features',
    tags: ['export', 'pdf', 'reports'],
    details: {
      requestedBy: 'enterprise_customers',
      businessValue: 'high',
      technicalComplexity: 'medium',
      estimatedDelivery: 'Q2 2024'
    }
  }
];

const issueMetrics = [
  { day: 'Mon', bugs: 5, features: 3, performance: 2, security: 1 },
  { day: 'Tue', bugs: 7, features: 4, performance: 1, security: 2 },
  { day: 'Wed', bugs: 4, features: 6, performance: 3, security: 0 },
  { day: 'Thu', bugs: 8, features: 2, performance: 4, security: 1 },
  { day: 'Fri', bugs: 6, features: 5, performance: 2, security: 3 },
  { day: 'Sat', bugs: 3, features: 1, performance: 1, security: 0 },
  { day: 'Sun', bugs: 2, features: 2, performance: 0, security: 1 },
];

export default function IssuesReportsDashboard() {
  const { state, actions } = useWRDO();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  const [issueStats, setIssueStats] = useState({
    totalIssues: issuesReports.length,
    openIssues: issuesReports.filter(issue => issue.status === 'open').length,
    inProgressIssues: issuesReports.filter(issue => issue.status === 'in_progress').length,
    resolvedIssues: issuesReports.filter(issue => issue.status === 'resolved').length,
    closedIssues: issuesReports.filter(issue => issue.status === 'closed').length,
    criticalIssues: issuesReports.filter(issue => issue.priority === 'critical').length,
    highIssues: issuesReports.filter(issue => issue.priority === 'high').length,
    bugReports: issuesReports.filter(issue => issue.type === 'bug').length,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        issueStats,
        issuesTracked: issuesReports.length,
        filterType,
        filterPriority,
        filterStatus,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [issueStats, filterType, filterPriority, filterStatus, state.currentUser?.id]);

  const filteredIssues = issuesReports.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || issue.type === filterType;
    const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'high': return 'text-orange-300 border-orange-400/30 bg-orange-500/10';
      case 'medium': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'low': return 'text-blue-300 border-blue-400/30 bg-blue-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'in_progress': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'resolved': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'closed': return 'text-slate-300 border-slate-400/30 bg-slate-500/10';
      case 'planned': return 'text-blue-300 border-blue-400/30 bg-blue-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="h-4 w-4" />;
      case 'feature_request': return <Plus className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'security': return <Lock className="h-4 w-4" />;
      case 'enhancement': return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Issues & Reports</h1>
          <p className="text-slate-400">Track bugs, feature requests, and system issues</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-red-300 border-red-400/30">
            {issueStats.openIssues} Open
          </Badge>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            New Issue
          </Button>
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
            title: 'Total Issues',
            value: issueStats.totalIssues,
            change: 'All reports',
            icon: FileText,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Open',
            value: issueStats.openIssues,
            change: 'Active',
            icon: AlertCircle,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
          },
          {
            title: 'In Progress',
            value: issueStats.inProgressIssues,
            change: 'Working',
            icon: Clock,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
          {
            title: 'Resolved',
            value: issueStats.resolvedIssues,
            change: 'Fixed',
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Closed',
            value: issueStats.closedIssues,
            change: 'Complete',
            icon: Archive,
            color: 'text-slate-400',
            bgColor: 'bg-slate-500/10',
          },
          {
            title: 'Critical',
            value: issueStats.criticalIssues,
            change: 'Urgent',
            icon: XCircle,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
          },
          {
            title: 'High Priority',
            value: issueStats.highIssues,
            change: 'Important',
            icon: AlertTriangle,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
          },
          {
            title: 'Bug Reports',
            value: issueStats.bugReports,
            change: 'Bugs',
            icon: Bug,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
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

      {/* Issues Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Issues Activity (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issueMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="bugs" stackId="a" fill="#EF4444" name="Bugs" />
                <Bar dataKey="features" stackId="a" fill="#3B82F6" name="Features" />
                <Bar dataKey="performance" stackId="a" fill="#F59E0B" name="Performance" />
                <Bar dataKey="security" stackId="a" fill="#EF4444" name="Security" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Issues List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Issues & Reports
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-slate-700 border-slate-600 text-white"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  <SelectItem value="bug" className="text-white">Bug</SelectItem>
                  <SelectItem value="feature_request" className="text-white">Feature Request</SelectItem>
                  <SelectItem value="performance" className="text-white">Performance</SelectItem>
                  <SelectItem value="security" className="text-white">Security</SelectItem>
                  <SelectItem value="enhancement" className="text-white">Enhancement</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Priority</SelectItem>
                  <SelectItem value="critical" className="text-white">Critical</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="open" className="text-white">Open</SelectItem>
                  <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                  <SelectItem value="resolved" className="text-white">Resolved</SelectItem>
                  <SelectItem value="closed" className="text-white">Closed</SelectItem>
                  <SelectItem value="planned" className="text-white">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-slate-600/50">
                        {getTypeIcon(issue.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                            {getPriorityIcon(issue.priority)}
                            <span className="ml-1 uppercase text-xs">{issue.priority}</span>
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(issue.status)}>
                            {issue.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-slate-400">#{issue.id}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-400">
                            {new Date(issue.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold mb-1">{issue.title}</h3>
                        <p className="text-slate-300 text-sm mb-2">{issue.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Reporter: {issue.reporter}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Assignee: {issue.assignee}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            {issue.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {issue.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs text-slate-400 border-slate-600">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-white border-slate-600"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="text-blue-300 border-blue-600">
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedIssue(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Issue Details #{selectedIssue.id}</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedIssue(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Title</p>
                <p className="text-white">{selectedIssue.title}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Description</p>
                <p className="text-white">{selectedIssue.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Type</p>
                  <p className="text-white">{selectedIssue.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Priority</p>
                  <Badge variant="outline" className={getPriorityColor(selectedIssue.priority)}>
                    {selectedIssue.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <Badge variant="outline" className={getStatusColor(selectedIssue.status)}>
                    {selectedIssue.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Category</p>
                  <p className="text-white">{selectedIssue.category}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Reporter</p>
                <p className="text-white">{selectedIssue.reporter}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Assignee</p>
                <p className="text-white">{selectedIssue.assignee}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Tags</p>
                <div className="flex gap-2">
                  {selectedIssue.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-slate-400 border-slate-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedIssue.details && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Additional Details</p>
                  <pre className="text-sm text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedIssue.details, null, 2)}
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
