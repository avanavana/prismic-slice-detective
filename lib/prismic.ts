import * as prismic from '@prismicio/client'
import cache from '@/lib/cache'

import type { Client, PrismicDocument, Query, QueryParams, SharedSlice } from '@prismicio/client'

const DEFAULT_TTL = 1000 * 60 * 60

function createClient(repositoryId: string): Client {
  return prismic.createClient(repositoryId)
}

export function getCachedData(key: string): unknown | null {
  const data = cache.prepare('SELECT value FROM cache WHERE key = ? AND expires_at > ?').get(key, Date.now()) as { value: string } | undefined
  return data ? JSON.parse(data.value) : null
}

export function setCachedData(key: string, data: unknown, { ttl = DEFAULT_TTL }: { ttl?: number } = {}): void {
  const expiresAt = Date.now() + ttl
  cache.prepare('INSERT OR REPLACE INTO cache (key, value, expires_at) VALUES (?, ?, ?)').run(key, JSON.stringify(data), expiresAt)
}

export async function getAllDocuments(repositoryId: string, params?: QueryParams): Promise<PrismicDocument[]> {
  if (!repositoryId) throw new Error('Repository ID is a required parameter.')

  const cacheKey = `${repositoryId}-all-documents`
  const cachedData = getCachedData(cacheKey) as PrismicDocument[] | null

  if (cachedData) {
    console.log(`Cache hit: All documents, "${repositoryId}"`)
    return cachedData
  }

  console.log(`Cache miss: All documents, "${repositoryId}"`)
  const client = createClient(repositoryId)

  let currentPage = 1
  let response: Query | null = null
  const results: PrismicDocument[] = []

  do {
    console.log(`Fetching page ${currentPage} from ${repositoryId}`)
    
    response = await client.get({
      ...params,
      page: currentPage,
    })

    results.push(...response.results)
    currentPage++
  } while (response.next_page)

  setCachedData(cacheKey, results, { ttl: DEFAULT_TTL })
  return results
}

export async function getAllDocumentTypes(repositoryId: string): Promise<string[]> {
  if (!repositoryId) throw new Error('Repository ID is required.')

  const cacheKey = `${repositoryId}-all-document-types`
  const cachedData = getCachedData(cacheKey) as string[] | null

  if (cachedData) {
    console.log(`Cache hit: All document types, "${repositoryId}"`)
    return cachedData
  }

  console.log(`Cache miss: All document types, "${repositoryId}"`)
  const documents = await getAllDocuments(repositoryId)
  const documentTypes = new Set<string>(documents.map(({ type }) => type))
  setCachedData(cacheKey, Array.from(documentTypes), { ttl: DEFAULT_TTL })
  return Array.from(documentTypes)
}

export interface PrismicSlice extends Pick<SharedSlice, 'id' | 'slice_type' | 'slice_label'> {
  variations: string[]
}

export async function getAllSlices(repositoryId: string): Promise<PrismicSlice[]> {
  if (!repositoryId) throw new Error('Repository ID is required.')

  const cacheKey = `${repositoryId}-all-slices`
  const cachedData = getCachedData(cacheKey) as PrismicSlice[] | null

  if (cachedData) {
    console.log(`Cache hit: All slices, "${repositoryId}"`)
    return cachedData
  }

  console.log(`Cache miss: All slices, "${repositoryId}"`)
  const documents = await getAllDocuments(repositoryId)
  const sliceTypes = new Map<string, PrismicSlice>()

  documents.forEach((document) => {
    if (document.data.slices) {
      document.data.slices.forEach(({ id, slice_type, slice_label, variation }: SharedSlice) => {
        if (!sliceTypes.has(slice_type)) {
          sliceTypes.set(slice_type, { id, slice_type, slice_label, variations: [ variation ] })
        } else {
          const slice = sliceTypes.get(slice_type)!
          if (!slice.variations.includes(variation)) slice.variations.push(variation)
        }
      })
    }
  })

  setCachedData(cacheKey, Array.from(sliceTypes.values()), { ttl: DEFAULT_TTL })
  return Array.from(sliceTypes.values())
}

export function addRepository(repositoryId: string): void {
  if (!repositoryId.trim()) return

  const storedRepositories = JSON.parse(localStorage.getItem('repositories') || '[]')

  if (!storedRepositories.includes(repositoryId)) {
    const updatedRepositories = [ repositoryId, ...storedRepositories ]
    localStorage.setItem('repositories', JSON.stringify(updatedRepositories))
    setCachedData('repositories', updatedRepositories, { ttl: Infinity })
  }
}