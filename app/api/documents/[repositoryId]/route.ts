import { NextResponse } from 'next/server'
import { getAllDocuments } from '@/lib/prismic'

interface Params {
  params: Promise<{
    repositoryId: string
  }>
}

export async function GET(req: Request, { params }: Params) {
  console.log('GET /api/documents/[repositoryId]')
  const repositoryId = (await params).repositoryId
  if (!repositoryId) return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 })
  const documents = await getAllDocuments(repositoryId)
  return NextResponse.json(documents, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' } })
}
