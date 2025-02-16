'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Spinner from '@/components/Spinner'

import { addRepository, fetchAllDocuments } from '@/lib/api'

interface RepositoryInputProps {
  setRepositories: (repositories: string[]) => void
}

export default function RepositoryInput({ setRepositories }: RepositoryInputProps) {
  const [ repositoryIdInputValue, setRepositoryIdInputValue ] = useState<string>('')
  const [ isPending, startTransition ] = useTransition()
  const router = useRouter()

  const handleSubmit = (formData: FormData) => {
    const repositoryId = formData.get('repositoryId') as string
    if (!repositoryId.trim()) return

    startTransition(async () => {
      localStorage.setItem('repositories', JSON.stringify([ repositoryId ]))
      window.dispatchEvent(new Event('storage'))
      await addRepository(repositoryId)
      setRepositories([ repositoryId ])
      const documents = await fetchAllDocuments(repositoryId)
      localStorage.setItem(`${repositoryId}-all-documents`, JSON.stringify(documents))
      router.refresh()
    })
  }

  return (
    <div className='flex flex-col gap-4 min-w-1/3'>
      <p className='text-sm'>Enter a Prismic repository ID to get started.</p>
      <form action={handleSubmit} className='flex gap-2'>
        <Input name='repositoryId' value={repositoryIdInputValue} onChange={(e) => setRepositoryIdInputValue(e.target.value)} placeholder='Repository ID…' />
        <Button type='submit' disabled={isPending}>{isPending ? <Spinner className='fill-background' /> : 'Use repository'}</Button>
      </form>
    </div>
  )
}