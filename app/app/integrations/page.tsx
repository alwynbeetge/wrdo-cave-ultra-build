
'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  Plus, 
  Key,
  Globe,
  Database,
  Mail,
  CreditCard,
  Github,
  MessageSquare,
  Zap,
  Search,
  Palette,
  BarChart3,
  Cloud
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { WRDOLayout } from '@/components/layout/wrdo-layout';
import { motion } from 'framer-motion';

// Sample integration data
const integrations = [
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'AI & ML',
    description: 'GPT models and AI capabilities',
    icon: Globe,
    status: 'connected',
    lastSync: '2024-01-20 14:30',
    requests: 12450,
    cost: 456.78,
    features: ['Chat Completion', 'Text Generation', 'Code Generation'],
    hasCredentials: true,
    priority: 'high',
  },
  {
    id: 'gmail',
    name: 'Gmail API',
    category: 'Communication',
    description: 'Email management and automation',
    icon: Mail,
    status: 'connected',
    lastSync: '2024-01-20 15:45',
    requests: 8920,
    cost: 0,
    features: ['Email Reading', 'Auto-Classification', 'Response Automation'],
    hasCredentials: true,
    priority: 'high',
  },
  {
    id: 'paystack',
    name: 'Paystack',
    category: 'Payments',
    description: 'Payment processing and financial data',
    icon: CreditCard,
    status: 'connected',
    lastSync: '2024-01-20 12:15',
    requests: 2340,
    cost: 89.45,
    features: ['Payment Processing', 'Transaction Analytics', 'Customer Data'],
    hasCredentials: true,
    priority: 'high',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Development',
    description: 'Code repository and project management',
    icon: Github,
    status: 'connected',
    lastSync: '2024-01-20 16:20',
    requests: 1580,
    cost: 0,
    features: ['Repository Access', 'Issue Tracking', 'Deployment Hooks'],
    hasCredentials: true,
    priority: 'medium',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'Deployment',
    description: 'Application deployment and hosting',
    icon: Cloud,
    status: 'connected',
    lastSync: '2024-01-20 13:10',
    requests: 890,
    cost: 25.00,
    features: ['Auto Deployment', 'Analytics', 'Performance Monitoring'],
    hasCredentials: true,
    priority: 'medium',
  },
  {
    id: 'hume',
    name: 'Hume.ai',
    category: 'AI & ML',
    description: 'Emotion detection and voice analysis',
    icon: MessageSquare,
    status: 'error',
    lastSync: '2024-01-19 09:30',
    requests: 450,
    cost: 45.00,
    features: ['Emotion Detection', 'Voice Analysis', 'Sentiment Tracking'],
    hasCredentials: false,
    priority: 'medium',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'AI & ML',
    description: 'Voice synthesis and audio generation',
    icon: MessageSquare,
    status: 'disabled',
    lastSync: null,
    requests: 0,
    cost: 0,
    features: ['Voice Synthesis', 'Audio Generation', 'Voice Cloning'],
    hasCredentials: false,
    priority: 'low',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'Communication',
    description: 'Messaging automation and customer support',
    icon: MessageSquare,
    status: 'disabled',
    lastSync: null,
    requests: 0,
    cost: 0,
    features: ['Message Automation', 'Customer Support', 'Broadcast Messages'],
    hasCredentials: false,
    priority: 'medium',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'Marketing',
    description: 'Email marketing and campaign management',
    icon: Mail,
    status: 'disabled',
    lastSync: null,
    requests: 0,
    cost: 0,
    features: ['Email Campaigns', 'Audience Management', 'Analytics'],
    hasCredentials: false,
    priority: 'low',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Automation',
    description: 'Workflow automation and app connections',
    icon: Zap,
    status: 'disabled',
    lastSync: null,
    requests: 0,
    cost: 0,
    features: ['Workflow Automation', 'App Connections', 'Trigger Management'],
    hasCredentials: false,
    priority: 'low',
  },
];

export default function IntegrationsPage() {
  // const { state, actions } = useWRDO();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Get user data for layout
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = {
      id: 'user_1',
      name: 'Admin User',
      email: 'admin@wrdo.cave',
      role: 'admin',
      permissions: ['admin.view', 'admin.manage', 'integrations.manage'],
    };
    setUser(userData);
  }, []);

  const [integrationStats, setIntegrationStats] = useState({
    totalIntegrations: integrations.length,
    connectedIntegrations: integrations.filter(i => i.status === 'connected').length,
    totalRequests: integrations.reduce((sum, i) => sum + i.requests, 0),
    totalCost: integrations.reduce((sum, i) => sum + i.cost, 0),
    errorCount: integrations.filter(i => i.status === 'error').length,
  });

  // useEffect(() => {
  //   actions.updateMemory({
  //     userId: state.currentUser?.id || 'unknown',
  //     pageContext: {
  //       integrationStats,
  //       filterCategory,
  //       filterStatus,
  //       lastUpdated: new Date(),
  //     },
  //     sessionContext: {},
  //     userPreferences: {},
  //     conversationHistory: []
  //   });
  // }, [integrationStats, filterCategory, filterStatus, actions, state.currentUser?.id]);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'disabled': return <AlertTriangle className="h-4 w-4 text-slate-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-300 border-green-400/30';
      case 'error': return 'text-red-300 border-red-400/30';
      case 'disabled': return 'text-slate-300 border-slate-400/30';
      default: return 'text-yellow-300 border-yellow-400/30';
    }
  };

  const handleToggleIntegration = (integrationId: string, enabled: boolean) => {
    console.log(`Integration ${integrationId} ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleConfigureIntegration = (integration: any) => {
    setSelectedIntegration(integration);
    setShowApiKeyModal(true);
  };

  const handleTestConnection = (integrationId: string) => {
    console.log(`Testing connection to ${integrationId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <WRDOLayout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">API Integrations</h1>
            <p className="text-slate-400">Manage external service connections and API configurations</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-green-300 border-green-400/30">
              {integrationStats.connectedIntegrations}/{integrationStats.totalIntegrations} Connected
            </Badge>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              title: 'Total Integrations',
              value: integrationStats.totalIntegrations,
              change: '10 categories',
              icon: Plug,
              color: 'text-blue-400',
              bgColor: 'bg-blue-500/10',
            },
            {
              title: 'Connected Services',
              value: integrationStats.connectedIntegrations,
              change: 'Active connections',
              icon: CheckCircle,
              color: 'text-green-400',
              bgColor: 'bg-green-500/10',
            },
            {
              title: 'API Requests',
              value: integrationStats.totalRequests.toLocaleString(),
              change: 'This month',
              icon: BarChart3,
              color: 'text-purple-400',
              bgColor: 'bg-purple-500/10',
            },
            {
              title: 'Integration Costs',
              value: `$${integrationStats.totalCost.toFixed(2)}`,
              change: 'Monthly spend',
              icon: Database,
              color: 'text-yellow-400',
              bgColor: 'bg-yellow-500/10',
            },
            {
              title: 'Errors/Issues',
              value: integrationStats.errorCount,
              change: 'Need attention',
              icon: AlertTriangle,
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

        {/* Integrations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Service Integrations
              </CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm bg-slate-700 border-slate-600 text-white"
                />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All Categories</SelectItem>
                    <SelectItem value="AI & ML" className="text-white">AI & ML</SelectItem>
                    <SelectItem value="Communication" className="text-white">Communication</SelectItem>
                    <SelectItem value="Payments" className="text-white">Payments</SelectItem>
                    <SelectItem value="Development" className="text-white">Development</SelectItem>
                    <SelectItem value="Marketing" className="text-white">Marketing</SelectItem>
                    <SelectItem value="Automation" className="text-white">Automation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All Status</SelectItem>
                    <SelectItem value="connected" className="text-white">Connected</SelectItem>
                    <SelectItem value="error" className="text-white">Error</SelectItem>
                    <SelectItem value="disabled" className="text-white">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIntegrations.map((integration) => (
                  <div key={integration.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-600">
                          <integration.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{integration.name}</h3>
                          <p className="text-xs text-slate-400">{integration.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.status)}
                        <Switch
                          checked={integration.status === 'connected'}
                          onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 mb-3">{integration.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Badge variant="outline" className="text-slate-300 border-slate-400/30 text-xs">
                        {integration.priority} priority
                      </Badge>
                    </div>

                    {integration.status === 'connected' && (
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div>
                          <p className="text-slate-400">Requests</p>
                          <p className="text-white font-medium">{integration.requests.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Cost</p>
                          <p className="text-white font-medium">${integration.cost.toFixed(2)}</p>
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <p className="text-xs text-slate-400 mb-1">Features</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-blue-300 border-blue-400/30">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 2 && (
                          <Badge variant="outline" className="text-xs text-slate-300 border-slate-400/30">
                            +{integration.features.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-white border-slate-600"
                        onClick={() => handleConfigureIntegration(integration)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      {integration.status === 'connected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-white border-slate-600"
                          onClick={() => handleTestConnection(integration.id)}
                        >
                          Test
                        </Button>
                      )}
                    </div>

                    {integration.lastSync && (
                      <p className="text-xs text-slate-400 mt-2">
                        Last sync: {integration.lastSync}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Key Configuration Modal */}
        {showApiKeyModal && selectedIntegration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Configure {selectedIntegration.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white block mb-2">API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your API key..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white block mb-2">Configuration</label>
                  <Textarea
                    placeholder="Additional configuration (JSON format)..."
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowApiKeyModal(false)}
                    className="text-white border-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setShowApiKeyModal(false);
                      console.log(`${selectedIntegration.name} configured`);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </WRDOLayout>
  );
}
