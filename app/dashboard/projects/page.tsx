
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Calendar,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

// Sample project data
const projects = [
  {
    id: 1,
    name: 'WRDO Cave Ultra Development',
    description: 'Complete transformation to autonomous AI operations platform',
    status: 'in_progress',
    priority: 'high',
    progress: 78,
    startDate: '2024-01-01',
    dueDate: '2024-03-15',
    team: ['Alice Johnson', 'Bob Smith', 'Carol Davis'],
    budget: 150000,
    spent: 89500,
    tasks: { total: 45, completed: 35, inProgress: 8, pending: 2 },
  },
  {
    id: 2,
    name: 'AI Model Integration',
    description: 'Integrate multiple AI providers with fallback systems',
    status: 'completed',
    priority: 'high',
    progress: 100,
    startDate: '2023-12-01',
    dueDate: '2024-01-15',
    team: ['Alice Johnson', 'David Wilson'],
    budget: 50000,
    spent: 47800,
    tasks: { total: 28, completed: 28, inProgress: 0, pending: 0 },
  },
  {
    id: 3,
    name: 'Business Intelligence Dashboard',
    description: 'Comprehensive dashboard for business analytics and insights',
    status: 'in_progress',
    priority: 'medium',
    progress: 45,
    startDate: '2024-01-15',
    dueDate: '2024-04-01',
    team: ['Carol Davis', 'Eve Martinez', 'Frank Brown'],
    budget: 80000,
    spent: 32000,
    tasks: { total: 35, completed: 16, inProgress: 12, pending: 7 },
  },
  {
    id: 4,
    name: 'Security Audit & Compliance',
    description: 'Comprehensive security review and POPI compliance implementation',
    status: 'planning',
    priority: 'high',
    progress: 15,
    startDate: '2024-02-01',
    dueDate: '2024-05-01',
    team: ['Grace Lee', 'Henry Clark'],
    budget: 75000,
    spent: 8500,
    tasks: { total: 22, completed: 3, inProgress: 2, pending: 17 },
  },
];

const projectTimeline = [
  { month: 'Jan', completed: 8, started: 5, planned: 3 },
  { month: 'Feb', completed: 12, started: 7, planned: 4 },
  { month: 'Mar', completed: 15, started: 6, planned: 2 },
  { month: 'Apr', completed: 18, started: 4, planned: 3 },
  { month: 'May', completed: 22, started: 3, planned: 5 },
  { month: 'Jun', completed: 25, started: 2, planned: 6 },
];

export default function ProjectsDashboard() {
  const { state, actions } = useWRDO();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [projectStats, setProjectStats] = useState({
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
    overdueTasks: 3,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        projectStats,
        filterStatus,
        filterPriority,
        projects: projects.length,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [projectStats, filterStatus, filterPriority, actions, state.currentUser?.id]);

  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-300 border-green-400/30';
      case 'in_progress': return 'text-blue-300 border-blue-400/30';
      case 'planning': return 'text-yellow-300 border-yellow-400/30';
      case 'on_hold': return 'text-red-300 border-red-400/30';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-300 border-red-400/30';
      case 'medium': return 'text-yellow-300 border-yellow-400/30';
      case 'low': return 'text-green-300 border-green-400/30';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Project Management</h1>
          <p className="text-slate-400">Track projects, tasks, and team performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-white border-slate-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Project Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Projects',
            value: projectStats.totalProjects,
            change: '+2 this month',
            icon: FolderOpen,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Active Projects',
            value: projectStats.activeProjects,
            change: `${projectStats.completedProjects} completed`,
            icon: Target,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Total Budget',
            value: `R${(projectStats.totalBudget / 1000).toFixed(0)}k`,
            change: `R${(projectStats.totalSpent / 1000).toFixed(0)}k spent`,
            icon: TrendingUp,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Overdue Tasks',
            value: projectStats.overdueTasks,
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
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Project Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Project Timeline (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={projectTimeline}>
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
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#60B5FF" fill="#60B5FF" fillOpacity={0.3} name="Completed" />
                <Area type="monotone" dataKey="started" stackId="1" stroke="#FF9149" fill="#FF9149" fillOpacity={0.3} name="In Progress" />
                <Area type="monotone" dataKey="planned" stackId="1" stroke="#FF9898" fill="#FF9898" fillOpacity={0.3} name="Planned" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Projects List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              All Projects
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-slate-700 border-slate-600 text-white"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="planning" className="text-white">Planning</SelectItem>
                  <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                  <SelectItem value="completed" className="text-white">Completed</SelectItem>
                  <SelectItem value="on_hold" className="text-white">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Priority</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div key={project.id} className="p-6 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        <Badge variant="outline" className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{project.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">Progress</span>
                          <span className="text-xs text-white">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Due Date</p>
                        <p className="text-sm text-white">{new Date(project.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Team Size</p>
                        <p className="text-sm text-white">{project.team.length} members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Budget</p>
                        <p className="text-sm text-white">R{project.budget.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Tasks</p>
                        <p className="text-sm text-white">{project.tasks.completed}/{project.tasks.total}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {project.team.slice(0, 3).map((member, index) => (
                        <div key={index} className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                          {member.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      {project.team.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-white border-slate-600">
                        View Details
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Edit Project
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
