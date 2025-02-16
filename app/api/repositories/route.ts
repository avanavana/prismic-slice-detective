import { NextResponse } from 'next/server'
import { addRepository } from '@/lib/prismic'

export async function POST(req: Request) {
  console.log('POST /api/repositories')
  const { repositoryId } = await req.json()
  if (!repositoryId) return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 })

  try {
    addRepository(repositoryId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
