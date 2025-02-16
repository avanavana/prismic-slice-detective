'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import RepositoryEditDialog from '@/components/RepositoryEditDialog'

import { fetchAllDocuments, addRepository } from '@/lib/api'

interface RepositoryComboboxProps {
  repositories: string[]
  setRepositories: (repositories: string[]) => void
}

export default function RepositoryCombobox({ repositories, setRepositories }: RepositoryComboboxProps) {
  const [ isEditDialogOpen, setIsEditDialogOpen ] = useState(false)
  const [ , startTransition ] = useTransition()
  const router = useRouter()

  const handleRepositoryChange = (repositoryId: string) => {
    if (!repositoryId) return

    const updatedRepositories = [ repositoryId, ...repositories.filter((id) => id !== repositoryId) ]
    setRepositories(updatedRepositories)
    localStorage.setItem('repositories', JSON.stringify(updatedRepositories))
    window.dispatchEvent(new Event('storage'))

    startTransition(async () => {
      await fetchAllDocuments(repositoryId)
      router.refresh()
    })
  }

  const handleAddRepository = async (repositoryId: string) => {
    await addRepository(repositoryId)
    handleRepositoryChange(repositoryId)
  }

  return (
    <div className='flex gap-2 items-center'>
      <Combobox
        options={repositories.map((repo) => ({ value: repo, label: repo }))}
        label={!repositories.length ? 'Enter a Prismic repository ID' : 'Select a repository'}
        createLabelFunction={(value: string) => `Add: '${value}'`}
        placeholder={!repositories.length ? 'Type to enter a repository ID' : 'Search for a repository…'} 
        selected={repositories.length > 0 ? repositories[0] : ''}
        onChange={handleRepositoryChange}
        onCreate={handleAddRepository}
      />
      <Button variant='outline' size='icon' onClick={() => setIsEditDialogOpen(true)}>
        <Pencil className='w-4 h-4' />
      </Button>
      <RepositoryEditDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        repositories={repositories}
        setRepositories={setRepositories}
      />
    </div>
  )
}
