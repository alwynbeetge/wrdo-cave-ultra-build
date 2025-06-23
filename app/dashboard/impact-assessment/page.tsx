'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  BarChart3,
  Eye,
  Download,
  Users,
  Globe
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

const impactAssessments = [
  {
    id: 1,
    name: 'WRDO Cave AI Implementation',
    type: 'technology',
    status: 'completed',
    priority: 'high',
    startDate: '2024-01-01',
    completionDate: '2024-02-15',
    impactScore: 8.7,
    category: 'operational_efficiency',
    description: 'Assessment of AI implementation impact on business operations',
    metrics: {
      efficiency: 85,
      costSavings: 250000,
      userSatisfaction: 92,
      riskLevel: 'low'
    },
  },
  {
    id: 2,
    name: 'Hyperlocal Community Expansion',
    type: 'business',
    status: 'in_progress',
    priority: 'critical',
    startDate: '2024-02-01',
    completionDate: '2024-04-30',
    impactScore: 9.2,
    category: 'market_expansion',
    description: 'Impact assessment for expanding to new hyperlocal markets',
    metrics: {
      efficiency: 78,
      costSavings: 180000,
      userSatisfaction: 88,
      riskLevel: 'medium'
    },
  },
  {
    id: 3,
    name: 'Data Privacy Compliance',
    type: 'regulatory',
    status: 'pending',
    priority: 'high',
    startDate: '2024-03-01',
    completionDate: '2024-05-15',
    impactScore: 7.8,
    category: 'compliance',
    description: 'Assessment of POPIA and GDPR compliance impact',
    metrics: {
      efficiency: 65,
      costSavings: 95000,
      userSatisfaction: 75,
      riskLevel: 'high'
    },
  },
];

const impactTimeline = [
  { month: 'Sep', efficiency: 65, satisfaction: 70, savings: 50 },
  { month: 'Oct', efficiency: 72, satisfaction: 75, savings: 85 },
  { month: 'Nov', efficiency: 78, satisfaction: 82, savings: 120 },
  { month: 'Dec', efficiency: 83, satisfaction: 87, savings: 165 },
  { month: 'Jan', efficiency: 85, satisfaction: 92, savings: 250 },
  { month: 'Feb', efficiency: 87, satisfaction: 94, savings: 280 },
];

export default function ImpactAssessmentDashboard() {
  const { state, actions } = useWRDO();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [impactStats, setImpactStats] = useState({
    totalAssessments: impactAssessments.length,
    completed: impactAssessments.filter(ia => ia.status === 'completed').length,
    inProgress: impactAssessments.filter(ia => ia.status === 'in_progress').length,
    pending: impactAssessments.filter(ia => ia.status === 'pending').length,
    avgImpactScore: (impactAssessments.reduce((sum, ia) => sum + ia.impactScore, 0) / impactAssessments.length).toFixed(1),
    totalSavings: impactAssessments.reduce((sum, ia) => sum + ia.metrics.costSavings, 0),
    highRisk: impactAssessments.filter(ia => ia.metrics.riskLevel === 'high').length,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        impactStats,
        assessmentsTracked: impactAssessments.length,
        filterType,
        filterStatus,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [impactStats, filterType, filterStatus, state.currentUser?.id]);

  const filteredAssessments = impactAssessments.filter(assessment => {
    const matchesSearch = assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || assessment.type === filterType;
    const matchesStatus = filterStatus === 'all' || assessment.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'in_progress': return 'text-blue-300 border-blue-400/30 bg-blue-500/10';
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
      case 'technology': return <Target className="h-4 w-4" />;
      case 'business': return <TrendingUp className="h-4 w-4" />;
      case 'regulatory': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getImpactScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-300';
    if (score >= 7.0) return 'text-yellow-300';
    return 'text-red-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Impact Assessment</h1>
          <p className="text-slate-400">Analyze and measure the impact of business initiatives and changes</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-orange-300 border-orange-400/30">
            {impactStats.highRisk} High Risk
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            title: 'Total Assessments',
            value: impactStats.totalAssessments,
            change: 'Active projects',
            icon: Target,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Completed',
            value: impactStats.completed,
            change: 'Finished',
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'In Progress',
            value: impactStats.inProgress,
            change: 'Active',
            icon: TrendingUp,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Pending',
            value: impactStats.pending,
            change: 'Awaiting start',
            icon: Calendar,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
          {
            title: 'Avg Impact Score',
            value: impactStats.avgImpactScore,
            change: 'Out of 10',
            icon: BarChart3,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Total Savings',
            value: `R${(impactStats.totalSavings / 1000).toFixed(0)}k`,
            change: 'Cost benefits',
            icon: DollarSign,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
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

      {/* Impact Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Impact Trends (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={impactTimeline}>
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
                <Line type="monotone" dataKey="efficiency" stroke="#60B5FF" strokeWidth={2} name="Efficiency %" />
                <Line type="monotone" dataKey="satisfaction" stroke="#A855F7" strokeWidth={2} name="Satisfaction %" />
                <Line type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={2} name="Savings (k)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Impact Assessments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Impact Assessment Management
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-slate-700 border-slate-600 text-white"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Assessment Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  <SelectItem value="technology" className="text-white">Technology</SelectItem>
                  <SelectItem value="business" className="text-white">Business</SelectItem>
                  <SelectItem value="regulatory" className="text-white">Regulatory</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="completed" className="text-white">Completed</SelectItem>
                  <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredAssessments.map((assessment) => (
                <div key={assessment.id} className="p-6 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-slate-600/50">
                          {getTypeIcon(assessment.type)}
                        </div>
                        <h3 className="text-lg font-semibold text-white">{assessment.name}</h3>
                        <Badge variant="outline" className={getStatusColor(assessment.status)}>
                          {assessment.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getRiskColor(assessment.metrics.riskLevel)}>
                          {assessment.metrics.riskLevel} risk
                        </Badge>
                        <Badge variant="outline" className={`${getImpactScoreColor(assessment.impactScore)} border-slate-400/30`}>
                          {assessment.impactScore}/10
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{assessment.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Started: {new Date(assessment.startDate).toLocaleDateString()}
                        </span>
                        <span>Target: {new Date(assessment.completionDate).toLocaleDateString()}</span>
                        <span className="capitalize">{assessment.category.replace('_', ' ')}</span>
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Efficiency Gain</p>
                      <p className="text-lg font-semibold text-white">{assessment.metrics.efficiency}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Cost Savings</p>
                      <p className="text-lg font-semibold text-white">R{assessment.metrics.costSavings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">User Satisfaction</p>
                      <p className="text-lg font-semibold text-white">{assessment.metrics.userSatisfaction}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Priority Level</p>
                      <p className="text-lg font-semibold text-white capitalize">{assessment.priority}</p>
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
