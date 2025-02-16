import { NextResponse } from 'next/server'
import { getAllDocumentTypes } from '@/lib/prismic'

interface Params {
  params: Promise<{
    repositoryId: string
  }>
}

export async function GET(req: Request, { params }: Params) {
  console.log('GET /api/documents/types/[repositoryId]')
  const repositoryId = (await params).repositoryId
  if (!repositoryId) return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 })
  const documentTypes = await getAllDocumentTypes(repositoryId)
  return NextResponse.json(documentTypes, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' } })
}
