
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User,
  Filter,
  Search,
  BarChart3,
  Target,
  TrendingUp,
  Bell
} from 'lucide-react';
import { useWRDO } from '@/lib/wrdo-context';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

// Sample tasks data
const tasks = [
  {
    id: 1,
    title: 'Complete AI model integration testing',
    description: 'Test all fallback scenarios and performance metrics',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-01-25',
    assignee: 'Alice Johnson',
    project: 'WRDO Cave Ultra Development',
    tags: ['AI', 'Testing', 'Critical'],
    progress: 75,
    timeSpent: 12,
    estimatedTime: 16,
  },
  {
    id: 2,
    title: 'Design competitor analysis dashboard',
    description: 'Create wireframes and mockups for competitive intelligence interface',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-01-28',
    assignee: 'Bob Smith',
    project: 'Business Intelligence Dashboard',
    tags: ['Design', 'UI/UX', 'Dashboard'],
    progress: 0,
    timeSpent: 0,
    estimatedTime: 8,
  },
  {
    id: 3,
    title: 'Implement Paystack integration',
    description: 'Set up payment processing and webhook handling',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-20',
    assignee: 'Carol Davis',
    project: 'Financial Management',
    tags: ['Integration', 'Payments', 'Backend'],
    progress: 100,
    timeSpent: 6,
    estimatedTime: 6,
  },
  {
    id: 4,
    title: 'Security audit preparation',
    description: 'Prepare documentation and access for security review',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-01-30',
    assignee: 'David Wilson',
    project: 'Security Audit & Compliance',
    tags: ['Security', 'Documentation', 'Compliance'],
    progress: 40,
    timeSpent: 8,
    estimatedTime: 20,
  },
  {
    id: 5,
    title: 'Update API documentation',
    description: 'Document new endpoints and integration examples',
    status: 'todo',
    priority: 'low',
    dueDate: '2024-02-05',
    assignee: 'Eve Martinez',
    project: 'Documentation',
    tags: ['Documentation', 'API', 'Development'],
    progress: 0,
    timeSpent: 0,
    estimatedTime: 4,
  },
];

const taskStats = [
  { status: 'Completed', value: 35, color: '#10B981' },
  { status: 'In Progress', value: 25, color: '#3B82F6' },
  { status: 'Todo', value: 30, color: '#6B7280' },
  { status: 'Overdue', value: 10, color: '#EF4444' },
];

const productivityData = [
  { day: 'Mon', completed: 8, created: 5, hours: 7.5 },
  { day: 'Tue', completed: 12, created: 8, hours: 8.2 },
  { day: 'Wed', completed: 6, created: 10, hours: 6.8 },
  { day: 'Thu', completed: 15, created: 7, hours: 9.1 },
  { day: 'Fri', completed: 10, created: 12, hours: 7.9 },
  { day: 'Sat', completed: 4, created: 3, hours: 3.5 },
  { day: 'Sun', completed: 2, created: 1, hours: 2.0 },
];

const COLORS = ['#10B981', '#3B82F6', '#6B7280', '#EF4444'];

export default function TasksCalendarPage() {
  const { state, actions } = useWRDO();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);

  const [dashboardStats, setDashboardStats] = useState({
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    overdueTasks: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
    totalHoursSpent: tasks.reduce((sum, t) => sum + t.timeSpent, 0),
    productivity: 85.6,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        dashboardStats,
        selectedDate,
        filterStatus,
        filterPriority,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [dashboardStats, selectedDate, filterStatus, filterPriority, actions, state.currentUser?.id]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'in_progress': return 'text-blue-300 border-blue-400/30 bg-blue-500/10';
      case 'todo': return 'text-slate-300 border-slate-400/30 bg-slate-500/10';
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

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignee)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tasks & Calendar</h1>
          <p className="text-slate-400">Manage tasks, deadlines, and team productivity</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-red-300 border-red-400/30">
            {dashboardStats.overdueTasks} Overdue
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateTask(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Tasks',
            value: dashboardStats.totalTasks,
            change: '+5 this week',
            icon: Target,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Completed',
            value: dashboardStats.completedTasks,
            change: `${((dashboardStats.completedTasks / dashboardStats.totalTasks) * 100).toFixed(1)}% completion rate`,
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'In Progress',
            value: dashboardStats.inProgressTasks,
            change: 'Active tasks',
            icon: Clock,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
          {
            title: 'Productivity',
            value: `${dashboardStats.productivity}%`,
            change: '+2.3% vs last week',
            icon: TrendingUp,
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
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Task Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ status, value }) => `${status}: ${value}%`}
                  >
                    {taskStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Productivity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Productivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={productivityData}>
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
                  <Area type="monotone" dataKey="completed" stackId="1" stroke="#60B5FF" fill="#60B5FF" fillOpacity={0.3} name="Completed" />
                  <Area type="monotone" dataKey="created" stackId="1" stroke="#FF9149" fill="#FF9149" fillOpacity={0.3} name="Created" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0 text-white"
              />
              
              {/* Upcoming Deadlines */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-white mb-3">Upcoming Deadlines</h4>
                <div className="space-y-2">
                  {tasks
                    .filter(t => t.status !== 'completed')
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 3)
                    .map((task) => (
                      <div key={task.id} className="p-2 rounded bg-slate-700/50 border border-slate-600">
                        <p className="text-xs font-medium text-white truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className={`text-xs ${
                            isOverdue(task.dueDate, task.status) ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {isOverdue(task.dueDate, task.status) && (
                            <Badge variant="outline" className="text-red-300 border-red-400/30 text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-3"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tasks Management
              </CardTitle>
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm bg-slate-700 border-slate-600 text-white"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All Status</SelectItem>
                    <SelectItem value="todo" className="text-white">Todo</SelectItem>
                    <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                    <SelectItem value="completed" className="text-white">Completed</SelectItem>
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
                <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All Assignees</SelectItem>
                    {uniqueAssignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee} className="text-white">
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">{task.title}</h3>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {isOverdue(task.dueDate, task.status) && (
                            <Badge variant="outline" className="text-red-300 border-red-400/30">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                        
                        {/* Progress Bar */}
                        {task.status === 'in_progress' && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-400">Progress</span>
                              <span className="text-xs text-white">{task.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">Due Date</p>
                          <p className="text-sm text-white">{new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">Assignee</p>
                          <p className="text-sm text-white">{task.assignee}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">Time Spent</p>
                          <p className="text-sm text-white">{task.timeSpent}h / {task.estimatedTime}h</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">Project</p>
                          <p className="text-sm text-white truncate">{task.project}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-blue-300 border-blue-400/30">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs text-slate-300 border-slate-400/30">
                            +{task.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="text-white border-slate-600">
                          Edit
                        </Button>
                        {task.status !== 'completed' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
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
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white block mb-2">Title</label>
                <Input
                  placeholder="Enter task title..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-2">Description</label>
                <Textarea
                  placeholder="Task description..."
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white block mb-2">Priority</label>
                  <Select>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="high" className="text-white">High</SelectItem>
                      <SelectItem value="medium" className="text-white">Medium</SelectItem>
                      <SelectItem value="low" className="text-white">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white block mb-2">Assignee</label>
                  <Select>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {uniqueAssignees.map((assignee) => (
                        <SelectItem key={assignee} value={assignee} className="text-white">
                          {assignee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateTask(false)}
                  className="text-white border-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateTask(false);
                    actions.addNotification({
                      type: 'success',
                      title: 'Task Created',
                      message: 'New task has been created successfully',
                      read: false,
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
