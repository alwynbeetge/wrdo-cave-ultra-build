'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Inbox,
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
  Server,
  Database,
  Wifi,
  User,
  Shield,
  Zap,
  FileText,
  Copy,
  ExternalLink,
  Save
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

const emailProviders = [
  {
    id: 1,
    name: 'Gmail SMTP',
    type: 'smtp',
    status: 'connected',
    host: 'smtp.gmail.com',
    port: 587,
    security: 'TLS',
    username: 'wrdo@getwrdo.com',
    lastUsed: '2024-02-20T10:30:00Z',
    emailsSent: 1250,
    deliveryRate: 98.5,
    bounceRate: 1.2,
    features: ['Authentication', 'Templates', 'Analytics']
  },
  {
    id: 2,
    name: 'SendGrid',
    type: 'api',
    status: 'connected',
    apiKey: 'SG.***************',
    lastUsed: '2024-02-20T09:15:00Z',
    emailsSent: 3420,
    deliveryRate: 99.2,
    bounceRate: 0.6,
    features: ['Templates', 'Analytics', 'Webhooks', 'A/B Testing']
  },
  {
    id: 3,
    name: 'Mailgun',
    type: 'api',
    status: 'configured',
    domain: 'mg.getwrdo.com',
    apiKey: 'key-***************',
    lastUsed: '2024-02-19T16:45:00Z',
    emailsSent: 890,
    deliveryRate: 97.8,
    bounceRate: 1.8,
    features: ['Templates', 'Analytics', 'Validation']
  },
  {
    id: 4,
    name: 'AWS SES',
    type: 'api',
    status: 'disabled',
    region: 'us-east-1',
    accessKey: 'AKIA***************',
    lastUsed: '2024-02-15T12:20:00Z',
    emailsSent: 0,
    deliveryRate: 0,
    bounceRate: 0,
    features: ['Templates', 'Analytics', 'Bounce Handling']
  }
];

const emailTemplates = [
  {
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to WRDO Cave Ultra!',
    type: 'transactional',
    status: 'active',
    lastModified: '2024-02-20T08:30:00Z',
    opens: 85.2,
    clicks: 12.4,
    usage: 145
  },
  {
    id: 2,
    name: 'Password Reset',
    subject: 'Reset Your Password',
    type: 'transactional',
    status: 'active',
    lastModified: '2024-02-19T14:15:00Z',
    opens: 92.1,
    clicks: 78.5,
    usage: 89
  },
  {
    id: 3,
    name: 'Weekly Report',
    subject: 'Your Weekly WRDO Summary',
    type: 'marketing',
    status: 'active',
    lastModified: '2024-02-18T10:00:00Z',
    opens: 68.7,
    clicks: 15.3,
    usage: 234
  },
  {
    id: 4,
    name: 'System Alert',
    subject: 'System Notification',
    type: 'system',
    status: 'draft',
    lastModified: '2024-02-17T16:30:00Z',
    opens: 0,
    clicks: 0,
    usage: 0
  }
];

const emailStats = [
  { date: '2024-02-14', sent: 420, delivered: 415, opened: 298, clicked: 45 },
  { date: '2024-02-15', sent: 380, delivered: 375, opened: 267, clicked: 38 },
  { date: '2024-02-16', sent: 520, delivered: 512, opened: 356, clicked: 62 },
  { date: '2024-02-17', sent: 650, delivered: 640, opened: 445, clicked: 78 },
  { date: '2024-02-18', sent: 580, delivered: 575, opened: 398, clicked: 65 },
  { date: '2024-02-19', sent: 720, delivered: 710, opened: 492, clicked: 89 },
  { date: '2024-02-20', sent: 890, delivered: 880, opened: 610, clicked: 125 },
];

export default function EmailSystemsSettings() {
  const { state, actions } = useWRDO();
  const [activeTab, setActiveTab] = useState('providers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [emailSystemStats, setEmailSystemStats] = useState({
    totalProviders: emailProviders.length,
    activeProviders: emailProviders.filter(p => p.status === 'connected').length,
    totalTemplates: emailTemplates.length,
    activeTemplates: emailTemplates.filter(t => t.status === 'active').length,
    totalEmailsSent: emailProviders.reduce((acc, p) => acc + p.emailsSent, 0),
    avgDeliveryRate: Math.round(emailProviders.reduce((acc, p) => acc + p.deliveryRate, 0) / emailProviders.length * 10) / 10,
    avgBounceRate: Math.round(emailProviders.reduce((acc, p) => acc + p.bounceRate, 0) / emailProviders.length * 10) / 10,
    avgOpenRate: Math.round(emailTemplates.reduce((acc, t) => acc + t.opens, 0) / emailTemplates.length * 10) / 10,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        emailSystemStats,
        activeTab,
        providersConfigured: emailProviders.length,
        templatesActive: emailTemplates.filter(t => t.status === 'active').length,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [emailSystemStats, activeTab, state.currentUser?.id]);

  const filteredProviders = emailProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredTemplates = emailTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'configured':
      case 'draft': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'disabled':
      case 'inactive': return 'text-red-300 border-red-400/30 bg-red-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'configured':
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'disabled':
      case 'inactive': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'smtp': return <Server className="h-4 w-4" />;
      case 'api': return <Zap className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'transactional': return <Send className="h-4 w-4" />;
      case 'marketing': return <TrendingUp className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Email Systems</h1>
          <p className="text-slate-400">Configure email providers, templates, and delivery settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-300 border-green-400/30">
            {emailSystemStats.activeProviders} Active
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
          <Button variant="outline" className="text-white border-slate-600">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
        {[
          {
            title: 'Providers',
            value: emailSystemStats.totalProviders,
            change: 'Total configured',
            icon: Server,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Active',
            value: emailSystemStats.activeProviders,
            change: 'Connected',
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Templates',
            value: emailSystemStats.totalTemplates,
            change: 'Available',
            icon: FileText,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Active Templates',
            value: emailSystemStats.activeTemplates,
            change: 'In use',
            icon: Send,
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
          },
          {
            title: 'Emails Sent',
            value: emailSystemStats.totalEmailsSent.toLocaleString(),
            change: 'Total',
            icon: Mail,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
          },
          {
            title: 'Delivery Rate',
            value: `${emailSystemStats.avgDeliveryRate}%`,
            change: 'Average',
            icon: TrendingUp,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Bounce Rate',
            value: `${emailSystemStats.avgBounceRate}%`,
            change: 'Average',
            icon: TrendingDown,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
          },
          {
            title: 'Open Rate',
            value: `${emailSystemStats.avgOpenRate}%`,
            change: 'Average',
            icon: Eye,
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

      {/* Email Statistics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Email Performance (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={emailStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Area type="monotone" dataKey="sent" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Sent" />
                <Area type="monotone" dataKey="delivered" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Delivered" />
                <Area type="monotone" dataKey="opened" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Opened" />
                <Area type="monotone" dataKey="clicked" stackId="4" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Clicked" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
        {[
          { id: 'providers', label: 'Email Providers', icon: Server },
          { id: 'templates', label: 'Templates', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'providers' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Server className="h-5 w-5" />
                Email Providers
              </CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <Input
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm bg-slate-700 border-slate-600 text-white"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All Status</SelectItem>
                    <SelectItem value="connected" className="text-white">Connected</SelectItem>
                    <SelectItem value="configured" className="text-white">Configured</SelectItem>
                    <SelectItem value="disabled" className="text-white">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProviders.map((provider) => (
                  <div key={provider.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-slate-600/50">
                          {getProviderIcon(provider.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getStatusColor(provider.status)}>
                              {getStatusIcon(provider.status)}
                              <span className="ml-1 uppercase text-xs">{provider.status}</span>
                            </Badge>
                            <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                              {provider.type.toUpperCase()}
                            </Badge>
                          </div>
                          <h3 className="text-white font-semibold mb-1">{provider.name}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300 mb-2">
                            <span>Emails Sent: {provider.emailsSent.toLocaleString()}</span>
                            <span>Delivery: {provider.deliveryRate}%</span>
                            <span>Bounce: {provider.bounceRate}%</span>
                            <span>Last Used: {new Date(provider.lastUsed).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {provider.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-slate-400 border-slate-500">
                                {feature}
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
                          onClick={() => setSelectedProvider(provider)}
                        >
                          <Settings className="h-3 w-3 mr-2" />
                          Configure
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-white border-slate-600"
                        >
                          <Send className="h-3 w-3 mr-2" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm bg-slate-700 border-slate-600 text-white"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All Status</SelectItem>
                    <SelectItem value="active" className="text-white">Active</SelectItem>
                    <SelectItem value="draft" className="text-white">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-slate-600/50">
                          {getTemplateIcon(template.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getStatusColor(template.status)}>
                              {getStatusIcon(template.status)}
                              <span className="ml-1 uppercase text-xs">{template.status}</span>
                            </Badge>
                            <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                              {template.type}
                            </Badge>
                          </div>
                          <h3 className="text-white font-semibold mb-1">{template.name}</h3>
                          <p className="text-slate-400 text-sm mb-2">{template.subject}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
                            <span>Usage: {template.usage}</span>
                            <span>Opens: {template.opens}%</span>
                            <span>Clicks: {template.clicks}%</span>
                            <span>Modified: {new Date(template.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-white border-slate-600"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-white border-slate-600"
                        >
                          <Copy className="h-3 w-3 mr-2" />
                          Clone
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">General Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Default From Name</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="WRDO Cave Ultra" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Default From Email</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="noreply@getwrdo.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Reply-To Email</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="support@getwrdo.com" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Delivery Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Rate Limit (emails/hour)</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="1000" type="number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Retry Attempts</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="3" type="number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Bounce Threshold (%)</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="5" type="number" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
