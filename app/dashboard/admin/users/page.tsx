'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Shield,
  Mail,
  Calendar,
  Activity,
  Settings,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const mockUsers = [
  {
    id: 1,
    name: 'Alwyn Beetge',
    email: 'alwyn@getwrdo.com',
    role: 'Super Admin',
    status: 'Active',
    lastLogin: '2 minutes ago',
    joinDate: '2024-01-15',
    sessions: 42,
    permissions: ['All Access'],
    avatar: 'A'
  },
  {
    id: 2,
    name: 'System Bot',
    email: 'system@wrdo.cave',
    role: 'System',
    status: 'Active',
    lastLogin: '1 minute ago',
    joinDate: '2024-01-15',
    sessions: 156,
    permissions: ['System Operations'],
    avatar: 'S'
  },
  {
    id: 3,
    name: 'Test User',
    email: 'test@wrdo.cave',
    role: 'User',
    status: 'Inactive',
    lastLogin: '2 days ago',
    joinDate: '2024-02-01',
    sessions: 8,
    permissions: ['Read Only'],
    avatar: 'T'
  },
  {
    id: 4,
    name: 'Demo Admin',
    email: 'demo@wrdo.cave',
    role: 'Admin',
    status: 'Active',
    lastLogin: '1 hour ago',
    joinDate: '2024-01-20',
    sessions: 23,
    permissions: ['Admin Access', 'User Management'],
    avatar: 'D'
  },
  {
    id: 5,
    name: 'Guest User',
    email: 'guest@wrdo.cave',
    role: 'Guest',
    status: 'Pending',
    lastLogin: 'Never',
    joinDate: '2024-06-23',
    sessions: 0,
    permissions: ['Limited Access'],
    avatar: 'G'
  }
];

const userActivityData = [
  { date: 'Mon', logins: 12, registrations: 2 },
  { date: 'Tue', logins: 19, registrations: 1 },
  { date: 'Wed', logins: 15, registrations: 3 },
  { date: 'Thu', logins: 22, registrations: 0 },
  { date: 'Fri', logins: 18, registrations: 1 },
  { date: 'Sat', logins: 8, registrations: 0 },
  { date: 'Sun', logins: 5, registrations: 1 }
];

const roleDistribution = [
  { name: 'Super Admin', value: 1, color: '#8b5cf6' },
  { name: 'Admin', value: 1, color: '#06b6d4' },
  { name: 'User', value: 1, color: '#10b981' },
  { name: 'Guest', value: 1, color: '#f59e0b' },
  { name: 'System', value: 1, color: '#ef4444' }
];

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const { state, actions } = useWRDO();

  const userStats = {
    totalUsers: mockUsers.length,
    activeUsers: mockUsers.filter(u => u.status === 'Active').length,
    pendingUsers: mockUsers.filter(u => u.status === 'Pending').length,
    totalSessions: mockUsers.reduce((sum, user) => sum + user.sessions, 0)
  };

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        currentPage: 'User Management',
        userActivity: 'Managing user accounts and permissions',
        systemMetrics: userStats,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [userStats, actions, state.currentUser?.id]);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Super Admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'User': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Guest': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'System': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-400">Manage user accounts, roles, and permissions</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{userStats.totalUsers}</div>
                <p className="text-xs text-gray-400">Registered accounts</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{userStats.activeUsers}</div>
                <p className="text-xs text-gray-400">Currently active</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Pending Users</CardTitle>
                <Calendar className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{userStats.pendingUsers}</div>
                <p className="text-xs text-gray-400">Awaiting approval</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Sessions</CardTitle>
                <Shield className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{userStats.totalSessions}</div>
                <p className="text-xs text-gray-400">All time</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Activity (7 Days)</CardTitle>
                <CardDescription className="text-gray-400">
                  Login and registration trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="logins" 
                      stackId="1"
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="registrations" 
                      stackId="1"
                      stroke="#06B6D4" 
                      fill="#06B6D4" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Role Distribution</CardTitle>
                <CardDescription className="text-gray-400">
                  User roles breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {roleDistribution.map((role, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="text-gray-300">{role.name}</span>
                      </div>
                      <span className="text-gray-400">{role.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">User Accounts</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage user accounts and permissions
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white w-64"
                    />
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="All">All Roles</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Guest">Guest</option>
                    <option value="System">System</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.avatar}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{user.name}</h3>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <p className="text-gray-400 text-xs mt-1">Last login: {user.lastLogin}</p>
                      </div>
                      
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      
                      <div className="text-right">
                        <p className="text-white text-sm">{user.sessions} sessions</p>
                        <p className="text-gray-400 text-xs">Joined {user.joinDate}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
