
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Shield, 
  Zap, 
  BarChart3, 
  Bot, 
  Globe, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Users,
  Lock,
  Activity,
  MessageSquare,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: Brain,
    title: 'Advanced AI Operations',
    description: 'Multiple AI models with intelligent fallback chains and autonomous agent execution',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Bot,
    title: 'Autonomous Agents',
    description: 'DeepAgent and Devin integration with approval workflows and cost management',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: BarChart3,
    title: 'Business Intelligence',
    description: 'Comprehensive dashboards for finances, projects, competitor analysis, and more',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Advanced security monitoring, compliance tracking, and IP protection',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Globe,
    title: 'API Integration Hub',
    description: 'Seamless integration with Gmail, Paystack, GitHub, Vercel, and 20+ services',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Zap,
    title: 'Real-time Automation',
    description: 'Intelligent automation with context-aware suggestions and proactive actions',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
];

const stats = [
  { label: 'AI Models Integrated', value: '15+', icon: Brain },
  { label: 'Business Dashboards', value: '12', icon: BarChart3 },
  { label: 'API Integrations', value: '25+', icon: Globe },
  { label: 'Security Features', value: '50+', icon: Shield },
];

export default function HomePage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    // Check if user is logged in
    const user = localStorage.getItem('wrdo_user');
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900/95 backdrop-blur-sm border-b border-slate-700' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">WRDO Cave Ultra</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
                  Sign In
                </Button>
              </Link>
              <Button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge variant="outline" className="text-blue-300 border-blue-400/30 px-4 py-2">
                🚀 Next-Generation AI Operations Platform
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                WRDO Cave
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  {" "}Ultra
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                The most advanced autonomous AI operations platform for enterprise business intelligence, 
                intelligent automation, and comprehensive operational control.
              </p>
            </div>

            <div className="flex items-center justify-center gap-6">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                onClick={handleGetStarted}
              >
                Launch Platform
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/chat">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-white border-slate-600 hover:bg-slate-700 text-lg px-8 py-6"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Try AI Chat
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <stat.icon className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Autonomous Intelligence at Scale
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experience the future of business operations with our comprehensive AI-driven platform 
              that thinks, learns, and acts autonomously.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-lg ${feature.bgColor} w-fit mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Complete Business Intelligence Suite
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                From financial management to competitor intelligence, from project tracking to 
                security monitoring - WRDO Cave Ultra provides everything you need to run 
                an autonomous, intelligent business operation.
              </p>
              
              <div className="space-y-4">
                {[
                  'AI-powered financial analysis and forecasting',
                  'Real-time competitor intelligence monitoring',
                  'Autonomous project and task management',
                  'Comprehensive security and compliance tracking',
                  'Intelligent email and communication processing',
                  'Advanced IP protection and management',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="mt-8 bg-blue-600 hover:bg-blue-700"
                onClick={handleGetStarted}
              >
                Explore All Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: TrendingUp, label: 'Analytics', count: '50+' },
                { icon: Users, label: 'Integrations', count: '25+' },
                { icon: Lock, label: 'Security', count: '100%' },
                { icon: Activity, label: 'Uptime', count: '99.9%' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 text-center"
                >
                  <item.icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{item.count}</div>
                  <div className="text-slate-400 text-sm">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl text-slate-300">
              Join the future of autonomous business intelligence and let AI handle 
              the complexity while you focus on growth.
            </p>
            <div className="flex items-center justify-center gap-6">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                onClick={handleGetStarted}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/dashboard/ai">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-white border-slate-600 hover:bg-slate-700 text-lg px-8 py-6"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  View AI Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">WRDO Cave Ultra</span>
          </div>
          <p className="text-slate-400 mb-4">
            The most advanced autonomous AI operations platform for enterprise business intelligence.
          </p>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} WRDO Cave Ultra. Intelligent operations platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
