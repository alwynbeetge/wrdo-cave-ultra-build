
'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn('animate-spin text-blue-400', sizeClasses[size])} />
        {text && (
          <p className="text-sm text-gray-400 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  )
}

export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function InlineLoader({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
      {text && <span className="text-sm text-gray-400">{text}</span>}
    </div>
  )
}
