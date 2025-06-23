'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Wallet,
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
  Save,
  Receipt,
  Building,
  Smartphone,
  QrCode,
  Banknote,
  PiggyBank
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

const paymentProviders = [
  {
    id: 1,
    name: 'Paystack',
    type: 'gateway',
    status: 'connected',
    publicKey: 'pk_test_***************',
    secretKey: 'sk_test_***************',
    lastUsed: '2024-02-20T10:30:00Z',
    transactionsProcessed: 1250,
    totalVolume: 125000.50,
    successRate: 98.5,
    fees: 1.5,
    currency: 'USD',
    features: ['Cards', 'Bank Transfer', 'Mobile Money', 'Webhooks']
  },
  {
    id: 2,
    name: 'Stripe',
    type: 'gateway',
    status: 'connected',
    publicKey: 'pk_test_***************',
    secretKey: 'sk_test_***************',
    lastUsed: '2024-02-20T09:15:00Z',
    transactionsProcessed: 3420,
    totalVolume: 342000.75,
    successRate: 99.2,
    fees: 2.9,
    currency: 'USD',
    features: ['Cards', 'ACH', 'Apple Pay', 'Google Pay', 'Subscriptions']
  },
  {
    id: 3,
    name: 'PayPal',
    type: 'wallet',
    status: 'configured',
    clientId: 'AYjcyDKqJgYIgnr***************',
    clientSecret: 'EHLohFMVlJqyBSK***************',
    lastUsed: '2024-02-19T16:45:00Z',
    transactionsProcessed: 890,
    totalVolume: 89000.25,
    successRate: 97.8,
    fees: 3.49,
    currency: 'USD',
    features: ['PayPal Wallet', 'Credit Cards', 'Express Checkout']
  },
  {
    id: 4,
    name: 'Flutterwave',
    type: 'gateway',
    status: 'disabled',
    publicKey: 'FLWPUBK_TEST-***************',
    secretKey: 'FLWSECK_TEST-***************',
    lastUsed: '2024-02-15T12:20:00Z',
    transactionsProcessed: 0,
    totalVolume: 0,
    successRate: 0,
    fees: 1.4,
    currency: 'NGN',
    features: ['Cards', 'Bank Transfer', 'Mobile Money', 'USSD']
  }
];

const paymentMethods = [
  {
    id: 1,
    name: 'Credit/Debit Cards',
    type: 'card',
    status: 'active',
    providers: ['Paystack', 'Stripe', 'PayPal'],
    usage: 65.2,
    transactions: 2890,
    volume: 289000.50,
    fees: 2.1
  },
  {
    id: 2,
    name: 'Bank Transfer',
    type: 'bank',
    status: 'active',
    providers: ['Paystack', 'Flutterwave'],
    usage: 25.8,
    transactions: 1120,
    volume: 112000.25,
    fees: 0.5
  },
  {
    id: 3,
    name: 'Mobile Money',
    type: 'mobile',
    status: 'active',
    providers: ['Paystack', 'Flutterwave'],
    usage: 8.5,
    transactions: 370,
    volume: 37000.75,
    fees: 1.0
  },
  {
    id: 4,
    name: 'Digital Wallets',
    type: 'wallet',
    status: 'active',
    providers: ['PayPal', 'Stripe'],
    usage: 0.5,
    transactions: 20,
    volume: 2000.00,
    fees: 3.2
  }
];

const paymentStats = [
  { date: '2024-02-14', volume: 42000, transactions: 420, fees: 1260, refunds: 840 },
  { date: '2024-02-15', volume: 38000, transactions: 380, fees: 1140, refunds: 760 },
  { date: '2024-02-16', volume: 52000, transactions: 520, fees: 1560, refunds: 1040 },
  { date: '2024-02-17', volume: 65000, transactions: 650, fees: 1950, refunds: 1300 },
  { date: '2024-02-18', volume: 58000, transactions: 580, fees: 1740, refunds: 1160 },
  { date: '2024-02-19', volume: 72000, transactions: 720, fees: 2160, refunds: 1440 },
  { date: '2024-02-20', volume: 89000, transactions: 890, fees: 2670, refunds: 1780 },
];

export default function PaymentSystemsSettings() {
  const { state, actions } = useWRDO();
  const [activeTab, setActiveTab] = useState('providers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  const [paymentSystemStats, setPaymentSystemStats] = useState({
    totalProviders: paymentProviders.length,
    activeProviders: paymentProviders.filter(p => p.status === 'connected').length,
    totalMethods: paymentMethods.length,
    activeMethods: paymentMethods.filter(m => m.status === 'active').length,
    totalTransactions: paymentProviders.reduce((acc, p) => acc + p.transactionsProcessed, 0),
    totalVolume: paymentProviders.reduce((acc, p) => acc + p.totalVolume, 0),
    avgSuccessRate: Math.round(paymentProviders.reduce((acc, p) => acc + p.successRate, 0) / paymentProviders.length * 10) / 10,
    avgFees: Math.round(paymentProviders.reduce((acc, p) => acc + p.fees, 0) / paymentProviders.length * 10) / 10,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        paymentSystemStats,
        activeTab,
        providersConfigured: paymentProviders.length,
        methodsActive: paymentMethods.filter(m => m.status === 'active').length,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [paymentSystemStats, activeTab, state.currentUser?.id]);

  const filteredProviders = paymentProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredMethods = paymentMethods.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || method.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'configured':
      case 'pending': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
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
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'disabled':
      case 'inactive': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getProviderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'paystack': return <CreditCard className="h-4 w-4" />;
      case 'stripe': return <CreditCard className="h-4 w-4" />;
      case 'paypal': return <Wallet className="h-4 w-4" />;
      case 'flutterwave': return <Smartphone className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'bank': return <Building className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'wallet': return <Wallet className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Systems</h1>
          <p className="text-slate-400">Configure payment providers, methods, and transaction settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-300 border-green-400/30">
            {paymentSystemStats.activeProviders} Active
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
            value: paymentSystemStats.totalProviders,
            change: 'Total configured',
            icon: Server,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Active',
            value: paymentSystemStats.activeProviders,
            change: 'Connected',
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Methods',
            value: paymentSystemStats.totalMethods,
            change: 'Available',
            icon: CreditCard,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Active Methods',
            value: paymentSystemStats.activeMethods,
            change: 'In use',
            icon: Wallet,
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
          },
          {
            title: 'Transactions',
            value: paymentSystemStats.totalTransactions.toLocaleString(),
            change: 'Total processed',
            icon: Receipt,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
          },
          {
            title: 'Volume',
            value: formatCurrency(paymentSystemStats.totalVolume),
            change: 'Total processed',
            icon: DollarSign,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Success Rate',
            value: `${paymentSystemStats.avgSuccessRate}%`,
            change: 'Average',
            icon: TrendingUp,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Avg Fees',
            value: `${paymentSystemStats.avgFees}%`,
            change: 'Transaction fees',
            icon: PiggyBank,
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

      {/* Payment Statistics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Payment Performance (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={paymentStats}>
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
                <Area type="monotone" dataKey="volume" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Volume ($)" />
                <Area type="monotone" dataKey="transactions" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Transactions" />
                <Area type="monotone" dataKey="fees" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Fees ($)" />
                <Area type="monotone" dataKey="refunds" stackId="4" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Refunds ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
        {[
          { id: 'providers', label: 'Payment Providers', icon: Server },
          { id: 'methods', label: 'Payment Methods', icon: CreditCard },
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
                Payment Providers
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
                          {getProviderIcon(provider.name)}
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
                            <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                              {provider.currency}
                            </Badge>
                          </div>
                          <h3 className="text-white font-semibold mb-1">{provider.name}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300 mb-2">
                            <span>Transactions: {provider.transactionsProcessed.toLocaleString()}</span>
                            <span>Volume: {formatCurrency(provider.totalVolume, provider.currency)}</span>
                            <span>Success: {provider.successRate}%</span>
                            <span>Fees: {provider.fees}%</span>
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
                          <Receipt className="h-3 w-3 mr-2" />
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

      {activeTab === 'methods' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <Input
                  placeholder="Search methods..."
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
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMethods.map((method) => (
                  <div key={method.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-slate-600/50">
                          {getMethodIcon(method.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getStatusColor(method.status)}>
                              {getStatusIcon(method.status)}
                              <span className="ml-1 uppercase text-xs">{method.status}</span>
                            </Badge>
                            <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                              {method.usage}% Usage
                            </Badge>
                          </div>
                          <h3 className="text-white font-semibold mb-1">{method.name}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300 mb-2">
                            <span>Transactions: {method.transactions.toLocaleString()}</span>
                            <span>Volume: {formatCurrency(method.volume)}</span>
                            <span>Fees: {method.fees}%</span>
                            <span>Providers: {method.providers.length}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {method.providers.map((provider, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-slate-400 border-slate-500">
                                {provider}
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
                          onClick={() => setSelectedMethod(method)}
                        >
                          <Settings className="h-3 w-3 mr-2" />
                          Configure
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
                Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">General Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Default Currency</label>
                      <Select defaultValue="USD">
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="USD" className="text-white">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR" className="text-white">EUR - Euro</SelectItem>
                          <SelectItem value="GBP" className="text-white">GBP - British Pound</SelectItem>
                          <SelectItem value="NGN" className="text-white">NGN - Nigerian Naira</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Webhook URL</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="https://cave.getwrdo.com/api/webhooks/payments" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Success Redirect URL</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="https://cave.getwrdo.com/payment/success" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Minimum Amount</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="1.00" type="number" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Maximum Amount</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="10000.00" type="number" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Session Timeout (minutes)</label>
                      <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="30" type="number" />
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
