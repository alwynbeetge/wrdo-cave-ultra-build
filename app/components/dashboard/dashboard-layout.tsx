
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Brain, 
  Menu, 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  Shield,
  Bot,
  BarChart3,
  Bell,
  Search
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/lib/auth'
import { Role } from '@/lib/roles'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { MobileNav } from '@/components/ui/mobile-nav'
import { ResponsiveContainer } from '@/components/ui/responsive-container'
import { ErrorBoundary } from '@/components/error-boundary'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
  roles: Role[]
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: false },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare, current: false, badge: 'Live' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, current: false },
  { name: 'AI Intelligence', href: '/dashboard/ai', icon: Bot, current: false },
]

const adminNavigation = [
  { name: 'Admin Panel', href: '/dashboard/admin', icon: Shield, current: false },
  { name: 'User Management', href: '/dashboard/admin/users', icon: Users, current: false },
  { name: 'System Settings', href: '/dashboard/admin/settings', icon: Settings, current: false },
]

export function DashboardLayout({ children, user, roles }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const isAdmin = roles.some(role => 
    role.name === 'admin' || 
    role.permissions.includes('manage:system')
  ) || user.email?.includes('admin') // Simplified admin check

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out.',
        })
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Update navigation items with current state
  const navWithCurrent = navigation.map(item => ({
    ...item,
    current: pathname === item.href
  }))

  const adminNavWithCurrent = adminNavigation.map(item => ({
    ...item,
    current: pathname === item.href
  }))

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center space-x-2 p-6 border-b border-slate-700">
        <Brain className="h-8 w-8 text-blue-400" />
        <span className="text-xl font-bold text-white">WRDO Cave</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navWithCurrent.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              item.current
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className={`h-5 w-5 ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className="bg-green-500/20 text-green-400 text-xs"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-700">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Administration
            </p>
            {adminNavWithCurrent.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.current
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <item.icon className={`h-5 w-5 ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>
    </div>
  )

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-slate-900">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700/50">
          <Sidebar />
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <MobileNav user={user} onLogout={handleLogout} />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  {/* Mobile menu button - handled by MobileNav on mobile */}
                  <div className="hidden lg:flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-blue-400" />
                    <span className="text-lg font-semibold text-white">
                      {pathname === '/dashboard' ? 'Dashboard' : 
                       pathname === '/chat' ? 'AI Chat' :
                       pathname.includes('/admin') ? 'Administration' :
                       'WRDO Cave'}
                    </span>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-3">
                  {/* Search Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-slate-700"
                  >
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>

                  {/* Notifications */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-slate-700 relative"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Notifications</span>
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                  </Button>

                  {/* Theme Toggle */}
                  <ThemeToggle />

                  {/* Desktop User Menu */}
                  <div className="hidden lg:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.image || ''} alt={user.name || user.email} />
                            <AvatarFallback className="bg-blue-600 text-white">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
                        <div className="flex items-center justify-start gap-2 p-2">
                          <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium text-white">{user.name || 'User'}</p>
                            <p className="w-[200px] truncate text-sm text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem 
                          className="text-gray-300 hover:text-white hover:bg-slate-700"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <ResponsiveContainer className="py-6 sm:py-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </ResponsiveContainer>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
