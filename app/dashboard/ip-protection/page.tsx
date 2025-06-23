'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Lock, 
  Plus, 
  Search, 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  Eye,
  Download
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

const ipAssets = [
  {
    id: 1,
    name: 'WRDO Cave AI Architecture',
    type: 'patent',
    status: 'filed',
    priority: 'high',
    filingDate: '2024-01-15',
    expiryDate: '2044-01-15',
    jurisdiction: 'South Africa',
    cost: 25000,
    description: 'Core AI architecture and compound intelligence system',
    riskLevel: 'low',
  },
  {
    id: 2,
    name: 'WRDO Brand Trademark',
    type: 'trademark',
    status: 'registered',
    priority: 'high',
    filingDate: '2023-08-10',
    expiryDate: '2033-08-10',
    jurisdiction: 'South Africa',
    cost: 8500,
    description: 'WRDO brand name and logo protection',
    riskLevel: 'low',
  },
  {
    id: 3,
    name: 'Hyperlocal AI Framework',
    type: 'trade_secret',
    status: 'protected',
    priority: 'critical',
    filingDate: '2024-02-01',
    expiryDate: 'indefinite',
    jurisdiction: 'Global',
    cost: 15000,
    description: 'Proprietary hyperlocal community AI algorithms',
    riskLevel: 'medium',
  },
];

const protectionTimeline = [
  { month: 'Sep', patents: 2, trademarks: 1, tradeSec: 1, costs: 15 },
  { month: 'Oct', patents: 2, trademarks: 1, tradeSec: 1, costs: 18 },
  { month: 'Nov', patents: 3, trademarks: 1, tradeSec: 2, costs: 25 },
  { month: 'Dec', patents: 3, trademarks: 2, tradeSec: 2, costs: 32 },
  { month: 'Jan', patents: 4, trademarks: 2, tradeSec: 3, costs: 48 },
  { month: 'Feb', patents: 4, trademarks: 2, tradeSec: 3, costs: 48 },
];

export default function IPProtectionDashboard() {
  const { state, actions } = useWRDO();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [ipStats, setIpStats] = useState({
    totalAssets: ipAssets.length,
    patents: ipAssets.filter(ip => ip.type === 'patent').length,
    trademarks: ipAssets.filter(ip => ip.type === 'trademark').length,
    tradeSecrets: ipAssets.filter(ip => ip.type === 'trade_secret').length,
    totalCost: ipAssets.reduce((sum, ip) => sum + ip.cost, 0),
    highRisk: ipAssets.filter(ip => ip.riskLevel === 'high').length,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        ipStats,
        assetsTracked: ipAssets.length,
        filterType,
        filterStatus,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [ipStats, filterType, filterStatus, state.currentUser?.id]);

  const filteredAssets = ipAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'filed': return 'text-blue-300 border-blue-400/30 bg-blue-500/10';
      case 'protected': return 'text-purple-300 border-purple-400/30 bg-purple-500/10';
      case 'pending': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'medium': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'low': return 'text-green-300 border-green-400/30 bg-green-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patent': return <FileText className="h-4 w-4" />;
      case 'trademark': return <Shield className="h-4 w-4" />;
      case 'trade_secret': return <Lock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">IP Protection</h1>
          <p className="text-slate-400">Manage intellectual property assets and protection strategies</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-orange-300 border-orange-400/30">
            {ipStats.highRisk} High Risk
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add IP Asset
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            title: 'Total Assets',
            value: ipStats.totalAssets,
            change: '+1 this month',
            icon: Shield,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Patents',
            value: ipStats.patents,
            change: 'Filed & pending',
            icon: FileText,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Trademarks',
            value: ipStats.trademarks,
            change: 'Registered',
            icon: Shield,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Trade Secrets',
            value: ipStats.tradeSecrets,
            change: 'Protected',
            icon: Lock,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
          {
            title: 'Total Investment',
            value: `R${(ipStats.totalCost / 1000).toFixed(0)}k`,
            change: 'Protection costs',
            icon: DollarSign,
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

      {/* Protection Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              IP Protection Timeline (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={protectionTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Area type="monotone" dataKey="patents" stackId="1" stroke="#60B5FF" fill="#60B5FF" fillOpacity={0.6} name="Patents" />
                <Area type="monotone" dataKey="trademarks" stackId="1" stroke="#A855F7" fill="#A855F7" fillOpacity={0.6} name="Trademarks" />
                <Area type="monotone" dataKey="tradeSec" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Trade Secrets" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* IP Assets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              IP Asset Management
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search IP assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-slate-700 border-slate-600 text-white"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Asset Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  <SelectItem value="patent" className="text-white">Patents</SelectItem>
                  <SelectItem value="trademark" className="text-white">Trademarks</SelectItem>
                  <SelectItem value="trade_secret" className="text-white">Trade Secrets</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="registered" className="text-white">Registered</SelectItem>
                  <SelectItem value="filed" className="text-white">Filed</SelectItem>
                  <SelectItem value="protected" className="text-white">Protected</SelectItem>
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="p-6 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-slate-600/50">
                          {getTypeIcon(asset.type)}
                        </div>
                        <h3 className="text-lg font-semibold text-white">{asset.name}</h3>
                        <Badge variant="outline" className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                        <Badge variant="outline" className={getRiskColor(asset.riskLevel)}>
                          {asset.riskLevel} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{asset.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Filed: {new Date(asset.filingDate).toLocaleDateString()}
                        </span>
                        <span>Expires: {asset.expiryDate === 'indefinite' ? 'Indefinite' : new Date(asset.expiryDate).toLocaleDateString()}</span>
                        <span>{asset.jurisdiction}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-white border-slate-600">
                        <Eye className="h-3 w-3 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="text-white border-slate-600">
                        <Download className="h-3 w-3 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Protection Cost</p>
                      <p className="text-lg font-semibold text-white">R{asset.cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Asset Type</p>
                      <p className="text-lg font-semibold text-white capitalize">{asset.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Priority Level</p>
                      <p className="text-lg font-semibold text-white capitalize">{asset.priority}</p>
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
