
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  Upload,
  Download,
  Filter,
  Plus,
  Calendar,
  PieChart
} from 'lucide-react';
import { useWRDO } from '@/lib/wrdo-context';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

// Sample financial data
const monthlyData = [
  { month: 'Jan', income: 45000, expenses: 32000, profit: 13000 },
  { month: 'Feb', income: 52000, expenses: 35000, profit: 17000 },
  { month: 'Mar', income: 48000, expenses: 33000, profit: 15000 },
  { month: 'Apr', income: 58000, expenses: 38000, profit: 20000 },
  { month: 'May', income: 54000, expenses: 36000, profit: 18000 },
  { month: 'Jun', income: 61000, expenses: 40000, profit: 21000 },
];

const expenseCategories = [
  { name: 'AI & Technology', value: 35, amount: 12250 },
  { name: 'Operations', value: 25, amount: 8750 },
  { name: 'Marketing', value: 20, amount: 7000 },
  { name: 'Legal & Compliance', value: 12, amount: 4200 },
  { name: 'Other', value: 8, amount: 2800 },
];

const recentTransactions = [
  { id: 1, date: '2024-01-20', description: 'OpenAI API Credits', amount: -250.00, category: 'AI & Technology', status: 'completed' },
  { id: 2, date: '2024-01-19', description: 'Client Payment - Project X', amount: 5000.00, category: 'Income', status: 'completed' },
  { id: 3, date: '2024-01-18', description: 'Paystack Transaction Fees', amount: -45.30, category: 'Operations', status: 'completed' },
  { id: 4, date: '2024-01-17', description: 'Legal Consultation', amount: -800.00, category: 'Legal & Compliance', status: 'completed' },
  { id: 5, date: '2024-01-16', description: 'Marketing Campaign', amount: -1200.00, category: 'Marketing', status: 'pending' },
];

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3'];

export default function FinanceDashboard() {
  const { state, actions } = useWRDO();
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [financialStats, setFinancialStats] = useState({
    totalIncome: 318000,
    totalExpenses: 214000,
    netProfit: 104000,
    monthlyGrowth: 12.5,
    pendingInvoices: 8,
    overduePayments: 2,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        financialStats,
        filterCategory,
        filterStatus,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [financialStats, filterCategory, filterStatus, actions, state.currentUser?.id]);

  const filteredTransactions = recentTransactions.filter(transaction => {
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleExportData = () => {
    actions.addNotification({
      type: 'success',
      title: 'Data Export',
      message: 'Financial data exported successfully',
      read: false,
    });
  };

  const handleImportData = () => {
    actions.addNotification({
      type: 'info',
      title: 'Data Import',
      message: 'File upload dialog would open here',
      read: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financial Management</h1>
          <p className="text-slate-400">Track income, expenses, and financial performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-white border-slate-600" onClick={handleImportData}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" className="text-white border-slate-600" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Income',
            value: `R${financialStats.totalIncome.toLocaleString()}`,
            change: `+${financialStats.monthlyGrowth}%`,
            icon: TrendingUp,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            changePositive: true,
          },
          {
            title: 'Total Expenses',
            value: `R${financialStats.totalExpenses.toLocaleString()}`,
            change: '+8.2%',
            icon: TrendingDown,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
            changePositive: false,
          },
          {
            title: 'Net Profit',
            value: `R${financialStats.netProfit.toLocaleString()}`,
            change: '+15.7%',
            icon: DollarSign,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            changePositive: true,
          },
          {
            title: 'Pending Invoices',
            value: financialStats.pendingInvoices.toString(),
            change: `${financialStats.overduePayments} overdue`,
            icon: Receipt,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            changePositive: false,
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
                  <Badge variant="outline" className={`text-xs ${
                    stat.changePositive ? 'text-green-300 border-green-400/30' : 'text-red-300 border-red-400/30'
                  }`}>
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Trend (6 months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
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
                  <Line type="monotone" dataKey="income" stroke="#60B5FF" strokeWidth={2} name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="#FF9149" strokeWidth={2} name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#FF9898" strokeWidth={2} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search transactions..."
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
                  <SelectItem value="Income" className="text-white">Income</SelectItem>
                  <SelectItem value="AI & Technology" className="text-white">AI & Technology</SelectItem>
                  <SelectItem value="Operations" className="text-white">Operations</SelectItem>
                  <SelectItem value="Marketing" className="text-white">Marketing</SelectItem>
                  <SelectItem value="Legal & Compliance" className="text-white">Legal & Compliance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="completed" className="text-white">Completed</SelectItem>
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {transaction.amount > 0 ? 
                        <TrendingUp className="h-4 w-4 text-green-400" /> : 
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-white">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-400">{transaction.date}</p>
                        <Badge variant="outline" className="text-xs text-slate-300">
                          {transaction.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <Badge variant="outline" className={`text-xs ${
                      transaction.status === 'completed' ? 'text-green-300 border-green-400/30' : 'text-yellow-300 border-yellow-400/30'
                    }`}>
                      {transaction.status}
                    </Badge>
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
