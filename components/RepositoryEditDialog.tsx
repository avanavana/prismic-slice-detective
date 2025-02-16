'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Trash, GripVertical } from 'lucide-react'

import ActionWithConfirmButton from '@/components/ActionWithConfirmDialog'
import AddInPlaceInput from '@/components/ui/AddInPlaceInput'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/Sortable'
import Spinner from '@/components/Spinner'

import { cn } from '@/lib/utils'

const addNewRepositorySchema = (items: string[]) =>
  z.string()
    .min(1, 'Repository ID must not be empty.')
    .refine((val) => !items.includes(val), {
      message: 'Repository already exists.'
    })

interface Item {
  id: string
}

interface RepositoryEditDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  repositories: string[]
  setRepositories: (repositories: string[]) => void
}

export default function RepositoryEditDialog({
  isOpen,
  setIsOpen,
  repositories,
  setRepositories
}: RepositoryEditDialogProps) {
  const [ items, setItems ] = useState<Item[]>([])
  const [ updatedItems, setUpdatedItems ] = useState<Item[]>([])
  const [ isPending, startTransition ] = useTransition()
  const router = useRouter()

  const handleAddRepository = async (repositoryId: string) => {
    console.log('handleAddRepository', repositoryId)
    setUpdatedItems((prev) => [ { id: repositoryId }, ...prev ])
    console.log('updatedItems', updatedItems)
  }

  const handleDeleteRepository = (repositoryId: string) => {
    setUpdatedItems(items.filter(({ id }) => id !== repositoryId))
  }

  const handleOnOpenChange = () => {
    if (isOpen) setUpdatedItems(items)
    setIsOpen(!isOpen)
  }

  const handleSave = () => {
    startTransition(() => {
      const updatedRepositories = updatedItems.map(({ id }) => id)

      repositories
        .filter((id) => !updatedRepositories.includes(id))
        .forEach((id) => {
          localStorage.removeItem(`${id}-all-documents`)
        })

        
      if (updatedRepositories.length === 0) {
        localStorage.removeItem('repositories')
      } else {
        localStorage.setItem('repositories', JSON.stringify(updatedRepositories))
      }
      
      window.dispatchEvent(new Event('storage'))
      setRepositories(updatedRepositories)
      setItems(updatedItems)
      setIsOpen(false)
      router.refresh()
    })
  }

  const isSaveDisabled = useMemo(() => {
    return JSON.stringify(updatedItems) === JSON.stringify(items)
  }, [ updatedItems, items ])

  useEffect(() => {
    if (isOpen) {
      const mappedItems = repositories.map((id) => ({ id }))
      setItems(mappedItems)
      setUpdatedItems(mappedItems)
    }
  }, [ isOpen, repositories ])

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className='gap-6'>
        <DialogHeader>
          <DialogTitle>Edit repositories</DialogTitle>
          <DialogDescription>Add, re-order, or delete your Prismic repositories.</DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <Sortable value={updatedItems} onValueChange={setUpdatedItems}>
            {updatedItems.length ? updatedItems.map((repository, i) => (
              <SortableItem key={`${i}-${repository.id}`} value={repository.id} {...(updatedItems.length === 1 && { disabled: true })}>
                <div className='flex items-center justify-between border p-2 rounded-md'>
                  <div className='flex items-center gap-2'>
                    {updatedItems.length > 1 && (
                      <SortableDragHandle className='bg-transparent hover:bg-transparent cursor-grab touch-none p-1'>
                        <GripVertical className='w-4 h-4 text-gray-500 cursor-grab' />
                      </SortableDragHandle>
                    )}
                    <span className={cn({ 'pl-3': items.length === 1 })}>{repository.id}</span>
                  </div>
                  <ActionWithConfirmButton
                    title='Are you sure?'
                    description={`Once you press "Save", "${repository.id}" and its data will be permanently deleted from your saved Prismic repositories.`}
                    actionLabel='Delete'
                    action={() => handleDeleteRepository(repository.id)}
                    variant='destructive'
                  >
                    <Trash size={16} />
                  </ActionWithConfirmButton>
                </div>
              </SortableItem>
            )) : (
              <div className='bg-gray-50 border p-4 rounded-md'>
                <p className='text-sm text-gray-500'>No repositories found.</p>
              </div>
            )}
          </Sortable>
          <AddInPlaceInput
            formAction={handleAddRepository}
            placeholder='Enter a valid Prismic repository ID…'
            triggerButtonText='Add a new repository'
            validationSchema={addNewRepositorySchema(updatedItems.map(({ id }) => id))}
          />
        </div>
        <Separator />
        <Button onClick={handleSave} disabled={isPending || isSaveDisabled} className='w-full'>
          {isPending ? <Spinner className='fill-background' /> : 'Save'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
