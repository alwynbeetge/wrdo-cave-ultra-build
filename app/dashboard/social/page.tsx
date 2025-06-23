'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Share2, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Heart,
  MessageCircle,
  Users,
  Calendar,
  BarChart3,
  Eye,
  ExternalLink,
  Instagram,
  Twitter,
  Facebook,
  Linkedin
} from 'lucide-react';
// import { useWRDO } from '@/lib/wrdo-context';
import { useMockWRDO as useWRDO } from '@/lib/wrdo-mock';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

const socialPosts = [
  {
    id: 1,
    platform: 'twitter',
    content: 'Excited to announce WRDO Cave Ultra - the future of hyperlocal AI is here! 🚀 #AI #Innovation #Hyperlocal',
    status: 'published',
    publishDate: '2024-02-20',
    engagement: {
      likes: 245,
      shares: 67,
      comments: 34,
      reach: 12500
    },
    performance: 'high',
    author: 'WRDO Team',
  },
  {
    id: 2,
    platform: 'linkedin',
    content: 'How AI is transforming local business operations: A deep dive into our hyperlocal intelligence platform',
    status: 'scheduled',
    publishDate: '2024-02-25',
    engagement: {
      likes: 0,
      shares: 0,
      comments: 0,
      reach: 0
    },
    performance: 'pending',
    author: 'Alwyn Beetge',
  },
  {
    id: 3,
    platform: 'instagram',
    content: 'Behind the scenes: Building the next generation of AI-powered community platforms 📱✨',
    status: 'draft',
    publishDate: '2024-02-28',
    engagement: {
      likes: 0,
      shares: 0,
      comments: 0,
      reach: 0
    },
    performance: 'pending',
    author: 'WRDO Team',
  },
];

const socialMetrics = [
  { month: 'Sep', followers: 1200, engagement: 3.2, reach: 8500 },
  { month: 'Oct', followers: 1450, engagement: 4.1, reach: 11200 },
  { month: 'Nov', followers: 1680, engagement: 5.3, reach: 14800 },
  { month: 'Dec', followers: 1920, engagement: 6.7, reach: 18500 },
  { month: 'Jan', followers: 2150, engagement: 7.8, reach: 22300 },
  { month: 'Feb', followers: 2380, engagement: 8.9, reach: 25600 },
];

export default function SocialMediaDashboard() {
  const { state, actions } = useWRDO();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [socialStats, setSocialStats] = useState({
    totalPosts: socialPosts.length,
    published: socialPosts.filter(post => post.status === 'published').length,
    scheduled: socialPosts.filter(post => post.status === 'scheduled').length,
    drafts: socialPosts.filter(post => post.status === 'draft').length,
    totalFollowers: 2380,
    totalEngagement: socialPosts.reduce((sum, post) => sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0),
    totalReach: socialPosts.reduce((sum, post) => sum + post.engagement.reach, 0),
    avgEngagementRate: 8.9,
  });

  useEffect(() => {
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        socialStats,
        postsTracked: socialPosts.length,
        filterPlatform,
        filterStatus,
        lastUpdated: new Date(),
      },
      sessionContext: {},
      userPreferences: {},
      conversationHistory: []
    });
  }, [socialStats, filterPlatform, filterStatus, state.currentUser?.id]);

  const filteredPosts = socialPosts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || post.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'scheduled': return 'text-blue-300 border-blue-400/30 bg-blue-500/10';
      case 'draft': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'high': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'medium': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'low': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'pending': return 'text-slate-300 border-slate-400/30 bg-slate-500/10';
      default: return 'text-slate-300 border-slate-400/30';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'text-blue-400';
      case 'linkedin': return 'text-blue-600';
      case 'instagram': return 'text-pink-400';
      case 'facebook': return 'text-blue-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Social Media</h1>
          <p className="text-slate-400">Manage social media presence and track engagement across platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-300 border-green-400/30">
            {socialStats.avgEngagementRate}% Engagement
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            title: 'Total Posts',
            value: socialStats.totalPosts,
            change: 'All content',
            icon: Share2,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Published',
            value: socialStats.published,
            change: 'Live posts',
            icon: Eye,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Scheduled',
            value: socialStats.scheduled,
            change: 'Upcoming',
            icon: Calendar,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Drafts',
            value: socialStats.drafts,
            change: 'In progress',
            icon: MessageCircle,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
          {
            title: 'Followers',
            value: socialStats.totalFollowers.toLocaleString(),
            change: 'Total reach',
            icon: Users,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Total Reach',
            value: `${(socialStats.totalReach / 1000).toFixed(1)}k`,
            change: 'Impressions',
            icon: TrendingUp,
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

      {/* Social Media Metrics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Social Media Growth (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={socialMetrics}>
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
                <Area type="monotone" dataKey="followers" stackId="1" stroke="#60B5FF" fill="#60B5FF" fillOpacity={0.6} name="Followers" />
                <Area type="monotone" dataKey="engagement" stackId="2" stroke="#A855F7" fill="#A855F7" fillOpacity={0.6} name="Engagement %" />
                <Area type="monotone" dataKey="reach" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Reach" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Posts Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Social Media Posts
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-slate-700 border-slate-600 text-white"
              />
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Platforms</SelectItem>
                  <SelectItem value="twitter" className="text-white">Twitter</SelectItem>
                  <SelectItem value="linkedin" className="text-white">LinkedIn</SelectItem>
                  <SelectItem value="instagram" className="text-white">Instagram</SelectItem>
                  <SelectItem value="facebook" className="text-white">Facebook</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="published" className="text-white">Published</SelectItem>
                  <SelectItem value="scheduled" className="text-white">Scheduled</SelectItem>
                  <SelectItem value="draft" className="text-white">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-6 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors border border-slate-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-slate-600/50 ${getPlatformColor(post.platform)}`}>
                          {getPlatformIcon(post.platform)}
                        </div>
                        <Badge variant="outline" className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        <Badge variant="outline" className={getPerformanceColor(post.performance)}>
                          {post.performance}
                        </Badge>
                        <span className="text-xs text-slate-400 capitalize">{post.platform}</span>
                      </div>
                      <p className="text-sm text-white mb-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.status === 'published' ? 'Published' : 'Scheduled'}: {new Date(post.publishDate).toLocaleDateString()}
                        </span>
                        <span>By: {post.author}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-white border-slate-600">
                        <Eye className="h-3 w-3 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="text-white border-slate-600">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Open
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Likes</p>
                      <p className="text-lg font-semibold text-white flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-400" />
                        {post.engagement.likes.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Shares</p>
                      <p className="text-lg font-semibold text-white flex items-center gap-1">
                        <Share2 className="h-4 w-4 text-blue-400" />
                        {post.engagement.shares.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Comments</p>
                      <p className="text-lg font-semibold text-white flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-green-400" />
                        {post.engagement.comments.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Reach</p>
                      <p className="text-lg font-semibold text-white flex items-center gap-1">
                        <Eye className="h-4 w-4 text-purple-400" />
                        {post.engagement.reach.toLocaleString()}
                      </p>
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
