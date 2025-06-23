
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Eye,
  Globe,
  BarChart3,
  Target,
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';
import { useWRDO } from '@/lib/wrdo-context';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

// Sample competitor data
const competitors = [
  {
    id: 1,
    name: 'TechFlow Solutions',
    location: 'Cape Town',
    industry: 'AI & Software Development',
    website: 'techflow.co.za',
    employees: '50-100',
    fundingStage: 'Series A',
    lastFunding: 25000000,
    marketShare: 15.2,
    socialMedia: {
      linkedin: 2500,
      twitter: 1200,
      instagram: 800,
    },
    recentActivity: [
      { date: '2024-01-20', activity: 'Launched new AI product suite', impact: 'high' },
      { date: '2024-01-15', activity: 'Hired VP of Engineering', impact: 'medium' },
      { date: '2024-01-10', activity: 'Partnership with Microsoft', impact: 'high' },
    ],
    strengths: ['Strong AI capabilities', 'Enterprise clients', 'Good funding'],
    weaknesses: ['Limited market presence', 'High employee turnover'],
    threatLevel: 'high',
  },
  {
    id: 2,
    name: 'DataMine Analytics',
    location: 'Stellenbosch',
    industry: 'Business Intelligence',
    website: 'datamine.co.za',
    employees: '20-50',
    fundingStage: 'Seed',
    lastFunding: 5000000,
    marketShare: 8.7,
    socialMedia: {
      linkedin: 1200,
      twitter: 600,
      instagram: 300,
    },
    recentActivity: [
      { date: '2024-01-18', activity: 'Opened new office in Johannesburg', impact: 'medium' },
      { date: '2024-01-12', activity: 'Released competitor analysis tool', impact: 'high' },
    ],
    strengths: ['Local market knowledge', 'Cost-effective solutions'],
    weaknesses: ['Limited technical capabilities', 'Small team'],
    threatLevel: 'medium',
  },
  {
    id: 3,
    name: 'AI Innovations Lab',
    location: 'Paarl',
    industry: 'AI Research & Development',
    website: 'ailab.africa',
    employees: '10-20',
    fundingStage: 'Bootstrap',
    lastFunding: 0,
    marketShare: 3.1,
    socialMedia: {
      linkedin: 800,
      twitter: 400,
      instagram: 200,
    },
    recentActivity: [
      { date: '2024-01-19', activity: 'Published research paper on AGI', impact: 'low' },
      { date: '2024-01-14', activity: 'Speaking at AI conference', impact: 'low' },
    ],
    strengths: ['Research expertise', 'Academic partnerships'],
    weaknesses: ['No commercial products', 'Limited funding'],
    threatLevel: 'low',
  },
];

const marketTrends = [
  { month: 'Sep', aiAdoption: 65, marketGrowth: 12, competition: 45 },
  { month: 'Oct', aiAdoption: 68, marketGrowth: 15, competition: 48 },
  { month: 'Nov', aiAdoption: 72, marketGrowth: 18, competition: 52 },
  { month: 'Dec', aiAdoption: 75, marketGrowth: 22, competition: 55 },
  { month: 'Jan', aiAdoption: 78, marketGrowth: 25, competition: 58 },
  { month: 'Feb', aiAdoption: 82, marketGrowth: 28, competition: 62 },
];

export default function CompetitorDashboard() {
  const { state, actions } = useWRDO();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterThreat, setFilterThreat] = useState('all');

  const [competitorStats, setCompetitorStats] = useState({
    totalCompetitors: competitors.length,
    highThreat: competitors.filter(c => c.threatLevel === 'high').length,
    marketShareLoss: 2.3,
    newEntrants: 1,
    averageFunding: competitors.reduce((sum, c) => sum + c.lastFunding, 0) / competitors.length,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        competitorStats,
        competitorsTracked: competitors.length,
        filterLocation,
        filterThreat,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [competitorStats, filterLocation, filterThreat, state.currentUser?.id]);

  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competitor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || competitor.location === filterLocation;
    const matchesThreat = filterThreat === 'all' || competitor.threatLevel === filterThreat;
    return matchesSearch && matchesLocation && matchesThreat;
  });

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'medium': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'low': return 'text-green-300 border-green-400/30 bg-green-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="h-3 w-3 text-red-400" />;
      case 'medium': return <TrendingUp className="h-3 w-3 text-yellow-400" />;
      case 'low': return <TrendingDown className="h-3 w-3 text-green-400" />;
      default: return <Activity className="h-3 w-3 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Competitor Intelligence</h1>
          <p className="text-slate-400">Monitor competitors, market trends, and strategic insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-orange-300 border-orange-400/30">
            {competitorStats.highThreat} High Threat
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            title: 'Tracked Competitors',
            value: competitorStats.totalCompetitors,
            change: '+1 this month',
            icon: Target,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'High Threat Level',
            value: competitorStats.highThreat,
            change: 'Requires attention',
            icon: AlertTriangle,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
          },
          {
            title: 'Market Share Loss',
            value: `${competitorStats.marketShareLoss}%`,
            change: 'vs last quarter',
            icon: TrendingDown,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
          {
            title: 'New Entrants',
            value: competitorStats.newEntrants,
            change: 'this quarter',
            icon: Plus,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Avg Funding',
            value: `R${(competitorStats.averageFunding / 1000000).toFixed(1)}M`,
            change: 'per competitor',
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

      {/* Market Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Market Analysis Trends (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={marketTrends}>
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
                <Line type="monotone" dataKey="aiAdoption" stroke="#60B5FF" strokeWidth={2} name="AI Adoption %" />
                <Line type="monotone" dataKey="marketGrowth" stroke="#FF9149" strokeWidth={2} name="Market Growth %" />
                <Line type="monotone" dataKey="competition" stroke="#FF9898" strokeWidth={2} name="Competition Index" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Competitors List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Competitor Analysis
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search competitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-slate-700 border-slate-600 text-white"
              />
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Locations</SelectItem>
                  <SelectItem value="Cape Town" className="text-white">Cape Town</SelectItem>
                  <SelectItem value="Stellenbosch" className="text-white">Stellenbosch</SelectItem>
                  <SelectItem value="Paarl" className="text-white">Paarl</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterThreat} onValueChange={setFilterThreat}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Threat" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Levels</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredCompetitors.map((competitor) => (
                <div key={competitor.id} className="p-6 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{competitor.name}</h3>
                        <Badge variant="outline" className={getThreatColor(competitor.threatLevel)}>
                          {competitor.threatLevel} threat
                        </Badge>
                        <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                          {competitor.location}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{competitor.industry}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-300">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {competitor.website}
                        </span>
                        <span>{competitor.employees} employees</span>
                        <span>{competitor.fundingStage} • R{(competitor.lastFunding / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-white border-slate-600">
                      <Eye className="h-3 w-3 mr-2" />
                      View Details
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Market Share</p>
                      <p className="text-lg font-semibold text-white">{competitor.marketShare}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Social Following</p>
                      <p className="text-lg font-semibold text-white">
                        {(competitor.socialMedia.linkedin + competitor.socialMedia.twitter + competitor.socialMedia.instagram).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Last Funding</p>
                      <p className="text-lg font-semibold text-white">R{(competitor.lastFunding / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Strengths</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.strengths.map((strength, index) => (
                          <Badge key={index} variant="outline" className="text-green-300 border-green-400/30 text-xs">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Weaknesses</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.weaknesses.map((weakness, index) => (
                          <Badge key={index} variant="outline" className="text-red-300 border-red-400/30 text-xs">
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-2">Recent Activity</p>
                    <div className="space-y-2">
                      {competitor.recentActivity.slice(0, 2).map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded bg-slate-800/50">
                          {getImpactIcon(activity.impact)}
                          <div className="flex-1">
                            <p className="text-sm text-white">{activity.activity}</p>
                            <p className="text-xs text-slate-400">{activity.date}</p>
                          </div>
                          <Badge variant="outline" className={`text-xs ${
                            activity.impact === 'high' ? 'text-red-300 border-red-400/30' :
                            activity.impact === 'medium' ? 'text-yellow-300 border-yellow-400/30' :
                            'text-green-300 border-green-400/30'
                          }`}>
                            {activity.impact} impact
                          </Badge>
                        </div>
                      ))}
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
