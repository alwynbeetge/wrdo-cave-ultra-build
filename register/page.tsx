
'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, Lock, Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">WRDO Cave</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Private Portal</h2>
          <p className="mt-2 text-gray-400">Restricted Access Only</p>
        </div>

        {/* Registration Disabled Notice */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <Lock className="h-6 w-6 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-white">Registration Disabled</CardTitle>
            <CardDescription className="text-gray-400">
              This is a private intelligence portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-red-900/50 border-red-700">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                <strong>Access Restricted:</strong> Public registration has been disabled for security reasons. 
                This portal is restricted to authorized personnel only.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="text-sm text-gray-300">
                <h4 className="font-medium text-white mb-2">To gain access:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Contact a system administrator</li>
                  <li>Provide valid business justification</li>
                  <li>Complete security clearance process</li>
                  <li>Receive invitation from authorized personnel</li>
                </ul>
              </div>
              
              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs text-gray-500 text-center">
                  This system is monitored and all access attempts are logged for security purposes.
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
              
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            WRDO Cave &copy; 2025 | Secure Intelligence Platform
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Unauthorized access is prohibited and may be subject to legal action
          </p>
        </div>
      </div>
    </div>
  )
}
