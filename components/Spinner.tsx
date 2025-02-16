'use client'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({ className, ...props }) => {
  const shouldReduceMotion = usePrefersReducedMotion()

  return (
    <div role='status'>
      {!shouldReduceMotion && (
        <svg aria-hidden='true' className={cn('w-8 h-8 text-gray-200 fill-foreground animate-spin', className)} viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
          <path d='M100 49.9999C100 77.6141 77.6142 100 50 100C22.3858 100 0 77.6141 0 49.9999C0 22.3857 22.3858 0 50 0C77.6142 0 100 22.3857 100 49.9999ZM9.08144 49.9999C9.08144 72.5985 27.4013 90.9184 50 90.9184C72.5987 90.9184 90.9186 72.5985 90.9186 49.9999C90.9186 27.4012 72.5987 9.08142 50 9.08142C27.4013 9.08142 9.08144 27.4012 9.08144 49.9999Z' fill='currentColor'/>
          <path d='M93.9676 38.4501C96.393 37.813 97.8624 35.3208 97.0079 32.9631C95.2932 28.2319 92.871 23.7784 89.8167 19.7572C85.8452 14.5284 80.8826 10.133 75.2124 6.82207C69.5422 3.51112 63.2754 1.34943 56.7698 0.46042C51.7666 -0.223279 46.6976 -0.143976 41.7345 0.687911C39.2613 1.10246 37.813 3.60696 38.4501 6.03244C39.0873 8.45792 41.5694 9.88088 44.0505 9.51628C47.8511 8.95773 51.7191 8.93607 55.5402 9.45828C60.8642 10.1858 65.9928 11.9549 70.6331 14.6644C75.2735 17.374 79.3347 20.9711 82.5849 25.2502C84.9175 28.3213 86.7997 31.7005 88.1811 35.285C89.083 37.625 91.5421 39.0873 93.9676 38.4501Z' fill='currentFill'/>
        </svg>
      )}
      <span className={cn('text-inherit', { 'sr-only': !shouldReduceMotion })}>Loading…</span>
    </div>
  )
}

Spinner.displayName = 'Spinner'

export default Spinner
