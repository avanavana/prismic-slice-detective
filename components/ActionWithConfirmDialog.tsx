'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog'

interface ActionWithConfirmButtonProps {
  title: string
  description: string
  actionLabel: string
  action: () => void
  variant?: 'default' | 'destructive'
  children: React.ReactNode
}

export default function ActionWithConfirmButton({
  title,
  description,
  actionLabel,
  action,
  variant = 'default',
  children,
}: ActionWithConfirmButtonProps) {
  const [ isOpen, setIsOpen ] = useState(false)

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='ghost' size='icon' onClick={() => setIsOpen(true)}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={variant}
              onClick={() => {
                action()
                setIsOpen(false)
              }}
            >
              {actionLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
