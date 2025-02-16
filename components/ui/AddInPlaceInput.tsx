'use client'

import { useEffect, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ZodSchema } from 'zod'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Spinner from '@/components/Spinner'

interface ErrorMessageProps {
  message: string | null
}

const ErrorMessage = ({ message }: ErrorMessageProps) => (
  <AnimatePresence>
    {message && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className='text-sm text-destructive w-full'
      >
        {message}
      </motion.p>
    )}
  </AnimatePresence>
)

interface AddInPlaceInputProps {
  formAction: (value: string) => Promise<void> | void
  placeholder?: string
  submitButtonText?: string
  triggerButtonText?: string
  validationSchema: ZodSchema<string>
}

export default function AddInPlaceInput({
  formAction,
  placeholder = 'Enter a value…',
  submitButtonText = 'Add',
  triggerButtonText = 'Add a new item',
  validationSchema
}: AddInPlaceInputProps) {
  const [ isEditing, setIsEditing ] = useState(false)
  const [ inputValue, setInputValue ] = useState('')
  const [ isPending, startTransition ] = useTransition()
  const [ error, setError ] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setInputValue(value)

    if (validationSchema) {
      const result = validationSchema.safeParse(value)
      setError(result.success ? null : result.error.errors[0].message)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || error) return

    startTransition(async () => {
      await formAction(inputValue.trim())
      setInputValue('')
      setError(null)
      setIsEditing(false)
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setInputValue('')
  }

  useEffect(() => {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) {
      setError(null)
      return
    }

    const validationResult = validationSchema.safeParse(trimmedValue)

    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message)
      return
    }

    setError(null)
  }, [ inputValue, validationSchema ])

  return isEditing ? (
    <form onSubmit={handleSubmit} className='flex flex-col gap-2 items-center w-full'>
      <div className='flex gap-2 items-center w-full'>
        <Input
          className='grow'
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoFocus
        />
        <Button type='submit' disabled={isPending}>
          {isPending ? <Spinner className='fill-background' /> : submitButtonText}
        </Button>
        <Button variant='ghost' onClick={handleCancel}>
          Cancel
        </Button>
      </div>
      <ErrorMessage message={error} />
    </form>
  ) : (
    <Button variant='ghost' onClick={() => setIsEditing(true)} className='w-full justify-start'>
      <Plus size={16} />
      {triggerButtonText}
    </Button>
  )
}
