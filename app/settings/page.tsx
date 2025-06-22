
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, User, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings & Configuration</h1>
            <p className="text-slate-400">Manage system preferences and configuration</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Settings Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['general', 'profile', 'security'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeSection === section
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    <span className="capitalize">{section}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white capitalize">{activeSection} Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white block mb-2">Setting Name</label>
                  <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Enter value..." />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                  <div>
                    <h4 className="text-white font-medium">Enable Feature</h4>
                    <p className="text-sm text-slate-400">Toggle this feature on or off</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
