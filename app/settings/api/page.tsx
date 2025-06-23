'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Key, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Copy,
  ExternalLink,
  Save,
  Shield,
  Zap,
  FileText,
  Calendar,
  User,
  Database,
  Server,
  Smartphone,
  Monitor,
  Code,
  Activity,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

const apiKeys = [
  {
    id: 1,
    name: 'OpenAI API Key',
    service: 'OpenAI',
    key: 'sk-proj-***********************************************',
    status: 'active',
    lastUsed: '2024-02-20T10:30:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    permissions: ['chat', 'completions', 'embeddings'],
    usage: {
      requests: 15420,
      tokens: 2840000,
      cost: 284.50
    },
    rateLimit: {
      rpm: 3500,
      tpm: 90000
    }
  },
  {
    id: 2,
    name: 'Google AI API Key',
    service: 'Google AI',
    key: 'AIza***********************************************',
    status: 'active',
    lastUsed: '2024-02-20T09:15:00Z',
    createdAt: '2024-01-20T14:30:00Z',
    expiresAt: '2024-11-30T23:59:59Z',
    permissions: ['generate', 'embed', 'count-tokens'],
    usage: {
      requests: 8920,
      tokens: 1560000,
      cost: 156.80
    },
    rateLimit: {
      rpm: 1000,
      tpm: 32000
    }
  },
  {
    id: 3,
    name: 'DeepSeek API Key',
    service: 'DeepSeek',
    key: 'sk-***********************************************',
    status: 'active',
    lastUsed: '2024-02-19T16:45:00Z',
    createdAt: '2024-02-01T11:20:00Z',
    expiresAt: '2025-02-01T11:20:00Z',
    permissions: ['chat', 'completions'],
    usage: {
      requests: 3450,
      tokens: 890000,
      cost: 89.20
    },
    rateLimit: {
      rpm: 500,
      tpm: 20000
    }
  },
  {
    id: 4,
    name: 'Database API Key',
    service: 'Internal',
    key: 'wrdo_***********************************************',
    status: 'active',
    lastUsed: '2024-02-20T11:00:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    expiresAt: null,
    permissions: ['read', 'write', 'admin'],
    usage: {
      requests: 45680,
      tokens: 0,
      cost: 0
    },
    rateLimit: {
      rpm: 10000,
      tpm: 0
    }
  },
  {
    id: 5,
    name: 'Webhook API Key',
    service: 'Internal',
    key: 'whk_***********************************************',
    status: 'inactive',
    lastUsed: '2024-02-15T12:20:00Z',
    createdAt: '2024-01-25T16:45:00Z',
    expiresAt: '2024-03-01T00:00:00Z',
    permissions: ['webhook'],
    usage: {
      requests: 120,
      tokens: 0,
      cost: 0
    },
    rateLimit: {
      rpm: 100,
      tpm: 0
    }
  }
];

const usageStats = [
  { date: '2024-02-14', requests: 4200, tokens: 420000, cost: 42.50 },
  { date: '2024-02-15', requests: 3800, tokens: 380000, cost: 38.20 },
  { date: '2024-02-16', requests: 5200, tokens: 520000, cost: 52.80 },
  { date: '2024-02-17', requests: 6500, tokens: 650000, cost: 65.30 },
  { date: '2024-02-18', requests: 5800, tokens: 580000, cost: 58.90 },
  { date: '2024-02-19', requests: 7200, tokens: 720000, cost: 72.40 },
  { date: '2024-02-20', requests: 8900, tokens: 890000, cost: 89.60 },
];

export default function APIKeysSettings() {
  const { state, actions } = useWRDO();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());

  const [apiKeyStats, setApiKeyStats] = useState({
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.filter(k => k.status === 'active').length,
    totalRequests: apiKeys.reduce((acc, k) => acc + k.usage.requests, 0),
    totalCost: apiKeys.reduce((acc, k) => acc + k.usage.cost, 0),
    totalTokens: apiKeys.reduce((acc, k) => acc + k.usage.tokens, 0),
    avgRpm: Math.round(apiKeys.reduce((acc, k) => acc + k.rateLimit.rpm, 0) / apiKeys.length),
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        apiKeyStats,
        keysConfigured: apiKeys.length,
        activeKeys: apiKeys.filter(k => k.status === 'active').length,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [apiKeyStats, state.currentUser?.id]);

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || key.status === filterStatus;
    const matchesService = filterService === 'all' || key.service === filterService;
    return matchesSearch && matchesStatus && matchesService;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'inactive': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'expired': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'expired': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'openai': return <Zap className="h-4 w-4" />;
      case 'google ai': return <Globe className="h-4 w-4" />;
      case 'deepseek': return <Code className="h-4 w-4" />;
      case 'internal': return <Server className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const toggleKeyVisibility = (keyId: number) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  };

  const uniqueServices = Array.from(new Set(apiKeys.map(k => k.service)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Keys Management</h1>
          <p className="text-slate-400">Manage API keys, monitor usage, and configure access permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-300 border-green-400/30">
            {apiKeyStats.activeKeys} Active
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateKey(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New API Key
          </Button>
          <Button variant="outline" className="text-white border-slate-600">
            <Download className="h-4 w-4 mr-2" />
            Export Keys
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            title: 'Total Keys',
            value: apiKeyStats.totalKeys,
            change: 'Configured',
            icon: Key,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Active',
            value: apiKeyStats.activeKeys,
            change: 'In use',
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Requests',
            value: formatNumber(apiKeyStats.totalRequests),
            change: 'Total made',
            icon: Activity,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Tokens',
            value: formatNumber(apiKeyStats.totalTokens),
            change: 'Processed',
            icon: Database,
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
          },
          {
            title: 'Cost',
            value: formatCurrency(apiKeyStats.totalCost),
            change: 'Total spent',
            icon: TrendingUp,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
          },
          {
            title: 'Avg RPM',
            value: formatNumber(apiKeyStats.avgRpm),
            change: 'Rate limit',
            icon: BarChart3,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
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

      {/* Usage Statistics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              API Usage Analytics (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageStats}>
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
                <Area type="monotone" dataKey="requests" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Requests" />
                <Area type="monotone" dataKey="tokens" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Tokens (K)" />
                <Area type="monotone" dataKey="cost" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Cost ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* API Keys Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search API keys..."
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
                  <SelectItem value="inactive" className="text-white">Inactive</SelectItem>
                  <SelectItem value="expired" className="text-white">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Services</SelectItem>
                  {uniqueServices.map((service) => (
                    <SelectItem key={service} value={service} className="text-white">{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredKeys.map((key) => (
                <div key={key.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-slate-600/50">
                        {getServiceIcon(key.service)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getStatusColor(key.status)}>
                            {getStatusIcon(key.status)}
                            <span className="ml-1 uppercase text-xs">{key.status}</span>
                          </Badge>
                          <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                            {key.service}
                          </Badge>
                          {isExpiringSoon(key.expiresAt) && (
                            <Badge variant="outline" className="text-yellow-300 border-yellow-400/30">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-white font-semibold mb-2">{key.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono">
                            {visibleKeys.has(key.id) ? key.key : key.key.replace(/(?<=.{8}).*(?=.{8})/g, '*'.repeat(35))}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-400 border-slate-600"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {visibleKeys.has(key.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-400 border-slate-600"
                            onClick={() => copyToClipboard(key.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300 mb-2">
                          <span>Requests: {formatNumber(key.usage.requests)}</span>
                          <span>Tokens: {formatNumber(key.usage.tokens)}</span>
                          <span>Cost: {formatCurrency(key.usage.cost)}</span>
                          <span>RPM: {formatNumber(key.rateLimit.rpm)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs text-slate-400 border-slate-500">
                              {permission}
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
                        onClick={() => setSelectedKey(key)}
                      >
                        <Settings className="h-3 w-3 mr-2" />
                        Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-white border-slate-600"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-400 border-red-600 hover:bg-red-600/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
