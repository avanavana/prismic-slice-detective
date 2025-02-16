import { NextResponse } from 'next/server'
import { getAllSlices } from '@/lib/prismic'

interface Params {
  params: Promise<{
    repositoryId: string
  }>
}

export async function GET(req: Request, { params }: Params) {
  console.log('GET /api/slices/[repositoryId]')
  const repositoryId = (await params).repositoryId
  if (!repositoryId) return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 })
  const slices = await getAllSlices(repositoryId)
  return NextResponse.json(slices, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' } })
}
