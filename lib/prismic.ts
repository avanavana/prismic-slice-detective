import * as prismic from '@prismicio/client'
import { getCachedData, setCachedData } from '@/lib/cache'

import type { Client, PrismicDocument, Query, QueryParams, SharedSlice } from '@prismicio/client'

export interface SimplifiedPrismicDocument extends Pick<PrismicDocument, 'id' | 'uid' | 'type' | 'href' | 'lang' | 'first_publication_date' | 'last_publication_date' | 'slugs'> {
  slices: PrismicSlice[]
}

const DEFAULT_TTL = 60 * 60

function createClient(repositoryId: string): Client {
  return prismic.createClient(repositoryId)
}

export function simplifyPrismicDocuments(documents: PrismicDocument[]): SimplifiedPrismicDocument[] {
  return documents.map((doc: PrismicDocument) => ({
    id: doc.id,
    uid: doc.uid,
    type: doc.type,
    href: doc.href,
    lang: doc.lang,
    first_publication_date: doc.first_publication_date,
    last_publication_date: doc.last_publication_date,
    slugs: doc?.slugs && doc.slugs.length ? doc.slugs : [],
    slices: doc.data?.slices && doc.data?.slices.length 
      ? doc.data.slices.map((slice: SharedSlice) => ({
          id: slice.id,
          slice_type: slice.slice_type,
          slice_label: slice.slice_label,
          variation: slice.variation ? slice.variation : null
        }))
      : []
  }))
}

export async function getAllDocuments(repositoryId: string, params?: QueryParams): Promise<PrismicDocument[]> {
  if (!repositoryId) throw new Error('Repository ID is a required parameter.')

  const cacheKey = `${repositoryId}-all-documents`
  const cachedData = await getCachedData<PrismicDocument[]>(cacheKey)

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

  const simplifiedResults = simplifyPrismicDocuments(results)

  setCachedData(cacheKey, simplifiedResults, { ttl: DEFAULT_TTL })
  return results
}

export async function getAllDocumentTypes(repositoryId: string): Promise<string[]> {
  if (!repositoryId) throw new Error('Repository ID is required.')

  const cacheKey = `${repositoryId}-all-document-types`
  const cachedData = await getCachedData<string[]>(cacheKey)

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
  const cachedData = await getCachedData<PrismicSlice[]>(cacheKey)

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

export async function addRepository(repositoryId: string): Promise<void> {
  if (!repositoryId.trim()) return

  const cacheKey = 'repositories'
  const repositories = await getCachedData<string[]>(cacheKey) || []

  if (!repositories.includes(repositoryId)) {
    const updatedRepositories = [ repositoryId, ...repositories ]
    setCachedData(cacheKey, updatedRepositories, { ttl: DEFAULT_TTL * 24 })
  }
}