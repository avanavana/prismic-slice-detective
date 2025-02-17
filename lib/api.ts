import type { PrismicDocument } from '@prismicio/client'

import type { PrismicSlice } from '@/lib/prismic'

export interface SimplifiedPrismicDocument extends Pick<PrismicDocument, 'id' | 'uid' | 'type' | 'href' | 'lang' | 'first_publication_date' | 'last_publication_date' | 'slugs'> {
  slices: PrismicSlice[]
}

const DEFAULT_TTL = 1000 * 60 * 60

const API_ENDPOINTS: Record<string, string> = {
  'all-documents': '/api/documents',
  'all-document-types': '/api/documents/types',
  'all-slices': '/api/slices'
}

async function fetchWithCache<T>(
  key: keyof typeof API_ENDPOINTS,
  repositoryId: string,
  transformFn?: (data: unknown) => T
): Promise<T> {
  const cacheKey = `${repositoryId}-${key}`
  const cacheTimestampKey = `${cacheKey}-timestamp`

  const localData = localStorage.getItem(cacheKey)
  const cacheTimestamp = localStorage.getItem(cacheTimestampKey)

  let isStale = false

  if (localData && cacheTimestamp) {
    const timestamp = parseInt(cacheTimestamp, 10)

    if (Date.now() - timestamp < DEFAULT_TTL) {
      return JSON.parse(localData) as T
    } else {
      isStale = true
    }
  }

  const endpoint = `${API_ENDPOINTS[key]}/${repositoryId}`
  const res = await fetch(endpoint, { method: 'GET', next: { revalidate: 300 } })

  if (!res.ok) throw new Error(`Failed to fetch data from "${endpoint}".`)

  let data: unknown = await res.json()

  if (transformFn) data = transformFn(data)

  localStorage.setItem(cacheKey, JSON.stringify(data))
  localStorage.setItem(cacheTimestampKey, Date.now().toString())

  return isStale ? (JSON.parse(localData!) as T) : data as T
}

export async function fetchAllDocuments(repositoryId: string) {
  return fetchWithCache<SimplifiedPrismicDocument[]>('all-documents', repositoryId)
}

export async function fetchAllDocumentTypes(repositoryId: string) {
  return fetchWithCache<string[]>('all-document-types', repositoryId)
}

export async function fetchAllSlices(repositoryId: string) {
  return fetchWithCache<PrismicSlice[]>('all-slices', repositoryId)
}

export async function addRepository(repositoryId: string) {
  await fetch('/api/repositories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repositoryId }),
  })
}
