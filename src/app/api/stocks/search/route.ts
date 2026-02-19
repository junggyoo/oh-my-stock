import { NextRequest, NextResponse } from 'next/server'
import { searchStock } from '@/lib/news'

// GET /api/stocks/search?q=xxx - Search stocks
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  try {
    const results = await searchStock(query)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Stock search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
