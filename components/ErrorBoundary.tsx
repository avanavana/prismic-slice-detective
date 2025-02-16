'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Error from '@/components/Error'

interface ErrorBoundaryProps {
  children: React.ReactNode
  message: string | (() => string)
}

export function ErrorBoundaryWithRetry({ children, message }: ErrorBoundaryProps) {
  const [ hasError, setHasError ] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleError = () => setHasError(true)
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  const handleRetry = () => {
    setHasError(false)
    router.refresh()
  }

  return hasError ? <Error message={message} onRetry={handleRetry} /> : <>{children}</>
}
