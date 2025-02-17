'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import NumberFlow from '@number-flow/react'

import { Badge } from '@/components/ui/Badge'
import Error from '@/components/Error'
import RepositorySelector from '@/components/RepositorySelector'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

import { fetchAllDocuments } from '@/lib/api'

import type { SimplifiedPrismicDocument } from '@/lib/prismic'

interface SkeletonListProps {
  rows: number
}

const SkeletonList = ({ rows = 25 }: SkeletonListProps) => (
  <motion.div
    key='skeleton-list'
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className='absolute z-10 inset-0 flex flex-col gap-2 bg-white backdrop-blur-md'
  >
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>UID</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, i) => (
          <TableRow key={`skeleton-row-${i}`}>
            <TableCell className='w-[20.75%]'>
              <Skeleton className='h-5 w-[66%]' />
            </TableCell>
            <TableCell className='w-[55%]'>
              <Skeleton className='h-5 w-[60%]' />
            </TableCell>
            <TableCell>
              <Skeleton className='h-5 w-[50%]' />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </motion.div>
)

export default function List() {
  const [ repositories, setRepositories ] = useState<string[]>([])
  const [ repositoryId, setRepositoryId ] = useState<string | null>(null)
  const [ documents, setDocuments ] = useState<SimplifiedPrismicDocument[]>([])
  const [ isLoading, setIsLoading ] = useState<boolean>(true)
  const [ isRetrying, setIsRetrying ] = useState<boolean>(false)
  const [ isError, setIsError ] = useState<boolean>(false)
  const router = useRouter()

  const handleRetry = async () => {
    setIsRetrying(true)

    try {
      const docs = await fetchAllDocuments(repositoryId!)
      localStorage.setItem(`${repositoryId}-all-documents`, JSON.stringify(docs))
      setDocuments(docs)
      setIsError(false)
    } catch (error) {
      console.error('Error retrying load documents. Make sure the repository ID is entered correctly and is not private:', error)
      setIsError(true)
    } finally {
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRepositories = JSON.parse(localStorage.getItem('repositories') || '[]')
      setRepositories(storedRepositories)

      const initialRepositoryId = storedRepositories.length > 0 ? storedRepositories[0] : null
      setRepositoryId(initialRepositoryId)

      if (initialRepositoryId) {
        const cachedDocuments = JSON.parse(localStorage.getItem(`${initialRepositoryId}-all-documents`) || '[]')
        setDocuments(cachedDocuments)
        setIsLoading(cachedDocuments.length === 0)
      } else {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const updateRepositoryId = () => {
      if (typeof window !== 'undefined') {
        const storedRepositories = JSON.parse(localStorage.getItem('repositories') || '[]')
        setRepositories(storedRepositories)
        setRepositoryId(storedRepositories.length > 0 ? storedRepositories[0] : null)
      }
    }

    updateRepositoryId()
    window.addEventListener('storage', updateRepositoryId)
    return () => window.removeEventListener('storage', updateRepositoryId)
  }, [ router ])

  useEffect(() => {
    if (!repositoryId) {
      setDocuments([])
      return
    }

    const loadDocuments = async () => {
      setIsLoading(true)
      setIsError(false)

      try {
        if (typeof window !== 'undefined') {
          const cachedDocuments = JSON.parse(localStorage.getItem(`${repositoryId}-all-documents`) || 'null')

          if (cachedDocuments) {
            setDocuments(cachedDocuments)
          } else {
            const docs = await fetchAllDocuments(repositoryId)
            localStorage.setItem(`${repositoryId}-all-documents`, JSON.stringify(docs))
            setDocuments(docs)
            setIsError(false)
          }
        }
      } catch (error) {
        console.error('Error loading documents. Make sure the repository ID is entered correctly and is not private:', error)
        setIsError(true)
      } finally {
        setIsLoading(false)
        setIsRetrying(false)
      }
    }

    loadDocuments()
  }, [ repositoryId ])
  
  if (!repositoryId) {
    return (
      <div className='flex items-center justify-center grow p-8'>
        <RepositorySelector repositories={repositories} setRepositories={setRepositories} />
      </div>
    )
  }

  if (isError) {
    return <Error message={`Couldn't load data for "${repositoryId}". If you're sure the repository you've chosen isn't set to "private", please try again.`} onRetry={handleRetry} isRetrying={isRetrying} />
  }

  return (
    <div className='flex flex-col grow h-[calc(100vh_-_66px)] overflow-y-scroll'>
      <div className='flex flex-col'>
        <div className='flex items-center justify-between gap-2 border-b p-8'>
          <h1 className='flex gap-2 items-center text-3xl font-bold'><span>All Documents</span><Badge variant='secondary'><NumberFlow value={documents.length} /></Badge></h1>
          <RepositorySelector repositories={repositories} setRepositories={setRepositories} />  
        </div>
        <div className='relative p-8'>
          <AnimatePresence mode='wait'>
            {isLoading && <SkeletonList rows={documents.length > 0 && documents.length < 25 ? documents.length : 25} />}
          </AnimatePresence>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>UID</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell><span className='px-2 py-1 text-xs text-gray-500 bg-gray-50 rounded-sm border font-mono'>{document.id}</span></TableCell>
                  <TableCell>{document.uid}</TableCell>
                  <TableCell>{document.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
