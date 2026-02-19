import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchStockNews } from '@/lib/news'
import { analyzeNews } from '@/lib/analyzer'

// POST /api/news - Fetch and analyze news for a stock
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { stockId } = body

  if (!stockId) {
    return NextResponse.json({ error: 'stockId is required' }, { status: 400 })
  }

  const stock = await prisma.stock.findUnique({ where: { id: stockId } })
  if (!stock) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
  }

  // Fetch news from Finnhub
  const newsItems = await fetchStockNews(stock.symbol)

  if (newsItems.length === 0) {
    return NextResponse.json({ message: 'No news found', news: [] })
  }

  // Save news to database
  const savedNews = await Promise.all(
    newsItems.map(async (item) => {
      return prisma.stockNews.upsert({
        where: { id: `${stock.id}-${item.id}` },
        update: {},
        create: {
          id: `${stock.id}-${item.id}`,
          stockId: stock.id,
          title: item.headline,
          summary: item.summary,
          url: item.url,
          source: item.source,
          imageUrl: item.image || null,
          publishedAt: new Date(item.datetime * 1000),
        },
      })
    })
  )

  // Analyze news with Claude
  const analyses = await analyzeNews(
    stock.symbol,
    stock.name,
    newsItems.map(item => ({
      title: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
    }))
  )

  // Save analyses
  await Promise.all(
    savedNews.map(async (news, i) => {
      if (analyses[i]) {
        await prisma.newsAnalysis.upsert({
          where: { newsId: news.id },
          update: {
            sentiment: analyses[i].sentiment,
            impact: analyses[i].impact,
            keyPoints: JSON.stringify(analyses[i].keyPoints),
            investorAction: analyses[i].investorAction,
            confidence: analyses[i].confidence,
          },
          create: {
            newsId: news.id,
            sentiment: analyses[i].sentiment,
            impact: analyses[i].impact,
            keyPoints: JSON.stringify(analyses[i].keyPoints),
            investorAction: analyses[i].investorAction,
            confidence: analyses[i].confidence,
          },
        })
      }
    })
  )

  // Return news with analyses
  const result = await prisma.stockNews.findMany({
    where: { stockId: stock.id },
    include: { analysis: true },
    orderBy: { publishedAt: 'desc' },
    take: 10,
  })

  return NextResponse.json(result)
}

// GET /api/news?stockId=xxx - Get cached news
export async function GET(request: NextRequest) {
  const stockId = request.nextUrl.searchParams.get('stockId')
  if (!stockId) {
    return NextResponse.json({ error: 'stockId is required' }, { status: 400 })
  }

  const news = await prisma.stockNews.findMany({
    where: { stockId },
    include: { analysis: true },
    orderBy: { publishedAt: 'desc' },
    take: 10,
  })

  return NextResponse.json(news)
}
