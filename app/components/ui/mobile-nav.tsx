
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  Home, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Brain,
  LogOut,
  Shield
} from 'lucide-react'
import { User } from '@/lib/auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface MobileNavProps {
  user: User
  onLogout: () => void
}

export function MobileNav({ user, onLogout }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: pathname === '/dashboard',
    },
    {
      name: 'AI Chat',
      href: '/chat',
      icon: MessageSquare,
      current: pathname === '/chat',
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      current: pathname === '/dashboard/analytics',
    },
    {
      name: 'Admin',
      href: '/dashboard/admin',
      icon: Shield,
      current: pathname === '/dashboard/admin',
      adminOnly: true,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-slate-700"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-slate-900 border-slate-700 w-72">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center space-x-2 text-white">
            <Brain className="h-6 w-6 text-blue-400" />
            <span>WRDO Cave</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 space-y-6">
          {/* User Info */}
          <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              // Skip admin items for non-admin users (simplified check)
              if (item.adminOnly && !user.email?.includes('admin')) {
                return null
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${item.current
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                    `}
                  />
                  {item.name}
                  {item.name === 'AI Chat' && (
                    <Badge 
                      variant="secondary" 
                      className="ml-auto bg-green-500/20 text-green-400 text-xs"
                    >
                      Live
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Theme & Settings */}
          <div className="space-y-3 pt-6 border-t border-slate-700">
            <div className="flex items-center justify-between px-3">
              <span className="text-sm font-medium text-gray-300">Theme</span>
              <ThemeToggle />
            </div>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-slate-700 hover:text-white"
              onClick={() => {
                setOpen(false)
                // Handle settings navigation
              }}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:bg-red-900/20 hover:text-red-300"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
