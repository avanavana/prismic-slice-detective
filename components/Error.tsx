'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { cn } from '@/lib/utils'

interface GenericErrorProps {
  message: string | (() => string) 
}

interface StaticErrorProps extends GenericErrorProps {}

interface DynamicErrorProps extends GenericErrorProps {
  isRetrying?: boolean
  onRetry?: () => void
}

type ErrorProps = StaticErrorProps & DynamicErrorProps

export default function Error({ isRetrying = false, onRetry, message }: ErrorProps) {
  return (
    <div className='grow flex flex-col items-center justify-center h-full p-8 text-center'>
      <div className='flex items-center gap-2 p-4 bg-red-50 border border-destructive rounded-md text-sm text-destructive'>
        <AlertTriangle size={16} />
        <p>{typeof message === 'string' ? message : message()}</p>
      </div>
      {isRetrying !== undefined && onRetry && (
        <Button onClick={onRetry} className='flex items-center gap-2 mt-4'> 
          <RefreshCw className={cn('w-4 h-4 mr-2', { 'animate-spin': isRetrying })} /> 
          Try Again
        </Button>
      )}
    </div>
  )
}

Error.displayName = 'Error'