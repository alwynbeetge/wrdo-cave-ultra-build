'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Eye, 
  Users, 
  MousePointer, 
  Clock, 
  Target, 
  ExternalLink,
  Settings,
  Save,
  RefreshCw,
  Download,
  Upload,
  FileText,
  Link,
  Tag,
  Image,
  Code,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Calendar,
  Zap,
  Database,
  Server,
  Shield,
  Lock,
  Key,
  Bell,
  Mail,
  Share2,
  MessageSquare,
  ThumbsUp,
  Heart,
  Star,
  Bookmark
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const seoMetrics = {
  organicTraffic: 45680,
  keywordRankings: 1247,
  backlinks: 8920,
  pageSpeed: 92,
  mobileScore: 88,
  seoScore: 94,
  indexedPages: 156,
  crawlErrors: 3
};

const trafficData = [
  { date: '2024-02-14', organic: 4200, direct: 1800, referral: 950, social: 420 },
  { date: '2024-02-15', organic: 3800, direct: 1650, referral: 890, social: 380 },
  { date: '2024-02-16', organic: 5200, direct: 2100, referral: 1200, social: 520 },
  { date: '2024-02-17', organic: 6500, direct: 2400, referral: 1450, social: 650 },
  { date: '2024-02-18', organic: 5800, direct: 2200, referral: 1300, social: 580 },
  { date: '2024-02-19', organic: 7200, direct: 2800, referral: 1600, social: 720 },
  { date: '2024-02-20', organic: 8900, direct: 3200, referral: 1890, social: 890 },
];

const keywordData = [
  { keyword: 'AI business intelligence', position: 3, volume: 8900, difficulty: 72, traffic: 2340 },
  { keyword: 'competitor analysis tool', position: 7, volume: 5600, difficulty: 68, traffic: 1120 },
  { keyword: 'business automation platform', position: 12, volume: 12000, difficulty: 85, traffic: 800 },
  { keyword: 'AI-powered dashboard', position: 5, volume: 4200, difficulty: 61, traffic: 1680 },
  { keyword: 'enterprise analytics', position: 15, volume: 7800, difficulty: 79, traffic: 520 },
  { keyword: 'business intelligence software', position: 9, volume: 15600, difficulty: 88, traffic: 1040 },
  { keyword: 'competitive intelligence', position: 4, volume: 3400, difficulty: 58, traffic: 1700 },
  { keyword: 'market analysis tool', position: 11, volume: 6200, difficulty: 65, traffic: 620 },
];

const analyticsData = [
  { metric: 'Page Views', value: 156780, change: '+12.5%', color: '#10B981' },
  { metric: 'Unique Visitors', value: 45680, change: '+8.3%', color: '#3B82F6' },
  { metric: 'Bounce Rate', value: '32.4%', change: '-2.1%', color: '#EF4444' },
  { metric: 'Avg Session', value: '4:32', change: '+15.2%', color: '#8B5CF6' },
  { metric: 'Conversion Rate', value: '3.8%', change: '+0.7%', color: '#F59E0B' },
  { metric: 'Goal Completions', value: 1247, change: '+18.9%', color: '#06B6D4' },
];

const deviceData = [
  { device: 'Desktop', sessions: 28450, percentage: 62.3, color: '#10B981' },
  { device: 'Mobile', sessions: 14230, percentage: 31.2, color: '#3B82F6' },
  { device: 'Tablet', sessions: 2970, percentage: 6.5, color: '#8B5CF6' },
];

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export default function SEOAnalyticsSettings() {
  const { state, actions } = useWRDO();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<any>(null);
  const [showAddKeyword, setShowAddKeyword] = useState(false);

  const [seoSettings, setSeoSettings] = useState({
    siteName: 'WRDO Cave Ultra',
    siteDescription: 'Advanced AI-powered business intelligence and automation platform',
    defaultTitle: 'WRDO Cave Ultra - AI Business Intelligence Platform',
    defaultMetaDescription: 'Transform your business with AI-powered intelligence, competitor analysis, and automated workflows. Get insights that drive growth.',
    keywords: 'AI, business intelligence, automation, competitor analysis, dashboard, analytics',
    ogImage: '/images/og-default.jpg',
    twitterCard: 'summary_large_image',
    canonicalUrl: 'https://cave.getwrdo.com',
    robotsTxt: 'User-agent: *\nAllow: /',
    sitemapUrl: '/sitemap.xml',
    googleAnalyticsId: 'GA-XXXXXXXXX',
    googleSearchConsoleId: 'GSC-XXXXXXXXX',
    facebookPixelId: 'FB-XXXXXXXXX',
    linkedinInsightTag: 'LI-XXXXXXXXX',
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        seoMetrics,
        seoSettings,
        activeTab,
        keywordCount: keywordData.length,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [seoMetrics, seoSettings, activeTab, state.currentUser?.id]);

  const filteredKeywords = keywordData.filter(keyword =>
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-green-300 border-green-400/30 bg-green-500/10';
    if (position <= 10) return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
    return 'text-red-300 border-red-400/30 bg-red-500/10';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'text-green-300';
    if (difficulty <= 70) return 'text-yellow-300';
    return 'text-red-300';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleSettingChange = (key: string, value: string) => {
    setSeoSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">SEO & Analytics</h1>
          <p className="text-slate-400">Monitor search performance, track analytics, and optimize SEO settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-300 border-green-400/30">
            SEO Score: {seoMetrics.seoScore}%
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" className="text-white border-slate-600">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'keywords', label: 'Keywords', icon: Search },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'settings', label: 'SEO Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* SEO Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Organic Traffic',
                value: formatNumber(seoMetrics.organicTraffic),
                change: '+12.5% vs last month',
                icon: TrendingUp,
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
              },
              {
                title: 'Keyword Rankings',
                value: formatNumber(seoMetrics.keywordRankings),
                change: '+8.3% improvement',
                icon: Search,
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10',
              },
              {
                title: 'Backlinks',
                value: formatNumber(seoMetrics.backlinks),
                change: '+15.7% new links',
                icon: Link,
                color: 'text-purple-400',
                bgColor: 'bg-purple-500/10',
              },
              {
                title: 'Page Speed',
                value: `${seoMetrics.pageSpeed}%`,
                change: 'Core Web Vitals',
                icon: Zap,
                color: 'text-yellow-400',
                bgColor: 'bg-yellow-500/10',
              },
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                        <metric.icon className={`h-4 w-4 ${metric.color}`} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{metric.change}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Traffic Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Traffic Sources (7 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trafficData}>
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
                    <Area type="monotone" dataKey="organic" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Organic" />
                    <Area type="monotone" dataKey="direct" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Direct" />
                    <Area type="monotone" dataKey="referral" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Referral" />
                    <Area type="monotone" dataKey="social" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Social" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Device Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Device Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="sessions"
                        label={({ device, percentage }) => `${device}: ${percentage}%`}
                      >
                        {deviceData.map((entry, index) => (
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

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.map((metric, index) => (
                      <div key={metric.metric} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                        <span className="text-slate-300">{metric.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{metric.value}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              metric.change.startsWith('+') ? 'text-green-300 border-green-400/30' : 'text-red-300 border-red-400/30'
                            }`}
                          >
                            {metric.change}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-slate-700 border-slate-600 text-white"
            />
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddKeyword(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Track Keyword
            </Button>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5" />
                Keyword Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredKeywords.map((keyword, index) => (
                  <div key={index} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-2">{keyword.keyword}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Position: </span>
                            <Badge variant="outline" className={getPositionColor(keyword.position)}>
                              #{keyword.position}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-slate-400">Volume: </span>
                            <span className="text-white">{formatNumber(keyword.volume)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Difficulty: </span>
                            <span className={getDifficultyColor(keyword.difficulty)}>{keyword.difficulty}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Traffic: </span>
                            <span className="text-white">{formatNumber(keyword.traffic)}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-white border-slate-600">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        View SERP
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.map((metric, index) => (
              <motion.div
                key={metric.metric}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">{metric.metric}</p>
                        <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          metric.change.startsWith('+') ? 'text-green-300 border-green-400/30' : 'text-red-300 border-red-400/30'
                        }`}
                      >
                        {metric.change}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Traffic Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trafficData}>
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
                  <Line type="monotone" dataKey="organic" stroke="#10B981" strokeWidth={2} name="Organic" />
                  <Line type="monotone" dataKey="direct" stroke="#3B82F6" strokeWidth={2} name="Direct" />
                  <Line type="monotone" dataKey="referral" stroke="#8B5CF6" strokeWidth={2} name="Referral" />
                  <Line type="monotone" dataKey="social" stroke="#F59E0B" strokeWidth={2} name="Social" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SEO Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">SEO Configuration</h2>
            <Button className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Basic SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Site Name</label>
                  <Input
                    value={seoSettings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Site Description</label>
                  <Textarea
                    value={seoSettings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Default Title</label>
                  <Input
                    value={seoSettings.defaultTitle}
                    onChange={(e) => handleSettingChange('defaultTitle', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Default Meta Description</label>
                  <Textarea
                    value={seoSettings.defaultMetaDescription}
                    onChange={(e) => handleSettingChange('defaultMetaDescription', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Analytics & Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Google Analytics ID</label>
                  <Input
                    value={seoSettings.googleAnalyticsId}
                    onChange={(e) => handleSettingChange('googleAnalyticsId', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="GA-XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Google Search Console ID</label>
                  <Input
                    value={seoSettings.googleSearchConsoleId}
                    onChange={(e) => handleSettingChange('googleSearchConsoleId', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="GSC-XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Facebook Pixel ID</label>
                  <Input
                    value={seoSettings.facebookPixelId}
                    onChange={(e) => handleSettingChange('facebookPixelId', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="FB-XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn Insight Tag</label>
                  <Input
                    value={seoSettings.linkedinInsightTag}
                    onChange={(e) => handleSettingChange('linkedinInsightTag', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="LI-XXXXXXXXX"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Advanced SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Canonical URL</label>
                  <Input
                    value={seoSettings.canonicalUrl}
                    onChange={(e) => handleSettingChange('canonicalUrl', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sitemap URL</label>
                  <Input
                    value={seoSettings.sitemapUrl}
                    onChange={(e) => handleSettingChange('sitemapUrl', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Keywords</label>
                <Input
                  value={seoSettings.keywords}
                  onChange={(e) => handleSettingChange('keywords', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Comma-separated keywords"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Robots.txt Content</label>
                <Textarea
                  value={seoSettings.robotsTxt}
                  onChange={(e) => handleSettingChange('robotsTxt', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
