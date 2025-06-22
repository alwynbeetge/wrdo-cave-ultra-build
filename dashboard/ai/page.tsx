
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  Settings, 
  DollarSign, 
  Clock, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  Bot,
  MessageSquare
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { AI_MODELS, AI_AGENTS, aiRouter } from '@/lib/ai-router';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

// Sample cost tracking data
const costHistory = [
  { date: '2024-01-01', gpt4: 45.20, gemini: 12.30, deepseek: 5.10 },
  { date: '2024-01-02', gpt4: 52.80, gemini: 15.60, deepseek: 6.40 },
  { date: '2024-01-03', gpt4: 38.90, gemini: 11.20, deepseek: 4.80 },
  { date: '2024-01-04', gpt4: 61.40, gemini: 18.90, deepseek: 7.20 },
  { date: '2024-01-05', gpt4: 55.70, gemini: 16.30, deepseek: 6.90 },
  { date: '2024-01-06', gpt4: 49.60, gemini: 14.80, deepseek: 5.60 },
  { date: '2024-01-07', gpt4: 67.20, gemini: 20.10, deepseek: 8.30 },
];

const agentExecutions = [
  { agent: 'DeepAgent', executions: 24, success: 22, cost: 156.80 },
  { agent: 'Devin', executions: 12, success: 11, cost: 89.40 },
];

export default function AIDashboard() {
  const { state, actions } = useWRDO();
  const [aiStats, setAiStats] = useState({
    totalRequests: 1247,
    successRate: 98.4,
    averageResponseTime: 1.2,
    monthlySpend: 456.78,
    fallbacksTriggered: 12,
    agentExecutions: 36,
  });

  const [selectedPrimaryModel, setSelectedPrimaryModel] = useState('gpt-4o');
  const [fallbackOrder, setFallbackOrder] = useState(['gpt-4o', 'gemini-pro', 'deepseek-chat']);

  useEffect(() => {
    // Update AI context
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        aiStats,
        selectedModel: selectedPrimaryModel,
        fallbackOrder,
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [aiStats, selectedPrimaryModel, fallbackOrder, actions, state.currentUser?.id]);

  const handleModelToggle = (modelId: string, enabled: boolean) => {
    actions.addNotification({
      type: 'info',
      title: 'Model Status Updated',
      message: `${modelId} has been ${enabled ? 'enabled' : 'disabled'}`,
      read: false,
    });
  };

  const handleFallbackOrderChange = (newOrder: string[]) => {
    setFallbackOrder(newOrder);
    actions.addNotification({
      type: 'success',
      title: 'Fallback Order Updated',
      message: 'AI model fallback sequence has been updated',
      read: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Operations Center</h1>
          <p className="text-slate-400">Manage AI models, agents, and intelligent automation</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-300 border-green-400/30">
            All Systems Operational
          </Badge>
          <Button variant="outline" className="text-white border-slate-600">
            <Settings className="h-4 w-4 mr-2" />
            Configure AI
          </Button>
        </div>
      </div>

      {/* AI Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Requests',
            value: aiStats.totalRequests.toLocaleString(),
            change: '+12% today',
            icon: MessageSquare,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Success Rate',
            value: `${aiStats.successRate}%`,
            change: 'Excellent',
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Avg Response Time',
            value: `${aiStats.averageResponseTime}s`,
            change: '-0.3s improved',
            icon: Clock,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Monthly Spend',
            value: `$${aiStats.monthlySpend}`,
            change: '+8% vs last month',
            icon: DollarSign,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Models Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Models Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Model Selection */}
              <div>
                <label className="text-sm font-medium text-white block mb-2">Primary Model</label>
                <Select value={selectedPrimaryModel} onValueChange={setSelectedPrimaryModel}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {Object.values(AI_MODELS).map((model) => (
                      <SelectItem key={model.id} value={model.id} className="text-white hover:bg-slate-600">
                        {model.name} - ${model.costPerToken * 1000}k/1k tokens
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Status */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Model Status</h4>
                {Object.values(AI_MODELS).map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{model.name}</p>
                        <p className="text-xs text-slate-400">{model.provider}</p>
                      </div>
                    </div>
                    <Switch
                      defaultChecked={true}
                      onCheckedChange={(checked) => handleModelToggle(model.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Agents Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.values(AI_AGENTS).map((agent) => (
                <div key={agent.id} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-400" />
                      <span className="font-medium text-white">{agent.name}</span>
                      <Badge variant="outline" className={`text-xs ${
                        agent.riskLevel === 'high' ? 'border-red-400/30 text-red-300' :
                        agent.riskLevel === 'medium' ? 'border-yellow-400/30 text-yellow-300' :
                        'border-green-400/30 text-green-300'
                      }`}>
                        {agent.riskLevel} risk
                      </Badge>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{agent.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <span>Est. Cost: ${agent.estimatedCostPerRequest}</span>
                    <span>Max Time: {agent.maxExecutionTime}min</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cost Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Cost Analytics (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costHistory}>
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
                <Line type="monotone" dataKey="gpt4" stroke="#60B5FF" strokeWidth={2} name="GPT-4o" />
                <Line type="monotone" dataKey="gemini" stroke="#FF9149" strokeWidth={2} name="Gemini Pro" />
                <Line type="monotone" dataKey="deepseek" stroke="#FF9898" strokeWidth={2} name="DeepSeek" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agent Execution History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Agent Execution History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentExecutions.map((agent, index) => (
                <div key={index} className="p-4 rounded-lg bg-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{agent.agent}</h4>
                    <Badge variant="outline" className="text-green-300 border-green-400/30">
                      {((agent.success / agent.executions) * 100).toFixed(1)}% success
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Executions</p>
                      <p className="text-white font-medium">{agent.executions}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Successful</p>
                      <p className="text-white font-medium">{agent.success}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Total Cost</p>
                      <p className="text-white font-medium">${agent.cost}</p>
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
